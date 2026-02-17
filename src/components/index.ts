// Component exports for documentary template

// Layout
export { FullScreen, Centered, PaddedContainer } from "./layout/FullScreen";
export { SplitScreen } from "./layout/SplitScreen";

// Text
export { ChapterTitle } from "./text/ChapterTitle";
export { Quote } from "./text/Quote";
export { Subtitle, InfoLabel } from "./text/Subtitle";

// Data Visualization
export { AnimatedCounter, ComparisonCounter } from "./data-viz/AnimatedCounter";
export { BarChart } from "./data-viz/BarChart";
export { Timeline } from "./data-viz/Timeline";
export { StatCard, StatGrid } from "./data-viz/StatCard";

// Media
export { PlaceholderImage, FullScreenPlaceholder } from "./media/PlaceholderImage";
export { StaticImage, FullScreenImage } from "./media/StaticImage";
export { BackgroundVideo, BackgroundImage } from "./media/BackgroundVideo";

// Audio
export { Narration } from "./audio/Narration";
export { BackgroundMusic } from "./audio/BackgroundMusic";
export { AudioTimeline } from "./audio/AudioTimeline";

// Maps
export { IndiaMap } from "./maps/IndiaMap";
export { RailwayRoute } from "./maps/RailwayRoute";

// 3D (requires @remotion/three + three + @react-three/fiber)
export { ThreeScene } from "./three/ThreeScene";
export { Globe } from "./three/Globe";
export { FloatingParticles } from "./three/FloatingParticles";
export { Bars3D } from "./three/Bars3D";

// Motion (remotion-bits) — within-scene sequential animations
export {
  StaggeredMotion,
  AnimatedText,
  TypeWriter,
  GradientTransition,
  Particles,
  Spawner,
  Behavior,
} from "remotion-bits";

// Transitions
export { ChapterTransition, FadeTransition } from "./transitions/ChapterTransition";
