// Font setup for Indian Railways documentary
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadNotoSansDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";

// Load Poppins for English text
const { fontFamily: poppinsFamily } = loadPoppins("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Load Noto Sans Devanagari for Hindi text
const { fontFamily: devanagariFamily } = loadNotoSansDevanagari("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
});

export const fonts = {
  primary: poppinsFamily,
  hindi: devanagariFamily,
  heading: poppinsFamily,
  body: poppinsFamily,
} as const;

// Font size presets (optimized for 1920x1080 video)
export const fontSizes = {
  // Headings
  hero: 140,
  chapterTitle: 100,
  sectionTitle: 80,
  subtitle: 56,

  // Body
  large: 44,
  medium: 38,
  normal: 32,
  small: 28,

  // Data visualization
  statNumber: 160,
  statLabel: 36,

  // Captions
  caption: 26,
  footnote: 22,
} as const;

// Font weight presets
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
