import React from "react";
import { AbsoluteFill } from "remotion";
import type { ColorGrade } from "../pipeline/types";

export interface ColorGradeLayerProps {
  grade: ColorGrade;
}

export const ColorGradeLayer: React.FC<ColorGradeLayerProps> = ({ grade }) => {
  const filter = [
    `brightness(${grade.brightness})`,
    `contrast(${grade.contrast})`,
    `saturate(${grade.saturate})`,
    grade.sepia > 0 ? `sepia(${grade.sepia})` : "",
    grade.hue_rotate !== 0 ? `hue-rotate(${grade.hue_rotate}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (filter === "brightness(1) contrast(1) saturate(1)") {
    return null; // no-op grade, skip rendering
  }

  return (
    <AbsoluteFill
      style={{
        filter,
        pointerEvents: "none",
        mixBlendMode: "normal",
      }}
    />
  );
};
