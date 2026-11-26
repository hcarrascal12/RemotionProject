/**
 * Subtítulos karaoke del Caso Nº 04, sincronizados con la voz (words.json sale de tools/gato06_voz.py: Whisper palabra
 * a palabra, ya con los silencios ajustados). Frases de hasta 3 palabras en una franja fija bajo los titulares
 * (los titulares nunca bajan de CAPTION_TOP). Cinta negra como la rotuladora; la palabra que suena, en rojo.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FPS, HEAD, ci } from './theme';
import { CAPTION_TOP } from './kit';
import words from './words.json';

type Word = { t: string; s: number; e: number };
type Chunk = { words: Word[]; s: number; e: number };

const ALL: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e }));
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  ALL.forEach((w, i) => {
    if (cur.length && w.s - cur[cur.length - 1].e > 0.45) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
    cur.push(w);
    if (cur.length >= 3 || /[,.:;?…»]$/.test(w.t) || !ALL[i + 1]) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
  });
  out.forEach((c, k) => {
    const next = out[k + 1];
    c.e = Math.min(next ? next.s - 0.03 : Infinity, c.e + 0.3);
  });
  return out;
})();

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = CHUNKS.find((k) => t >= k.s - 0.03 && t < k.e);
  if (!c) return null;
  const p = ci(t * FPS, c.s * FPS - 1, c.s * FPS + 3, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: CAPTION_TOP, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.94 + 0.06 * p})` }}>
      <div style={{ padding: '8px 24px 6px', borderRadius: 12, background: 'rgba(14,14,14,0.9)', boxShadow: '0 10px 26px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 52, lineHeight: 1.12, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
        {c.words.map((w, i) => {
          const end = c.words[i + 1]?.s ?? c.e;
          const on = t >= w.s && t < end;
          const said = t >= w.s;
          const pop = ci(t * FPS, w.s * FPS, w.s * FPS + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 14 : 0, color: on ? '#FF4A52' : '#F4F1EA', opacity: said ? 1 : 0.45, transform: `scale(${on ? pop : 1})` }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
