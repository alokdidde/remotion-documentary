// Main video composition with TransitionSeries
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Chapter1, Chapter2, Chapter3 } from "./chapters";
import { chapters } from "./data/chapters";

// Individual chapter durations from data
const CHAPTER_DURATIONS = chapters.map((ch) => ch.durationFrames);

// Transition duration in frames
const TRANSITION_DURATION = 30;

const CHAPTER_COMPONENTS = [Chapter1, Chapter2, Chapter3];

export const DocumentaryVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
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
            acc.push(
              <TransitionSeries.Transition
                key={`transition-${index}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            );
          }
          return acc;
        }, [])}
      </TransitionSeries>
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
  );
};
