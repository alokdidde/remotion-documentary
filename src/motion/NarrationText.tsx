// NarrationText.tsx — Wraps AnimatedText with word-split stagger,
// positioned by TitleStyle.position

import React from "react";
import { AnimatedText } from "remotion-bits";

export interface NarrationTextProps {
  text: string;
  position?: "center" | "lower-third" | "upper-left" | "upper-right";
  fontSize?: number;
  color?: string;
  background?: string;
}

export const NarrationText: React.FC<NarrationTextProps> = ({
  text,
  position = "lower-third",
  fontSize = 36,
  color = "#ffffff",
  background,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        ...getPosition(position),
        zIndex: 20,
      }}
    >
      <AnimatedText
        transition={{
          opacity: [0, 1],
          y: [15, 0],
          duration: 12,
          easing: "easeOutCubic",
          split: "word",
          splitStagger: 2,
        }}
        style={{
          fontSize,
          color,
          background: background || "rgba(0, 0, 0, 0.6)",
          padding: "8px 20px",
          borderRadius: 6,
          lineHeight: 1.5,
          maxWidth: "80vw",
        }}
      >
        {text}
      </AnimatedText>
    </div>
  );
};

function getPosition(position: string): React.CSSProperties {
  switch (position) {
    case "center":
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center" as const,
      };
    case "lower-third":
      return {
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center" as const,
      };
    case "upper-left":
      return { top: "8%", left: "8%" };
    case "upper-right":
      return { top: "8%", right: "8%" };
    default:
      return {
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
      };
  }
}
