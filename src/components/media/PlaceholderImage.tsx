// Labeled placeholder image component
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface PlaceholderImageProps {
  label: string;
  sublabel?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "full";
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  showPattern?: boolean;
  delay?: number;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  label,
  sublabel,
  aspectRatio = "16:9",
  backgroundColor = "#1F2937",
  borderColor = "#374151",
  textColor = "#9CA3AF",
  showPattern = true,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: videoWidth, height: videoHeight } = useVideoConfig();

  // Entrance animation
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfigs.smooth,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.98, 1]);

  // Calculate dimensions
  const getAspectStyle = () => {
    switch (aspectRatio) {
      case "16:9":
        return { paddingBottom: "56.25%" };
      case "4:3":
        return { paddingBottom: "75%" };
      case "1:1":
        return { paddingBottom: "100%" };
      case "full":
        return { width: videoWidth, height: videoHeight };
    }
  };

  const aspectStyle = getAspectStyle();
  const isFull = aspectRatio === "full";

  return (
    <div
      style={{
        position: isFull ? "absolute" : "relative",
        width: isFull ? videoWidth : "100%",
        height: isFull ? videoHeight : undefined,
        ...(isFull ? {} : aspectStyle),
        backgroundColor,
        border: `2px dashed ${borderColor}`,
        borderRadius: isFull ? 0 : 12,
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
        top: isFull ? 0 : undefined,
        left: isFull ? 0 : undefined,
      }}
    >
      {/* Pattern background */}
      {showPattern && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage: `
              linear-gradient(45deg, ${borderColor} 25%, transparent 25%),
              linear-gradient(-45deg, ${borderColor} 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, ${borderColor} 75%),
              linear-gradient(-45deg, transparent 75%, ${borderColor} 75%)
            `,
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        {/* Image icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: borderColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={textColor}
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.normal,
            fontWeight: fontWeights.semibold,
            color: textColor,
            textAlign: "center",
            maxWidth: "80%",
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
              color: textColor,
              opacity: 0.7,
              textAlign: "center",
              marginTop: 8,
              maxWidth: "70%",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

// Full-screen placeholder
interface FullScreenPlaceholderProps {
  label: string;
  description?: string;
  chapterColor?: string;
}

export const FullScreenPlaceholder: React.FC<FullScreenPlaceholderProps> = ({
  label,
  description,
  chapterColor = "#3B82F6",
}) => {
  return (
    <PlaceholderImage
      label={label}
      sublabel={description}
      aspectRatio="full"
      backgroundColor="#0F172A"
      borderColor={`${chapterColor}40`}
      textColor={chapterColor}
    />
  );
};
