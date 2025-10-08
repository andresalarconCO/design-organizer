/**
 * 🧠 Scan all text nodes in selection or frame,
 * including family, style, size, decoration, case, and color.
 */
export async function scanTextStyles(selection: readonly SceneNode[]) {
  const texts: any[] = [];
  const textNodes: TextNode[] = [];
  const promises: Promise<void>[] = [];

  const traverse = (node: SceneNode) => {
    if (node.type === "TEXT") {
      textNodes.push(node as TextNode);
      promises.push(processTextNode(node as TextNode, texts));
    }

    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) traverse(child as SceneNode);
    }
  };

  if (selection.length > 0) selection.forEach(traverse);
  else {
    figma.notify("⚠️ Select a frame or element to scan its text styles.");
    return [];
  }

  await Promise.allSettled(promises);
  (globalThis as any)._lastScanNodes = textNodes;
  return texts;
}

async function processTextNode(node: TextNode, texts: any[]) {
  let styleName = "Unlinked text style";
  let origin = "Unlinked";
  let fontName: FontName | "Mixed" = "Mixed";
  let fontSize: number | "Mixed" = "Mixed";
  let textDecoration = "NONE";
  let textCase = "ORIGINAL";
  let color: string | null = null;

  try {
    if (node.fontName !== figma.mixed) fontName = node.fontName as FontName;
    if (node.fontSize !== figma.mixed) fontSize = node.fontSize as number;

    textDecoration = String(node.textDecoration ?? "NONE").toUpperCase();
    textCase = String(node.textCase ?? "ORIGINAL").toUpperCase();

    if ("fills" in node && Array.isArray(node.fills)) {
      const fill = node.fills.find(
        (f) => f.type === "SOLID" && (f as SolidPaint).visible !== false
      ) as SolidPaint | undefined;
      if (fill) {
        const { r, g, b } = fill.color;
        color = rgbToHex({ r, g, b });
      }
    }

    const styleId = node.textStyleId as string;
    if (styleId) {
      const style = await figma.getStyleByIdAsync(styleId);
      if (style) {
        styleName = style.name;
        origin = style.remote ? "Team" : "Local";
      }
    }
  } catch {
    origin = "Restricted";
  }

  texts.push({
    id: node.id,
    name: styleName,
    fontName,
    fontSize,
    textDecoration, // ALWAYS "NONE" | "UNDERLINE" | ...
    textCase,       // ALWAYS "ORIGINAL" | "UPPER" | ...
    color,
    origin,
  });
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const to255 = (v: number) => Math.round(v * 255);
  return (
    "#" +
    [r, g, b]
      .map((v) => to255(v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
