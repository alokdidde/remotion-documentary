// Chapter 1: The Beginning
// Replace this with your actual chapter content
import { AbsoluteFill, Sequence } from "remotion";
import { ChapterTitle, FullScreenPlaceholder, Subtitle } from "../components";
import { chapters } from "../data/chapters";

const chapter = chapters[0];

export const Chapter1: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Title Card */}
      <Sequence durationInFrames={150}>
        <ChapterTitle
          chapterNumber={chapter.id}
          title={chapter.title}
          subtitle={chapter.subtitle}
          colorKey="chapter1"
        />
      </Sequence>

      {/* Main Content */}
      <Sequence from={150} durationInFrames={chapter.durationFrames - 150}>
        <FullScreenPlaceholder
          label={`Chapter ${chapter.id}: ${chapter.title}`}
          description="Replace with your chapter content"
          chapterColor="#1E40AF"
        />
        <Subtitle text={chapter.subtitle} delay={10} />
      </Sequence>
    </AbsoluteFill>
  );
};
