// Static image component for displaying images from public/images/
import { Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { springConfigs } from "../../lib/timing";

interface StaticImageProps {
  src: string; // Path relative to public/images/
  alt?: string;
  style?: React.CSSProperties;
  objectFit?: "cover" | "contain" | "fill";
  delay?: number;
  animate?: boolean;
}

export const StaticImage: React.FC<StaticImageProps> = ({
  src,
  alt = "",
  style,
  objectFit = "cover",
  delay = 0,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const progress = animate
    ? spring({
        frame: frame - delay,
        fps,
        config: springConfigs.smooth,
      })
    : 1;

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [1.02, 1]);

  return (
    <Img
      src={staticFile(`images/${src}`)}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit,
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    />
  );
};

// Full-screen static image with optional overlay
interface FullScreenImageProps {
  src: string;
  alt?: string;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  delay?: number;
}

export const FullScreenImage: React.FC<FullScreenImageProps> = ({
  src,
  alt = "",
  overlay = false,
  overlayColor = "#000000",
  overlayOpacity = 0.3,
  delay = 0,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <StaticImage src={src} alt={alt} delay={delay} />
      {overlay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </div>
  );
};
