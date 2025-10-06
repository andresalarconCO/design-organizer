// =====================================================
// 🧩 Design Organizer – controller.ts (Refactor)
// =====================================================

figma.showUI(__html__, { width: 420, height: 620, themeColors: true });

// =====================================================
// 🎨 Theme Handling
// =====================================================
initializeTheme();

function initializeTheme() {
  const defaultTheme = "light";
  figma.ui.postMessage({ type: "theme-change", theme: defaultTheme });

  try {
    // @ts-ignore
    figma.on("themechange", (event) => {
      const colorTheme = event?.colorTheme || defaultTheme;
      figma.ui.postMessage({ type: "theme-change", theme: colorTheme });
    });
  } catch (e) {
    console.warn("⚠️ Theme listener not supported", e);
  }
}

figma.ui.onmessage = async (msg) => {
  try {
    const { type, module } = msg;

    const actions: Record<string, () => void | Promise<void>> = {
      "create-text-styles": async () => { await createTextStyles(); },
      "create-color-styles": async () => { await createColorStyles(); },
      "sync-color-styles": async () => { await syncColorStyles(); },
      "sync-text-styles": async () => { await syncTextStyles(); },
      "reset-all-instances": async () => { await resetAllInstances(); },
      "create-local-styles": async () => { await createLocalStyleFromSelection(); },
      "scan-elements": async () => { await handleScan(module); },
      "focus-node": () => focusNode(msg.id),
      "focus-group": async () => { await focusGroup(msg); },
      "focus-color": async () => { await focusColor(msg); },
      "scan-images": async () => await scanImages(msg.options),
      "export-bulk-images": async () => await exportBulkImages(msg.options),
      "check-accessibility": async () => await checkAccessibility(),
    };


    const action = actions[type];
    if (action) await action();
    else console.warn("⚠️ Unknown message type:", type);

  } catch (err) {
    console.error("❌ Error in onmessage:", err);
    figma.notify("Something went wrong. Check console for details.");
  }
};

async function handleScan(module: string) {
  const selection = figma.currentPage.selection;
  if (!selection.length) {
    return figma.ui.postMessage({
      type: "scan-result",
      error: "No elements selected.",
    });
  }

  const scanners: Record<string, (nodes: readonly SceneNode[]) => any[]> = {
    colors: scanColors,
    text: scanTextStyles,
  };

  const scanFn = scanners[module];
  if (!scanFn) return;

  const data = scanFn(selection);
  figma.ui.postMessage({ type: "scan-result", module, data });
}

// =====================================================
// 🎯 Focus Functions
// =====================================================
function focusNode(id: string): void {
  const node = figma.getNodeById(id);

  if (!node) {
    figma.notify("⚠️ Node not found.");
    return;
  }

  if ("visible" in node && "locked" in node) {
    const sceneNode = node as SceneNode;

    figma.currentPage.selection = [sceneNode];
    figma.viewport.scrollAndZoomIntoView([sceneNode]);
    figma.notify("🎯 Node focused.");
  } else {
    figma.notify("⚠️ This node cannot be focused.");
  }
}

async function focusGroup({ fontFamily, fontSize }: any) {
  const matched: SceneNode[] = [];

  const traverse = (node: BaseNode & ChildrenMixin) => {
    for (const child of node.children) {
      if (child.type === "TEXT") {
        const text = child as TextNode;
        const font = text.fontName as FontName;
        const size = Math.round(text.fontSize as number);

        if (
          font.family === fontFamily.family &&
          font.style === fontFamily.style &&
          size === Math.round(fontSize)
        ) matched.push(text);
      }
      if ("children" in child) traverse(child as BaseNode & ChildrenMixin);
    }
  };

  traverse(figma.currentPage as BaseNode & ChildrenMixin);

  if (matched.length) {
    figma.currentPage.selection = matched;
    figma.viewport.scrollAndZoomIntoView(matched);
    figma.notify(`✅ Selected ${matched.length} text layers`);
  } else figma.notify("No matching text layers found.");
}

