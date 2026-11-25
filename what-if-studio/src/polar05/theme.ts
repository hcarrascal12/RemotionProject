/**
 * No Presiones · Sin resolver · Fallo #05 · El oso polar de "Noviembre 2026"
 * Identidad "archivo helado": negro azulado, hielo cian, nieve blanca y rojo solo para las alertas de la fecha.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const COL = {
  bg: '#04070C',
  card: 'rgba(10, 16, 24, 0.86)',
  border: '#1A2635',
  ice: '#8FE9FF', // acento principal: datos, fechas, palabras clave
  frost: '#D9F7FF',
  red: '#FF3355', // solo para "noviembre 2026", lo que falta y lo que no pasó
  white: '#F4F8FB',
  muted: '#7B8A9C',
};

export const HEAD = 'P5 Inter';
export const MONO = 'P5 JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** Zona segura de Shorts / Reels / TikTok: todo lo importante vive en x 80..1000, y 220..1580. */
export const SAFE = { top: 220, bottom: 340, x: 80 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Tabla de escenas (frames a 30 fps), sincronizada con la voz grabada (public/polar05/voz.wav, tiempos en words.json).
 */
export const SCENES = {
  hook: { from: 0, len: 93 }, // 0,0–3,1 s · "Este meme de 2023 habla de este mes."
  caption: { from: 93, len: 252 }, // 3,1–11,5 s · "Un oso polar, de noche, y una frase en ruso: «Este es un meme de noviembre de 2026…»"
  views: { from: 345, len: 114 }, // 11,5–15,3 s · "Tres millones de vistas y nadie sabe quién lo hizo."
  back: { from: 459, len: 149 }, // 15,3–20,3 s · "En agosto volvió, cantando." + el canto real (17,47–20,17 s)
  lore: { from: 608, len: 157 }, // 20,3–25,5 s · "Le pusieron fechas: septiembre, octubre. Fueron pasando sin que pasara nada."
  now: { from: 765, len: 71 }, // 25,5–27,9 s · "Noviembre ya se está acabando."
  nothing: { from: 836, len: 92 }, // 27,9–30,9 s · "Ningún anuncio, ningún evento, ningún autor."
  loop: { from: 928, len: 212 }, // 30,9–38,0 s · "Y aquí estamos. ¿Era la broma…? …o alguien sabía algo?" + CTA y vuelta al oso
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
