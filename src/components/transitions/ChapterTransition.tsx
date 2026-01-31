// Chapter transition component
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";
import { chapterColors, ChapterKey, sharedColors } from "../../data/colors";

interface ChapterTransitionProps {
  fromChapter?: number;
  toChapter: number;
  colorKey: ChapterKey;
}

export const ChapterTransition: React.FC<ChapterTransitionProps> = ({
  fromChapter,
  toChapter,
  colorKey,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colors = chapterColors[colorKey];

  // Wipe animation
  const wipeProgress = spring({
    frame,
    fps,
    config: springConfigs.smooth,
  });

  const wipeWidth = interpolate(wipeProgress, [0, 1], [0, 100]);

  // Number animation
  const numberProgress = spring({
    frame: frame - 15,
    fps,
    config: springConfigs.bouncy,
  });

  const numberScale = interpolate(numberProgress, [0, 1], [0.5, 1]);
  const numberOpacity = interpolate(numberProgress, [0, 1], [0, 1]);

  // Exit animation
  const exitProgress = spring({
    frame: frame - (durationInFrames - 20),
    fps,
    config: springConfigs.quick,
  });

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Background wipe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${wipeWidth}%`,
          height: "100%",
          backgroundColor: colors.primary,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: numberOpacity,
            transform: `scale(${numberScale})`,
          }}
        >
          {/* Chapter indicator */}
          <span
            style={{
              fontFamily: fonts.primary,
              fontSize: fontSizes.subtitle,
              fontWeight: fontWeights.medium,
              color: sharedColors.text.light,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            Chapter
          </span>

          {/* Chapter number */}
          <span
            style={{
              fontFamily: fonts.primary,
              fontSize: 200,
              fontWeight: fontWeights.bold,
              color: sharedColors.text.light,
              lineHeight: 1,
            }}
          >
            {toChapter}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Fade transition between chapters
interface FadeTransitionProps {
  direction?: "in" | "out";
  color?: string;
  duration?: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  direction = "in",
  color = "#000000",
  duration,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const effectiveDuration = duration ?? durationInFrames;

  const opacity =
    direction === "in"
      ? interpolate(frame, [0, effectiveDuration], [1, 0], {
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [0, effectiveDuration], [0, 1], {
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
};
