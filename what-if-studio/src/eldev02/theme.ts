/**
 * No Presiones · Sin resolver · Caso Nº 02 · Satoshi Nakamoto
 * "Crypto-forensic terminal / cyber-editorial" identity: tokens, fonts, safe zone, timing.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import type { CSSProperties } from 'react';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const COL = {
  bg: '#07080A', // carbon black
  card: 'rgba(15, 18, 24, 0.85)', // dark glass
  border: '#1E2430',
  amber: '#F7931A', // Bitcoin amber: data, figures, cryptography
  cyan: '#00F0FF', // terminal cyan: block metadata, hashes
  crimson: '#FF2A55', // only for locked / failed states
  white: '#F5F7FA',
  muted: '#7C8696',
  dim: '#2A3342',
};

export const HEAD = 'ED Inter';
export const MONO = 'ED JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** Shorts / Reels / TikTok safe zone: every key text and graphic lives in x 80..1000, y 220..1580. */
export const SAFE = { top: 220, bottom: 340, x: 80 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom; // 1580

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const TR = 8; // transition length in frames

/** Scene table on the global clock (frames at 30 fps). Total 1050 frames = 35.0 s. */
export const SCENES = {
  hook: { from: 0, len: 100 }, // 0.0 – 3.33 s
  paper: { from: 100, len: 125 }, // 3.33 – 7.5 s
  genesis: { from: 225, len: 140 }, // 7.5 – 12.17 s
  exit: { from: 365, len: 140 }, // 12.17 – 16.83 s
  wallet: { from: 505, len: 155 }, // 16.83 – 21.83 s
  fakes: { from: 660, len: 155 }, // 21.83 – 26.83 s
  proof: { from: 815, len: 140 }, // 26.83 – 31.5 s
  loop: { from: 955, len: 95 }, // 31.5 – 35.0 s
} as const;
export const DURATION = 1050;

/** Clamped interpolation with the house curve. */
export const ci = (f: number, a: number, b: number, x: number, y: number, easing: (t: number) => number = EASE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/** Deterministic pseudo-random in [0, 1). */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const glass: CSSProperties = {
  background: COL.card,
  border: `1px solid ${COL.border}`,
  borderRadius: 18,
  backdropFilter: 'blur(14px)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
};
