// IntentToCamera.tsx — Maps 6 intent dials to 3D camera parameters
//
// weight  → distance between steps (bigger = closer camera)
// energy  → transition speed (affects transitionDuration)
// contrast → rotation change between steps
// warmth  → z-depth (warm = closer)
// density → number of sub-elements visible

import type { SegmentIntent, CameraWaypoint } from "../pipeline/types";

export interface CameraParams {
  waypoint: CameraWaypoint;
  transitionSpeed: number; // multiplier on base transition duration
  elementCount: number; // how many sub-elements to show
}

export function intentToCamera(
  intent: SegmentIntent,
  baseWaypoint: CameraWaypoint
): CameraParams {
  // Weight affects scale (high weight = closer, more prominent)
  const scale = baseWaypoint.scale * lerp(0.8, 1.3, intent.weight);

  // Warmth affects z-depth (warm = closer to camera)
  const z = baseWaypoint.z + lerp(0, 300, intent.warmth);

  // Contrast affects rotation magnitude
  const rotationMagnitude = lerp(0, 5, intent.contrast);
  const rotateX = baseWaypoint.rotateX + rotationMagnitude * Math.sin(baseWaypoint.x * 0.01);
  const rotateY = baseWaypoint.rotateY + rotationMagnitude * Math.cos(baseWaypoint.y * 0.01);

  // Energy affects transition speed
  const transitionSpeed = lerp(1.5, 0.5, intent.energy); // high energy = faster

  // Density affects how many elements are visible
  const elementCount = Math.round(lerp(1, 5, intent.density));

  return {
    waypoint: {
      x: baseWaypoint.x,
      y: baseWaypoint.y,
      z,
      rotateX,
      rotateY,
      rotateZ: baseWaypoint.rotateZ,
      scale,
    },
    transitionSpeed,
    elementCount,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
