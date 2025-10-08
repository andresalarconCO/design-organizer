import { scanTextStyles } from "./scanText";
import { scanColors } from "./scanColors";
import { focusNode, focusText, focusColor } from "./focusActions";
import { createColorStyles, createTextStyles } from "./createStyles";
import { syncColorStyles, syncTextStyles } from "./syncStyles";
import { resetAllInstances, createLocalStyleFromSelection } from "./reset";
import { scanImages, exportBulkImages } from "./images";
import { checkAccessibility } from "./accessibility";

/**
 * ------------------------------------------------------
 *  Design Organizer – Plugin Main Controller
 * ------------------------------------------------------
 * Handles communication between UI and Figma’s plugin API.
 * Dispatches actions to corresponding modules for:
 *  - Style creation / synchronization
 *  - Scanning colors, text styles, and images
 *  - Focusing and selecting elements
 *  - Accessibility evaluation
 *  - Bulk image export
 * ------------------------------------------------------
 */

figma.showUI(__html__, { width: 420, height: 620, themeColors: true });
initializeTheme();

/**
 * Initializes theme synchronization between the plugin UI
 * and Figma’s current theme (light / dark).
 */
function initializeTheme(): void {
  const defaultTheme = "light";
  figma.ui.postMessage({ type: "theme-change", theme: defaultTheme });

  try {
    // @ts-ignore - Theme change event is still experimental
    figma.on("themechange", (event) => {
      const colorTheme = event?.colorTheme || defaultTheme;
      figma.ui.postMessage({ type: "theme-change", theme: colorTheme });
    });
  } catch (err) {
    console.warn("⚠️ Theme listener not supported on this Figma version", err);
  }
}

/**
 * Main message handler for communication between
 * the UI (React interface) and Figma’s plugin backend.
 */
figma.ui.onmessage = async (msg) => {
  try {
    const { type, module, id, options } = msg;

    /**
     * Action registry: maps incoming message types
     * to their corresponding async operations.
     */
    const actions: Record<string, () => Promise<void> | void> = {
      // --- Style creation ---
      "create-text-styles": async () => await createTextStyles(),
      "create-color-styles": async () => await createColorStyles(),
      "create-local-styles": async () => { await createLocalStyleFromSelection() },

      // --- Synchronization ---
      "sync-color-styles": async () => { await syncColorStyles(); },
      "sync-text-styles": async () => { await syncTextStyles(); },

      // --- Reset / cleanup ---
      "reset-all-instances": async () => await resetAllInstances(),

      // --- Scanning ---
      "scan-elements": async () => await handleScan(module, options),
      "scan-images": async () => await scanImages(options),

      // --- Focus & navigation ---
      "focus-node": async () => await focusNode(id),
      "focus-text": async () => await focusText(msg),
      "focus-color": async () => await focusColor(msg),

      // --- Exporting ---
      "export-bulk-images": async () => await exportBulkImages(options),

      // --- Accessibility ---
      "check-accessibility": async () => await checkAccessibility(),
    };

    const action = actions[type];
    if (action) {
      await action();
    } else {
      console.warn(`⚠️ Unknown message type received: ${type}`);
      figma.notify("⚠️ Unknown message type received.");
    }
  } catch (err) {
    console.error("❌ Error in controller:", err);
    figma.notify("❌ Something went wrong. Check console for details.");
  }
};

// 🧠 Global cache to store the last successful scan (for focus operations)
export let lastScanCache: { module: string; nodeIds: string[] } | null = null;

/**
 * 🔍 Executes a scan for the specified module ("colors" or "text")
 * - Works for selection or entire page.
 * - Sends scan results directly back to the UI.
 */
export async function handleScan(
  module: string,
  options?: { scope?: "selection" | "page" }
): Promise<void> {
  const scope = options?.scope || "selection";

  // 🧩 Define the nodes to scan
  const nodes: SceneNode[] =
    scope === "page"
      ? [...figma.currentPage.children]
      : [...figma.currentPage.selection];

  // ⚠️ If empty, fallback to entire page
  if (!nodes.length) {
    figma.notify("🔍 No selection found, scanning entire page...");
    nodes.push(...figma.currentPage.children);
  }

  // 🧠 Map available scanners — acepta ambos tipos de funciones
  const scanners: Record<
    string,
    | ((nodes: readonly SceneNode[]) => Promise<any[]>)
    | ((opts: { scope?: "selection" | "page" }) => Promise<any[]>)
  > = {
    colors: scanColors,
    text: scanTextStyles,
  };

  const scanFn = scanners[module];
  if (!scanFn) {
    figma.notify(`⚠️ Unknown scan module: ${module}`);
    return;
  }

  try {
    // 🚀 Run the scan intelligently
    let data: any[] = [];

    // Si la función espera un array de nodos
    if (scanFn.length === 1 && Array.isArray(nodes)) {
      try {
        data = await (scanFn as (nodes: readonly SceneNode[]) => Promise<any[]>)(nodes);
      } catch {
        // Si falla, intenta con scope
        data = await (scanFn as (opts: { scope?: "selection" | "page" }) => Promise<any[]>)({
          scope,
        });
      }
    } else {
      // Si la función espera un objeto { scope }
      data = await (scanFn as (opts: { scope?: "selection" | "page" }) => Promise<any[]>)({
        scope,
      });
    }

    if (!Array.isArray(data)) throw new Error("Scan function did not return an array");

    // 📤 Send results to UI
    figma.ui.postMessage({
      type: "scan-result",
      module,
      data,
    });

  } catch (err) {
    console.error("❌ Scan failed:", err);
    figma.notify("❌ Scan failed. Check console for details.");
    figma.ui.postMessage({
      type: "scan-result",
      error: "Scan failed due to an unexpected error.",
    });
  }
}
