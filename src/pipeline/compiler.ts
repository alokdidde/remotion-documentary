// compiler.ts — Converts loaded project tree → compiled timeline
//
// This is the MATH LAYER. No AI, no judgment.
// Pure arithmetic: durations → frames, intents → render params.
// Extended with layout3d() for 3D camera waypoint assignment.

import type {
  CompiledTimeline,
  CompiledSegment,
  CompiledMusicCue,
  CompiledSfxEvent,
  CompiledVisualEvent,
  CompiledTextEvent,
  SegmentSfx,
  CameraWaypoint,
  ElementPosition3D,
  Scene3DConfig,
} from "./types";
import type { LoadedProject, LoadedScene, LoadedSequence } from "./loader";

// ════════════════════════════════════════════════════
// Main compiler
// ════════════════════════════════════════════════════

export function compile(project: LoadedProject): CompiledTimeline {
  const { fps, width, height, audio_mix, color_grades } = project.root;

  let cursor = 0; // current frame position
  const segments: CompiledSegment[] = [];
  const musicCues: CompiledMusicCue[] = [];

  // Track act/seq/scene indices for 3D layout
  let actIndex = 0;

  for (const act of project.acts) {
    let seqIndex = 0;

    for (const seq of act.sequences) {
      // Compile music cue for this sequence
      const seqStartFrame = cursor;
      const musicCue = compileMusicCue(seq, seqStartFrame, fps);
      let sceneIndex = 0;

      for (let i = 0; i < seq.scenes.length; i++) {
        const scene = seq.scenes[i];
        const intent = scene.editorial.intent;
        const sfx = scene.editorial.sfx;

        // Narration duration from word timings
        const narrationDurationSeconds = scene.wordTimings.duration_seconds;
        const narrationDurationFrames = Math.ceil(narrationDurationSeconds * fps);

        // Gap duration from intent.breath (0 → 0 frames, 1 → 4 seconds)
        const gapDurationFrames = Math.round(lerp(0, fps * 4, intent.breath));

        // Frame positions
        const narrationStart = cursor;
        const narrationEnd = cursor + narrationDurationFrames;
        const gapStart = narrationEnd;
        const gapEnd = gapStart + gapDurationFrames;

        // 3D camera waypoint from layout
        const camera = computeCameraWaypoint(
          actIndex, seqIndex, sceneIndex, intent
        );

        // 3D positions for visual elements
        const visual_elements_3d = computeVisualPositions(
          scene, sceneIndex, intent
        );

        // Compile visual events (word index → absolute frame)
        const visualEvents = compileVisualEvents(
          scene, narrationStart, fps, visual_elements_3d
        );

        // Compile text overlay events
        const textEvents = compileTextEvents(scene, narrationStart, fps);

        // Compile SFX
        const sfxEntry = compileSfxEntry(sfx, narrationStart, gapDurationFrames, fps);
        const sfxExit = compileSfxExit(sfx, narrationEnd, gapDurationFrames, fps);
        const sfxBed = compileSfxBed(sfx, narrationStart, narrationDurationFrames, fps);

        // Resolve ambience (scene override → sequence default → none)
        const ambience = scene.config.ambience ?? seq.config.default_ambience;

        // Resolve color grade
        const colorGrade = color_grades[scene.config.color_grade]
          ?? color_grades["neutral"]
          ?? { brightness: 1, contrast: 1, saturate: 1, sepia: 0, hue_rotate: 0 };

        // Compile music intensity keyframes for this segment
        const musicEvents = scene.editorial.word_events
          .filter((e): e is Extract<typeof e, { type: "music-intensity" }> =>
            e.type === "music-intensity"
          )
          .map((e) => ({
            frame: wordToFrame(scene, e.at_word, narrationStart, fps),
            intensity: e.intensity,
          }));

        segments.push({
          id: scene.path,
          path: scene.path,
          narration_start_frame: narrationStart,
          narration_end_frame: narrationEnd,
          narration_duration_frames: narrationDurationFrames,
          gap_start_frame: gapStart,
          gap_end_frame: gapEnd,
          gap_duration_frames: gapDurationFrames,
          narration_src: scene.narrationAudioPath,
          sfx_entry: sfxEntry,
          sfx_exit: sfxExit,
          sfx_bed: sfxBed,
          ambience: ambience
            ? { src: ambience.src, volume: ambience.volume, loop: ambience.loop }
            : undefined,
          color_grade: colorGrade,
          camera,
          visual_elements_3d,
          visual_events: visualEvents,
          music_events: musicEvents,
          text_events: textEvents,
        });

        cursor = gapEnd;
        sceneIndex++;
      }

      // Finalize music cue duration (from sequence start to last scene end)
      if (musicCue) {
        musicCue.duration_frames = cursor - seqStartFrame;
        musicCues.push(musicCue);
      }

      seqIndex++;
    }

    actIndex++;
  }

  // Scene3D configuration
  const scene3d: Scene3DConfig = {
    perspective: 1000,
    transition_duration: Math.round(fps * 1.5), // 1.5 seconds for camera sweep
    easing: "easeInOutCubic",
  };

  return {
    fps,
    total_frames: cursor,
    width,
    height,
    scene3d,
    segments,
    music_cues: musicCues,
    audio_mix,
    color_grades,
  };
}

