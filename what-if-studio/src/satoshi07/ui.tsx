import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ci } from './theme';

export const XFADE = 8;
/** Entra fundiéndose encima de la anterior, con un acercamiento lento durante toda la escena. */
export const SceneIn: React.FC<{ children: React.ReactNode; len: number; skipIn?: boolean }> = ({ children, len, skipIn = false }) => {
  const f = useCurrentFrame();
  const k = skipIn ? 1 : ci(f, 0, XFADE, 0, 1);
  const scale = (1.12 - 0.12 * k) * (1 + 0.035 * (f / len));
  const blur = 6 * (1 - k);
  return <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${Math.sin(f / 47) * 0.35}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: k }}>{children}</AbsoluteFill>;
};
