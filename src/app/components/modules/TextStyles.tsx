import React, { useMemo } from "react";
import { Button, Tag, Title, Description, Footer } from "../ui";

export const TextStyles = ({ onBack, data }: { onBack: () => void; data: any[] }) => {
  const grouped = useMemo(() => {
    const map = new Map<string, any>();
    data.forEach((t) => {
      const key = `${t.fontName.family}|${t.fontName.style}|${t.fontSize}|${t.lineHeight?.value}|${t.letterSpacing}`;
      if (!map.has(key)) {
        map.set(key, { ...t, count: 1 });
      } else {
        map.get(key).count += 1;
      }
    });
    return Array.from(map.values());
  }, [data]);

  const handleFocusGroup = (font: any) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "focus-group",
          fontFamily: font.fontName,
          fontSize: font.fontSize,
        },
      },
      "*"
    );
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
        <Button
          variant="primary"
          style={{
            fontWeight: 600,
            letterSpacing: "0.3px",
            padding: "8px 14px",
          }}
          onClick={() =>
            parent.postMessage({ pluginMessage: { type: "scan-elements", module: "text" } }, "*")
          }
        >
          ⟳ Refresh
        </Button>
      </div>

      {/* Contenido */}
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
            Review all detected text styles and their typographic details.
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
            }}
            onClick={() => handleFocusGroup(t)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--figma-color-bg-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--figma-color-bg-secondary)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
            }}
          >
            {/* CABECERA de la tarjeta */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {t.fontName.family} – {t.fontName.style}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  style={{
                    background: "#007AFF",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    parent.postMessage(
                      { pluginMessage: { type: "focus-node", id: t.id } },
                      "*"
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#005FCC";

                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#007AFF";
                  }}
                >
                  🔍 Focus
                </button>
                <Tag type={t.origin as "Local" | "Team" | "Unlinked"} />
              </div>
            </div>

            {/* Detalles tipográficos */}
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
              <div>
                Line height:{" "}
                {t.lineHeight?.unit === "PERCENT"
                  ? `${Math.round(t.lineHeight.value)}%`
                  : t.lineHeight?.unit === "PIXELS"
                    ? `${Math.round(t.lineHeight.value)}px`
                    : "Auto"}

              </div>
              <div>
                Letter spacing:{" "}
                {t.letterSpacing
                  ? t.letterSpacing.unit === "PERCENT"
                    ? `${t.letterSpacing.value}%`
                    : `${t.letterSpacing.value}px`
                  : "0px"}
              </div>
              <div>Uses: {t.count}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};