// ════════════════════════════════════════════════════
// 3D Layout — spiral path through 3D space
// ════════════════════════════════════════════════════

function computeCameraWaypoint(
  actIndex: number,
  seqIndex: number,
  sceneIndex: number,
  intent: { weight: number; energy: number; contrast: number; warmth: number }
): CameraWaypoint {
  // Each act gets a different depth plane (z)
  // Sequences spread on x-axis
  // Scenes spread on y-axis
  // Intent dials influence spacing

  const baseSpacing = 800;
  const contrastMultiplier = 1 + intent.contrast * 2; // high contrast = bigger movement

  // Spiral layout: angle increases per scene
  const globalSceneIndex = actIndex * 10 + seqIndex * 3 + sceneIndex;
  const angle = globalSceneIndex * 0.8; // radians per scene

  const radius = baseSpacing * (1 + seqIndex * 0.5);
  const x = Math.cos(angle) * radius * contrastMultiplier;
  const y = Math.sin(angle) * radius * contrastMultiplier;
  const z = -actIndex * 1500 - intent.warmth * 500; // warmth pulls forward

  // Subtle rotation based on energy
  const rotateX = intent.energy * 5 - 2.5; // -2.5 to +2.5 degrees
  const rotateY = Math.sin(angle) * 3;
  const rotateZ = 0;

  // Scale: weight influences how "close" the camera gets
  const scale = lerp(0.8, 1.2, intent.weight);

  return { x, y, z, rotateX, rotateY, rotateZ, scale };
}

function computeVisualPositions(
  scene: LoadedScene,
  _sceneIndex: number,
  intent: { density: number }
): ElementPosition3D[] {
  const visuals = scene.config.available_visuals;
  const spread = lerp(50, 200, intent.density);

  return visuals.map((v, i) => ({
    visual_id: v.id,
    x: (i - (visuals.length - 1) / 2) * spread,
    y: 0,
    z: -i * 30,
  }));
}

// ════════════════════════════════════════════════════
// Word → Frame resolution
// ════════════════════════════════════════════════════

function wordToFrame(
  scene: LoadedScene,
  wordIndex: number,
  segmentStartFrame: number,
  fps: number
): number {
  const word = scene.wordTimings.words[wordIndex];
  if (!word) {
    console.warn(`Word index ${wordIndex} out of bounds in ${scene.path}`);
    return segmentStartFrame;
  }
  return segmentStartFrame + Math.round(word.start * fps);
}

// ════════════════════════════════════════════════════
// Visual events compiler
// ════════════════════════════════════════════════════

function compileVisualEvents(
  scene: LoadedScene,
  segmentStartFrame: number,
  fps: number,
  visualPositions: ElementPosition3D[]
): CompiledVisualEvent[] {
  const events = scene.editorial.word_events
    .filter((e): e is Extract<typeof e, { type: "visual-change" }> =>
      e.type === "visual-change"
    )
    .sort((a, b) => a.at_word - b.at_word);

  const narrationDurationFrames = Math.ceil(
    scene.wordTimings.duration_seconds * fps
  );

  return events.map((event, i) => {
    const frame = wordToFrame(scene, event.at_word, segmentStartFrame, fps);

    // Duration: until next visual event or end of segment
    const nextFrame =
      i < events.length - 1
        ? wordToFrame(scene, events[i + 1].at_word, segmentStartFrame, fps)
        : segmentStartFrame + narrationDurationFrames;

    // Resolve visual asset from scene config
    const visual = scene.config.available_visuals.find(
      (v) => v.id === event.visual_id
    );

    // Resolve 3D position for this visual
    const pos = visualPositions.find((p) => p.visual_id === event.visual_id);

    return {
      frame,
      visual: visual!,
      animation: event.animation,
      direction: event.direction,
      duration_frames: nextFrame - frame,
      element3d: pos ? { x: pos.x, y: pos.y, z: pos.z } : undefined,
    };
  });
}

