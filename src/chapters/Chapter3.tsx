// Chapter 3: The Future
import { AbsoluteFill, Sequence } from "remotion";
import { ChapterTitle, FullScreenPlaceholder, Subtitle } from "../components";
import { chapters } from "../data/chapters";

const chapter = chapters[2];

export const Chapter3: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={150}>
        <ChapterTitle
          chapterNumber={chapter.id}
          title={chapter.title}
          subtitle={chapter.subtitle}
          colorKey="chapter3"
        />
      </Sequence>

      <Sequence from={150} durationInFrames={chapter.durationFrames - 150}>
        <FullScreenPlaceholder
          label={`Chapter ${chapter.id}: ${chapter.title}`}
          description="Replace with your chapter content"
          chapterColor="#7C3AED"
        />
        <Subtitle text={chapter.subtitle} delay={10} />
      </Sequence>
    </AbsoluteFill>
  );
};
