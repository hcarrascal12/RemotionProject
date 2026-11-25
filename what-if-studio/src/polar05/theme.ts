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
 * Tabla de escenas (frames a 30 fps). Provisional: está cronometrada con el guion leído a ritmo de narración.
 * Cuando llegue la voz grabada se re-sincroniza con sus tiempos palabra a palabra, como en Satoshi y Max Headroom.
 */
export const SCENES = {
  hook: { from: 0, len: 120 }, // 0,0–4,0 s · "En 2023 apareció en TikTok la foto de un oso polar…" (al móvil en el segundo 4)
  caption: { from: 120, len: 240 }, // 4,0–12,0 s · "Con una frase en ruso: «Este es un meme de noviembre de 2026…»"
  views: { from: 360, len: 138 }, // 12,0–16,6 s · "Tres millones de personas la vieron. Nadie sabe quién creó la imagen."
  lore: { from: 498, len: 138 }, // 16,6–21,2 s · "Le pusieron fechas, canciones, teorías… un meme enviado desde el futuro."
  back: { from: 636, len: 150 }, // 21,2–26,2 s · "En agosto de 2026 volvió, cantando…"
  now: { from: 786, len: 90 }, // 26,2–29,2 s · "Y ahora… ya es noviembre de 2026."
  nothing: { from: 876, len: 126 }, // 29,2–33,4 s · "No hubo anuncio. No hubo evento. Nadie ha reclamado la imagen."
  loop: { from: 1002, len: 138 }, // 33,4–38,0 s · "¿Era solo una broma… o todavía falta algo?"
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
