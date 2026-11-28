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

/** Scene table on the global clock (frames at 30 fps), retimed to the recorded voice (public/eldev02/voz-raw.mp3,
 * word times in out/eldev02/voz-words.json). Total 1113 frames = 37.1 s. The loop holds through the zoom back into
 * frame 0 and the final riser/hit (local f74–75), plus another ~0.5 s so the "¿Quién crees que es Satoshi?" call
 * to action — raised clear of where Shorts/TikTok/Reels draw their own UI — sits on screen a beat longer. */
export const SCENES = {
  hook: { from: 0, len: 145 }, // 0.00 – 4.83 s · "Inventó Bitcoin... nunca tocó su fortuna."
  paper: { from: 145, len: 169 }, // 4.83 – 10.47 s · "El 31 de octubre... Satoshi Nakamoto."
  genesis: { from: 314, len: 146 }, // 10.47 – 15.33 s · "En el primer bloque... segundo rescate a los bancos."
  exit: { from: 460, len: 114 }, // 15.33 – 19.13 s · "Años después... y se esfumó."
  wallet: { from: 574, len: 150 }, // 19.13 – 24.13 s · "Se calcula... ninguno se ha movido."
  // +15 frames of hold (and a matching 0.5 s of silence spliced into voz-raw.mp3 right after "no lo era.") so the
  // tribunal's ruling gets a beat to land before the next line starts — the court's verdict and the "bastaría
  // mover una moneda" twist shouldn't run into each other.
  fakes: { from: 724, len: 175 }, // 24.13 – 29.97 s · "Varios dijeron... no lo era." [+0.5 s pause]
  proof: { from: 899, len: 132 }, // 29.97 – 34.37 s · "Bastaría mover una moneda... nadie lo ha hecho."
  // +15 extra frames (0.5 s) of hold on the CTA before the loop, on top of the hold already there for the riser.
  loop: { from: 1031, len: 112 }, // 34.37 – 38.1 s · "¿Quién crees que es Satoshi?"
} as const;
export const DURATION = 1143;

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
