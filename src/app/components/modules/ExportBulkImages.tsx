import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { Button, Title, Description, Footer } from "../ui";

export const ExportBulkImages = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ name: string; bytes: Uint8Array }[]>([]);
  const [quality, setQuality] = useState(80);
  const [exportAsZip] = useState(true);

  const handleScan = () => {
    setLoading(true);
    parent.postMessage(
      { pluginMessage: { type: "export-bulk-images", options: { quality } } },
      "*"
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === "export-bulk-result") {
        setImages(msg.images);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // --- Exportar todas ---
  // --- Utilidad: optimizar usando canvas ---
  const optimizeImage = async (
    bytes: Uint8Array,
    quality: number
  ): Promise<{ blob: Blob; format: string }> => {
    return new Promise((resolve) => {
      // @ts-ignore
      const blob = new Blob([bytes], { type: "image/png" });
      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve({ blob, format: "png" });

        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Detectar si tiene transparencia
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const hasTransparency = imageData.data.some(
          (value, index) => index % 4 === 3 && value < 255
        );

        // Selección automática de formato
        const format = hasTransparency ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (optimizedBlob) => {
            resolve({
              blob: optimizedBlob || blob,
              format: hasTransparency ? "png" : "jpg",
            });
            URL.revokeObjectURL(img.src);
          },
          format,
          quality / 100
        );
      };

      img.onerror = () => resolve({ blob, format: "png" });
    });
  };

  // --- Exportar todas ---
  const handleExportAll = async () => {
    if (!images.length) return;
    setLoading(true);

    const zip = new JSZip();
    for (const img of images) {
      const { blob, format } = await optimizeImage(img.bytes, quality);
      const newName = img.name.replace(/\.(png|jpg|jpeg|webp)$/i, `.${format}`);
      zip.file(newName, blob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized_images.zip";
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
  };

  // --- Export individual ---
  const handleExportSingle = async (img: { name: string; bytes: Uint8Array }) => {
    setLoading(true);
    const { blob, format } = await optimizeImage(img.bytes, quality);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = img.name.replace(/\.(png|jpg|jpeg|webp)$/i, `.${format}`);
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  const toImageBlob = (bytes: Uint8Array, type = "image/png"): Blob => {
    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );
    // @ts-ignore
    return new Blob([arrayBuffer], { type });
  };


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--figma-color-bg)",
        color: "var(--figma-color-text)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px",
          borderBottom: "1px solid var(--figma-color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--figma-color-bg-secondary)",
        }}
      >
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "🔍 Scan Images"}
        </Button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Title>Export Bulk Images</Title>
        <Description>Scan, optimize, and export all image fills from your selection.</Description>

        {/* Quality Slider */}
        <div>
          <label style={{ fontSize: 12 }}>Optimization Quality: {quality}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Export Mode
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
          <input
            type="checkbox"
            checked={exportAsZip}
            onChange={() => setExportAsZip(!exportAsZip)}
          />
          Export as ZIP file
        </label> */}

        {/* Exported Images List */}
        {images.length > 0 && (
          <>
            <Button variant="primary" onClick={handleExportAll}>
              {exportAsZip ? "📦 Export All as ZIP" : "💾 Download All"}
            </Button>

            <div
              style={{
                border: "1px solid var(--figma-color-border)",
                borderRadius: 8,
                padding: "8px",
                background: "var(--figma-color-bg-secondary)",
                maxHeight: "auto",
                overflowY: "auto",
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderBottom: "1px solid var(--figma-color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={URL.createObjectURL(toImageBlob(img.bytes))}
                      alt={img.name}
                      style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }}
                    />

                    <span style={{ fontSize: 12 }}>{img.name}</span>
                  </div>
                  <Button
                    variant="secondary"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                    onClick={() => handleExportSingle(img)}
                  >
                    Export
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};
