// types.ts — Complete type definitions for the documentary project
// These types map 1:1 to the YAML/JSON files in the project folder.

// ════════════════════════════════════════════════════
// ROOT: project.yaml
// ════════════════════════════════════════════════════

export interface Project {
  title: string;
  description?: string;
  fps: number;
  width: number;
  height: number;

  voice: VoiceConfig;
  audio_mix: AudioMixConfig;
  color_grades: Record<string, ColorGrade>;
  acts: string[]; // folder names: ["act-1", "act-2", "act-3"]
}

export interface VoiceConfig {
  voice_id: string;
  model_id: string;
  stability: number;
  similarity_boost: number;
  style: number;
}

export interface AudioMixConfig {
  narration: MixLayer;
  sfx_bed: MixLayer;
  sfx_transition: MixLayer;
  ambience: MixLayer;
  music: MixLayer;
}

export interface MixLayer {
  base_volume: number; // 0-1
  ducks_under: AudioLayerType[];
  duck_ratio?: number; // multiplier when ducking (e.g., 0.25 = 25% of base)
  ramp_ms?: number; // fade duration for ducking transitions
}

export type AudioLayerType =
  | "narration"
  | "sfx_bed"
  | "sfx_transition"
  | "ambience"
  | "music";

export interface ColorGrade {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  hue_rotate: number;
}

// ════════════════════════════════════════════════════
// ACT: acts/act-N/act.yaml
// ════════════════════════════════════════════════════

export interface Act {
  title: string;
  arc: ActArc;
  sequences: string[]; // folder names: ["seq-1", "seq-2"]
}

export interface ActArc {
  start_energy: number; // 0-1
  peak_energy: number; // 0-1
  end_energy: number; // 0-1
  peak_position: number; // 0-1 (where in the act the peak falls)
}

// ════════════════════════════════════════════════════
// SEQUENCE: acts/act-N/seq-N/sequence.yaml
// ════════════════════════════════════════════════════

export interface Sequence {
  purpose: string;

  music: SequenceMusic;
  default_ambience?: AmbienceConfig;
  scenes: string[]; // folder names: ["scene-1", "scene-2"]
}

export interface SequenceMusic {
  src: string; // relative path to music file
  volume: number; // relative to global music base_volume
  fade_in_seconds: number;
  fade_out_seconds: number;
  track_offset_seconds?: number; // skip into the track
}

export interface AmbienceConfig {
  src: string;
  volume: number;
  loop: boolean;
}

// ════════════════════════════════════════════════════
// SCENE: acts/act-N/seq-N/scene-N/scene.yaml
// ════════════════════════════════════════════════════

export interface Scene {
  color_grade: string; // references key in project.color_grades
  ambience?: AmbienceConfig; // overrides sequence default
  available_visuals: VisualAsset[];
}

export type VisualAsset =
  | BRollAsset
  | ImageAsset
  | TitleAsset;

interface BaseVisualAsset {
  id: string; // referenced in editorial.yaml
}

export interface BRollAsset extends BaseVisualAsset {
  type: "broll";
  src: string;
  trim_start_seconds?: number;
  trim_end_seconds?: number;
}

export interface ImageAsset extends BaseVisualAsset {
  type: "image";
  src: string;
}

export interface TitleAsset extends BaseVisualAsset {
  type: "title";
  text: string;
  style: TitleStyle;
}

export interface TitleStyle {
  font_size: number;
  font_weight: "normal" | "bold";
  color: string;
  position: "center" | "lower-third" | "upper-left" | "upper-right";
  background?: string;
}

// ════════════════════════════════════════════════════
// WORD TIMINGS: acts/act-N/seq-N/scene-N/words.json
// ════════════════════════════════════════════════════

export interface WordTimings {
  audio_file: string;
  duration_seconds: number;
  words: WordTiming[];
}

export interface WordTiming {
  index: number;
  word: string;
  start: number; // seconds from segment start
  end: number; // seconds from segment start
}

// ════════════════════════════════════════════════════
// EDITORIAL: acts/act-N/seq-N/scene-N/editorial.yaml
// ════════════════════════════════════════════════════

export interface Editorial {
  intent: SegmentIntent;
  sfx: SegmentSfx;
  word_events: WordEvent[];
}

// The 6 continuous dials — all 0.0 to 1.0
export interface SegmentIntent {
  weight: number;   // boundary significance (0 = invisible, 1 = act break)
  energy: number;   // kinetic energy (0 = still, 1 = urgent)
  contrast: number; // difference from next (0 = continuation, 1 = jarring shift)
  breath: number;   // space after (0 = no gap, 1 = long hold)
  warmth: number;   // temperature (0 = cold, 1 = intimate)
  density: number;  // visual changes (0 = single held, 1 = rapid montage)
}

// Structural SFX — tied to boundaries, not words
export interface SegmentSfx {
  entry: number;        // 0-1: arrival sound intensity
  entry_src?: string;   // asset path (agent picks from manifest)

  exit: number;         // 0-1: departure sound intensity
  exit_src?: string;

  bed: number;          // 0-1: textural bed intensity
  bed_src?: string;
}

