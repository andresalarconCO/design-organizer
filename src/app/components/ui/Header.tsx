import React from "react";

export const Header = ({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) => (
  <header
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 16,
    }}
  >
    {onBack && (
      <button
        onClick={onBack}
        style={{
          background: "var(--figma-color-bg-secondary)",
          color: "var(--figma-color-text)",
          border: "1px solid var(--figma-color-border)",
          borderRadius: 8,
          padding: "6px 12px",
          alignSelf: "flex-start",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        ← Back
      </button>
    )}
    <h2
      style={{
        fontWeight: 600,
        fontSize: 18,
        margin: 0,
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        style={{
          color: "var(--figma-color-text-secondary)",
          fontSize: 13,
          margin: 0,
        }}
      >
        {subtitle}
      </p>
    )}
  </header>
);
