// Chapter definitions for documentary
// Edit this file to define your documentary structure

export interface ChapterSection {
  title: string;
  durationFrames: number;
  content?: string[];
}

export interface ChapterDefinition {
  id: number;
  title: string;
  subtitle: string;
  durationFrames: number;
  durationMinutes: number;
  colorKey: string;
  sections: ChapterSection[];
  keyFacts: string[];
  visualCues: string[];
}

// 30 fps
export const FPS = 30;

export const chapters: ChapterDefinition[] = [
  {
    id: 1,
    title: "The Beginning",
    subtitle: "How It All Started",
    durationFrames: 2700, // ~1.5 minutes
    durationMinutes: 1.5,
    colorKey: "chapter1",
    sections: [
      {
        title: "Introduction",
        durationFrames: 900,
        content: [
          "Opening hook - grab the viewer's attention",
          "Establish the topic and why it matters",
          "Preview what's coming in the documentary",
        ],
      },
      {
        title: "Background",
        durationFrames: 900,
        content: [
          "Historical context and origins",
          "Key players and their motivations",
          "The status quo before the change",
        ],
      },
      {
        title: "The Catalyst",
        durationFrames: 900,
        content: [
          "What triggered the transformation",
          "Early challenges and resistance",
          "The turning point moment",
        ],
      },
    ],
    keyFacts: [
      "Key fact 1 about the beginning",
      "Key fact 2 about the origins",
      "Key fact 3 about early developments",
    ],
    visualCues: ["Historical imagery", "Archive footage", "Maps and timelines"],
  },
  {
    id: 2,
    title: "The Transformation",
    subtitle: "When Everything Changed",
    durationFrames: 3600, // ~2 minutes
    durationMinutes: 2,
    colorKey: "chapter2",
    sections: [
      {
        title: "The Change",
        durationFrames: 1200,
        content: [
          "The main transformation event",
          "Key innovations and breakthroughs",
          "Impact on people and society",
        ],
      },
      {
        title: "The Data",
        durationFrames: 1200,
        content: [
          "Statistics that tell the story",
          "Before and after comparisons",
          "Growth metrics and milestones",
        ],
      },
      {
        title: "The People",
        durationFrames: 1200,
        content: [
          "Heroes and key figures",
          "Personal stories and testimonials",
          "The human element",
        ],
      },
    ],
    keyFacts: [
      "Key fact 1 about the transformation",
      "Key fact 2 about the impact",
      "Key fact 3 about the results",
    ],
    visualCues: ["Data visualizations", "Interview footage", "Before/after comparisons"],
  },
  {
    id: 3,
    title: "The Future",
    subtitle: "What Comes Next",
    durationFrames: 2700, // ~1.5 minutes
    durationMinutes: 1.5,
    colorKey: "chapter3",
    sections: [
      {
        title: "Current State",
        durationFrames: 900,
        content: [
          "Where things stand today",
          "Recent developments",
          "Current challenges",
        ],
      },
      {
        title: "Looking Ahead",
        durationFrames: 900,
        content: [
          "Future plans and projections",
          "Emerging trends",
          "Opportunities and risks",
        ],
      },
      {
        title: "Conclusion",
        durationFrames: 900,
        content: [
          "Summary of the journey",
          "Key takeaways",
          "Call to action or final thought",
        ],
      },
    ],
    keyFacts: [
      "Key fact 1 about the future",
      "Key fact 2 about upcoming changes",
      "Key fact 3 about the vision",
    ],
    visualCues: ["Futuristic renders", "Charts and projections", "Inspiring imagery"],
  },
];

// Total frames calculation
export const totalFrames = chapters.reduce((sum, ch) => sum + ch.durationFrames, 0);
export const totalMinutes = totalFrames / FPS / 60;

// Helper to get chapter start frame
export const getChapterStartFrame = (chapterIndex: number): number => {
  return chapters.slice(0, chapterIndex).reduce((sum, ch) => sum + ch.durationFrames, 0);
};

// Helper to get chapter by frame
export const getChapterByFrame = (frame: number): ChapterDefinition | undefined => {
  let accumulatedFrames = 0;
  for (const chapter of chapters) {
    if (frame < accumulatedFrames + chapter.durationFrames) {
      return chapter;
    }
    accumulatedFrames += chapter.durationFrames;
  }
  return chapters[chapters.length - 1];
};
