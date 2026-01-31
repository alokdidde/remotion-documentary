// Animated counter component for statistics
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs, easings } from "../../lib/timing";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  decimals?: number;
  color?: string;
  labelColor?: string;
  size?: "small" | "medium" | "large" | "hero";
  format?: "number" | "compact" | "currency" | "percentage";
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 60,
  delay = 0,
  prefix = "",
  suffix = "",
  label,
  decimals = 0,
  color = "#FFFFFF",
  labelColor = "#9CA3AF",
  size = "large",
  format = "number",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  const progress = Math.max(0, Math.min(localFrame / duration, 1));
  const easedProgress = easings.easeOutCubic(progress);

  const rawValue = from + (to - from) * easedProgress;
  const currentValue = decimals === 0
    ? Math.round(rawValue)
    : Math.round(rawValue * Math.pow(10, decimals)) / Math.pow(10, decimals);

  const formatNumber = (num: number): string => {
    switch (format) {
      case "compact":
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return decimals === 0 ? Math.round(num).toString() : num.toFixed(decimals);
      case "currency":
        return "$" + num.toLocaleString("en-US", { maximumFractionDigits: decimals });
      case "percentage":
        return (decimals === 0 ? Math.round(num) : num.toFixed(decimals)) + "%";
      default:
        return decimals === 0
          ? Math.round(num).toLocaleString("en-US")
          : num.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    }
  };

  const finalFormatted = prefix + formatNumber(to) + suffix;
  const minWidth = `${finalFormatted.length * 0.6}em`;

  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: springConfigs.bouncy,
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  const sizeConfig = {
    small: { number: fontSizes.large, label: fontSizes.small },
    medium: { number: fontSizes.sectionTitle, label: fontSizes.normal },
    large: { number: fontSizes.hero, label: fontSizes.medium },
    hero: { number: fontSizes.statNumber, label: fontSizes.large },
  };

  const config = sizeConfig[size];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.primary,
          fontSize: config.number,
          fontWeight: fontWeights.bold,
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          minWidth,
          textAlign: "center",
        }}
      >
        {prefix}
        {formatNumber(currentValue)}
        {suffix}
      </div>

      {label && (
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: config.label,
            fontWeight: fontWeights.medium,
            color: labelColor,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

interface ComparisonCounterProps {
  beforeValue: number;
  afterValue: number;
  beforeLabel?: string;
  afterLabel?: string;
  unit?: string;
  color?: string;
  delay?: number;
}

export const ComparisonCounter: React.FC<ComparisonCounterProps> = ({
  beforeValue,
  afterValue,
  beforeLabel = "Before",
  afterLabel = "After",
  unit = "",
  color = "#10B981",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfigs.smooth,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const gap = interpolate(progress, [0, 1], [0, 60]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <AnimatedCounter to={beforeValue} suffix={unit} size="medium" delay={delay} />
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.small,
            color: "#9CA3AF",
            marginTop: 8,
          }}
        >
          {beforeLabel}
        </p>
      </div>

      <div
        style={{
          fontSize: 48,
          color,
        }}
      >
        →
      </div>

      <div style={{ textAlign: "center" }}>
        <AnimatedCounter to={afterValue} suffix={unit} size="medium" color={color} delay={delay + 30} />
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.small,
            color,
            marginTop: 8,
          }}
        >
          {afterLabel}
        </p>
      </div>
    </div>
  );
};
