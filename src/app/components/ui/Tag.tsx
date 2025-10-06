import React from "react";

interface TagProps {
  type: "Local" | "Team" | "Unlinked";
}

export const Tag: React.FC<TagProps> = ({ type }) => {
  const colors: Record<TagProps["type"], string> = {
    Local: "#4CAF50",
    Team: "#A05EF8",
    Unlinked: "#F44336",
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
