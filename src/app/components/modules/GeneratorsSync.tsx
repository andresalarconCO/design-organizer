import React from "react";
import { Button, Footer } from "../ui";

export const GeneratorsSync = ({ onBack }: { onBack: () => void }) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "var(--figma-color-bg)",
        color: "var(--figma-color-text)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          borderBottom: "1px solid var(--figma-color-border)",
          background: "var(--figma-color-bg-secondary)",
        }}
      >
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 26px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Intro */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          <h1
            style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Streamline your style workflow
          </h1>
          <p
            style={{
              fontSize: 13,
              opacity: 0.7,
              maxWidth: 300,
              margin: "0 auto",
              lineHeight: 1.4,
            }}
          >
            Generate, sync, and reset text and color styles — all in one place.
          </p>
        </div>

        {/* Step 1 */}
        <section
          style={{
            background: "var(--figma-color-bg-secondary)",
            border: "1px solid var(--figma-color-border)",
            borderRadius: 12,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "#A66CFF22",
                color: "#A66CFF",
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              1
            </div>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Create local styles
            </h2>
          </div>

          <p
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              opacity: 0.7,
            }}
          >
            Select elements in your design and generate <b>color</b> or{" "}
            <b>text styles</b> based on their properties.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button
              width="fill"
              variant="primary"
              onClick={() =>
                parent.postMessage(
                  { pluginMessage: { type: "create-color-styles" } },
                  "*"
                )
              }
            >
              🎨 Create color styles
            </Button>
            <Button
              width="fill"
              variant="primary"
              onClick={() =>
                parent.postMessage(
                  { pluginMessage: { type: "create-text-styles" } },
                  "*"
                )
              }
            >
              ✍️ Create text styles
            </Button>
          </div>
        </section>

        {/* Step 2 */}
        <section
          style={{
            background: "var(--figma-color-bg-secondary)",
            border: "1px solid var(--figma-color-border)",
            borderRadius: 12,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "#00C89622",
                color: "#00C896",
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              2
            </div>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Sync with team styles
            </h2>
          </div>

          <p
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              opacity: 0.7,
            }}
          >
            Connect your local styles with existing <b>global team styles</b> and
            keep your design consistent.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <Button
              variant="secondary"
              onClick={() =>
                parent.postMessage(
                  { pluginMessage: { type: "sync-color-styles" } },
                  "*"
                )
              }
            >
                Sync color styles
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                parent.postMessage(
                  { pluginMessage: { type: "sync-text-styles" } },
                  "*"
                )
              }
            >
              Sync text styles
            </Button>
          </div>

          <Button
            variant="danger"
            width="fill"
            onClick={() =>
              parent.postMessage(
                { pluginMessage: { type: "reset-all-instances" } },
                "*"
              )
            }
          >
            Reset all instances
          </Button>
        </section>
      </div>

      <Footer />
    </div>
  );
};