// Word-level events — ONLY visual and music changes
export type WordEvent =
  | VisualChangeEvent
  | MusicIntensityEvent
  | TextOverlayEvent;

export interface VisualChangeEvent {
  type: "visual-change";
  at_word: number;          // index into words.json
  visual_id: string;        // references scene.yaml available_visuals
  animation?: "ken-burns" | "static" | "fade-in" | "slide" | "fullscreen-zoom";
  direction?: "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
}

export interface MusicIntensityEvent {
  type: "music-intensity";
  at_word: number;
  intensity: number;        // 0-1
}

export interface TextOverlayEvent {
  type: "text-overlay";
  at_word: number;
  visual_id: string;        // references a title in scene.yaml available_visuals
  duration_words: number;   // how many words to stay visible
}

// ════════════════════════════════════════════════════
// ASSET MANIFESTS: assets/*/manifest.yaml
// ════════════════════════════════════════════════════

export interface MusicManifest {
  tracks: MusicTrack[];
}

export interface MusicTrack {
  id: string;
  file: string;
  duration_seconds: number;
  bpm: number | null;
  key: string | null;
  mood_tags: string[];
  energy_range: [number, number];
  warmth_range: [number, number];
  has_build: boolean;
  build_starts_at?: number;
  loop_safe: boolean;
}

export interface SfxManifest {
  beds: SfxBed[];
  transitions: SfxTransition[];
}

export interface SfxBed {
  id: string;
  file: string;
  duration_seconds: number;
  loop_safe: boolean;
  mood_tags: string[];
  energy_range: [number, number];
}

export interface SfxTransition {
  id: string;
  file: string;
  duration_seconds: number;
  category: "entry" | "exit";
  intensity_range: [number, number];
}

// ════════════════════════════════════════════════════
// 3D CAMERA & POSITION TYPES
// ════════════════════════════════════════════════════

export interface CameraWaypoint {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}

export interface ElementPosition3D {
  visual_id: string;
  x: number;
  y: number;
  z: number;
}

// ════════════════════════════════════════════════════
// COMPILED OUTPUT: compiled/timeline.json
// Generated by the compiler, consumed by Remotion.
// ════════════════════════════════════════════════════

export interface CompiledTimeline {
  fps: number;
  total_frames: number;
  width: number;
  height: number;

  // 3D scene configuration
  scene3d: Scene3DConfig;

  // Every scene with absolute frame positions
  segments: CompiledSegment[];

  // Music cues with absolute positions
  music_cues: CompiledMusicCue[];

  // Global audio mix config (copied from project)
  audio_mix: AudioMixConfig;

  // Color grades (copied from project)
  color_grades: Record<string, ColorGrade>;
}

export interface Scene3DConfig {
  perspective: number;          // CSS perspective (default 1000)
  transition_duration: number;  // frames for camera sweep between steps
  easing: string;               // e.g. "easeInOutCubic"
}

export interface CompiledSegment {
  id: string;                           // e.g., "act-1/seq-1/scene-1"
  path: string;                         // filesystem path to scene folder

  // Absolute frame positions
  narration_start_frame: number;
  narration_end_frame: number;
  narration_duration_frames: number;
  gap_start_frame: number;
  gap_end_frame: number;
  gap_duration_frames: number;

  // Audio sources
  narration_src: string;

  // SFX (resolved to frames)
  sfx_entry?: CompiledSfxEvent;
  sfx_exit?: CompiledSfxEvent;
  sfx_bed?: CompiledSfxEvent;

  // Ambience
  ambience?: {
    src: string;
    volume: number;
    loop: boolean;
  };

  // Color grade
  color_grade: ColorGrade;              // resolved from name to actual values

  // 3D camera waypoint for this scene
  camera: CameraWaypoint;

  // 3D positions for each visual element in this scene
  visual_elements_3d: ElementPosition3D[];

  // Visuals resolved to absolute frames
  visual_events: CompiledVisualEvent[];

  // Music intensity changes resolved to frames
  music_events: CompiledMusicEvent[];

  // Text overlays resolved to frames
  text_events: CompiledTextEvent[];
}

export interface CompiledSfxEvent {
  src: string;
  start_frame: number;
  duration_frames: number;
  volume: number;
  fade_in_frames: number;
  fade_out_frames: number;
}

export interface CompiledVisualEvent {
  frame: number;                        // absolute frame where this visual starts
  visual: VisualAsset;                  // the resolved asset
  animation?: string;
  direction?: string;
  duration_frames: number;              // until the next visual-change or end of segment
  element3d?: { x: number; y: number; z: number };
}

export interface CompiledMusicCue {
  src: string;
  start_frame: number;
  duration_frames: number;
  volume: number;
  fade_in_frames: number;
  fade_out_frames: number;
  track_offset_seconds: number;

  // Intensity keyframes (from music-intensity word events)
  intensity_keyframes: Array<{
    frame: number;
    intensity: number;
  }>;
}

export interface CompiledMusicEvent {
  frame: number;
  intensity: number;
}

export interface CompiledTextEvent {
  start_frame: number;
  end_frame: number;
  visual: TitleAsset;
}
