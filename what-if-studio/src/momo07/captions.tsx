/**
 * Subtítulos "inteligentes" del Caso Nº 05: solo aparecen cuando la voz dice algo que ningún titular dice ya.
 * words.json sale de tools/momo07_voz.py. Frases sin titular que las cubra:
 *  · «En 2019 el pánico se volvió mundial» (en pantalla: el mapa y el 2019)
 *  · «una mujer pájaro» (en pantalla: «con patas de ave»)
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FPS, HEAD, ci } from './theme';
import { CAPTION_TOP } from './kit';
import words from './words.json';

type Word = { t: string; s: number; e: number };
type Chunk = { words: Word[]; s: number; e: number };
const ALL: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e }));
/** [primera palabra, última palabra], buscadas en orden. */
const UNCOVERED: [string, string][] = [
  ['En', 'mundial.'],
  ['una', 'pájaro'],
];
const spans = (() => {
  const out: [number, number][] = [];
  let from = ALL.findIndex((w) => w.t === 'ti.'); // a partir del pánico
  UNCOVERED.forEach(([a, b]) => {
    if (a === 'una') from = ALL.findIndex((w, k) => k > from && w.t.includes('Bird')); // la de «mujer pájaro», no la de «una escultura»
    const i = ALL.findIndex((w, k) => k > from && w.t === a);
    const j = ALL.findIndex((w, k) => k >= i && w.t === b);
    if (i >= 0 && j >= 0) {
      out.push([i, j]);
      from = j;
    }
  });
  return out;
})();
const CHUNKS: Chunk[] = spans.flatMap(([i, j]) => {
  const ws = ALL.slice(i, j + 1);
  const out: Chunk[] = [];
  const per = ws.length <= 4 ? 4 : 3;
  for (let k = 0; k < ws.length; k += per) {
    const g = ws.slice(k, k + per);
    out.push({ words: g, s: g[0].s, e: g[g.length - 1].e });
  }
  out.forEach((c, k) => (c.e = Math.min(out[k + 1] ? out[k + 1].s - 0.03 : Infinity, c.e + 0.3)));
  return out;
});

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = CHUNKS.find((k) => t >= k.s - 0.03 && t < k.e);
  if (!c) return null;
  const p = ci(t * FPS, c.s * FPS - 1, c.s * FPS + 3, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: CAPTION_TOP, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.94 + 0.06 * p})` }}>
      <div style={{ padding: '10px 26px 8px', borderRadius: 12, background: 'rgba(14,14,14,0.92)', boxShadow: '0 10px 26px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 58, lineHeight: 1.1, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
        {c.words.map((w, i) => {
          const end = c.words[i + 1]?.s ?? c.e;
          const on = t >= w.s && t < end;
          const said = t >= w.s;
          const pop = ci(t * FPS, w.s * FPS, w.s * FPS + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 16 : 0, color: on ? '#FF4A52' : '#F4F1EA', opacity: said ? 1 : 0.45, transform: `scale(${on ? pop : 1})` }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
