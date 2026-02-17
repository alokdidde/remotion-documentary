// Floating particles — ambient 3D background for mood/atmosphere.
// Renders a field of small glowing spheres drifting through 3D space.

import { useMemo } from "react";
import { useCurrentFrame, interpolate, random } from "remotion";

interface FloatingParticlesProps {
  /** Number of particles (default 80) */
  count?: number;
  /** Spread radius (default 8) */
  spread?: number;
  /** Particle size (default 0.04) */
  size?: number;
  /** Particle color (default #60A5FA) */
  color?: string;
  /** Drift speed multiplier (default 1) */
  speed?: number;
  /** Fade in over first N frames (default 30) */
  fadeInFrames?: number;
  /** Seed for deterministic randomness (default "particles") */
  seed?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  phase: number;
  speedX: number;
  speedY: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 80,
  spread = 8,
  size = 0.04,
  color = "#60A5FA",
  speed = 1,
  fadeInFrames = 30,
  seed = "particles",
}) => {
  const frame = useCurrentFrame();

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (random(`${seed}-x-${i}`) - 0.5) * spread * 2,
      y: (random(`${seed}-y-${i}`) - 0.5) * spread * 2,
      z: (random(`${seed}-z-${i}`) - 0.5) * spread * 2,
      phase: random(`${seed}-phase-${i}`) * Math.PI * 2,
      speedX: (random(`${seed}-sx-${i}`) - 0.5) * 0.01 * speed,
      speedY: (random(`${seed}-sy-${i}`) - 0.5) * 0.01 * speed,
    }));
  }, [count, spread, speed, seed]);

  const opacity = interpolate(frame, [0, fadeInFrames], [0, 0.7], {
    extrapolateRight: "clamp",
  });

  return (
    <group>
      {particles.map((p, i) => {
        const x = p.x + Math.sin(frame * p.speedX + p.phase) * 0.5;
        const y = p.y + Math.cos(frame * p.speedY + p.phase) * 0.5;
        return (
          <mesh key={i} position={[x, y, p.z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
};
