// Narration script for documentary
// Edit this file to define your narration entries

export interface NarrationEntry {
  id: string;
  chapter: number;
  scene: string;
  text: string;
  startFrame: number;
  durationFrames: number;
}

// Add 15 frames (0.5 sec) padding at start
const PADDING_FRAMES = 15;

// Define your narration entries here
// Example structure:
// {
//   id: "ch1-intro",
//   chapter: 1,
//   scene: "Introduction",
//   text: "Your narration text here...",
//   startFrame: 0 + PADDING_FRAMES,
//   durationFrames: 300 - PADDING_FRAMES,
// },

export const narrationScript: NarrationEntry[] = [];

export default narrationScript;
