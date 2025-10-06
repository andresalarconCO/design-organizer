import React from "react";

interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Title: React.FC<TitleProps> = ({ level = 2, children, style }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const baseStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "Inter, system-ui, sans-serif",
    color: "var(--figma-color-text)",
    fontWeight: level === 1 ? 700 : level === 2 ? 600 : 500,
    fontSize:
      level === 1
        ? 20
        : level === 2
        ? 16
        : level === 3
        ? 14
        : level === 4
        ? 13
        : 12,
    lineHeight: "1.4em",
  };

  return <Tag style={{ ...baseStyle, ...style }}>{children}</Tag>;
};
