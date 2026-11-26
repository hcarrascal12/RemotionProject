/**
 * Subtítulos "inteligentes" del Caso Nº 04: solo aparecen cuando la voz dice algo que la pantalla NO dice ya.
 * Donde hay un titular con la misma frase, se callan (una sola capa de texto). words.json sale de tools/gato06_voz.py.
 * Hoy eso deja dos frases: «Un video pasó los 14 millones» (el contador solo dice la cifra) y
 * «La policía lo confirmó» (el escáner no lleva titular).
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FPS, HEAD, ci } from './theme';
import { CAPTION_TOP } from './kit';
import words from './words.json';

type Word = { t: string; s: number; e: number };
type Chunk = { words: Word[]; s: number; e: number };

const ALL: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e }));
/** Frases sin titular que las cubra: [primera palabra, última palabra], buscadas en orden. */
const UNCOVERED: [string, string][] = [
  ['Un', 'millones,'],
  ['policía', 'confirmó.'],
];
const spans = (() => {
  const out: [number, number][] = [];
  let from = 0;
  UNCOVERED.forEach(([a, b]) => {
    const i = ALL.findIndex((w, k) => k >= from && w.t === a && (a !== 'policía' || ALL[k + 1]?.t === 'lo'));
    const j = ALL.findIndex((w, k) => k > i && w.t === b);
    if (i >= 0 && j >= 0) {
      // «La» va con «policía»
      out.push([i > 0 && a === 'policía' ? i - 1 : i, j]);
      from = j + 1;
    }
  });
  return out;
})();
const CHUNKS: Chunk[] = spans.flatMap(([i, j]) => {
  const ws = ALL.slice(i, j + 1);
  const out: Chunk[] = [];
  for (let k = 0; k < ws.length; k += 3) {
    const g = ws.slice(k, k + 3);
    out.push({ words: g, s: g[0].s, e: g[g.length - 1].e });
  }
  out.forEach((c, k) => (c.e = Math.min(out[k + 1] ? out[k + 1].s - 0.03 : Infinity, c.e + 0.25)));
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
      <div style={{ padding: '10px 26px 8px', borderRadius: 12, background: 'rgba(14,14,14,0.92)', boxShadow: '0 10px 26px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 60, lineHeight: 1.1, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
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
