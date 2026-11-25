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
type Chunk = { words: Word[]; s: number; e: number; compact?: boolean };

// tramos en segundos en los que el titular ya dice la frase
// tramos con titular grande o tarjetas: el subtítulo sigue, pero en versión compacta para no competir
const TITLED: [number, number][] = [
  // una sola capa de texto: sin subtítulos mientras hay titular grande o tarjetas con texto largo
  [0, 3.1], // "Este meme de 2023 habla de este mes" → UN MEME DE 2023 / HABLA DE ESTE MES
  [6.7, 11.5], // la cita y "Todavía no lo van a entender" → «ESTE ES UN MEME DE NOVIEMBRE DE 2026» sigue en pantalla
  [11.6, 15.0], // "Tres millones de vistas y nadie sabe quién lo hizo" → 3,1M / NADIE SABE QUIÉN LO CREÓ
  [22.1, 23.9], // "septiembre, octubre" → las fechas en grande
  [24.1, 25.3], // "sin que pasara nada" → SIN QUE PASARA NADA
  [25.4, 27.2], // "noviembre ya se está acabando" → NOVIEMBRE SE ACABA
  [30.6, 99], // cierre: feed de publicaciones, ¿ERA UNA BROMA?, ¿O ALGUIEN SABÍA ALGO?, DIME QUÉ CREES TÚ
];
const isTitled = (s: number) => TITLED.some(([a, b]) => s >= a && s < b);

const ALL: Word[] = (words as { w: string; s: number; e: number }[]).map((w) => ({ t: w.w, s: w.s, e: w.e }));
const CHUNKS: Chunk[] = (() => {
  const live: Word[] = ALL;
  const out: Chunk[] = [];
  let cur: Word[] = [];
  live.forEach((w, i) => {
    const gap = cur.length ? w.s - cur[cur.length - 1].e : 0;
    if (cur.length && (gap > 0.45 || isTitled(w.s) !== isTitled(cur[0].s))) {
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
  out.forEach((c) => (c.compact = isTitled(c.s)));
  out.forEach((c, k) => {
    // se va antes de la siguiente palabra dicha, aunque esa esté silenciada: nunca encima del titular siguiente
    const nextWord = ALL.find((w) => w.s > c.words[c.words.length - 1].s);
    c.e = Math.min(nextWord ? nextWord.s - 0.03 : Infinity, c.e + 0.3);
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
    <div style={{ position: 'absolute', left: 70, right: 70, top: SAFE_BOTTOM_Y - (c.compact ? 110 : 130), display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.92 + 0.08 * p})` }}>
      <div style={{ padding: '6px 22px', borderRadius: 16, background: c.compact ? 'rgba(4,7,12,0.72)' : 'rgba(4,7,12,0.9)', border: '2px solid rgba(240,248,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: c.compact ? 44 : 64, lineHeight: 1.12, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        {c.words.map((w, i) => {
          const end = c.words[i + 1]?.s ?? c.e;
          const on = t >= w.s && t < end;
          const said = t >= w.s;
          const pop = ci(t * FPS, w.s * FPS, w.s * FPS + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 14 : 0, color: on ? COL.ice : COL.white, opacity: said ? 1 : 0.5, transform: `scale(${on ? pop : 1})`, WebkitTextStroke: '3px rgba(0,0,0,0.7)', paintOrder: 'stroke fill', textShadow: on ? `0 0 22px ${COL.ice}99, 0 3px 0 #000` : '0 3px 0 #000' }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