async function focusColor({ colorHex, opacity }: any) {
  const matched: SceneNode[] = [];

  const traverse = (node: BaseNode & ChildrenMixin) => {
    for (const child of node.children) {
      if ("fills" in child && Array.isArray(child.fills)) {
        const solidFills = child.fills.filter((f: any) => f.type === "SOLID");
        for (const fill of solidFills) {
          const hex = rgbToHex(fill.color);
          const alpha = Math.round((fill.opacity ?? 1) * 100);
          if (hex.toLowerCase() === colorHex.toLowerCase() && alpha === opacity)
            matched.push(child as SceneNode);
        }
      }
      if ("children" in child) traverse(child as BaseNode & ChildrenMixin);
    }
  };

  traverse(figma.currentPage as BaseNode & ChildrenMixin);

  if (matched.length) {
    figma.currentPage.selection = matched;
    figma.viewport.scrollAndZoomIntoView(matched);
    figma.notify(`🎨 Selected ${matched.length} layers`);
  } else figma.notify(`No elements found for ${colorHex}`);
}

function scanColors(selection: readonly SceneNode[]) {
  const colors: any[] = [];

  const traverse = (node: SceneNode) => {
    const processPaints = (paints: Paint[], key: "fillStyleId" | "strokeStyleId") => {
      paints.forEach((paint) => {
        if (paint.type === "SOLID") {
          const styleId = (node as any)[key] as string;
          const style = styleId ? figma.getStyleById(styleId) : null;
          const hex = rgbToHex(paint.color);
          const opacity = Math.round((paint.opacity ?? 1) * 100);

          colors.push({
            id: node.id,
            name: style?.name || "Unlinked color",
            value: hex,
            opacity,
            origin: getStyleOrigin(styleId),
          });
        }
      });
    };

    if ("fills" in node && Array.isArray(node.fills)) processPaints(node.fills, "fillStyleId");
    if ("strokes" in node && Array.isArray(node.strokes)) processPaints(node.strokes, "strokeStyleId");

    if ("children" in node) node.children.forEach(traverse);
  };

  selection.forEach(traverse);
  return colors;
}

function scanTextStyles(selection: readonly SceneNode[]) {
  const texts: any[] = [];

  const traverse = (node: SceneNode) => {
    if (node.type === "TEXT") {
      const styleId = node.textStyleId as string;
      const style = styleId ? figma.getStyleById(styleId) : null;

      texts.push({
        id: node.id,
        name: style?.name || "Unlinked text style",
        fontName: (node as TextNode).fontName,
        fontSize: node.fontSize,
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
        paragraphSpacing: node.paragraphSpacing,
        origin: getStyleOrigin(styleId),
      });
    }
    if ("children" in node) node.children.forEach(traverse);
  };

  selection.forEach(traverse);
  return texts;
}

