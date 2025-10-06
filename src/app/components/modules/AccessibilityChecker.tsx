import React, { useEffect, useState } from "react";
import { Button, Title, Description, Footer } from "../ui";

export const AccessibilityChecker = ({ onBack }: { onBack: () => void }) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScan = () => {
        setLoading(true);
        parent.postMessage({ pluginMessage: { type: "check-accessibility" } }, "*");
    };

    useEffect(() => {
        const listener = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;
            if (msg?.type === "accessibility-result") {
                setResults(msg.results);
                setLoading(false);
            }
        };
        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    }, []);

    const toHex = (v: number) =>
        Math.round(v * 255)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase();

    const VariationCell = ({
        title,
        bg,
        text,
        passes,
        ratio,
    }: {
        title: string;
        bg: string;
        text: string;
        passes: boolean;
        ratio: number;
    }) => (
        <div
            style={{
                background: bg,
                color: text,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 64,
                borderRight: "1px solid var(--figma-color-border)",
                borderBottom: "1px solid var(--figma-color-border)",
                fontSize: 11,
                fontWeight: 500,
                transition: "0.2s ease",
            }}
        >
            <span>{title}</span>
            <span
                style={{
                    marginTop: 4,
                    background: passes ? "#27AE60" : "#C0392B",
                    color: "white",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 10,
                }}
            >
                {passes ? `Pass (${ratio?.toFixed?.(2)})` : `Fail (${ratio?.toFixed?.(2)})`}
            </span>
        </div>
    );

    const getAccessibilitySummary = (r: any) => {
        const combos = [
            r.passesBlackAA,
            r.passesWhiteAA,
            r.passesOnWhiteAA,
            r.passesOnBlackAA,
            r.passesOnGrayLight,
            r.passesOnGrayDark,
            r.passesGrayDarkText,
            r.passesGrayLightText,
        ].filter(Boolean).length;

        if (combos >= 7)
            return { color: "#27AE60", label: "Excellent", desc: "Most combinations pass accessibility" };
        if (combos >= 4)
            return { color: "#27AE60", label: "Good", desc: "Some combinations are accessible" };
        return { color: "#E74C3C", label: "Poor", desc: "Most combinations fail contrast checks" };
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
                    {loading ? "Scanning..." : "♿ Check Accessibility"}
                </Button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                <Title>Accessibility Checker (WCAG 2.2)</Title>
                <Description>
                    Evaluate the contrast of your selected color against multiple real-world backgrounds.
                </Description>

                {results.length === 0 && !loading && (
                    <p style={{ fontSize: 13, opacity: 0.6, marginTop: 12 }}>
                        No results yet. Click “Check Accessibility” to start.
                    </p>
                )}

                {results.map((r, i) => {
                    const hex = `#${toHex(r.color.r)}${toHex(r.color.g)}${toHex(r.color.b)}`;
                    const summary = getAccessibilitySummary(r);

                    return (
                        <div
                            key={i}
                            style={{
                                border: "1px solid var(--figma-color-border)",
                                borderRadius: 14,
                                padding: "18px 16px",
                                marginTop: 18,
                                background: "var(--figma-color-bg-secondary)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 14,
                            }}
                        >

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        background: hex,
                                        border: "1px solid var(--figma-color-border)",
                                    }}
                                />
                                <strong style={{ fontSize: 14 }}>{hex}</strong>
                            </div>

                            <div
                                style={{
                                    marginTop: 10,
                                    border: "1px solid var(--figma-color-border)",
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                                }}
                            >
                                <div
                                    style={{
                                        background: "var(--figma-color-bg-secondary)",
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        opacity: 0.8,
                                        borderBottom: "1px solid var(--figma-color-border)",
                                    }}
                                >
                                    Variations
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        borderBottom: "1px solid var(--figma-color-border)",
                                    }}
                                >
                                    <VariationCell
                                        title="Text Black"
                                        bg={hex}
                                        text="#000"
                                        passes={r.passesBlackAA}
                                        ratio={r.contrastBlack}
                                    />
                                    <VariationCell
                                        title="Text White"
                                        bg={hex}
                                        text="#FFF"
                                        passes={r.passesWhiteAA}
                                        ratio={r.contrastWhite}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        borderBottom: "1px solid var(--figma-color-border)",
                                    }}
                                >
                                    <VariationCell
                                        title="Text Color / White"
                                        bg="#FFF"
                                        text={hex}
                                        passes={r.passesOnWhiteAA}
                                        ratio={r.contrastOnWhite}
                                    />
                                    <VariationCell
                                        title="Text Color / Black"
                                        bg="#000"
                                        text={hex}
                                        passes={r.passesOnBlackAA}
                                        ratio={r.contrastOnBlack}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        borderBottom: "1px solid var(--figma-color-border)",
                                    }}
                                >
                                    <VariationCell
                                        title="Text Color / Gray Light"
                                        bg="#E0E0E0"
                                        text={hex}
                                        passes={r.passesOnGrayLight}
                                        ratio={r.contrastOnGrayLight}
                                    />
                                    <VariationCell
                                        title="Text Color / Gray Dark"
                                        bg="#2E2E2E"
                                        text={hex}
                                        passes={r.passesOnGrayDark}
                                        ratio={r.contrastOnGrayDark}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
                                    <VariationCell
                                        title="Color / Gray Dark"
                                        bg={hex}
                                        text="#333333"
                                        passes={r.passesGrayDarkText}
                                        ratio={r.contrastGrayDarkText}
                                    />
                                    <VariationCell
                                        title="Color / Gray Light"
                                        bg={hex}
                                        text="#F5F5F5"
                                        passes={r.passesGrayLightText}
                                        ratio={r.contrastGrayLightText}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 12,
                                    border: "1px solid var(--figma-color-border)",
                                    borderRadius: 10,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        background: "var(--figma-color-bg-secondary)",
                                        padding: "6px 10px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        opacity: 0.8,
                                    }}
                                >
                                    UI Contexts
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        borderTop: "1px solid var(--figma-color-border)",
                                    }}
                                >

                                    <div
                                        style={{
                                            background: "#FFF",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: 70,
                                            borderRight: "1px solid var(--figma-color-border)",
                                            borderBottom: "1px solid var(--figma-color-border)",
                                            gap: 4,
                                        }}
                                    >
                                        <svg
                                            width="22"
                                            height="22"
                                            viewBox="0 0 24 24"
                                            fill={hex}
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: "#555",
                                            }}
                                        >
                                            Icon Light
                                        </span>
                                        <span
                                            style={{
                                                background: r.passesIconLight ? "#27AE60" : "#C0392B",
                                                color: "white",
                                                borderRadius: 3,
                                                padding: "1px 5px",
                                                fontSize: 9,
                                            }}
                                        >
                                            {r.passesIconLight ? `Pass (${r.contrastIconLight})` : `Fail (${r.contrastIconLight})`}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            background: "#2E2E2E",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: 70,
                                            borderBottom: "1px solid var(--figma-color-border)",
                                            gap: 4,
                                        }}
                                    >
                                        <svg
                                            width="22"
                                            height="22"
                                            viewBox="0 0 24 24"
                                            fill={hex}
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: "#EEE",
                                            }}
                                        >
                                            Icon Dark
                                        </span>
                                        <span
                                            style={{
                                                background: r.passesIconDark ? "#27AE60" : "#C0392B",
                                                color: "white",
                                                borderRadius: 3,
                                                padding: "1px 5px",
                                                fontSize: 9,
                                            }}
                                        >
                                            {r.passesIconDark ? `Pass (${r.contrastIconDark})` : `Fail (${r.contrastIconDark})`}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            background: "#F8F8F8",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: 70,
                                            borderRight: "1px solid var(--figma-color-border)",
                                            borderBottom: "1px solid var(--figma-color-border)",
                                            gap: 4,
                                        }}
                                    >
                                        <div
                                            style={{
                                                border: `2px solid ${hex}`,
                                                width: 80,
                                                height: 22,
                                                borderRadius: 4,
                                            }}
                                        />
                                        <span style={{ fontSize: 10, color: "#555" }}>Input Border</span>
                                        <span
                                            style={{
                                                background: r.passesBorderLight ? "#27AE60" : "#C0392B",
                                                color: "white",
                                                borderRadius: 3,
                                                padding: "1px 5px",
                                                fontSize: 9,
                                            }}
                                        >
                                            {r.passesBorderLight
                                                ? `Pass (${r.contrastBorderLight})`
                                                : `Fail (${r.contrastBorderLight})`}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            background: "var(--figma-color-bg)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: 70,
                                            borderBottom: "1px solid var(--figma-color-border)",
                                            gap: 4,
                                        }}
                                    >
                                        <button
                                            style={{
                                                background: hex,
                                                color: r.passesButtonTextWhite ? "#FFF" : "#000",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                border: "none",
                                                borderRadius: 5,
                                                padding: "4px 10px",
                                                cursor: "default",
                                            }}
                                        >
                                            Button
                                        </button>
                                        <span style={{ fontSize: 10, color: "#777" }}>Text Contrast</span>
                                        <span
                                            style={{
                                                background:
                                                    r.passesButtonTextWhite || r.passesButtonTextBlack
                                                        ? "#27AE60"
                                                        : "#C0392B",
                                                color: "white",
                                                borderRadius: 3,
                                                padding: "1px 5px",
                                                fontSize: 9,
                                            }}
                                        >
                                            {(r.passesButtonTextWhite || r.passesButtonTextBlack)
                                                ? `Pass (${r.passesButtonTextWhite
                                                    ? r.contrastButtonTextWhite
                                                    : r.contrastButtonTextBlack
                                                })`
                                                : `Fail (${r.contrastButtonTextWhite})`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: summary.color + "22",
                                    borderRadius: 8,
                                    border: `1px solid ${summary.color}`,
                                    padding: "10px 12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 2,
                                            background: summary.color,
                                        }}
                                    />
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{summary.label}</span>
                                </div>
                                <span style={{ fontSize: 12, opacity: 0.8 }}>{summary.desc}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Footer />
        </div>
    );
};
