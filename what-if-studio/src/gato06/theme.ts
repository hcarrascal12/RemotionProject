/**
 * No Presiones · Sin resolver · Caso Nº 04 · El Gato con Sombrero (el bulo de IA de Irlanda, agosto de 2026)
 * Identidad "aviso policial": noche negra, rojo del sombrero, amarillo de cinta policial y luces de patrulla.
 * Hechos: BBC (23-ago-2026), Know Your Meme (31-ago-2026), ABC News, Economic Times. Ver public/gato06/CREDITOS.md.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const COL = {
  bg: '#060608',
  card: 'rgba(14, 12, 14, 0.88)',
  border: '#2A2226',
  ice: '#FFD23F', // acento principal: amarillo de cinta policial (fechas, datos)
  frost: '#FFF4CC',
  red: '#FF2E3B', // el rojo del sombrero: alertas, lo falso
  white: '#F6F3EE',
  muted: '#8A8088',
  blue: '#2F6BFF', // luces de patrulla
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

/** Escenas (frames a 30 fps). Sin voz todavía: el texto en pantalla cuenta la historia. 38 s. */
export const SCENES = {
  hook: { from: 0, len: 105 }, // 0–3,5 s · la foto viral, "¿QUÉ HACE ESTO EN LA CALLE?"
  auction: { from: 105, len: 150 }, // 3,5–8,5 s · el disfraz original sale a subasta (8-ago)
  ireland: { from: 255, len: 135 }, // 8,5–13 s · 18-ago: "avistamientos" en Limerick y Wexford
  viral: { from: 390, len: 135 }, // 13–17,5 s · 14,6 M de vistas en 3 semanas
  police: { from: 525, len: 165 }, // 17,5–23 s · la Garda: era IA
  spread: { from: 690, len: 150 }, // 23–28 s · pero no se detuvo
  fear: { from: 840, len: 120 }, // 28–32 s · todo era falso… pero el miedo fue real
  loop: { from: 960, len: 180 }, // 32–38 s · ¿quién creó la primera foto? → vuelta al frame 0
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
