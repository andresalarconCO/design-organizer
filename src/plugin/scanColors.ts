import { rgbToHex } from "./utils";

/**
 * 🎨 Scan all solid fill and stroke colors in the selected scope.
 * Scope can be "selection" (only inside the current selection)
 * or "page" (entire page).
 * Saves the scanned nodes globally for focusColor().
 */
export async function scanColors({
  scope = "selection",
}: {
  scope?: "selection" | "page";
}) {
  const colors: any[] = [];
  const colorNodes: SceneNode[] = [];

  /**
   * Recursively traverse nodes and collect color data.
   */
  const traverse = async (node: SceneNode) => {
    if ("visible" in node && !node.visible) return;
    if ("locked" in node && node.locked) return;

    const processPaints = async (
      paints: Paint[],
      key: "fillStyleId" | "strokeStyleId"
    ) => {
      for (const paint of paints) {
        if (paint.type !== "SOLID") continue;

        const styleId = (node as any)[key] as string;
        let styleName = "Unlinked color";
        let origin = "Unlinked";

        try {
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

        const hex = rgbToHex(paint.color);
        const opacity = Math.round(Number(paint.opacity ?? 1) * 100);

        colors.push({
          id: node.id,
          name: styleName,
          value: hex,
          opacity,
          origin,
        });

        colorNodes.push(node);
      }
    };

    if ("fills" in node && Array.isArray(node.fills))
      await processPaints(node.fills, "fillStyleId");

    if ("strokes" in node && Array.isArray(node.strokes))
      await processPaints(node.strokes, "strokeStyleId");

    if ("children" in node && Array.isArray(node.children))
      for (const child of node.children) await traverse(child as SceneNode);
  };

  // --- Define scan base based on scope ---
  let baseNodes: SceneNode[] = [];

  if (scope === "selection" && figma.currentPage.selection.length > 0) {
    for (const node of figma.currentPage.selection) {
      if ("findAll" in node) baseNodes.push(...node.findAll());
      else baseNodes.push(node as SceneNode);
    }
  } else {
    baseNodes = figma.currentPage.findAll();
  }

  for (const node of baseNodes) await traverse(node);

  // 🧠 Save globally for focusColor()
  (globalThis as any)._lastScanColorNodes = colorNodes;

  figma.notify(
    `🎨 Found ${colors.length} color layers in ${
      scope === "selection" ? "current selection" : "entire page"
    }.`
  );

  return colors;
}
