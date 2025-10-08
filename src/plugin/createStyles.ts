import { rgbToHex } from "./utils";

/**
 * 🎨 Creates local color styles from selected shapes.
 * - Ignores text layers.
 * - Avoids creating duplicates.
 * - Supports nested children.
 */
export async function createColorStyles(): Promise<void> {
  const selection = figma.currentPage.selection;
  if (!selection.length) {
    figma.notify("⚠️ Select at least one shape.");
    return;
  }

  const created: string[] = [];
  const localStyles = await figma.getLocalPaintStylesAsync();

  const traverse = (node: SceneNode) => {
    if (node.type === "TEXT") return;

    if ("fills" in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type !== "SOLID") continue;

        const name = node.name?.trim() || rgbToHex(fill.color).toUpperCase();
        if (localStyles.some((s) => s.name === name)) continue;

        const style = figma.createPaintStyle();
        style.name = name;
        style.paints = [
          {
            type: "SOLID",
            color: fill.color,
            opacity: fill.opacity ?? 1,
          },
        ];
        created.push(name);
      }
    }

    if ("children" in node) node.children.forEach(traverse);
  };

  selection.forEach(traverse);

  figma.notify(
    created.length
      ? `🎨 Created ${created.length} color styles.`
      : "No valid layers found."
  );
  return;
}

/**
 * ✍️ Creates local text styles from selected text layers.
 * - Loads required fonts.
 * - Avoids duplicates.
 * - Preserves line height and letter spacing.
 */
export async function createTextStyles(): Promise<void> {
  const texts = figma.currentPage.selection.filter(
    (n) => n.type === "TEXT"
  ) as TextNode[];

  if (!texts.length) {
    figma.notify("⚠️ You must select text layers.");
    return;
  }

  const created: string[] = [];
  const localTextStyles = await figma.getLocalTextStylesAsync();

  for (const node of texts) {
    try {
      const font =
        node.fontName !== figma.mixed
          ? (node.fontName as FontName)
          : { family: "Inter", style: "Regular" };
      await figma.loadFontAsync(font);

      const fontSize =
        node.fontSize !== figma.mixed ? (node.fontSize as number) : 16;

      const name = node.name?.trim() || `${font.family}/${fontSize}px`;
      if (localTextStyles.some((s) => s.name === name)) continue;

      const style = figma.createTextStyle();
      style.name = name;
      style.fontName = font;
      style.fontSize = fontSize;

      if (node.lineHeight !== figma.mixed)
        style.lineHeight = node.lineHeight as LineHeight;

      if (node.letterSpacing !== figma.mixed)
        style.letterSpacing = node.letterSpacing as LetterSpacing;

      created.push(name);
    } catch (err) {
      console.warn(`⚠️ Error creating style from "${node.name}"`, err);
    }
  }

  figma.notify(
    created.length
      ? `✨ Created ${created.length} new text styles.`
      : "No valid text layers found."
  );
  return;
}
