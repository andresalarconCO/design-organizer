import React from "react";

export const Footer = ({
  text = "Design Organizer",
  version = "v1.0",
  link = "",
}: {
  text?: string;
  version?: string;
  link?: string;
}) => (
  <footer
    style={{
      padding: "10px 16px",
      textAlign: "center",
      fontSize: 11,
      color: "var(--figma-color-text-secondary)",
      borderTop: "1px solid var(--figma-color-border)",
      background: "var(--figma-color-bg-secondary)",
      marginTop: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    }}
  >
    <span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "var(--figma-color-text-secondary)",
            textDecoration: "none",
          }}
        >
          {text}
        </a>
      ) : (
        text
      )}
      {version && <span style={{ marginLeft: 6, opacity: 0.6 }}>{version}</span>}
    </span>

    <span style={{ opacity: 0.6 }}>
      · Made by <strong style={{ opacity: 0.9 }}>Andrés Osorio</strong>
    </span>
  </footer>
);
