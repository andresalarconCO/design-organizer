import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    {...props}
    style={{
      background: "var(--figma-color-bg-secondary)",
      borderRadius: 12,
      padding: 16,
      boxShadow: "inset 0 0 0 1px var(--figma-color-border)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style,
    }}
  >
    {children}
  </div>
);
