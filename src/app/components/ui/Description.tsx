import React from "react";

interface DescriptionProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Description: React.FC<DescriptionProps> = ({ children, style }) => {
  return (
    <p
      style={{
        margin: 0,
        color: "var(--figma-color-text-secondary)",
        fontSize: 13,
        lineHeight: "1.5em",
        fontFamily: "Inter, system-ui, sans-serif",
        ...style,
      }}
    >
      {children}
    </p>
  );
};
