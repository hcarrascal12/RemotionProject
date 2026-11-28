/**
 * No Presiones · Sin resolver · Caso Nº 04 · El Gato con Sombrero (el bulo de IA de Irlanda, agosto de 2026)
 * Identidad "tablero de investigación": papel claro, tinta negra, fotos en 3D y un solo acento, el rojo del sombrero.
 * Hechos: BBC (23-ago-2026), Know Your Meme (31-ago-2026), ABC News, Economic Times. Ver public/gato06/CREDITOS.md.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const COL = {
  // tablero de investigación sobre papel: claro y neutro, con un solo color fuerte (el rojo del sombrero)
  paper: '#E9E6E0',
  paper2: '#D9D5CD',
  ink: '#121212',
  bg: '#E9E6E0',
  card: '#FAFAF7',
  border: '#C9C3B8',
  ice: '#E3262F', // acento único: rojo sombrero
  frost: '#FFF4CC',
  red: '#E3262F',
  white: '#FFFFFF',
  muted: '#6E6860',
  blue: '#2F6BFF',
  tape: 'rgba(245, 232, 170, 0.78)',
};

export const HEAD = 'G6 Inter';
export const MONO = 'G6 JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** Zona segura de Shorts / Reels / TikTok: todo lo importante vive en x 80..1000, y 220..1580. */
export const SAFE = { top: 220, bottom: 340, x: 80 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Escenas (frames a 30 fps), sincronizadas con la voz (public/gato06/voz.wav, ver tools/gato06_voz.py). 38 s. */
export const SCENES = {
  hook: { from: 0, len: 262 }, // 0–8,7 s · «cierren sus puertas» → el Gato de noche en Irlanda → el comunicado
  auction: { from: 262, len: 148 }, // 8,7–13,7 s · 8-ago: el disfraz original sale a subasta · 10 M lo vieron
  ireland: { from: 410, len: 84 }, // 13,7–16,5 s · días más tarde, los avistamientos
  viral: { from: 494, len: 117 }, // 16,5–20,4 s · un video pasó los 14 M, y muchos se lo creyeron
  police: { from: 611, len: 129 }, // 20,4–24,7 s · la policía lo confirmó: era IA
  spread: { from: 740, len: 136 }, // 24,7–29,2 s · ni así paró
  fear: { from: 876, len: 117 }, // 29,2–33,1 s (medio segundo de respiro tras «falso») · todo era falso. El miedo, no.
  loop: { from: 993, len: 147 }, // 33,1–38 s · ¿quién creó la primera foto? → vuelta al frame 0
} as const;
export const DURATION = 1140;

export const ci = (f: number, a: number, b: number, x: number, y: number, easing: (t: number) => number = EASE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Golpe de cámara: zoom brusco que se asienta en ~0,4 s. */
export const punch = (f: number, hits: number[], amp = 0.06) =>
  1 + hits.reduce((acc, h) => (f >= h && f < h + 14 ? acc + amp * Math.exp(-(f - h) / 3.5) : acc), 0);

/** Sacudida corta. */
export const shake = (f: number, at: number, amp = 10, len = 8) => (f >= at && f < at + len ? { x: (f % 2 ? 1 : -1) * amp, y: (((f + 1) % 3) - 1) * amp } : { x: 0, y: 0 });
