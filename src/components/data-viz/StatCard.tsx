// Single statistic display card
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs, easings } from "../../lib/timing";

interface StatCardProps {
  value: number | string;
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  delay?: number;
  animate?: boolean;
  animateDuration?: number;
  format?: "number" | "compact" | "currency" | "percentage";
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  sublabel,
  prefix = "",
  suffix = "",
  icon,
  color = "#3B82F6",
  backgroundColor = "rgba(0,0,0,0.5)",
  delay = 0,
  animate = true,
  animateDuration = 60,
  format = "number",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;

  // Card entrance
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: springConfigs.bouncy,
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  // Format number helper
  const formatNumber = (num: number, isInteger: boolean = false): string => {
    // Round to avoid floating point issues
    const rounded = isInteger ? Math.round(num) : Math.round(num * 10) / 10;
    switch (format) {
      case "compact":
        if (rounded >= 10000000) return (rounded / 10000000).toFixed(1) + " Cr";
        if (rounded >= 100000) return (rounded / 100000).toFixed(1) + " L";
        if (rounded >= 1000) return (rounded / 1000).toFixed(1) + "K";
        return isInteger ? Math.round(rounded).toLocaleString("en-IN") : rounded.toLocaleString("en-IN");
      case "currency":
        return "₹" + Math.round(rounded).toLocaleString("en-IN");
      case "percentage":
        return (isInteger ? Math.round(rounded) : rounded.toFixed(1)) + "%";
      default:
        return isInteger
          ? Math.round(rounded).toLocaleString("en-IN")
          : rounded.toLocaleString("en-IN", { maximumFractionDigits: 1 });
    }
  };

  // Value animation (for numeric values)
  const numericValue = typeof value === "number" ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue);
  const isInteger = isNumeric && Number.isInteger(numericValue);

  let displayValue: string;
  let finalDisplayValue: string;
  if (isNumeric && animate) {
    const valueProgress = Math.max(0, Math.min(localFrame / animateDuration, 1));
    const easedProgress = easings.easeOutCubic(valueProgress);
    const animatedValue = numericValue * easedProgress;
    displayValue = formatNumber(animatedValue, isInteger);
    finalDisplayValue = formatNumber(numericValue, isInteger);
  } else {
    displayValue = String(value);
    finalDisplayValue = displayValue;
  }

  // Fixed width based on final value to prevent layout shifts during animation
  const fullText = prefix + finalDisplayValue + suffix;

  return (
    <div
      style={{
        backgroundColor,
        borderRadius: 20,
        padding: "32px 28px",
        border: `3px solid ${color}30`,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            fontSize: 52,
            marginBottom: 12,
          }}
        >
          {icon}
        </div>
      )}

      {/* Value — hidden final value reserves width to prevent layout shift */}
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.hero,
            fontWeight: fontWeights.bold,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            visibility: "hidden",
          }}
        >
          {prefix}{finalDisplayValue}{suffix}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            fontFamily: fonts.primary,
            fontSize: fontSizes.hero,
            fontWeight: fontWeights.bold,
            color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {prefix}{displayValue}{suffix}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: fonts.primary,
          fontSize: fontSizes.normal,
          fontWeight: fontWeights.medium,
          color: "#FFFFFFEE",
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        {label}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.small,
            fontWeight: fontWeights.regular,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
};

// Grid of stat cards
interface StatGridProps {
  stats: Omit<StatCardProps, "delay">[];
  columns?: 2 | 3 | 4;
  gap?: number;
  staggerDelay?: number;
  delay?: number;
}

export const StatGrid: React.FC<StatGridProps> = ({
  stats,
  columns = 3,
  gap = 24,
  staggerDelay = 8,
  delay = 0,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        width: "100%",
      }}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} delay={delay + index * staggerDelay} />
      ))}
    </div>
  );
};