// ════════════════════════════════════════════════════
// Text overlay compiler
// ════════════════════════════════════════════════════

function compileTextEvents(
  scene: LoadedScene,
  segmentStartFrame: number,
  fps: number
): CompiledTextEvent[] {
  return scene.editorial.word_events
    .filter((e): e is Extract<typeof e, { type: "text-overlay" }> =>
      e.type === "text-overlay"
    )
    .map((event) => {
      const startFrame = wordToFrame(scene, event.at_word, segmentStartFrame, fps);

      // End frame: at_word + duration_words
      const endWordIndex = event.at_word + event.duration_words - 1;
      const endWord = scene.wordTimings.words[endWordIndex];
      const endFrame = endWord
        ? segmentStartFrame + Math.round(endWord.end * fps)
        : startFrame + fps * 2; // fallback: 2 seconds

      const visual = scene.config.available_visuals.find(
        (v) => v.id === event.visual_id
      );

      return {
        start_frame: startFrame,
        end_frame: endFrame,
        visual: visual as any,
      };
    });
}

// ════════════════════════════════════════════════════
// SFX compilers (intent gradients → concrete events)
// ════════════════════════════════════════════════════

function compileSfxEntry(
  sfx: SegmentSfx,
  segmentStartFrame: number,
  _prevGapFrames: number,
  fps: number
): CompiledSfxEvent | undefined {
  if (sfx.entry < 0.1 || !sfx.entry_src) return undefined;

  // Entry sound plays during the gap BEFORE this segment
  const riserDuration = Math.round(lerp(fps * 0.5, fps * 2, sfx.entry));
  const startFrame = Math.max(0, segmentStartFrame - riserDuration);

  return {
    src: sfx.entry_src,
    start_frame: startFrame,
    duration_frames: riserDuration + Math.round(fps * 0.3), // slight bleed
    volume: lerp(0, 0.3, sfx.entry),
    fade_in_frames: Math.round(riserDuration * 0.6),
    fade_out_frames: Math.round(fps * 0.3),
  };
}

function compileSfxExit(
  sfx: SegmentSfx,
  narrationEndFrame: number,
  gapDurationFrames: number,
  fps: number
): CompiledSfxEvent | undefined {
  if (sfx.exit < 0.1 || !sfx.exit_src) return undefined;

  // Exit sound plays during the gap AFTER this segment
  const tailDuration = Math.min(
    Math.round(lerp(fps * 1, fps * 3, sfx.exit)),
    gapDurationFrames
  );

  return {
    src: sfx.exit_src,
    start_frame: narrationEndFrame,
    duration_frames: tailDuration,
    volume: lerp(0, 0.4, sfx.exit),
    fade_in_frames: 0, // starts immediately
    fade_out_frames: Math.round(tailDuration * 0.7),
  };
}

function compileSfxBed(
  sfx: SegmentSfx,
  segmentStartFrame: number,
  segmentDurationFrames: number,
  fps: number
): CompiledSfxEvent | undefined {
  if (sfx.bed < 0.1 || !sfx.bed_src) return undefined;

  return {
    src: sfx.bed_src,
    start_frame: segmentStartFrame,
    duration_frames: segmentDurationFrames,
    volume: lerp(0, 0.15, sfx.bed), // always subtle
    fade_in_frames: Math.round(fps * 1),
    fade_out_frames: Math.round(fps * 1),
  };
}

// ════════════════════════════════════════════════════
// Music cue compiler
// ════════════════════════════════════════════════════

function compileMusicCue(
  seq: LoadedSequence,
  seqStartFrame: number,
  fps: number
): CompiledMusicCue | null {
  const music = seq.config.music;
  if (!music) return null;

  return {
    src: music.src,
    start_frame: seqStartFrame,
    duration_frames: 0, // filled in after all scenes are processed
    volume: music.volume,
    fade_in_frames: Math.round(music.fade_in_seconds * fps),
    fade_out_frames: Math.round(music.fade_out_seconds * fps),
    track_offset_seconds: music.track_offset_seconds ?? 0,
    intensity_keyframes: [], // filled in per-segment
  };
}

// ════════════════════════════════════════════════════
// Math utilities
// ════════════════════════════════════════════════════

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
