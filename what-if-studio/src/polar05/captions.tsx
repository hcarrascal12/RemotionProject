/**
 * Subtítulos karaoke (estilo de la casa: palabra a palabra, la palabra que suena en hielo).
 * PROVISIONAL: los tiempos se reparten dentro de la ventana de cada frase según la longitud de cada palabra,
 * a ritmo de narración. Cuando llegue la voz grabada se sustituyen por los tiempos de Whisper.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COL, FPS, HEAD, SAFE_BOTTOM_Y, ci } from './theme';

type Line = { text: string; s: number; e: number; mute?: boolean; muteFrom?: number };
// s/e en segundos. mute: el título grande ya dice lo mismo. muteFrom: índice de palabra desde el que se calla.
const LINES: Line[] = [
  { text: 'Este meme de 2023 habla de este mes.', s: 0.3, e: 2.4, mute: true },
  { text: 'Un oso polar, de noche. Y una frase en ruso: «Este es un meme de noviembre de 2026. Todavía no lo vais a entender».', s: 4.2, e: 11.6, muteFrom: 9 },
  { text: 'Tres millones de vistas… y nadie sabe quién lo hizo.', s: 12.0, e: 15.8, mute: true },
  { text: 'Le pusieron fechas: septiembre, octubre… Fueron pasando una por una, sin que pasara nada.', s: 16.7, e: 21.0, mute: true },
  { text: 'En agosto volvió. Cantando.', s: 21.3, e: 23.3 },
  { text: 'Quedan cinco días.', s: 26.8, e: 28.4, mute: true },
  { text: 'Ningún anuncio. Ningún evento. Ningún autor.', s: 29.3, e: 32.6, mute: true },
  { text: 'Y aquí estamos: noviembre de 2026. ¿Era la broma de alguien muy aburrido… o alguien sabía algo?', s: 33.4, e: 37.4, muteFrom: 5 },
];

type Word = { t: string; s: number; e: number };
type Chunk = { words: Word[]; s: number; e: number };

const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const L of LINES) {
    if (L.mute) continue;
    const ws = L.text.split(' ');
    const weight = ws.map((w) => w.replace(/[«»,.:;¿?…]/g, '').length + 2);
    const total = weight.reduce((a, b) => a + b, 0);
    let acc = L.s;
    const timed: Word[] = ws.map((w, i) => {
      const d = ((L.e - L.s) * weight[i]) / total;
      const word = { t: w, s: acc, e: acc + d };
      acc += d;
      return word;
    });
    const live = L.muteFrom === undefined ? timed : timed.slice(0, L.muteFrom);
    // frases de hasta 3 palabras; se corta antes en la puntuación
    let cur: Word[] = [];
    for (const w of live) {
      cur.push(w);
      if (cur.length >= 3 || /[,.:;?…»]$/.test(w.t)) {
        out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    }
    if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  }
  // cada bloque se queda hasta que entra el siguiente (o 0,3 s tras su última palabra)
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
