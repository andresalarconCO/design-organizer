/**
 * accessibility.ts
 * WCAG Contrast Checker for Figma plugin
 */

export function checkAccessibility(): void {
  const selection = figma.currentPage.selection;
  const results: any[] = [];

  if (!selection.length) {
    figma.notify("Please select at least one color layer.");
    figma.ui.postMessage({ type: "accessibility-result", results: [] });
    return;
  }

  // --- Helper functions ---
  const luminance = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const getContrast = (rgb1: RGBColor, rgb2: RGBColor): number => {
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

  // --- WCAG reference colors ---
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const grayLight = { r: 224, g: 224, b: 224 }; // #E0E0E0
  const grayDark = { r: 46, g: 46, b: 46 }; // #2E2E2E
  const textGrayLight = { r: 245, g: 245, b: 245 }; // #F5F5F5
  const textGrayDark = { r: 51, g: 51, b: 51 }; // #333333

  const AA_THRESHOLD = 4.5;
  const AAA_THRESHOLD = 7;

  // --- Scan selected nodes ---
  for (const node of selection) {
    if (!("fills" in node) || !Array.isArray(node.fills)) continue;

    const fill = node.fills[0];
    if (!fill || fill.type !== "SOLID" || !fill.color) continue;

    const color = fill.color;
    const rgb: RGBColor = {
      r: Math.round(color.r * 255),
      g: Math.round(color.g * 255),
      b: Math.round(color.b * 255),
    };

    // --- Contrast calculations ---
    const contrastWhite = getContrast(rgb, white);
    const contrastBlack = getContrast(rgb, black);
    const contrastOnWhite = getContrast(white, rgb);
    const contrastOnBlack = getContrast(black, rgb);
    const contrastOnGrayLight = getContrast(grayLight, rgb);
    const contrastOnGrayDark = getContrast(grayDark, rgb);
    const contrastGrayDarkText = getContrast(rgb, textGrayDark);
    const contrastGrayLightText = getContrast(rgb, textGrayLight);

    // --- AA & AAA Checks ---
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

    // --- UI context contrast checks ---
    const uiContexts = evaluateUIContexts(rgb);

    results.push({
      id: node.id,
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

  figma.ui.postMessage({ type: "accessibility-result", results });
  figma.notify(`✅ Accessibility check complete (${results.length} layers).`);
}

// ---------------------------------------------------------
// Evaluate common UI contexts (icons, borders, buttons)
// ---------------------------------------------------------
export function evaluateUIContexts(rgb: RGBColor) {
  const white = { r: 255, g: 255, b: 255 };
  const dark = { r: 46, g: 46, b: 46 };
  const lightBg = { r: 240, g: 240, b: 240 };

  const luminance = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const getContrast = (rgb1: RGBColor, rgb2: RGBColor): number => {
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

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}
