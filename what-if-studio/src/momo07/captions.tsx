/**
 * Subtítulos "inteligentes" del Caso Nº 05: solo aparecen cuando la voz dice algo que ningún titular dice ya.
 * Usan EXACTAMENTE la misma cinta (Headline) que los titulares: un solo estilo en todo el vídeo.
 * words.json sale de tools/momo07_voz.py. Frases sin titular que las cubra:
 *  · «el pánico se volvió mundial» (en pantalla: el mapa y «EN 2019»)
 *  · «Mother Bird, una mujer pájaro» (en pantalla: la escultura, sin nombre legible)
 */
import React from 'react';
import { Sequence } from 'remotion';
import { FPS } from './theme';
import { Headline } from './kit';
import words from './words.json';

type Word = { t: string; s: number; e: number };
const ALL: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e }));
/** [primera palabra, última palabra, palabras por tramo (número o lista)], buscadas en orden a partir del pánico. */
const UNCOVERED: [string, string, number | number[]][] = [
  ['el', 'mundial.', 3],
  ['Mother Bird,', 'pájaro', [1, 3]],
];
type Chunk = { text: string; from: number; len: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let from = ALL.findIndex((w) => w.t === 'ti.');
  UNCOVERED.forEach(([a, b, per]) => {
    const i = ALL.findIndex((w, k) => k > from && w.t === a);
    const j = ALL.findIndex((w, k) => k >= i && w.t === b);
    if (i < 0 || j < 0) return;
    from = j;
    const ws = ALL.slice(i, j + 1);
    const cs: Word[][] = [];
    const sizes = Array.isArray(per) ? per : Array(Math.ceil(ws.length / per)).fill(per);
    let p0 = 0;
    sizes.forEach((n) => { cs.push(ws.slice(p0, p0 + n)); p0 += n; });
    cs.forEach((g, k) => {
      const s = g[0].s;
      const e = cs[k + 1] ? cs[k + 1][0].s : g[g.length - 1].e + 0.35;
      const t = g.map((w) => w.t.replace(/[.,]$/, ''));
      t[t.length - 1] = `*${t[t.length - 1]}*`; // la última palabra va en la cinta roja, como en los titulares
      out.push({ text: t.join(' '), from: Math.round(s * FPS) - 1, len: Math.max(12, Math.round((e - s) * FPS) + 1) });
    });
  });
  return out;
})();

export const Captions: React.FC = () => (
  <>
    {CHUNKS.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.len}>
        <Headline text={c.text} at={0} y={0} size={64} out={c.len} sub stagger={0} />
      </Sequence>
    ))}
  </>
);
