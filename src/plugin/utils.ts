/** 🎨 Convert RGB color to HEX string */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** 🧩 Check if value is Figma’s mixed type */
export function isMixed(value: unknown): value is typeof figma.mixed {
  return value === figma.mixed;
}

/** 📏 Get numeric line height value from LineHeight */
export function getLineHeightValue(lh: LineHeight | typeof figma.mixed): number | null {
  if (isMixed(lh)) return null;
  if (typeof lh !== "object" || lh === null) return null;
  if (lh.unit === "AUTO" || typeof lh.value !== "number") return null;
  return Math.round(lh.value);
}