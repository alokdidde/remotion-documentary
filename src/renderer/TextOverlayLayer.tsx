import React from "react";
import { Sequence } from "remotion";
import { AnimatedText } from "remotion-bits";
import type { CompiledTextEvent } from "../pipeline/types";

export interface TextOverlayLayerProps {
  events: CompiledTextEvent[];
  fps: number;
  segmentStartFrame: number;
}

export const TextOverlayLayer: React.FC<TextOverlayLayerProps> = ({
  events,
  segmentStartFrame,
}) => {
  return (
    <>
      {events.map((event, i) => {
        const localFrom = event.start_frame - segmentStartFrame;
        const duration = event.end_frame - event.start_frame;

        return (
          <Sequence
            key={i}
            from={localFrom}
            durationInFrames={duration}
          >
            <div
              style={{
                position: "absolute",
                ...getOverlayPosition(event.visual.style.position),
                zIndex: 10,
              }}
            >
              <AnimatedText
                transition={{
                  opacity: [0, 1],
                  y: [20, 0],
                  duration: 15,
                  easing: "easeOutCubic",
                  split: "word",
                  splitStagger: 3,
                }}
                style={{
                  fontSize: event.visual.style.font_size,
                  fontWeight: event.visual.style.font_weight,
                  color: event.visual.style.color,
                  background: event.visual.style.background || "transparent",
                  padding: "12px 24px",
                }}
              >
                {event.visual.text}
              </AnimatedText>
            </div>
          </Sequence>
        );
      })}
    </>
  );
};

function getOverlayPosition(position: string): React.CSSProperties {
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
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center" as const,
        width: "80%",
      };
    case "upper-left":
      return { top: "8%", left: "8%" };
    case "upper-right":
      return { top: "8%", right: "8%" };
    default:
      return {
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center" as const,
      };
  }
}
