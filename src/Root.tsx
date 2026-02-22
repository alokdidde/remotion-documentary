import "./index.css";
import { Composition, staticFile } from "remotion";
import { DocumentaryComposition } from "./renderer/DocumentaryComposition";
import type { CompiledTimeline } from "./pipeline/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Documentary"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={DocumentaryComposition as any}
        calculateMetadata={async ({ props }: { props: Record<string, unknown> }) => {
          const timeline: CompiledTimeline =
            (props.timeline as CompiledTimeline) ??
            (await fetch(staticFile("compiled/timeline.json")).then((r) =>
              r.json()
            ));
          return {
            fps: timeline.fps,
            width: timeline.width,
            height: timeline.height,
            durationInFrames: timeline.total_frames,
            props: { timeline },
          };
        }}
        defaultProps={{ timeline: null as any }}
      />
    </>
  );
};
