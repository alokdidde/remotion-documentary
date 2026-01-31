// Root composition definitions for documentary template
import "./index.css";
import { Composition, Folder } from "remotion";
import { DocumentaryVideo, DocumentaryVideoSimple } from "./Video";
import { Chapter1, Chapter2, Chapter3 } from "./chapters";
import { chapters, totalFrames, FPS } from "./data/chapters";

// Video specifications
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

// Calculate total duration with transitions
// Each transition is 30 frames, and there are (N-1) transitions between N chapters
const TRANSITION_FRAMES = 30 * (chapters.length - 1);
const TOTAL_FRAMES_WITH_TRANSITIONS = totalFrames + TRANSITION_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Video Composition */}
      <Composition
        id="Documentary"
        component={DocumentaryVideo}
        durationInFrames={TOTAL_FRAMES_WITH_TRANSITIONS}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />

      {/* Simple Version (no transitions) */}
      <Composition
        id="DocumentarySimple"
        component={DocumentaryVideoSimple}
        durationInFrames={totalFrames}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />

      {/* Individual Chapter Compositions for Preview */}
      <Folder name="Chapters">
        <Composition
          id="Chapter1"
          component={Chapter1}
          durationInFrames={chapters[0].durationFrames}
          fps={FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Chapter2"
          component={Chapter2}
          durationInFrames={chapters[1].durationFrames}
          fps={FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Chapter3"
          component={Chapter3}
          durationInFrames={chapters[2].durationFrames}
          fps={FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />
      </Folder>
    </>
  );
};
