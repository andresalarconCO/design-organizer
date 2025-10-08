import { rgbToHex } from "./utils";

/**
 * 🎯 Focus a single node by ID (safe async version)
 */
export async function focusNode(id: string) {
    try {
        const node = await figma.getNodeByIdAsync(id);
        if (!node || !("visible" in node) || !node.visible) {
            figma.notify("⚠️ Node not found or not visible.");
            return;
        }
        if ("locked" in node && node.locked) {
            figma.notify("🔒 Node is locked and cannot be focused.");
            return;
        }

        figma.currentPage.selection = [node as SceneNode];
        figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
        figma.notify("🎯 Node focused.");
    } catch (error) {
        console.error("Focus failed:", error);
        figma.notify("❌ Unable to focus this node.");
    }
}

/**
 * 🎯 Focus all nodes that use a specific solid color (fill or stroke).
 * Works only within the last scanned scope (Selection or Entire Page).
 */
export async function focusColor({
  colorHex,
  opacity,
  options,
}: {
  colorHex: string;
  opacity: number;
  options?: { scope?: "selection" | "page" };
}) {
  const matched: SceneNode[] = [];
  const targetHex = colorHex.toLowerCase();
  const targetOpacity = Math.round(opacity);
  const scope = options?.scope || "selection";

  // 🧠 Use last scanned nodes from scanColors()
  const baseNodes =
    (globalThis as any)._lastScanColorNodes &&
    (globalThis as any)._lastScanColorNodes.length > 0
      ? (globalThis as any)._lastScanColorNodes
      : [];

  if (baseNodes.length === 0) {
    figma.notify(
      "⚠️ No scanned color nodes available. Please scan colors first."
    );
    return;
  }

  for (const node of baseNodes) {
    if ("fills" in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type !== "SOLID") continue;
        const hex = rgbToHex(fill.color).toLowerCase();
        const alpha = Math.round((fill.opacity ?? 1) * 100);
        if (hex === targetHex && Math.abs(alpha - targetOpacity) <= 2) {
          matched.push(node);
          break;
        }
      }
    }

    if ("strokes" in node && Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        if (stroke.type !== "SOLID") continue;
        const hex = rgbToHex(stroke.color).toLowerCase();
        const alpha = Math.round((stroke.opacity ?? 1) * 100);
        if (hex === targetHex && Math.abs(alpha - targetOpacity) <= 2) {
          matched.push(node);
          break;
        }
      }
    }
  }

  if (matched.length > 0) {
    figma.currentPage.selection = matched;
    figma.viewport.scrollAndZoomIntoView(matched);
    figma.notify(
      `✅ Selected ${matched.length} layer${
        matched.length > 1 ? "s" : ""
      } (${scope}).`
    );
  } else {
    figma.notify(
      `⚠️ No layers found for ${colorHex} (${scope}).`
    );
  }
}

/**
 * 🔤 Focus text layers by font family, style, size, and decoration/case.
 */
export async function focusText({
  fontFamily,
  fontSize,
  textDecoration = "NONE",
  textCase = "ORIGINAL",
}: {
  fontFamily: string | { family: string; style?: string };
  fontSize: number;
  textDecoration?: string;
  textCase?: string;
}) {
  const matched: SceneNode[] = [];
  const targetSize = Math.round(Number(fontSize));

  let targetFamily = "";
  let targetStyle = "";

  if (typeof fontFamily === "object" && fontFamily.family) {
    targetFamily = fontFamily.family.toLowerCase().trim();
    targetStyle = fontFamily.style ? fontFamily.style.toLowerCase().trim() : "";
  } else if (typeof fontFamily === "string") {
    const parts = fontFamily.split(/[–-]/).map((p) => p.trim().toLowerCase());
    targetFamily = parts[0] || "";
    targetStyle = parts[1] || "";
  }

  const targetDecoration = (textDecoration || "NONE").toUpperCase();
  const targetCase = (textCase || "ORIGINAL").toUpperCase();

  const styleGroups: Record<string, string[]> = {
    bold: ["bold", "semibold", "extrabold", "black"],
    medium: ["medium"],
    regular: ["regular", "book", "normal"],
    light: ["light", "extralight", "thin"],
  };

  const findGroup = (s: string) =>
    Object.entries(styleGroups).find(([_, list]) =>
      list.some((v) => s.includes(v))
    )?.[0];

  const areStylesRelated = (a: string, b: string) => {
    const gA = findGroup(a);
    const gB = findGroup(b);
    return gA && gB ? gA === gB : a === b;
  };

  const baseNodes =
    (globalThis as any)._lastScanNodes && (globalThis as any)._lastScanNodes.length
      ? (globalThis as any)._lastScanNodes
      : [];

  if (!baseNodes.length) {
    figma.notify("⚠️ No scanned text nodes available. Please refresh first.");
    return;
  }

  for (const node of baseNodes) {
    if (node.type !== "TEXT") continue;

    try {
      const text = node as TextNode;
      if (text.fontName === figma.mixed || text.fontSize === figma.mixed) continue;

      const font = text.fontName as FontName;
      const family = (font.family || "").toLowerCase().trim();
      const style = (font.style || "regular").toLowerCase().trim();
      const size = Math.round(Number(text.fontSize));
      const nodeDecoration = String(text.textDecoration ?? "NONE").toUpperCase();
      const nodeCase = String(text.textCase ?? "ORIGINAL").toUpperCase();

      const sameFamily = family === targetFamily;
      const sameStyle = areStylesRelated(style, targetStyle);
      const sameSize = Math.abs(size - targetSize) <= 1;
      const sameDecoration = nodeDecoration === targetDecoration;
      const sameCase = nodeCase === targetCase;

      if (sameFamily && sameStyle && sameSize && sameDecoration && sameCase)
        matched.push(text);
    } catch {
      continue;
    }
  }

  if (matched.length > 0) {
    figma.currentPage.selection = matched;
    figma.viewport.scrollAndZoomIntoView(matched);
    figma.notify(
      `✅ Selected ${matched.length} "${targetFamily}" (${targetStyle}, ${targetSize}px, ${targetDecoration})`
    );
  } else {
    figma.notify(
      `⚠️ No matches for "${targetFamily}" ${targetStyle} ${targetSize}px (${targetDecoration})`
    );
  }
}
