// Base wrapper for 3D scenes using @remotion/three.
// Provides ThreeCanvas with standard documentary defaults.
// Use Remotion's useCurrentFrame() inside children — NOT React Three Fiber's useFrame().

import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

interface ThreeSceneProps {
  /** Camera field of view (default 75) */
  fov?: number;
  /** Camera position [x, y, z] (default [0, 0, 5]) */
  cameraPosition?: [number, number, number];
  /** Background color (default transparent) */
  backgroundColor?: string;
  /** Additional CSS styles on the canvas container */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  fov = 75,
  cameraPosition = [0, 0, 5],
  backgroundColor,
  style,
  children,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov, position: cameraPosition }}
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        ...style,
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {children}
    </ThreeCanvas>
  );
};
