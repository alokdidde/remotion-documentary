// 3D animated bar chart — for dramatic data visualization sequences.
// Each bar grows from zero to its target height with staggered timing.

import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface Bar3DData {
  label: string;
  value: number;
  color?: string;
}

interface Bars3DProps {
  data: Bar3DData[];
  /** Maximum bar height in 3D units (default 3) */
  maxHeight?: number;
  /** Width of each bar (default 0.6) */
  barWidth?: number;
  /** Gap between bars (default 0.3) */
  gap?: number;
  /** Default bar color (default #3B82F6) */
  color?: string;
  /** Frames to stagger each bar's entrance (default 8) */
  stagger?: number;
  /** Camera orbit: rotate Y over time (radians per frame, default 0) */
  orbitSpeed?: number;
}

export const Bars3D: React.FC<Bars3DProps> = ({
  data,
  maxHeight = 3,
  barWidth = 0.6,
  gap = 0.3,
  color = "#3B82F6",
  stagger = 8,
  orbitSpeed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const startX = -totalWidth / 2 + barWidth / 2;

  const groupRotation = frame * orbitSpeed;

  return (
    <group rotation={[0, groupRotation, 0]}>
      {/* Base plate */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalWidth + 1, 2]} />
        <meshStandardMaterial
          color="#1F2937"
          transparent
          opacity={0.3}
        />
      </mesh>

      {data.map((bar, i) => {
        const targetHeight = (bar.value / maxValue) * maxHeight;

        const growProgress = spring({
          frame: frame - i * stagger,
          fps,
          config: { damping: 20, stiffness: 80, mass: 0.8 },
        });

        const currentHeight = interpolate(
          growProgress,
          [0, 1],
          [0.01, targetHeight],
        );

        const x = startX + i * (barWidth + gap);

        return (
          <mesh key={i} position={[x, currentHeight / 2, 0]}>
            <boxGeometry args={[barWidth, currentHeight, barWidth]} />
            <meshStandardMaterial color={bar.color ?? color} />
          </mesh>
        );
      })}
    </group>
  );
};
