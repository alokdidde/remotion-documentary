// Chapter 2: The Transformation
import { AbsoluteFill, Sequence } from "remotion";
import { ChapterTitle, FullScreenPlaceholder, Subtitle } from "../components";
import { chapters } from "../data/chapters";

const chapter = chapters[1];

export const Chapter2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={150}>
        <ChapterTitle
          chapterNumber={chapter.id}
          title={chapter.title}
          subtitle={chapter.subtitle}
          colorKey="chapter2"
        />
      </Sequence>

      <Sequence from={150} durationInFrames={chapter.durationFrames - 150}>
        <FullScreenPlaceholder
          label={`Chapter ${chapter.id}: ${chapter.title}`}
          description="Replace with your chapter content"
          chapterColor="#059669"
        />
        <Subtitle text={chapter.subtitle} delay={10} />
      </Sequence>
    </AbsoluteFill>
  );
};
