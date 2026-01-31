// Full screen wrapper component
import { AbsoluteFill } from "remotion";
import { ReactNode } from "react";

interface FullScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

export const FullScreen: React.FC<FullScreenProps> = ({
  children,
  backgroundColor = "#000000",
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Centered content wrapper
interface CenteredProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export const Centered: React.FC<CenteredProps> = ({ children, style }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Padded container
interface PaddedContainerProps {
  children: ReactNode;
  padding?: number;
  style?: React.CSSProperties;
}

export const PaddedContainer: React.FC<PaddedContainerProps> = ({
  children,
  padding = 80,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
