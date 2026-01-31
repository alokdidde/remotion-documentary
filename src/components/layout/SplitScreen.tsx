// Split screen component for before/after comparisons
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ReactNode } from "react";
import { springConfigs } from "../../lib/timing";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";

interface SplitScreenProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  splitRatio?: number;
  animateReveal?: boolean;
  revealDelay?: number;
  dividerColor?: string;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
  splitRatio = 0.5,
  animateReveal = true,
  revealDelay = 0,
  dividerColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate the split reveal
  const revealProgress = animateReveal
    ? spring({
        frame: frame - revealDelay,
        fps,
        config: springConfigs.smooth,
      })
    : 1;

  const leftWidth = interpolate(revealProgress, [0, 1], [100, splitRatio * 100]);
  const rightOpacity = interpolate(revealProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Left side */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${leftWidth}%`,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${100 / (leftWidth / 100)}%`,
            height: "100%",
          }}
        >
          {leftContent}
        </div>
        {leftLabel && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 40,
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: "12px 24px",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontFamily: fonts.primary,
                fontSize: fontSizes.medium,
                fontWeight: fontWeights.semibold,
                color: "#FFFFFF",
              }}
            >
              {leftLabel}
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: `${100 - leftWidth}%`,
          height: "100%",
          overflow: "hidden",
          opacity: rightOpacity,
        }}
      >
        <div
          style={{
            width: `${100 / ((100 - leftWidth) / 100)}%`,
            height: "100%",
            marginLeft: `-${(leftWidth / (100 - leftWidth)) * 100}%`,
          }}
        >
          {rightContent}
        </div>
        {rightLabel && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 40,
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: "12px 24px",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontFamily: fonts.primary,
                fontSize: fontSizes.medium,
                fontWeight: fontWeights.semibold,
                color: "#FFFFFF",
              }}
            >
              {rightLabel}
            </span>
          </div>
        )}
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          left: `${leftWidth}%`,
          top: 0,
          width: 4,
          height: "100%",
          backgroundColor: dividerColor,
          transform: "translateX(-50%)",
          boxShadow: "0 0 20px rgba(255,255,255,0.5)",
        }}
      />
    </AbsoluteFill>
  );
};
