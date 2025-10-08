import React, { useMemo, useState } from "react";
import { Button, Tag, Title, Description, Footer } from "../ui";

export const TextStyles = ({
  onBack,
  data,
}: {
  onBack: () => void;
  data: any[];
}) => {
  const [scope, setScope] = useState<"selection" | "page">("selection");
  const [isScanning, setIsScanning] = useState(false);

  // ✅ Group by font + style + size + decoration + case + color
  const grouped = useMemo(() => {
    const map = new Map<string, any>();
    data.forEach((t) => {
      const key = [
        t.fontName.family,
        t.fontName.style,
        t.fontSize,
        t.textDecoration,
        t.textCase,
      ].join("|");

      if (!map.has(key)) map.set(key, { ...t, count: 1 });
      else map.get(key).count += 1;
    });
    return Array.from(map.values());
  }, [data]);

  const handleFocusText = (t: any) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "focus-text",
          fontFamily: { family: t.fontName.family, style: t.fontName.style },
          fontSize: t.fontSize,
          textDecoration: t.textDecoration,
          textCase: t.textCase,
          options: { scope },
        },
      },
      "*"
    );
  };


  // 🔄 Trigger new scan
  const handleScan = () => {
    setIsScanning(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: "scan-elements",
          module: "text",
          options: { scope },
        },
      },
      "*"
    );
    setTimeout(() => setIsScanning(false), 1500);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--figma-color-bg)",
        color: "var(--figma-color-text)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 20px",
          borderBottom: "1px solid var(--figma-color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--figma-color-bg-secondary)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={scope}
            onChange={(e) =>
              setScope(e.target.value as "selection" | "page")
            }
            style={{
              background: "var(--figma-color-bg)",
              border: "1px solid var(--figma-color-border)",
              borderRadius: 6,
              color: "var(--figma-color-text)",
              fontSize: 12,
              padding: "4px 8px",
              outline: "none",
            }}
          >
            <option value="selection">Selection</option>
            <option value="page">Entire page</option>
          </select>

          <Button
            variant="primary"
            style={{
              fontWeight: 600,
              letterSpacing: "0.3px",
              padding: "8px 14px",
              minWidth: 100,
            }}
            onClick={handleScan}
          >
            {isScanning ? "⏳ Scanning..." : "⟳ Refresh"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <Title>Text Styles ({grouped.length})</Title>
          <Description>
            Review all detected text styles, including decoration, case and color.
          </Description>
        </div>

        {grouped.map((t, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "16px 18px",
              borderRadius: 10,
              border: "1px solid var(--figma-color-border)",
              background: "var(--figma-color-bg-secondary)",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              cursor: "pointer",
              opacity: t.origin === "Restricted" ? 0.6 : 1,
            }}
            onClick={() => handleFocusText(t)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--figma-color-bg-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 2px 5px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "var(--figma-color-bg-secondary)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 1px 2px rgba(0,0,0,0.05)";
            }}
          >
            {/* Top Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
{t.origin === "Restricted" ? (
  "🔒 Restricted Layer"
) : (
  <>
    {`${t.fontName.family || t.fontName} – ${t.fontName.style || "Regular"}`}
    {t.textDecoration !== "NONE" && (
      <> <span style={{ opacity: 0.7 }}>• {t.textDecoration}</span></>
    )}
    {t.textCase !== "ORIGINAL" && (
      <> <span style={{ opacity: 0.7 }}>• {t.textCase}</span></>
    )}
  </>
)}
              </div>

              <Tag
                type={
                  t.origin as "Local" | "Team" | "Unlinked" | "Restricted"
                }
              />
            </div>

            {/* Text details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px 16px",
                fontSize: 12,
                color: "var(--figma-color-text-secondary)",
                lineHeight: "18px",
              }}
            >
              <div>Size: {t.fontSize}px</div>
              <div>Letter spacing: 0px</div>
              <div>Line height: Auto</div>
              <div>Uses: {t.count}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};
