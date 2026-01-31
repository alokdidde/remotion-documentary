// India map component with DFC corridors
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface IndiaMapProps {
  highlightedRegions?: string[];
  routes?: Array<{
    from: string;
    to: string;
    color?: string;
    label?: string;
  }>;
  title?: string;
  accentColor?: string;
  delay?: number;
}

// Simplified India outline path
const INDIA_PATH = `M 180,50
  C 190,45 210,40 230,45
  L 260,55 280,50 300,60 320,55
  C 340,50 360,55 380,70
  L 400,90 410,120 420,150
  C 425,180 420,210 415,240
  L 400,280 390,320 380,360
  C 370,390 350,420 320,440
  L 280,460 250,470 220,475
  C 190,480 160,475 140,460
  L 120,440 100,400 90,350
  C 85,300 90,250 100,200
  L 110,160 130,120 150,90
  C 160,70 170,55 180,50 Z`;

// City coordinates on the map (approximate positions)
const CITIES: Record<string, { x: number; y: number }> = {
  "Ludhiana": { x: 200, y: 120 },
  "Dadri": { x: 230, y: 170 },
  "Sonnagar": { x: 320, y: 220 },
  "Mumbai (JNPT)": { x: 150, y: 340 },
  "Delhi": { x: 220, y: 160 },
  "Kolkata": { x: 350, y: 260 },
  "Chennai": { x: 280, y: 420 },
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  routes = [],
  title,
  accentColor = "#D97706",
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
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  // Animate route drawing
  const routeProgress = interpolate(frame - delay, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "center",
          padding: 40,
        }}
      >
        {/* SVG Map */}
        <svg
          width="500"
          height="550"
          viewBox="0 0 500 550"
          style={{
            filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))",
          }}
        >
          {/* India outline */}
          <path
            d={INDIA_PATH}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* DFC Routes */}
          {routes.map((route, index) => {
            const fromCity = CITIES[route.from];
            const toCity = CITIES[route.to];
            if (!fromCity || !toCity) return null;

            const pathLength = Math.sqrt(
              Math.pow(toCity.x - fromCity.x, 2) + Math.pow(toCity.y - fromCity.y, 2)
            );

            return (
              <g key={index}>
                {/* Route line with animation */}
                <line
                  x1={fromCity.x}
                  y1={fromCity.y}
                  x2={fromCity.x + (toCity.x - fromCity.x) * routeProgress}
                  y2={fromCity.y + (toCity.y - fromCity.y) * routeProgress}
                  stroke={route.color || accentColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 8px ${route.color || accentColor})`,
                  }}
                />

                {/* Animated glow effect */}
                <line
                  x1={fromCity.x}
                  y1={fromCity.y}
                  x2={fromCity.x + (toCity.x - fromCity.x) * routeProgress}
                  y2={fromCity.y + (toCity.y - fromCity.y) * routeProgress}
                  stroke={route.color || accentColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.3"
                />

                {/* From city dot */}
                <circle
                  cx={fromCity.x}
                  cy={fromCity.y}
                  r="10"
                  fill={route.color || accentColor}
                  style={{
                    filter: `drop-shadow(0 0 10px ${route.color || accentColor})`,
                  }}
                />
                <circle
                  cx={fromCity.x}
                  cy={fromCity.y}
                  r="5"
                  fill="#FFFFFF"
                />

                {/* To city dot (animated) */}
                {routeProgress > 0.9 && (
                  <>
                    <circle
                      cx={toCity.x}
                      cy={toCity.y}
                      r="10"
                      fill={route.color || accentColor}
                      style={{
                        filter: `drop-shadow(0 0 10px ${route.color || accentColor})`,
                      }}
                    />
                    <circle
                      cx={toCity.x}
                      cy={toCity.y}
                      r="5"
                      fill="#FFFFFF"
                    />
                  </>
                )}

                {/* City labels */}
                <text
                  x={fromCity.x}
                  y={fromCity.y - 18}
                  fill="#FFFFFF"
                  fontSize="14"
                  fontFamily={fonts.primary}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {route.from}
                </text>
                {routeProgress > 0.9 && (
                  <text
                    x={toCity.x}
                    y={toCity.y - 18}
                    fill="#FFFFFF"
                    fontSize="14"
                    fontFamily={fonts.primary}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {route.to}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {title && (
            <div
              style={{
                fontFamily: fonts.heading,
                fontSize: fontSizes.large,
                fontWeight: fontWeights.bold,
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              {title}
            </div>
          )}

          {routes.map((route, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "20px 28px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                borderLeft: `4px solid ${route.color || accentColor}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: route.color || accentColor,
                    boxShadow: `0 0 10px ${route.color || accentColor}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: fontSizes.medium,
                    fontWeight: fontWeights.semibold,
                    color: "#FFFFFF",
                  }}
                >
                  {route.from} → {route.to}
                </span>
              </div>
              {route.label && (
                <span
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: fontSizes.normal,
                    color: route.color || accentColor,
                    marginLeft: 24,
                  }}
                >
                  {route.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
