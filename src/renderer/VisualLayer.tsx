import React from "react";
import { Sequence, staticFile } from "remotion";
import { Element3D } from "remotion-bits";
import type { CompiledVisualEvent } from "../pipeline/types";
import { BackgroundVideo, BackgroundImage } from "../components/media/BackgroundVideo";

export interface VisualLayerProps {
  events: CompiledVisualEvent[];
  fps: number;
  segmentStartFrame: number;
}

export const VisualLayer: React.FC<VisualLayerProps> = ({
  events,
  fps,
  segmentStartFrame,
}) => {
  return (
    <>
      {events.map((event, i) => {
        const localFrom = event.frame - segmentStartFrame;

        return (
          <Sequence
            key={`${event.visual.id}-${i}`}
            from={localFrom}
            durationInFrames={event.duration_frames}
          >
            <Element3D
              x={event.element3d?.x ?? 0}
              y={event.element3d?.y ?? 0}
              z={event.element3d?.z ?? 0}
              transition={{
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 20,
                easing: "easeOutCubic",
              }}
            >
              <VisualContent event={event} />
            </Element3D>
          </Sequence>
        );
      })}
    </>
  );
};

const VisualContent: React.FC<{ event: CompiledVisualEvent }> = ({ event }) => {
  const { visual, animation, direction } = event;

  if (visual.type === "broll") {
    return (
      <BackgroundVideo
        src={staticFile(visual.src)}
        startFrom={
          visual.trim_start_seconds
            ? Math.round(visual.trim_start_seconds * 30)
            : undefined
        }
        overlay
      />
    );
  }

  if (visual.type === "image") {
    const animationType = mapAnimationToType(animation, direction);
    return (
      <BackgroundImage
        src={staticFile(visual.src)}
        animation={animationType as any}
      />
    );
  }

  if (visual.type === "title") {
    return (
      <div
        style={{
          position: "absolute",
          ...getTitlePosition(visual.style.position),
          fontSize: visual.style.font_size,
          fontWeight: visual.style.font_weight,
          color: visual.style.color,
          background: visual.style.background || "transparent",
          padding: "16px 32px",
        }}
      >
        {visual.text}
      </div>
    );
  }

  return null;
};

function mapAnimationToType(
  animation?: string,
  direction?: string
): string | undefined {
  if (!animation || animation === "static") return undefined;
  if (animation === "ken-burns") {
    if (direction === "zoom-in") return "zoomIn";
    if (direction === "zoom-out") return "zoomOut";
    if (direction === "pan-left") return "panLeft";
    if (direction === "pan-right") return "panRight";
    return "zoomIn";
  }
  if (animation === "slide") {
    if (direction === "pan-left") return "panLeft";
    if (direction === "pan-right") return "panRight";
    return "panLeft";
  }
  return undefined;
}

function getTitlePosition(
  position: string
): React.CSSProperties {
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
        bottom: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center" as const,
      };
    case "upper-left":
      return { top: "10%", left: "10%" };
    case "upper-right":
      return { top: "10%", right: "10%" };
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}
