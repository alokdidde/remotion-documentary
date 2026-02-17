// Renders the global audio timeline as Remotion <Sequence> + <Audio> pairs.
// Mount once at the composition root, parallel to the visual chapter stack.

import { Audio, Sequence, interpolate } from "remotion";
import {
  audioTimeline,
  AudioEvent,
  AudioEventType,
  DEFAULT_VOLUME,
  DEFAULT_FADE_IN,
  DEFAULT_FADE_OUT,
  DEFAULT_LOOP,
} from "../../data/audio-timeline";

interface AudioTimelineProps {
  /** Override the default timeline (useful for previewing a subset) */
  events?: AudioEvent[];
  /** Filter to specific audio layer types */
  types?: AudioEventType[];
  /** Master volume multiplier (0 = mute all, 1 = normal). Useful for dev. */
  masterVolume?: number;
}

function AudioEventPlayer({
  event,
  masterVolume,
}: {
  event: AudioEvent;
  masterVolume: number;
}) {
  const baseVolume = event.volume ?? DEFAULT_VOLUME[event.type];
  const fadeIn = event.fadeInFrames ?? DEFAULT_FADE_IN[event.type];
  const fadeOut = event.fadeOutFrames ?? DEFAULT_FADE_OUT[event.type];
  const duration = event.durationFrames;

  return (
    <Audio
      src={event.src}
      volume={(f) => {
        let vol = baseVolume;
        if (fadeIn > 0) {
          vol *= interpolate(f, [0, fadeIn], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
        }
        if (fadeOut > 0) {
          vol *= interpolate(f, [duration - fadeOut, duration], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }
        return vol * masterVolume;
      }}
      loop={event.loop ?? DEFAULT_LOOP[event.type]}
    />
  );
}

export const AudioTimeline: React.FC<AudioTimelineProps> = ({
  events,
  types,
  masterVolume = 1,
}) => {
  let timeline = events ?? audioTimeline;

  if (types) {
    timeline = timeline.filter((e) => types.includes(e.type));
  }

  return (
    <>
      {timeline.map((event) => (
        <Sequence
          key={event.id}
          from={event.startFrame}
          durationInFrames={event.durationFrames}
          name={event.label ?? `${event.type}: ${event.id}`}
        >
          <AudioEventPlayer event={event} masterVolume={masterVolume} />
        </Sequence>
      ))}
    </>
  );
};
