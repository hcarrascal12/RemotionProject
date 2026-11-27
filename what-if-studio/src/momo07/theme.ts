/**
 * No Presiones · Casos reales de internet · Caso Nº 05 · Momo (el bulo de WhatsApp, 2018–2019). Estándar: estilo del Caso Nº 04.
 * Identidad "tablero de investigación": papel claro, tinta negra, fotos en 3D y un solo acento, el rojo del sombrero.
 * Hechos: BBC Mundo (25-jul-2018), BBC News (28-feb-2019), Wikipedia (Momo Challenge hoax), Japan Times (6-mar-2019).
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

export const HEAD = 'M7 Inter';
export const MONO = 'M7 JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** Zona segura de Shorts / Reels / TikTok: todo lo importante vive en x 80..1000, y 220..1580. */
export const SAFE = { top: 220, bottom: 340, x: 80 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Escenas (frames a 30 fps). Sin voz todavía: el texto en pantalla cuenta la historia. 38 s. */
export const SCENES = {
  hook: { from: 0, len: 150 }, // 0–5 s · videollamada de Momo: «NO CONTESTES» → ¿te acuerdas de ella?
  chat: { from: 150, len: 150 }, // 5–10 s · te escribía por WhatsApp (+81, +52, +57)
  rumor: { from: 300, len: 90 }, // 10–13 s · decían que sabía cosas de ti
  panic: { from: 390, len: 165 }, // 13–18,5 s · 2019: mapa con 9 alertas, Kim → ¿REAL O FALSO?
  hoax: { from: 555, len: 140 }, // 18,5–23 s · 0 casos confirmados → ¿de dónde salió la cara?
  sculpt: { from: 695, len: 205 }, // 23–30 s · era una escultura → patas de ave → RESPUESTA: FALSO
  trash: { from: 900, len: 135 }, // 30–34,5 s · se había podrido
  loop: { from: 1035, len: 105 }, // 34,5–38 s · ¿tú la recibiste? (3 s, sin música) → frame 0
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
