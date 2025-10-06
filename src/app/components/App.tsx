import React, { useEffect, useState } from "react";
import { ColorVariables } from "./modules/ColorVariables";
import { TextStyles } from "./modules/TextStyles";
import { GeneratorsSync } from "./modules/GeneratorsSync";
import { ExportBulkImages } from "./modules/ExportBulkImages"; // 👈 nuevo módulo
import { MainView } from "./MainView";
import { useFigmaTheme } from "./hooks/useFigmaTheme";
import { AccessibilityChecker } from "./modules/AccessibilityChecker";

export default function App() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any[]>([]);

  useFigmaTheme();

  // --- Escucha los mensajes desde controller.ts ---
  useEffect(() => {
    window.onmessage = (event) => {
      const { type, module, data, error } = event.data.pluginMessage || {};
      if (type === "scan-result") {
        if (error) alert(error);
        else {
          setActiveModule(module);
          setScanResult(data);
        }
      }
    };
  }, []);

  // --- Manejo del botón "Back" ---
  const handleBack = () => {
    setActiveModule(null);
    setScanResult([]);
  };

  // --- Render dinámico según módulo activo ---
  return (
    <div id="app-container">
      {activeModule === "colors" && (
        <ColorVariables onBack={handleBack} data={scanResult} />
      )}
      {activeModule === "text" && (
        <TextStyles onBack={handleBack} data={scanResult} />
      )}
      {activeModule === "sync" && (
        <GeneratorsSync onBack={handleBack} />
      )}
      {activeModule === "export-bulk-images" && ( // 👇 nuevo bloque
        <ExportBulkImages onBack={handleBack} />
      )}
      {activeModule === "accessibility" && <AccessibilityChecker onBack={handleBack} />}
      {!activeModule && (
        <MainView setActiveModule={setActiveModule} />
      )}
    </div>
  );
}
