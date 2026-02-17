// 3D rotating globe — useful for geography-focused documentaries.
// Renders a wireframe sphere with configurable rotation speed and color.

import { useCurrentFrame, interpolate } from "remotion";

interface GlobeProps {
  /** Radius of the sphere (default 2) */
  radius?: number;
  /** Frames for one full rotation (default 300 = 10s at 30fps) */
  rotationPeriod?: number;
  /** Globe color (default #3B82F6) */
  color?: string;
  /** Wireframe vs solid (default true) */
  wireframe?: boolean;
  /** Y-axis tilt in radians (default 0.4 ≈ 23°) */
  tilt?: number;
  /** Position offset [x, y, z] */
  position?: [number, number, number];
  /** Scale entrance over first N frames (default 0 = no scale animation) */
  scaleInFrames?: number;
}

export const Globe: React.FC<GlobeProps> = ({
  radius = 2,
  rotationPeriod = 300,
  color = "#3B82F6",
  wireframe = true,
  tilt = 0.4,
  position = [0, 0, 0],
  scaleInFrames = 0,
}) => {
  const frame = useCurrentFrame();

  const rotation = (frame / rotationPeriod) * Math.PI * 2;

  const scale =
    scaleInFrames > 0
      ? interpolate(frame, [0, scaleInFrames], [0, 1], {
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <mesh
      position={position}
      rotation={[tilt, rotation, 0]}
      scale={[scale, scale, scale]}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={wireframe ? 0.6 : 1}
      />
    </mesh>
  );
};
