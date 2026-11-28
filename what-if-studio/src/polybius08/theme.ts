/**
 * No Presiones · Casos reales de internet · Caso Nº 06 · Polybius (mito de internet). Estilo del Caso Nº 04/05:
 * tablero de papel, rotuladora, un solo acento rojo. Guion y fuentes: canal/no-presiones/caso-06-polybius/CASO-06-POLYBIUS.md
 * Los tiempos son una ESTIMACIÓN (~10,7 frames por palabra del guion v2); se reajustan a words.json cuando exista la voz.
 */
import { Easing, interpolate, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const COL = {
  paper: '#E9E6E0',
  paper2: '#D9D5CD',
  ink: '#121212',
  bg: '#E9E6E0',
  card: '#FAFAF7',
  border: '#C9C3B8',
  ice: '#E3262F',
  frost: '#FFF4CC',
  red: '#E3262F',
  white: '#FFFFFF',
  muted: '#6E6860',
  blue: '#2F6BFF',
  tape: 'rgba(245, 232, 170, 0.78)',
  crt: '#6FD3B0', // verde de la pantalla de título de Polybius
};

export const HEAD = 'P8 Inter';
export const MONO = 'P8 JetBrains';
loadFont({ family: HEAD, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500' });
loadFont({ family: MONO, url: staticFile('fonts/jetbrains-mono-800.woff2'), weight: '800' });

/** Zona segura de Shorts / Reels / TikTok. */
export const SAFE = { top: 220, bottom: 340, x: 80 };
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Escenas (frames a 30 fps). 50 s. Cada una corresponde a un bloque del guion v2. */
export const SCENES = {
  hook: { from: 0, len: 150 }, // «Hay gente que jura haber jugado este videojuego de 1981… pero nadie ha encontrado una sola máquina.»
  legend: { from: 150, len: 110 }, // «Se decía que enfermaba a los niños, en Portland. Se llamaba Polybius.»
  proof: { from: 260, len: 270 }, // «Las revistas no lo mencionan. Ni un archivo. De su empresa, ni rastro.»
  page: { from: 530, len: 200 }, // «La primera página: coinop.org, fecha 1998 dudosa. En 2003: necesitamos información.»
  real: { from: 730, len: 340 }, // «Pero había piezas reales…»
  quote: { from: 1070, len: 150 }, // «Inverse concluyó que se inventó casi seguro para promocionar esa web.»
  check: { from: 1220, len: 180 }, // «Para dudar de un mito: ¿fuente? ¿objeto? ¿quién primero?»
  loop: { from: 1400, len: 100 }, // «¿Lo conocías… o te lo creíste?» → vuelve al frame 0
} as const;
export const DURATION = 1500; // 50 s

export const ci = (f: number, a: number, b: number, x: number, y: number, easing: (t: number) => number = EASE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const punch = (f: number, hits: number[], amp = 0.06) =>
  1 + hits.reduce((acc, h) => (f >= h && f < h + 14 ? acc + amp * Math.exp(-(f - h) / 3.5) : acc), 0);

export const shake = (f: number, at: number, amp = 10, len = 8) => (f >= at && f < at + len ? { x: (f % 2 ? 1 : -1) * amp, y: (((f + 1) % 3) - 1) * amp } : { x: 0, y: 0 });
