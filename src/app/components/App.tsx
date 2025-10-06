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

  const handleBack = () => {
    setActiveModule(null);
    setScanResult([]);
  };

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
