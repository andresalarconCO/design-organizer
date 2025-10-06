import { useEffect } from "react";

export function useFigmaTheme() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.documentElement.style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--figma-color-bg");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
}
