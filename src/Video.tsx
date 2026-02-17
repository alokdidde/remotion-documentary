// Main video composition with TransitionSeries
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { Chapter1, Chapter2, Chapter3 } from "./chapters";
import { chapters } from "./data/chapters";
import { AudioTimeline } from "./components/audio/AudioTimeline";
import {
  chapterTransitions,
  defaultTransition,
  resolveTransition,
} from "./lib/transitions";

// Individual chapter durations from data
const CHAPTER_DURATIONS = chapters.map((ch) => ch.durationFrames);

const CHAPTER_COMPONENTS = [Chapter1, Chapter2, Chapter3];

export const DocumentaryVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill>
        <TransitionSeries>
          {CHAPTER_COMPONENTS.map((ChapterComponent, index) => (
            <TransitionSeries.Sequence
              key={index}
              durationInFrames={CHAPTER_DURATIONS[index]}
            >
              <ChapterComponent />
            </TransitionSeries.Sequence>
          )).reduce((acc: React.ReactNode[], seq, index) => {
            acc.push(seq);
            if (index < CHAPTER_COMPONENTS.length - 1) {
              const config = chapterTransitions[index] ?? defaultTransition;
              const { presentation, timing } = resolveTransition(config);
              acc.push(
                <TransitionSeries.Transition
                  key={`transition-${index}`}
                  presentation={presentation}
                  timing={timing}
                />
              );
            }
            return acc;
          }, [])}
        </TransitionSeries>
      </AbsoluteFill>
      <AbsoluteFill>
        <AudioTimeline />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Alternative: Simple sequence-based version (no transitions library needed)
export const DocumentaryVideoSimple: React.FC = () => {
  let currentFrame = 0;

  const getNextFrame = (duration: number) => {
    const start = currentFrame;
    currentFrame += duration;
    return start;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill>
        {CHAPTER_COMPONENTS.map((ChapterComponent, index) => (
          <Sequence
            key={index}
            from={getNextFrame(CHAPTER_DURATIONS[index])}
            durationInFrames={CHAPTER_DURATIONS[index]}
          >
            <ChapterComponent />
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill>
        <AudioTimeline />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