function getStyleOrigin(styleId: string) {
  if (!styleId) return "Unlinked";
  const style = figma.getStyleById(styleId);
  if (!style) return "Unlinked";
  return style.remote ? "Team" : "Local";
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

async function createColorStyles() {
  const selection = figma.currentPage.selection;
  if (!selection.length) return figma.notify("⚠️ Select at least one shape.");

  const created: string[] = [];

  try {
    const localPaintStyles = await figma.getLocalPaintStylesAsync();

    // --- Función recursiva ---
    const traverse = (node: SceneNode) => {
      if (node.type === "TEXT") return;

      if ("fills" in node && Array.isArray(node.fills)) {
        const fills = node.fills as Paint[];

        for (const fill of fills) {
          if (fill.type !== "SOLID") continue; // ignorar gradientes o imágenes

          const color = fill.color;
          const opacity = fill.opacity ?? 1;
          const name = node.name?.trim() || rgbToHex(color).toUpperCase();

          // Evitar duplicados
          if (localPaintStyles.some((s) => s.name === name)) continue;

          const style = figma.createPaintStyle();
          style.name = name;
          style.paints = [{ type: "SOLID", color, opacity }];
          created.push(name);
        }
      }
      
      if ("children" in node) node.children.forEach(traverse);
    };

    selection.forEach(traverse);

    // Mensaje final
    figma.notify(
      created.length
        ? `🎨 Created ${created.length} new color styles.`
        : "No valid non-text layers found."
    );
  } catch (err) {
    console.error("❌ Error creating color styles:", err);
    figma.notify("❌ Failed to create color styles. Check console for details.");
  }
}

async function createTextStyles() {
  const selection = figma.currentPage.selection.filter(
    (n) => n.type === "TEXT"
  ) as TextNode[];

  if (!selection.length) return figma.notify("⚠️ You must select text layers.");

  const created: string[] = [];

  try {
    // --- Obtener estilos locales actuales ---
    const localTextStyles = await figma.getLocalTextStylesAsync();

    for (const node of selection) {
      const fontName =
        node.fontName !== figma.mixed
          ? (node.fontName as FontName)
          : { family: "Inter", style: "Regular" };

      await figma.loadFontAsync(fontName);

      const fontSize =
        node.fontSize !== figma.mixed ? node.fontSize : 16;
      const styleName = node.name?.trim() || `${fontName.family}/${fontSize}px`;

      // --- Evitar duplicados ---
      if (localTextStyles.some((s) => s.name === styleName)) continue;

      // --- Crear nuevo estilo ---
      const style = figma.createTextStyle();
      style.name = styleName;
      style.fontName = fontName;
      style.fontSize = fontSize;

      if (node.lineHeight !== figma.mixed)
        style.lineHeight = node.lineHeight as LineHeight;

      if (node.letterSpacing !== figma.mixed)
        style.letterSpacing = node.letterSpacing as LetterSpacing;

      if (node.textDecoration !== figma.mixed)
        style.textDecoration = node.textDecoration;

      created.push(styleName);
    }

    figma.notify(
      created.length
        ? `✨ Created ${created.length} new text styles.`
        : "No valid text layers found."
    );
  } catch (err) {
    console.error("❌ Error creating text styles:", err);
    figma.notify("❌ Failed to create text styles. Check console for details.");
  }
}

async function syncColorStyles() {
  const colorStyles = await figma.getLocalPaintStylesAsync();
  if (!colorStyles.length) return figma.notify("⚠️ No color styles found to sync.");

  const nodes = figma.currentPage.findAll((n) => "fills" in n || "strokes" in n) as SceneNode[];
  const tolerance = 0.015;
  let linkedCount = 0;

  const colorsAreClose = (c1: RGB, c2: RGB) =>
    Math.abs(c1.r - c2.r) < tolerance &&
    Math.abs(c1.g - c2.g) < tolerance &&
    Math.abs(c1.b - c2.b) < tolerance;

  for (const node of nodes) {
    const syncPaints = (paints: Paint[], key: "fillStyleId" | "strokeStyleId") => {
      paints.forEach((paint) => {
        if (paint.type !== "SOLID") return;
        const match = colorStyles.find((s) => {
          const stylePaint = s.paints[0];
          if (!stylePaint || stylePaint.type !== "SOLID") return false;
          const sameColor = colorsAreClose(stylePaint.color, paint.color);
          const sameOpacity = Math.abs((stylePaint.opacity ?? 1) - (paint.opacity ?? 1)) < 0.02;
          return sameColor && sameOpacity;
        });
        if (match) {
          (node as any)[key] = match.id;
          linkedCount++;
        }
      });
    };

    if ("fills" in node) syncPaints(node.fills as Paint[], "fillStyleId");
    if ("strokes" in node) syncPaints(node.strokes as Paint[], "strokeStyleId");
  }

  figma.notify(
    linkedCount
      ? `🎨 Synced ${linkedCount} layers by color tolerance.`
      : "No color matches found."
  );
}

async function syncTextStyles() {
  try {
    const textStyles = await figma.getLocalTextStylesAsync();
    if (!textStyles.length) return figma.notify("⚠️ No text styles found to sync.");

    const textNodes = figma.currentPage.findAll((n) => n.type === "TEXT") as TextNode[];
    let synced = 0;

    for (const node of textNodes) {
      if (node.hasMissingFont || node.fontName === figma.mixed) continue;
      const nodeFont = node.fontName as FontName;
      const nodeSize = Math.round(node.fontSize as number);

      const match = textStyles.find((s) => {
        const font = s.fontName as FontName;
        const size = Math.round(s.fontSize as number);
        return font.family === nodeFont.family && font.style === nodeFont.style && size === nodeSize;
      });

      if (match) {
        node.textStyleId = match.id;
        synced++;
      }
    }

    figma.notify(
      synced
        ? `📝 Synced ${synced} text layers to local styles.`
        : "No matching text styles found."
    );
  } catch (err) {
    console.error("❌ Error syncing text styles:", err);
    figma.notify("❌ Failed to sync text styles.");
  }
}

async function resetAllInstances() {
  const nodes = figma.currentPage.findAll((n) => {
    const hasText = n.type === "TEXT" && !!(n as TextNode).textStyleId;
    const hasFill = "fillStyleId" in n && !!(n as any).fillStyleId;
    const hasStroke = "strokeStyleId" in n && !!(n as any).strokeStyleId;
    return hasText || hasFill || hasStroke;
  });

  let count = 0;
  for (const node of nodes) {
    if (node.type === "TEXT") (node as TextNode).textStyleId = "";
    if ("fillStyleId" in node) (node as any).fillStyleId = "";
    if ("strokeStyleId" in node) (node as any).strokeStyleId = "";
    count++;
  }

  figma.notify(count ? `🧹 Reset ${count} style instances.` : "No styles to reset.");
}

async function createLocalStyleFromSelection() {
  const selection = figma.currentPage.selection;
  if (!selection.length) return figma.notify("Select an element.");

  for (const node of selection) {
    if (node.type === "TEXT") await createTextStyles();
    else if ("fills" in node) await createColorStyles();
  }

  figma.notify("✅ Local styles created successfully.");
}

async function scanImages(options?: { scope?: "selection" | "page" }) {
  const scope = options?.scope || "selection";
  const targetNodes =
    scope === "page" ? figma.currentPage.children : figma.currentPage.selection;

  if (!targetNodes.length) {
    figma.ui.postMessage({
      type: "scan-images-result",
      error: "No elements selected.",
    });
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
            const name = node.name.replace(/[<>:"/\\|?*]+/g, "_") || "Image";
            images.push({
              id: node.id,
              imageHash: fill.imageHash,
              name: `${name}.png`,
            });
          }
        }
      }
    }
    if ("children" in node) node.children.forEach(traverse);
  };

  targetNodes.forEach(traverse);

  // --- Generar previews ---
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
}

