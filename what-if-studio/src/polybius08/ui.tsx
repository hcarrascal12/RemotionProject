import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ci } from './theme';

export const XFADE = 6;
export const SceneIn: React.FC<{ children: React.ReactNode; len: number; skipIn?: boolean; skipOut?: boolean }> = ({ children, len, skipIn = false, skipOut = false }) => {
  const f = useCurrentFrame();
  // entra fundiéndose ENCIMA de la anterior, que sigue viva por debajo (Sequence alargada en Polar05):
  // ni un frame en negro entre escenas
  const k = skipIn ? 1 : ci(f, 0, XFADE, 0, 1);
  const outK = 0;
  // nunca un frame quieto: la escena entera se acerca durante toda su vida (salvo la última, que debe acabar
  // exactamente en el encuadre del frame 0 para que el loop enganche)
  const drift = skipOut ? 1 : 1 + 0.05 * (f / len);
  const scale = (1.16 - 0.16 * k) * (1 + 0.05 * outK) * drift;
  const blur = 6 * (1 - k);
  const rot = skipOut ? 0 : Math.sin(f / 37) * 0.5;
  return <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${rot}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: k }}>{children}</AbsoluteFill>;
};

