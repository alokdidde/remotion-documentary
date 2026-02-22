// CameraSfxSync.tsx — Utility that pairs camera transitions with
// appropriate SFX from the manifest
//
// High-energy moves → risers
// Slow sweeps → resonance/warm tails

import type { SegmentIntent, SfxManifest, SfxTransition } from "../pipeline/types";

export interface SfxPairing {
  entry_src: string | undefined;
  exit_src: string | undefined;
}

export function pairCameraSfx(
  intent: SegmentIntent,
  sfxManifest: SfxManifest
): SfxPairing {
  const entryTransitions = sfxManifest.transitions.filter(
    (t) => t.category === "entry"
  );
  const exitTransitions = sfxManifest.transitions.filter(
    (t) => t.category === "exit"
  );

  return {
    entry_src: pickBestSfx(entryTransitions, intent.energy),
    exit_src: pickBestSfx(exitTransitions, 1 - intent.energy), // low energy = warmer exit
  };
}

function pickBestSfx(
  transitions: SfxTransition[],
  targetIntensity: number
): string | undefined {
  if (transitions.length === 0) return undefined;

  // Find the transition whose intensity range best matches
  let best = transitions[0];
  let bestScore = Infinity;

  for (const t of transitions) {
    const mid = (t.intensity_range[0] + t.intensity_range[1]) / 2;
    const score = Math.abs(mid - targetIntensity);
    if (score < bestScore) {
      bestScore = score;
      best = t;
    }
  }

  return best.file;
}