async function exportBulkImages(options?: { quality?: number; asZip?: boolean }) {
  const selection = figma.currentPage.selection.length
    ? figma.currentPage.selection
    : figma.currentPage.children;

  if (!selection.length) {
    figma.ui.postMessage({ type: "export-bulk-error", error: "No elements selected." });
    return;
  }

  const uniqueImages = new Map<string, Uint8Array>();
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
            const name = `${node.name || "image"}_${fill.imageHash.slice(0, 6)}.png`;
            if (!uniqueImages.has(name)) {
              uniqueImages.set(name, bytes);
            }
          }
        }
      }
    }

    if ("children" in node) {
      for (const child of node.children) {
        await traverse(child);
      }
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

  figma.notify(`🖼️ ${imagesArray.length} unique images exported.`);
}


function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const L1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const L2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function checkAccessibility() {
  const selection = figma.currentPage.selection;
  const results: any[] = [];

  if (!selection.length) {
    figma.notify("Please select at least one color node.");
    figma.ui.postMessage({ type: "accessibility-result", results: [] });
    return;
  }

  const luminance = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const getContrast = (rgb1: any, rgb2: any) => {
    const L1 =
      0.2126 * luminance(rgb1.r / 255) +
      0.7152 * luminance(rgb1.g / 255) +
      0.0722 * luminance(rgb1.b / 255);
    const L2 =
      0.2126 * luminance(rgb2.r / 255) +
      0.7152 * luminance(rgb2.g / 255) +
      0.0722 * luminance(rgb2.b / 255);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    return Math.round(ratio * 100) / 100;
  };
  
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const grayLight = { r: 224, g: 224, b: 224 }; // #E0E0E0
  const grayDark = { r: 46, g: 46, b: 46 };     // #2E2E2E
  const textGrayLight = { r: 245, g: 245, b: 245 }; // #F5F5F5
  const textGrayDark = { r: 51, g: 51, b: 51 };     // #333333

  const AA_THRESHOLD = 4.5;
  const AAA_THRESHOLD = 7;

  for (const node of selection) {
    if ("fills" in node && Array.isArray(node.fills)) {
      const fill = node.fills[0];
      if (fill?.type === "SOLID") {
        const color = fill.color;
        const rgb = {
          r: Math.round(color.r * 255),
          g: Math.round(color.g * 255),
          b: Math.round(color.b * 255),
        };

        const contrastWhite = getContrast(rgb, white);
        const contrastBlack = getContrast(rgb, black);
        const contrastOnWhite = getContrast(white, rgb);
        const contrastOnBlack = getContrast(black, rgb);

        const contrastOnGrayLight = getContrast(grayLight, rgb);
        const contrastOnGrayDark = getContrast(grayDark, rgb);
        const contrastGrayDarkText = getContrast(rgb, textGrayDark);
        const contrastGrayLightText = getContrast(rgb, textGrayLight);

        const passesWhiteAA = contrastWhite >= AA_THRESHOLD;
        const passesBlackAA = contrastBlack >= AA_THRESHOLD;
        const passesWhiteAAA = contrastWhite >= AAA_THRESHOLD;
        const passesBlackAAA = contrastBlack >= AAA_THRESHOLD;

        const passesOnWhiteAA = contrastOnWhite >= AA_THRESHOLD;
        const passesOnBlackAA = contrastOnBlack >= AA_THRESHOLD;

        const passesOnGrayLight = contrastOnGrayLight >= AA_THRESHOLD;
        const passesOnGrayDark = contrastOnGrayDark >= AA_THRESHOLD;
        const passesGrayDarkText = contrastGrayDarkText >= AA_THRESHOLD;
        const passesGrayLightText = contrastGrayLightText >= AA_THRESHOLD;

        const uiContexts = evaluateUIContexts(rgb);

        results.push({
          name: node.name,
          color,
          contrastWhite,
          contrastBlack,
          contrastOnWhite,
          contrastOnBlack,
          contrastOnGrayLight,
          contrastOnGrayDark,
          contrastGrayDarkText,
          contrastGrayLightText,
          passesWhiteAA,
          passesBlackAA,
          passesWhiteAAA,
          passesBlackAAA,
          passesOnWhiteAA,
          passesOnBlackAA,
          passesOnGrayLight,
          passesOnGrayDark,
          passesGrayDarkText,
          passesGrayLightText,
          ...uiContexts,
        });
      }
    }
  }

  figma.ui.postMessage({ type: "accessibility-result", results });
}

