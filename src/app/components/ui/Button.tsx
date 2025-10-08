import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  width?: "auto" | "fill" | "grow";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  width = "auto",
  style,
  ...rest
}) => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 500,
    fontSize: 13,
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
    flex:
      width === "fill"
        ? "1 1 100%"
        : width === "grow"
        ? "1 1 auto"
        : "0 0 auto",
    width: width === "fill" ? "100%" : "auto",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "#690AE6",
      color: "#fff",
    },
    secondary: {
      background: "var(--figma-color-bg)",
      border: "1px solid var(--figma-color-border)",
      color: "var(--figma-color-text)",
    },
    danger: {
      background: "#A81F00",
      color: "#fff",
    },
    success: {
      background: "#156034",
      color: "#fff",
    },
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.filter = "brightness(1.1)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.filter = "brightness(1)";
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
};
