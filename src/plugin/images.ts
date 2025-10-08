/**
 * 🔍 Scan all images from selection or entire page.
 * Returns image previews (base64) to the UI.
 */
export async function scanImages(
  options?: { scope?: "selection" | "page" }
): Promise<void> {
  const scope = options?.scope || "selection";
  const targetNodes =
    scope === "page" ? figma.currentPage.children : figma.currentPage.selection;

  if (!targetNodes.length) {
    figma.ui.postMessage({
      type: "scan-images-result",
      error: scope === "page" ? "No layers found on page." : "No elements selected.",
    });
    figma.notify("⚠️ No elements found to scan.");
    return;
  }

  const images: any[] = [];
  const hashSet = new Set<string>();

  const traverse = (node: SceneNode) => {
    if ("fills" in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === "IMAGE" && fill.imageHash && !hashSet.has(fill.imageHash)) {
          const image = figma.getImageByHash(fill.imageHash);
          if (image) {
            hashSet.add(fill.imageHash);
            const safeName = node.name.replace(/[<>:"/\\|?*]+/g, "_") || "Image";
            images.push({
              id: node.id,
              imageHash: fill.imageHash,
              name: `${safeName}.png`,
            });
          }
        }
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) traverse(child as SceneNode);
    }
  };

  targetNodes.forEach(traverse);

  if (!images.length) {
    figma.notify("⚠️ No images found in selection or page.");
    figma.ui.postMessage({ type: "scan-images-result", data: [] });
    return;
  }

  // --- Convert to base64 previews ---
  const previewData = await Promise.all(
    images.map(async (img) => {
      const image = figma.getImageByHash(img.imageHash);
      const bytes = await image.getBytesAsync();
      const base64 = `data:image/png;base64,${figma.base64Encode(bytes)}`;
      return { ...img, preview: base64 };
    })
  );

  figma.ui.postMessage({
    type: "scan-images-result",
    data: previewData,
  });

  figma.notify(`🖼️ Found ${previewData.length} unique images.`);
}

/**
 * 💾 Exports all images found in selection or entire page.
 * Sends binary data to UI for download or packaging (ZIP, etc).
 */
export async function exportBulkImages(
  options?: { quality?: number; asZip?: boolean }
): Promise<void> {
  const selection =
    figma.currentPage.selection.length > 0
      ? figma.currentPage.selection
      : figma.currentPage.children;

  if (!selection.length) {
    figma.ui.postMessage({
      type: "export-bulk-error",
      error: "No elements selected to export.",
    });
    figma.notify("⚠️ Please select elements or use page export.");
    return;
  }

  const uniqueImages = new Map<string, Uint8Array>();

  // Ajustar resolución según calidad (100 = tamaño original)
  // @ts-ignore
  const exportOptions: ExportSettingsImage = {
    format: "PNG",
    constraint: { type: "SCALE", value: (options?.quality ?? 100) / 100 },
  };

  const traverse = async (node: SceneNode) => {
    if ("fills" in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === "IMAGE" && fill.imageHash) {
          const image = figma.getImageByHash(fill.imageHash);
          if (image) {
            const bytes = await image.getBytesAsync();
            const name = `${sanitizeName(node.name)}_${fill.imageHash.slice(0, 6)}.png`;
            if (!uniqueImages.has(name)) {
              uniqueImages.set(name, bytes);
            }
          }
        }
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) await traverse(child);
    }
  };

  for (const node of selection) await traverse(node);

  const imagesArray = Array.from(uniqueImages.entries()).map(([name, bytes]) => ({
    name,
    bytes,
  }));

  figma.ui.postMessage({
    type: "export-bulk-result",
    images: imagesArray,
  });

  figma.notify(`✅ Exported ${imagesArray.length} image(s).`);
}

/**
 * 🧹 Sanitizes node names for use as filenames.
 */
function sanitizeName(name: string): string {
  return (name || "image").replace(/[<>:"/\\|?*]+/g, "_").trim();
}
