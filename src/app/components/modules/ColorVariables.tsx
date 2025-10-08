import React, { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Title } from "../ui/Title";
import { Description } from "../ui/Description";
import { Footer } from "../ui/Footer";

export const ColorVariables = ({
  onBack,
  data,
}: {
  onBack: () => void;
  data: any[];
}) => {
  const [scope, setScope] = useState<"selection" | "page">("selection");
  const [isScanning, setIsScanning] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, any>();
    data.forEach((c) => {
      const key = `${c.value}|${c.opacity}|${c.origin}`;
      if (!map.has(key)) {
        map.set(key, { ...c, count: 1 });
      } else {
        map.get(key).count += 1;
      }
    });
    return Array.from(map.values());
  }, [data]);

  const handleFocusColor = (hex: string, opacity: number) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "focus-color",
          colorHex: hex,
          opacity: Number(opacity),
          options: { scope },
        },
      },
      "*"
    );
  };

  const handleScan = () => {
    setIsScanning(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: "scan-elements",
          module: "colors",
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--figma-color-border)",
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

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Title>Color Variables ({grouped.length})</Title>
        <Description>
          Review all detected solid colors and their link origin.
        </Description>

        {grouped.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: "var(--figma-color-bg-secondary)",
              border: "1px solid var(--figma-color-border)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleFocusColor(c.value, Number(c.opacity))}
            onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--figma-color-bg-hover)")
            }
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "var(--figma-color-bg-secondary)")
            }
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: c.value,
                opacity: c.opacity / 100,
                border: "1px solid var(--figma-color-border)",
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {c.value.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--figma-color-text-secondary)",
                }}
              >
                {c.opacity}% · {c.count} uses
              </div>
            </div>

            <span style={tag(c.origin)}>{c.origin}</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

const tag = (type: string): React.CSSProperties => ({
  display: "inline-block",
  background:
    type === "Team"
      ? "#A05EF8"
      : type === "Local"
        ? "#4CAF50"
        : "#F44336",
  color: "white",
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: 4,
  textTransform: "uppercase",
});
