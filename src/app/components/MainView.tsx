import React, { useState } from "react";
import { Button, Title, Description, Footer } from "./ui";
import logo from "../assets/logo.svg";

export const MainView = ({
  setActiveModule,
}: {
  setActiveModule: (m: string) => void;
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleScan = () => {
    if (!selectedModule) {
      figma.notify?.("Please select a category first.") ||
        alert("Please select a category first.");
      return;
    }

    parent.postMessage(
      { pluginMessage: { type: "scan-elements", module: selectedModule } },
      "*"
    );
  };

  const mainModules = [
    { id: "colors", label: "🎨 Color Variables" },
    { id: "text", label: "✍️ Text Styles" },
  ];

  const extraModules = [
    { id: "sync", label: "🧩 Generators & Sync" },
    { id: "export-bulk-images", label: "🖼️ Export Bulk Images" },
    { id: "accessibility", label: "♿ Accessibility Checker" },
  ];

  const canScan = ["colors", "text"].includes(selectedModule || "");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "16px 0px 0px 0px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "var(--figma-color-bg)",
        color: "var(--figma-color-text)",
      }}
    >
      {/* --- Main content area --- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 320,
          textAlign: "center",
          gap: 10,
        }}
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Design Organizer"
          width={64}
          height={64}
          style={{
            borderRadius: 8,
            boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
            marginBottom: 10,
            padding: 5,
          }}
        />

        {/* Title */}
        <Title level={1} style={{ fontSize: 18 }}>
          Design Organizer
        </Title>
        <Description style={{ fontSize: 13, opacity: 0.8 }}>
          Simplify, scan and organize your design system in seconds.
        </Description>

        <div
          style={{
            height: 1,
            background: "var(--figma-color-border)",
            width: "80%",
            margin: "14px 0 12px",
            opacity: 0.5,
          }}
        />

        {/* --- Main categories --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 10,
          }}
        >
                      <Title
            level={3}
            style={{
              fontSize: 13,
              opacity: 0.75,
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Smart Scanning
          </Title>
          {mainModules.map((btn) => {
            const isActive = selectedModule === btn.id;
            return (
              <Button
                key={btn.id}
                variant={isActive ? "primary" : "secondary"}
                width="fill"
                onClick={() => setSelectedModule(btn.id)}
                style={{
                  transition: "all 0.2s ease",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                {btn.label}
              </Button>
            );
          })}
        </div>

        {/* --- Scan button --- */}
        <div
          style={{
            width: "100%",
            marginTop: canScan ? 0 : 0,
            maxHeight: canScan ? 100 : 0,
            overflow: "hidden",
            opacity: canScan ? 1 : 0,
            transition: "all 0.3s ease",
          }}
        >
          {canScan && (
            <Button
              variant="primary"
              width="fill"
              onClick={handleScan}
              style={{
                transition: "0.2s ease",
              }}
            >
              Scan Selected Elements
            </Button>
          )}
        </div>

        {/* --- Extra functions --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 8,
            marginTop: 20,
          }}
        >
          <Title
            level={3}
            style={{
              fontSize: 13,
              opacity: 0.75,
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Power Tools
          </Title>

          {extraModules.map((btn) => {
            const isActive = selectedModule === btn.id;
            return (
              <Button
                key={btn.id}
                variant={isActive ? "primary" : "secondary"}
                width="fill"
                onClick={() => {
                  setSelectedModule(btn.id);
                  setActiveModule(btn.id);
                }}
                style={{
                  transition: "all 0.2s ease",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                {btn.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* --- Footer full width --- */}
      <div style={{ width: "100%", marginTop: 16 }}>
        <Footer />
      </div>
    </div>
  );
};
