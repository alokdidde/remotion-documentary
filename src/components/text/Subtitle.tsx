// Lower-third subtitle component
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface SubtitleProps {
  text: string;
  position?: "bottom" | "top";
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  delay?: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  position = "bottom",
  backgroundColor = "rgba(0,0,0,0.8)",
  textColor = "#FFFFFF",
  accentColor = "#FFFFFF",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfigs.smooth,
  });

  const translateY = interpolate(
    progress,
    [0, 1],
    [position === "bottom" ? 100 : -100, 0]
  );
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        [position]: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: "24px 50px",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 20,
          maxWidth: "85%",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 5,
            height: 40,
            backgroundColor: accentColor,
            borderRadius: 3,
          }}
        />

        <span
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.normal,
            fontWeight: fontWeights.medium,
            color: textColor,
            lineHeight: 1.4,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

// Info label variant
interface InfoLabelProps {
  label: string;
  value: string;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  backgroundColor?: string;
  accentColor?: string;
  delay?: number;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({
  label,
  value,
  position = { bottom: 80, left: 80 },
  backgroundColor = "rgba(0,0,0,0.85)",
  accentColor = "#3B82F6",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfigs.snappy,
  });

  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        ...position,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: "12px 24px",
          borderRadius: 8,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.caption,
            fontWeight: fontWeights.medium,
            color: accentColor,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.medium,
            fontWeight: fontWeights.bold,
            color: "#FFFFFF",
            margin: "4px 0 0",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
