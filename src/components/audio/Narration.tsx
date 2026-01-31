// Narration audio component for playing chapter voice-overs
import { Audio, staticFile, Sequence } from "remotion";

const AUDIO_PADDING_FRAMES = 15;

interface NarrationSegment {
  id: string;
  startFrame: number;
  durationFrames: number;
}

interface NarrationProps {
  segments: NarrationSegment[];
  volume?: number;
}

export const Narration: React.FC<NarrationProps> = ({
  segments,
  volume = 1
}) => {
  return (
    <>
      {segments.map((segment) => (
        <Sequence
          key={segment.id}
          from={segment.startFrame + AUDIO_PADDING_FRAMES}
          durationInFrames={segment.durationFrames}
        >
          <Audio
            src={staticFile(`audio/narration/${segment.id}.mp3`)}
            volume={volume}
          />
        </Sequence>
      ))}
    </>
  );
};
