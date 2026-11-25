/**
 * Subtítulos karaoke sincronizados con la voz grabada (words.json: Whisper palabra a palabra, ya con el hueco de 2,75 s
 * en el que canta el oso). Frases de hasta 3 palabras; la que suena, en hielo. Se callan donde el titular grande ya dice
 * lo mismo (una idea por plano).
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COL, FPS, HEAD, SAFE_BOTTOM_Y, ci } from './theme';
import words from './words.json';

type Word = { t: string; s: number; e: number };
type Chunk = { words: Word[]; s: number; e: number };

// tramos en segundos en los que el titular ya dice la frase
const MUTED: [number, number][] = [
  [0, 3.1], // "Este meme de 2023 habla de este mes" → UN MEME DE 2023 / HABLA DE ESTE MES
  [6.6, 11.3], // la cita → «ESTE ES UN MEME DE NOVIEMBRE DE 2026»
  [11.6, 15.2], // "Tres millones de vistas y nadie sabe quién lo hizo" → 3,1M / NADIE SABE QUIÉN LA CREÓ
  [16.7, 18.3], // "septiembre, octubre" → las fechas en grande
  [20.0, 21.3], // "sin que pasara nada" → SIN QUE PASARA NADA
  [26.8, 28.6], // "noviembre ya se está acabando" → NOVIEMBRE SE ACABA
  [29.0, 31.9], // "ningún anuncio, ningún evento, ningún autor" → las tres ✕
  [33.7, 99], // "noviembre de 2026" y las preguntas → titulares del cierre
];
const isMuted = (s: number) => MUTED.some(([a, b]) => s >= a && s < b);

const CHUNKS: Chunk[] = (() => {
  const live: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e })).filter((w) => !isMuted(w.s));
  const out: Chunk[] = [];
  let cur: Word[] = [];
  live.forEach((w, i) => {
    const gap = cur.length ? w.s - cur[cur.length - 1].e : 0;
    if (cur.length && gap > 0.45) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
    cur.push(w);
    const next = live[i + 1];
    if (cur.length >= 3 || /[,.:;?…»]$/.test(w.t) || !next) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
  });
  out.forEach((c, k) => {
    const next = out[k + 1];
    c.e = next ? Math.min(next.s, c.e + 0.3) : c.e + 0.3;
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
    <div style={{ position: 'absolute', left: 70, right: 70, top: SAFE_BOTTOM_Y - 165, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.92 + 0.08 * p})` }}>
      <div style={{ padding: '6px 22px', borderRadius: 16, background: 'rgba(4,7,12,0.9)', border: '2px solid rgba(240,248,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 64, lineHeight: 1.12, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        {c.words.map((w, i) => {
          const end = c.words[i + 1]?.s ?? c.e;
          const on = t >= w.s && t < end;
          const said = t >= w.s;
          const pop = ci(t * FPS, w.s * FPS, w.s * FPS + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 14 : 0, color: on ? COL.ice : COL.white, opacity: said ? 1 : 0.5, transform: `scale(${on ? pop : 1})`, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', textShadow: on ? `0 0 22px ${COL.ice}99, 0 3px 0 #000` : '0 3px 0 #000' }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
