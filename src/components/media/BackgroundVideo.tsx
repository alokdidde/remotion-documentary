// Background video component for displaying videos from public/video/
import { staticFile, useCurrentFrame, interpolate, OffthreadVideo } from "remotion";
import { AbsoluteFill } from "remotion";

interface BackgroundVideoProps {
  src: string; // Path relative to public/video/
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  muted?: boolean;
  playbackRate?: number;
  startFrom?: number;
  style?: React.CSSProperties;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  src,
  overlay = true,
  overlayColor = "#000000",
  overlayOpacity = 0.4,
  muted = true,
  playbackRate = 1,
  startFrom = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Solid color fallback - always visible behind video */}
      <AbsoluteFill
        style={{
          backgroundColor: overlayColor,
        }}
      />
      <AbsoluteFill
        style={{
          opacity,
          overflow: "hidden",
        }}
      >
        <OffthreadVideo
          src={staticFile(`video/${src}`)}
          muted={muted}
          playbackRate={playbackRate}
          startFrom={startFrom}
          loop
          pauseWhenBuffering={false}
          delayRenderTimeoutInMilliseconds={60000}
          delayRenderRetries={3}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...style,
          }}
        />
      </AbsoluteFill>
      {overlay && (
        <AbsoluteFill
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Animation types for Ken Burns effect
type AnimationType =
  | "zoomIn"      // Zoom from normal to larger
  | "zoomOut"     // Zoom from larger to normal
  | "panLeft"     // Pan from right to left
  | "panRight"    // Pan from left to right
  | "panUp"       // Pan from bottom to top
  | "panDown"     // Pan from top to bottom
  | "zoomInPanLeft"   // Ken Burns: zoom in while panning left
  | "zoomInPanRight"  // Ken Burns: zoom in while panning right
  | "zoomOutPanLeft"  // Ken Burns: zoom out while panning left
  | "zoomOutPanRight" // Ken Burns: zoom out while panning right
  | "none";       // Static image

// Background image component for static backgrounds with Ken Burns effects
interface BackgroundImageProps {
  src: string; // Path relative to public/images/
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  animation?: AnimationType;
  animationDuration?: number; // Duration in frames for the animation
  animationIntensity?: number; // 0-1, controls how much movement (default 0.5)
  style?: React.CSSProperties;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  overlay = true,
  overlayColor = "#000000",
  overlayOpacity = 0.4,
  animation = "zoomIn",
  animationDuration = 300,
  animationIntensity = 0.5,
  style,
}) => {
  const frame = useCurrentFrame();

  // Calculate animation values based on type and intensity
  const getTransform = () => {
    // Scale range based on intensity (0.5 intensity = 1.0 to 1.1 scale range)
    const scaleAmount = 0.05 + (animationIntensity * 0.15); // 0.05 to 0.20
    const panAmount = 3 + (animationIntensity * 7); // 3% to 10% movement

    const progress = interpolate(frame, [0, animationDuration], [0, 1], {
      extrapolateRight: "clamp",
    });

    switch (animation) {
      case "zoomIn": {
        const scale = 1 + (progress * scaleAmount);
        return `scale(${scale})`;
      }
      case "zoomOut": {
        const scale = (1 + scaleAmount) - (progress * scaleAmount);
        return `scale(${scale})`;
      }
      case "panLeft": {
        const translateX = (panAmount / 2) - (progress * panAmount);
        return `scale(1.1) translateX(${translateX}%)`;
      }
      case "panRight": {
        const translateX = -(panAmount / 2) + (progress * panAmount);
        return `scale(1.1) translateX(${translateX}%)`;
      }
      case "panUp": {
        const translateY = (panAmount / 2) - (progress * panAmount);
        return `scale(1.1) translateY(${translateY}%)`;
      }
      case "panDown": {
        const translateY = -(panAmount / 2) + (progress * panAmount);
        return `scale(1.1) translateY(${translateY}%)`;
      }
      case "zoomInPanLeft": {
        const scale = 1 + (progress * scaleAmount);
        const translateX = (panAmount / 3) - (progress * (panAmount / 1.5));
        return `scale(${scale}) translateX(${translateX}%)`;
      }
      case "zoomInPanRight": {
        const scale = 1 + (progress * scaleAmount);
        const translateX = -(panAmount / 3) + (progress * (panAmount / 1.5));
        return `scale(${scale}) translateX(${translateX}%)`;
      }
      case "zoomOutPanLeft": {
        const scale = (1 + scaleAmount) - (progress * scaleAmount);
        const translateX = (panAmount / 3) - (progress * (panAmount / 1.5));
        return `scale(${scale}) translateX(${translateX}%)`;
      }
      case "zoomOutPanRight": {
        const scale = (1 + scaleAmount) - (progress * scaleAmount);
        const translateX = -(panAmount / 3) + (progress * (panAmount / 1.5));
        return `scale(${scale}) translateX(${translateX}%)`;
      }
      case "none":
      default:
        return "scale(1)";
    }
  };

  // Fade in animation
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity,
          overflow: "hidden",
        }}
      >
        <img
          src={staticFile(`images/${src}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: getTransform(),
            ...style,
          }}
        />
      </AbsoluteFill>
      {overlay && (
        <AbsoluteFill
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
