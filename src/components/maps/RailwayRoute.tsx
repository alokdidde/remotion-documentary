// Animated railway route component
// This is a placeholder for animated route visualization

import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface Station {
  name: string;
  position: { x: number; y: number }; // Percentage positions
}

interface RailwayRouteProps {
  stations: Station[];
  routeColor?: string;
  stationColor?: string;
  routeName?: string;
  animationDelay?: number;
  staggerDelay?: number;
}

export const RailwayRoute: React.FC<RailwayRouteProps> = ({
  stations,
  routeColor = "#EF4444",
  stationColor = "#FFFFFF",
  routeName,
  animationDelay = 0,
  staggerDelay = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Route line progress
  const lineProgress = spring({
    frame: frame - animationDelay,
    fps,
    config: springConfigs.gentle,
    durationInFrames: stations.length * staggerDelay + 30,
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Route name */}
      {routeName && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            fontFamily: fonts.primary,
            fontSize: fontSizes.medium,
            fontWeight: fontWeights.bold,
            color: routeColor,
          }}
        >
          {routeName}
        </div>
      )}

      {/* SVG for route line */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Route line */}
        {stations.length > 1 && (
          <path
            d={stations
              .map((station, i) =>
                i === 0
                  ? `M ${station.position.x}% ${station.position.y}%`
                  : `L ${station.position.x}% ${station.position.y}%`
              )
              .join(" ")}
            fill="none"
            stroke={routeColor}
            strokeWidth="4"
            strokeDasharray="1000"
            strokeDashoffset={interpolate(lineProgress, [0, 1], [1000, 0])}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Station markers */}
      {stations.map((station, index) => {
        const stationDelay = animationDelay + 10 + index * staggerDelay;
        const stationProgress = spring({
          frame: frame - stationDelay,
          fps,
          config: springConfigs.bouncy,
        });

        const scale = interpolate(stationProgress, [0, 1], [0, 1]);
        const opacity = interpolate(stationProgress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${station.position.x}%`,
              top: `${station.position.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
            }}
          >
            {/* Station dot */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: stationColor,
                border: `3px solid ${routeColor}`,
                boxShadow: `0 0 15px ${routeColor}80`,
              }}
            />

            {/* Station label */}
            <div
              style={{
                position: "absolute",
                top: 28,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontFamily: fonts.primary,
                fontSize: fontSizes.caption,
                fontWeight: fontWeights.medium,
                color: stationColor,
                textAlign: "center",
              }}
            >
              {station.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
