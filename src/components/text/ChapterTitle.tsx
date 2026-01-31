// Animated chapter title card
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";
import { chapterColors, ChapterKey } from "../../data/colors";

interface ChapterTitleProps {
  chapterNumber: number;
  title: string;
  subtitle?: string;
  colorKey: ChapterKey;
}

export const ChapterTitle: React.FC<ChapterTitleProps> = ({
  chapterNumber,
  title,
  subtitle,
  colorKey,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = chapterColors[colorKey];

  // Animation sequences
  const numberProgress = spring({
    frame,
    fps,
    config: springConfigs.bouncy,
  });

  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: springConfigs.smooth,
  });

  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: springConfigs.gentle,
  });

  const lineProgress = spring({
    frame: frame - 5,
    fps,
    config: springConfigs.smooth,
  });

  // Number animation
  const numberScale = interpolate(numberProgress, [0, 1], [0.5, 1]);
  const numberOpacity = interpolate(numberProgress, [0, 1], [0, 1]);

  // Title animation
  const titleTranslateY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Subtitle animation
  const subtitleTranslateY = interpolate(subtitleProgress, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Line animation
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 200]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${colors.primary}15 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Chapter number */}
        <div
          style={{
            opacity: numberOpacity,
            transform: `scale(${numberScale})`,
          }}
        >
          <span
            style={{
              fontFamily: fonts.primary,
              fontSize: 32,
              fontWeight: fontWeights.medium,
              color: colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Chapter {chapterNumber}
          </span>
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: colors.primary,
            borderRadius: 2,
          }}
        />

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
          }}
        >
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes.chapterTitle,
              fontWeight: fontWeights.bold,
              color: colors.primary,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
            }}
          >
            <p
              style={{
                fontFamily: fonts.primary,
                fontSize: fontSizes.subtitle,
                fontWeight: fontWeights.regular,
                color: colors.secondary,
                margin: 0,
                textAlign: "center",
                maxWidth: 800,
              }}
            >
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
