import { getLineHeightValue } from "./utils";

export async function syncColorStyles() {
  const colorStyles = await figma.getLocalPaintStylesAsync();
  if (!colorStyles.length)
    return figma.notify("⚠️ No local color styles found.");

  const tolerance = 0.004;
  const opacityTolerance = 0.01;

  const colorIndex = colorStyles
    .map((s) => {
      const p = s.paints[0];
      if (!p || p.type !== "SOLID") return null;
      return {
        id: s.id,
        r: p.color.r,
        g: p.color.g,
        b: p.color.b,
        o: p.opacity ?? 1,
      };
    })
    .filter(Boolean) as { id: string; r: number; g: number; b: number; o: number }[];

  const colorsAreClose = (a: RGB, b: RGB) =>
    Math.abs(a.r - b.r) < tolerance &&
    Math.abs(a.g - b.g) < tolerance &&
    Math.abs(a.b - b.b) < tolerance;

  let linked = 0;
  let alreadyLinked = 0;

  const traverse = async (node: SceneNode) => {
    if ("visible" in node && !node.visible) return;
    if ("locked" in node && node.locked) return;

    // --- Fills ---
    if ("fills" in node && Array.isArray(node.fills)) {
      const fills = node.fills.filter((f): f is SolidPaint => f.type === "SOLID");
      if (fills.length === 1) {
        const fill = fills[0];
        for (const s of colorIndex) {
          if (
            colorsAreClose(fill.color, s) &&
            Math.abs((fill.opacity ?? 1) - s.o) < opacityTolerance
          ) {
            // ✅ If already linked, count as "alreadyLinked"
            if (node.fillStyleId === s.id) {
              alreadyLinked++;
              break;
            }

            try {
              await node.setFillStyleIdAsync?.(s.id);
              linked++;
            } catch {}
            break;
          }
        }
      }
    }

    // --- Strokes ---
    if ("strokes" in node && Array.isArray(node.strokes)) {
      const strokes = node.strokes.filter((f): f is SolidPaint => f.type === "SOLID");
      if (strokes.length === 1) {
        const stroke = strokes[0];
        for (const s of colorIndex) {
          if (
            colorsAreClose(stroke.color, s) &&
            Math.abs((stroke.opacity ?? 1) - s.o) < opacityTolerance
          ) {
            if (node.strokeStyleId === s.id) {
              alreadyLinked++;
              break;
            }

            try {
              await node.setStrokeStyleIdAsync?.(s.id);
              linked++;
            } catch {}
            break;
          }
        }
      }
    }

    // 🔁 Explore children
    if ("children" in node) {
      for (const c of node.children) await traverse(c as SceneNode);
    }

    // 🧩 Traverse instances too
    if (node.type === "INSTANCE") {
      try {
        const nested = node.findAll();
        for (const inner of nested) await traverse(inner as SceneNode);
      } catch (err) {
        console.warn("⚠️ Could not inspect instance:", node.name, err);
      }
    }
  };

  await figma.loadAllPagesAsync();

  const baseNodes = [
    ...figma.currentPage.children,
    ...figma.root.findAll(
      (n) => n.type === "COMPONENT" || n.type === "COMPONENT_SET"
    ),
  ];

  for (const n of baseNodes) await traverse(n as SceneNode);

  // --- ✅ Final notifications ---
  if (linked > 0) {
    figma.notify(`🎨 Synced ${linked} new color links.`);
  } else if (alreadyLinked > 0) {
    figma.notify("✅ All colors are already linked and up-to-date.");
  } else {
    figma.notify("⚠️ No color matches found to link.");
  }
}

export async function syncTextStyles() {
  const styles = await figma.getLocalTextStylesAsync();
  if (!styles.length) return figma.notify("⚠️ No local text styles.");

  const nodes = figma.currentPage.findAll((n) => n.type === "TEXT") as TextNode[];
  if (!nodes.length) return figma.notify("⚠️ No text layers found.");

  const cache = new Map<string, string>();
  for (const s of styles) {
    const f = s.fontName as FontName;
    const key = `${f.family}-${f.style}-${s.fontSize}-${getLineHeightValue(s.lineHeight) ?? "auto"}`;
    cache.set(key, s.id);
  }

  let synced = 0;
  for (const node of nodes) {
    try {
      if (node.fontName === figma.mixed || node.textStyleId) continue;
      const f = node.fontName as FontName;
      const key = `${f.family}-${f.style}-${String(node.fontSize ?? "auto")}-${String(
        getLineHeightValue(node.lineHeight) ?? "auto"
      )}`;

      const id = cache.get(key);
      if (id) {
        await node.setTextStyleIdAsync(id);
        synced++;
      }
    } catch { }
  }

  figma.notify(synced ? `📝 Synced ${synced} texts.` : "All text layers already linked.");
}
