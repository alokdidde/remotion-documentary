// Horizontal timeline component
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface TimelineEvent {
  year: string | number;
  title: string;
  description?: string;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  lineColor?: string;
  dotColor?: string;
  textColor?: string;
  staggerDelay?: number;
  delay?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  lineColor = "rgba(255,255,255,0.3)",
  dotColor = "#3B82F6",
  textColor = "#FFFFFF",
  staggerDelay = 15,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line progress
  const lineProgress = spring({
    frame: frame - delay,
    fps,
    config: springConfigs.gentle,
    durationInFrames: events.length * staggerDelay + 30,
  });

  const lineWidth = interpolate(lineProgress, [0, 1], [0, 100]);

  return (
    <div
      style={{
        width: "100%",
        padding: "80px 100px",
      }}
    >
      {/* Timeline line */}
      <div
        style={{
          position: "relative",
          height: 6,
          backgroundColor: lineColor,
          borderRadius: 3,
          marginBottom: 50,
        }}
      >
        {/* Animated progress line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${lineWidth}%`,
            backgroundColor: dotColor,
            borderRadius: 2,
          }}
        />

        {/* Event dots */}
        {events.map((event, index) => {
          const eventDelay = delay + 10 + index * staggerDelay;
          const eventProgress = spring({
            frame: frame - eventDelay,
            fps,
            config: springConfigs.bouncy,
          });

          const dotScale = interpolate(eventProgress, [0, 1], [0, 1]);
          const dotOpacity = interpolate(eventProgress, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          });

          const position = (index / (events.length - 1)) * 100;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${position}%`,
                top: "50%",
                transform: `translate(-50%, -50%) scale(${dotScale})`,
                opacity: dotOpacity,
              }}
            >
              {/* Outer ring */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: event.color ?? dotColor,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: `0 0 25px ${event.color ?? dotColor}50`,
                }}
              >
                {/* Inner dot */}
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Event labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {events.map((event, index) => {
          const eventDelay = delay + 15 + index * staggerDelay;
          const textProgress = spring({
            frame: frame - eventDelay,
            fps,
            config: springConfigs.smooth,
          });

          const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
          const textTranslateY = interpolate(textProgress, [0, 1], [20, 0]);

          return (
            <div
              key={index}
              style={{
                flex: 1,
                textAlign: "center",
                opacity: textOpacity,
                transform: `translateY(${textTranslateY}px)`,
              }}
            >
              {/* Year */}
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: fontSizes.medium,
                  fontWeight: fontWeights.bold,
                  color: event.color ?? dotColor,
                  marginBottom: 8,
                }}
              >
                {event.year}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: fontSizes.small,
                  fontWeight: fontWeights.semibold,
                  color: textColor,
                  marginBottom: 4,
                }}
              >
                {event.title}
              </div>

              {/* Description */}
              {event.description && (
                <div
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: fontSizes.caption,
                    fontWeight: fontWeights.regular,
                    color: textColor,
                    opacity: 0.7,
                    maxWidth: 200,
                    margin: "0 auto",
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
