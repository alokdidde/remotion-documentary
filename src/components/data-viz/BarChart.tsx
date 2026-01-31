// Animated bar chart component
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  orientation?: "horizontal" | "vertical";
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  barColor?: string;
  labelColor?: string;
  staggerDelay?: number;
  delay?: number;
  height?: number;
  width?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  orientation = "horizontal",
  showValues = true,
  valueFormat = (v) => v.toLocaleString(),
  barColor = "#3B82F6",
  labelColor = "#FFFFFF",
  staggerDelay = 8,
  delay = 0,
  height = 400,
  width = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const calculatedMax = maxValue ?? Math.max(...data.map((d) => d.value)) * 1.1;

  if (orientation === "horizontal") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width,
        }}
      >
        {data.map((item, index) => {
          const itemDelay = delay + index * staggerDelay;

          const progress = spring({
            frame: frame - itemDelay,
            fps,
            config: springConfigs.smooth,
          });

          const barWidth = interpolate(progress, [0, 1], [0, (item.value / calculatedMax) * 100]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div key={index} style={{ opacity }}>
              {/* Label */}
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: fontSizes.small,
                  fontWeight: fontWeights.medium,
                  color: labelColor,
                  marginBottom: 10,
                }}
              >
                {item.label}
              </div>

              {/* Bar container */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Bar */}
                <div
                  style={{
                    height: 44,
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      backgroundColor: item.color ?? barColor,
                      borderRadius: 6,
                    }}
                  />
                </div>

                {/* Value */}
                {showValues && (
                  <div
                    style={{
                      fontFamily: fonts.primary,
                      fontSize: fontSizes.normal,
                      fontWeight: fontWeights.bold,
                      color: item.color ?? barColor,
                      minWidth: 80,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {valueFormat(
                      Number.isInteger(item.value)
                        ? Math.round(item.value * progress)
                        : Math.round(item.value * progress * 10) / 10
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical orientation
  const barSpacing = 20;
  const barWidth = (width - (data.length - 1) * barSpacing) / data.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: barSpacing,
        height,
        width,
      }}
    >
      {data.map((item, index) => {
        const itemDelay = delay + index * staggerDelay;

        const progress = spring({
          frame: frame - itemDelay,
          fps,
          config: springConfigs.bouncy,
        });

        const barHeight = interpolate(progress, [0, 1], [0, (item.value / calculatedMax) * height * 0.8]);
        const labelOpacity = interpolate(progress, [0.5, 1], [0, 1], {
          extrapolateLeft: "clamp",
        });

        return (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: barWidth,
            }}
          >
            {/* Value on top */}
            {showValues && (
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: fontSizes.small,
                  fontWeight: fontWeights.bold,
                  color: item.color ?? barColor,
                  marginBottom: 8,
                  opacity: labelOpacity,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {valueFormat(item.value)}
              </div>
            )}

            {/* Bar */}
            <div
              style={{
                width: "100%",
                height: barHeight,
                backgroundColor: item.color ?? barColor,
                borderRadius: "4px 4px 0 0",
              }}
            />

            {/* Label */}
            <div
              style={{
                fontFamily: fonts.primary,
                fontSize: fontSizes.caption,
                fontWeight: fontWeights.medium,
                color: labelColor,
                marginTop: 12,
                textAlign: "center",
                opacity: labelOpacity,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
