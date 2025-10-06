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

    // --- Categorías principales ---
    const mainModules = [
        { id: "colors", label: "🎨 Color Variables" },
        { id: "text", label: "✍️ Text Styles" },
    ];

    // --- Otras herramientas ---
    const extraModules = [
        { id: "sync", label: "🧩 Generators & Sync" },
        { id: "export-bulk-images", label: "🖼️ Export Bulk Images" },
        { id: "accessibility", label: "♿ Accessibility Checker" }
    ];

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                padding: "32px 24px 16px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, system-ui, sans-serif",
                background: "var(--figma-color-bg)",
                color: "var(--figma-color-text)",
                position: "relative",
            }}
        >
            {/* --- Contenido principal --- */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 300,
                    textAlign: "center",
                    gap: 8,
                    paddingBottom: 40,
                }}
            >
                {/* Logo */}
                <img
                    src={logo}
                    alt="Design Organizer"
                    width={80}
                    height={80}
                    style={{ borderRadius: 6 }}
                />
                {/* Título y descripción */}
                <Title level={1}>Design Organizer</Title>
                <Description>Organize your design tokens with ease.</Description>

                {/* --- Sección principal --- */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        gap: 8,
                        marginTop: 12,
                        marginBottom: 0
                    }}
                >
                    <Title level={3} style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                        Main Categories
                    </Title>
                    {mainModules.map((btn) => {
                        const isActive = selectedModule === btn.id;
                        return (
                            <Button
                                key={btn.id}
                                variant={isActive ? "primary" : "secondary"}
                                width="fill"
                                onClick={() => setSelectedModule(btn.id)}
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </div>

                {/* --- Botón de acción --- */}
                <div style={{ width: "100%" }}>
                    <Button
                        variant="primary"
                        width="fill"
                        onClick={handleScan}
                        disabled={!selectedModule || !["colors", "text"].includes(selectedModule)}
                        style={{
                            opacity:
                                !selectedModule || !["colors", "text"].includes(selectedModule)
                                    ? 0.5
                                    : 1,
                            cursor:
                                !selectedModule || !["colors", "text"].includes(selectedModule)
                                    ? "not-allowed"
                                    : "pointer",
                            transition: "0.2s ease",
                        }}
                    >
                        🔍 Scan Selected Elements
                    </Button>
                    {(!selectedModule || !["colors", "text"].includes(selectedModule)) && (
                        <p
                            style={{
                                fontSize: 11,
                                color: "var(--figma-color-text-secondary)",
                                opacity: 0.6,
                                marginTop: 4,
                            }}
                        >
                            Select a main category before scanning.
                        </p>
                    )}
                </div>

                {/* --- Sección secundaria --- */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        gap: 8,
                    }}
                >
                    <Title level={3} style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                        Additional Functions
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
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* --- Footer Global --- */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <Footer />
            </div>
        </div>
    );
};
