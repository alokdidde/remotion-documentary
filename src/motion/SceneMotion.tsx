// SceneMotion.tsx — Maps editorial animation/direction to StaggeredMotion props
// for within-scene animations (ken-burns, pans, slides)

import React from "react";
import { StaggeredMotion } from "remotion-bits";

export interface SceneMotionProps {
  animation?: string;
  direction?: string;
  children: React.ReactNode;
}

export const SceneMotion: React.FC<SceneMotionProps> = ({
  animation,
  direction,
  children,
}) => {
  const transition = getMotionTransition(animation, direction);

  if (!transition) {
    return <>{children}</>;
  }

  return (
    <StaggeredMotion transition={transition}>
      {children}
    </StaggeredMotion>
  );
};

function getMotionTransition(animation?: string, direction?: string) {
  if (!animation || animation === "static") return null;

  switch (animation) {
    case "ken-burns":
      return getKenBurnsTransition(direction);
    case "fade-in":
      return {
        opacity: [0, 1] as [number, number],
        duration: 30,
        easing: "easeOutCubic" as const,
        stagger: 5,
      };
    case "slide":
      return getSlideTransition(direction);
    case "fullscreen-zoom":
      return {
        scale: [0.8, 1] as [number, number],
        opacity: [0, 1] as [number, number],
        duration: 20,
        easing: "easeOutCubic" as const,
        stagger: 3,
      };
    default:
      return null;
  }
}

function getKenBurnsTransition(direction?: string) {
  switch (direction) {
    case "zoom-in":
      return {
        scale: [1, 1.15] as [number, number],
        duration: 90,
        easing: "linear" as const,
        stagger: 0,
      };
    case "zoom-out":
      return {
        scale: [1.15, 1] as [number, number],
        duration: 90,
        easing: "linear" as const,
        stagger: 0,
      };
    case "pan-left":
      return {
        x: [50, -50] as [number, number],
        scale: [1.05, 1.05] as [number, number],
        duration: 90,
        easing: "linear" as const,
        stagger: 0,
      };
    case "pan-right":
      return {
        x: [-50, 50] as [number, number],
        scale: [1.05, 1.05] as [number, number],
        duration: 90,
        easing: "linear" as const,
        stagger: 0,
      };
    default:
      return {
        scale: [1, 1.1] as [number, number],
        duration: 90,
        easing: "linear" as const,
        stagger: 0,
      };
  }
}

function getSlideTransition(direction?: string) {
  switch (direction) {
    case "pan-left":
      return {
        x: [100, 0] as [number, number],
        opacity: [0, 1] as [number, number],
        duration: 20,
        easing: "easeOutCubic" as const,
        stagger: 5,
      };
    case "pan-right":
      return {
        x: [-100, 0] as [number, number],
        opacity: [0, 1] as [number, number],
        duration: 20,
        easing: "easeOutCubic" as const,
        stagger: 5,
      };
    default:
      return {
        y: [50, 0] as [number, number],
        opacity: [0, 1] as [number, number],
        duration: 20,
        easing: "easeOutCubic" as const,
        stagger: 5,
      };
  }
}
