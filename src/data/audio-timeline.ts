// Global audio timeline — all audio events (narration, music, SFX, ambience)
// rendered as a single layer at the composition root, independent of visual chapters.

import { staticFile } from "remotion";

export type AudioEventType = "narration" | "music" | "sfx" | "ambience";

export interface AudioEvent {
  id: string;
  type: AudioEventType;
  /** Path relative to public/ (e.g. "audio/narration/ch1-intro.mp3") */
  src: string;
  startFrame: number;
  durationFrames: number;
  /** 0-1, defaults per type if omitted */
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  loop?: boolean;
  /** Display name in Remotion Studio timeline */
  label?: string;
}

// Default volumes matching CLAUDE.md hierarchy:
// Narration 0 dB, SFX -6 to -12 dB, Music -12 to -18 dB, Ambience -18 to -24 dB
export const DEFAULT_VOLUME: Record<AudioEventType, number> = {
  narration: 1.0,
  sfx: 0.5,
  music: 0.15,
  ambience: 0.08,
};

export const DEFAULT_FADE_IN: Record<AudioEventType, number> = {
  narration: 0,
  sfx: 0,
  music: 30,
  ambience: 60,
};

export const DEFAULT_FADE_OUT: Record<AudioEventType, number> = {
  narration: 0,
  sfx: 0,
  music: 45,
  ambience: 60,
};

export const DEFAULT_LOOP: Record<AudioEventType, boolean> = {
  narration: false,
  sfx: false,
  music: true,
  ambience: true,
};

/** Resolve a filename to its staticFile path under public/ */
export function audioSrc(
  filename: string,
  type: AudioEventType = "narration",
): string {
  const dirs: Record<AudioEventType, string> = {
    narration: "audio/narration",
    music: "audio/music",
    sfx: "audio/sfx",
    ambience: "audio/sfx",
  };
  return staticFile(`${dirs[type]}/${filename}`);
}

// ─── Global Timeline ────────────────────────────────────────────────
// Add AudioEvent objects here. They use absolute frame positions,
// completely decoupled from visual chapters. This enables J-cuts
// (audio leads visual) and L-cuts (audio trails visual).
//
// Example:
// {
//   id: "ch1-intro-narration",
//   type: "narration",
//   src: audioSrc("ch1-intro.mp3", "narration"),
//   startFrame: 15,
//   durationFrames: 300,
//   label: "Ch1 Intro Narration",
// },
// {
//   id: "ch1-bg-music",
//   type: "music",
//   src: audioSrc("ch1-mysterious.mp3", "music"),
//   startFrame: 0,
//   durationFrames: 900,
//   label: "Ch1 Background Music",
// },

export const audioTimeline: AudioEvent[] = [];

// ─── Helpers ────────────────────────────────────────────────────────

export function getEventsByType(type: AudioEventType): AudioEvent[] {
  return audioTimeline.filter((e) => e.type === type);
}

export function getEventsAtFrame(frame: number): AudioEvent[] {
  return audioTimeline.filter(
    (e) => frame >= e.startFrame && frame < e.startFrame + e.durationFrames,
  );
}

export function getTimelineEndFrame(): number {
  if (audioTimeline.length === 0) return 0;
  return Math.max(...audioTimeline.map((e) => e.startFrame + e.durationFrames));
}
