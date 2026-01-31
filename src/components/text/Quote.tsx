// Animated quote display component
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts, fontSizes, fontWeights } from "../../lib/fonts";
import { springConfigs } from "../../lib/timing";

interface QuoteProps {
  text: string;
  author: string;
  role?: string;
  year?: number | string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const Quote: React.FC<QuoteProps> = ({
  text,
  author,
  role,
  year,
  accentColor = "#FFFFFF",
  backgroundColor = "rgba(0,0,0,0.85)",
  textColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation progress
  const quoteMarkProgress = spring({
    frame,
    fps,
    config: springConfigs.bouncy,
  });

  const textProgress = spring({
    frame: frame - 10,
    fps,
    config: springConfigs.smooth,
  });

  const authorProgress = spring({
    frame: frame - 25,
    fps,
    config: springConfigs.gentle,
  });

  // Quote mark animation
  const quoteMarkScale = interpolate(quoteMarkProgress, [0, 1], [0, 1]);
  const quoteMarkOpacity = interpolate(quoteMarkProgress, [0, 1], [0, 0.3]);

  // Text animation
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textTranslateY = interpolate(textProgress, [0, 1], [20, 0]);

  // Author animation
  const authorOpacity = interpolate(authorProgress, [0, 1], [0, 1]);
  const authorTranslateY = interpolate(authorProgress, [0, 1], [15, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      {/* Large quote mark */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 150,
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 400,
            color: accentColor,
            lineHeight: 1,
          }}
        >
          "
        </span>
      </div>

      {/* Quote content */}
      <div
        style={{
          maxWidth: 1400,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        {/* Quote text */}
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          <p
            style={{
              fontFamily: fonts.primary,
              fontSize: fontSizes.subtitle,
              fontWeight: fontWeights.medium,
              color: textColor,
              lineHeight: 1.5,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            "{text}"
          </p>
        </div>

        {/* Attribution */}
        <div
          style={{
            opacity: authorOpacity,
            transform: `translateY(${authorTranslateY}px)`,
            marginTop: 40,
          }}
        >
          {/* Accent line */}
          <div
            style={{
              width: 60,
              height: 3,
              backgroundColor: accentColor,
              margin: "0 auto 20px",
            }}
          />

          <p
            style={{
              fontFamily: fonts.primary,
              fontSize: fontSizes.medium,
              fontWeight: fontWeights.semibold,
              color: accentColor,
              margin: 0,
            }}
          >
            — {author}
          </p>

          {(role || year) && (
            <p
              style={{
                fontFamily: fonts.primary,
                fontSize: fontSizes.small,
                fontWeight: fontWeights.regular,
                color: textColor,
                opacity: 0.7,
                margin: "8px 0 0",
              }}
            >
              {role}
              {role && year && " • "}
              {year}
            </p>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
