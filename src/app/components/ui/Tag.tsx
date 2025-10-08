import React from "react";

interface TagProps {
  type: "Unlinked" | "Team" | "Local" | "Restricted";
}

export const Tag: React.FC<TagProps> = ({ type }) => {
  // 🎨 Define a color for each tag type
  const colors: Record<TagProps["type"], string> = {
    Local: "#4CAF50",      // Green
    Team: "#A05EF8",       // Purple
    Unlinked: "#F44336",   // Red
    Restricted: "#FF9800", // Orange (warning)
  };

  return (
    <span
      style={{
        display: "inline-block",
        background: colors[type],
        color: "#fff",
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {type}
    </span>
  );
};
