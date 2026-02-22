import React from "react";
import { AbsoluteFill } from "remotion";
import { Step } from "remotion-bits";
import type { CompiledSegment, CompiledTimeline } from "../pipeline/types";
import { VisualLayer } from "./VisualLayer";
import { AudioLayer } from "./AudioLayer";
import { TextOverlayLayer } from "./TextOverlayLayer";
import { ColorGradeLayer } from "./ColorGradeLayer";
import { TransitionSfxLayer } from "./TransitionSfxLayer";

export interface FullScreenStepProps {
  segment: CompiledSegment;
  fps: number;
  timeline: CompiledTimeline;
}

export const FullScreenStep: React.FC<FullScreenStepProps> = ({
  segment,
  fps,
  timeline,
}) => {
  const totalSegmentFrames =
    segment.narration_duration_frames + segment.gap_duration_frames;

  // Zoom-in phase: 80% of segment, full-screen content
  const contentDuration = Math.round(totalSegmentFrames * 0.8);
  // Pull-back phase: 20% of segment, camera pulls back
  const pullBackDuration = totalSegmentFrames - contentDuration;

  const cam = segment.camera;

  return (
    <>
      {/* Zoom-in step: high scale, content fills screen */}
      <Step
        x={cam.x}
        y={cam.y}
        z={cam.z}
        rotateX={cam.rotateX}
        rotateY={cam.rotateY}
        rotateZ={cam.rotateZ}
        scale={cam.scale * 1.5}
        duration={contentDuration}
      >
        <AbsoluteFill>
          <VisualLayer
            events={segment.visual_events}
            fps={fps}
            segmentStartFrame={segment.narration_start_frame}
          />
          <ColorGradeLayer grade={segment.color_grade} />
          <TextOverlayLayer
            events={segment.text_events}
            fps={fps}
            segmentStartFrame={segment.narration_start_frame}
          />
          <AudioLayer segment={segment} />
          <TransitionSfxLayer
            segment={segment}
            transitionDuration={timeline.scene3d.transition_duration}
          />
        </AbsoluteFill>
      </Step>

      {/* Zoom-out step: camera pulls back to reveal 3D space */}
      <Step
        x={cam.x}
        y={cam.y}
        z={cam.z - 200}
        rotateX={cam.rotateX}
        rotateY={cam.rotateY}
        rotateZ={cam.rotateZ}
        scale={cam.scale * 0.8}
        duration={pullBackDuration}
      >
        <AbsoluteFill>
          <VisualLayer
            events={segment.visual_events}
            fps={fps}
            segmentStartFrame={segment.narration_start_frame}
          />
          <ColorGradeLayer grade={segment.color_grade} />
        </AbsoluteFill>
      </Step>
    </>
  );
};