function evaluateUIContexts(rgb: { r: number; g: number; b: number }) {
  const white = { r: 255, g: 255, b: 255 };
  const dark = { r: 46, g: 46, b: 46 };
  const lightBg = { r: 240, g: 240, b: 240 };

  const luminance = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const getContrast = (rgb1: any, rgb2: any) => {
    const L1 =
      0.2126 * luminance(rgb1.r / 255) +
      0.7152 * luminance(rgb1.g / 255) +
      0.0722 * luminance(rgb1.b / 255);
    const L2 =
      0.2126 * luminance(rgb2.r / 255) +
      0.7152 * luminance(rgb2.g / 255) +
      0.0722 * luminance(rgb2.b / 255);
    return Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100;
  };

  const contrastIconLight = getContrast(rgb, white);
  const contrastIconDark = getContrast(rgb, dark);
  const contrastBorderLight = getContrast(rgb, lightBg);
  const contrastButtonTextWhite = getContrast(rgb, white);
  const contrastButtonTextBlack = getContrast(rgb, dark);

  return {
    contrastIconLight,
    passesIconLight: contrastIconLight >= 3,
    contrastIconDark,
    passesIconDark: contrastIconDark >= 3,
    contrastBorderLight,
    passesBorderLight: contrastBorderLight >= 3,
    contrastButtonTextWhite,
    passesButtonTextWhite: contrastButtonTextWhite >= 4.5,
    contrastButtonTextBlack,
    passesButtonTextBlack: contrastButtonTextBlack >= 4.5,
  };
}
