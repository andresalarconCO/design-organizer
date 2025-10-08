import { createColorStyles, createTextStyles } from "./createStyles";

export async function resetAllInstances() {
  const nodes = figma.currentPage.findAll((n) => {
    const hasText = n.type === "TEXT" && !!(n as TextNode).textStyleId;
    const hasFill = "fillStyleId" in n && !!(n as any).fillStyleId;
    const hasStroke = "strokeStyleId" in n && !!(n as any).strokeStyleId;
    return hasText || hasFill || hasStroke;
  });

  let count = 0;
  for (const node of nodes) {
    try {
      if (node.type === "TEXT" && (node as TextNode).textStyleId) {
        await (node as TextNode).setTextStyleIdAsync("");
        count++;
      }
      if ("fillStyleId" in node && (node as any).fillStyleId) {
        await (node as any).setFillStyleIdAsync("");
        count++;
      }
      if ("strokeStyleId" in node && (node as any).strokeStyleId) {
        await (node as any).setStrokeStyleIdAsync("");
        count++;
      }
    } catch {}
  }

  figma.notify(count ? `🧹 Reset ${count} styles.` : "No styles to reset.");
}

export async function createLocalStyleFromSelection() {
  const selection = figma.currentPage.selection;
  if (!selection.length) return figma.notify("Select an element.");
  for (const node of selection) {
    if (node.type === "TEXT") await createTextStyles();
    else if ("fills" in node) await createColorStyles();
  }
  figma.notify("✅ Local styles created.");
}
