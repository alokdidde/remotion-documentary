// Chapter color themes for documentary
// Customize these colors to match your documentary's visual identity

export const chapterColors = {
  chapter1: {
    primary: "#1E40AF", // Deep blue
    secondary: "#3B82F6",
    background: "#EFF6FF",
    accent: "#1E3A8A",
    name: "The Beginning",
  },
  chapter2: {
    primary: "#059669", // Emerald green
    secondary: "#10B981",
    background: "#ECFDF5",
    accent: "#047857",
    name: "The Transformation",
  },
  chapter3: {
    primary: "#7C3AED", // Purple
    secondary: "#8B5CF6",
    background: "#F5F3FF",
    accent: "#6D28D9",
    name: "The Future",
  },
} as const;

export type ChapterKey = keyof typeof chapterColors;

// Shared colors
export const sharedColors = {
  text: {
    primary: "#1F2937",
    secondary: "#4B5563",
    light: "#FFFFFF",
    muted: "#9CA3AF",
  },
  overlay: {
    dark: "rgba(0, 0, 0, 0.7)",
    medium: "rgba(0, 0, 0, 0.5)",
    light: "rgba(0, 0, 0, 0.3)",
  },
} as const;
