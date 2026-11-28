/**
 * No Presiones · Casos reales de internet · Satoshi Nakamoto — formato largo 16:9 (5 min), estilo del Caso Nº 04
 * Identidad "tablero de investigación": papel claro, tinta negra, fotos en 3D y un solo acento, el rojo del sombrero.
 * Hechos: Wikipedia (Satoshi Nakamoto, Bitcoin, Hal Finney, Bitcoin Pizza Day) y canal/no-presiones/sin-resolver-02/CASO-02-SATOSHI.md.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

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

export const HEAD = 'S7 Inter';
export const MONO = 'S7 JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** 16:9 para YouTube: márgenes de título seguros. */
export const SAFE = { top: 70, bottom: 70, x: 110 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Escenas (frames a 30 fps): 5 min, sin voz todavía; el texto en pantalla cuenta la historia. */
export const SCENES = {
  hook: { from: 0, len: 600 }, // 0:00–0:20 · inventó Bitcoin y nadie sabe quién es
  title: { from: 600, len: 360 }, // 0:20–0:32 · expediente: índice de capítulos
  crisis: { from: 960, len: 690 }, // 0:32–0:55 · 2008, la crisis
  paper: { from: 1650, len: 900 }, // 0:55–1:25 · 31 oct 2008, el documento
  genesis: { from: 2550, len: 900 }, // 1:25–1:55 · 3 ene 2009, el bloque génesis
  hal: { from: 3450, len: 810 }, // 1:55–2:22 · Hal Finney y el primer envío
  pizza: { from: 4260, len: 600 }, // 2:22–2:42 · 10.000 BTC por dos pizzas
  gone: { from: 4860, len: 900 }, // 2:42–3:12 · se esfuma
  fortune: { from: 5760, len: 840 }, // 3:12–3:40 · la fortuna intacta
  suspects: { from: 6600, len: 1440 }, // 3:40–4:28 · los señalados
  proof: { from: 8040, len: 480 }, // 4:28–4:44 · bastaría una firma
  end: { from: 8520, len: 480 }, // 4:44–5:00 · ¿quién crees que es?
} as const;
export const DURATION = 9000;

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
