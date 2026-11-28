/**
 * Subtítulos palabra por palabra al estilo de los Shorts ganadores analizados: 2–3 palabras enormes, centradas,
 * blancas con contorno negro y la palabra clave en amarillo. Cada palabra "salta" al entrar.
 * Los tiempos de las palabras son una ESTIMACIÓN (reparto por longitud dentro de cada bloque de LINES).
 * Cuando exista la voz, sustituir `buildWords()` por los tiempos reales de words.json (como en momo07/captions.tsx).
 * *palabra* = clave en amarillo.
 */
import React from 'react';
import { AbsoluteFill, Sequence, spring, useCurrentFrame } from 'remotion';
import { FPS, HEAD } from './theme';

export const KEY = '#FFD21F';

/** Texto narrado en cada tramo (frames absolutos). Debe coincidir con el guion v4 de CASO-06-POLYBIUS.md. */
export const LINES: { from: number; len: number; text: string }[] = [
  { from: 0, len: 70, text: 'Hay gente que jura haber *jugado*' },
  { from: 70, len: 90, text: 'un videojuego de 1981… pero *nadie* ha encontrado una sola *máquina*' },
  { from: 160, len: 40, text: 'Se llamaba *Polybius*.' },
  { from: 200, len: 70, text: 'Decían que *enfermaba* a los niños, en *Portland*.' },
  { from: 270, len: 60, text: 'Las *revistas* de la época no lo mencionan.' },
  { from: 330, len: 60, text: 'Ni un *archivo* del juego.' },
  { from: 390, len: 60, text: 'De su *empresa*, ni rastro.' },
  { from: 450, len: 70, text: 'La primera página es de *coinop.org*.' },
  { from: 520, len: 70, text: 'En 2003 seguía pidiendo: «necesitamos *información*».' },
  { from: 590, len: 60, text: 'Pero había piezas *reales*.' },
  { from: 650, len: 140, text: 'En 1981, dos jugadores se sintieron *mal* el mismo día, en la misma sala.' },
  { from: 790, len: 100, text: 'Diez días después, allanaron salas por *apuestas* ilegales.' },
  { from: 890, len: 120, text: '*Inverse* concluyó que se inventó casi seguro para *promocionar* esa web.' },
  { from: 1010, len: 120, text: '¿Fuente de la época? ¿Existe el *objeto*? ¿Quién lo contó *primero*?' },
  { from: 1130, len: 50, text: '¿Lo conocías… o te lo *creíste*?' },
];

type Word = { t: string; key: boolean; s: number; e: number };
const buildWords = (): Word[] => {
  const out: Word[] = [];
  LINES.forEach((l) => {
    const toks = l.text.split(/\s+/).filter(Boolean).map((tok) => ({ key: tok.includes('*'), t: tok.replace(/\*/g, '') }));
    const a = l.from + 5;
    const b = l.from + l.len - 6;
    const wts = toks.map((w) => w.t.length + 2);
    const tot = wts.reduce((x, y) => x + y, 0);
    let acc = 0;
    toks.forEach((w, i) => {
      const s = a + ((b - a) * acc) / tot;
      acc += wts[i];
      const e = a + ((b - a) * acc) / tot;
      out.push({ ...w, s: Math.round(s), e: Math.round(e) });
    });
  });
  return out;
};

type Chunk = { words: Word[]; s: number; e: number };
const buildChunks = (): Chunk[] => {
  const ws = buildWords();
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const chars = cur.map((x) => x.t).join(' ').length;
    const endSentence = /[.?!…:»]$/.test(w.t);
    const lineEnd = i === ws.length - 1 || ws[i + 1].s - w.e > 2; // pausa entre tramos
    if (cur.length >= 3 || chars >= 19 || endSentence || lineEnd) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  return chunks.map((words, k) => {
    const next = chunks[k + 1];
    const last = words[words.length - 1];
    const e = next && next[0].s - last.e <= 2 ? next[0].s : last.e + 6;
    return { words, s: words[0].s, e };
  });
};
const CHUNKS = buildChunks();

const ChunkView: React.FC<{ c: Chunk }> = ({ c }) => {
  const f = useCurrentFrame();
  const chars = c.words.map((w) => w.t).join(' ').length;
  const size = Math.max(64, Math.min(122, Math.floor(940 / (chars * 0.7))));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1110, display: 'flex', justifyContent: 'center', gap: size * 0.22, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
      {c.words.map((w, i) => {
        const t = f - (w.s - c.s);
        if (t < 0) return null;
        const k = spring({ frame: t, fps: FPS, config: { damping: 11, stiffness: 320 } });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: HEAD,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: w.key ? KEY : '#FFFFFF',
              WebkitTextStroke: `${Math.round(size * 0.12)}px #000`,
              paintOrder: 'stroke fill',
              textShadow: '0 10px 0 rgba(0,0,0,0.85), 0 14px 26px rgba(0,0,0,0.6)',
              transform: `scale(${0.7 + 0.3 * k}) translateY(${(1 - k) * 14}px)`,
              opacity: Math.min(1, k * 2),
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

export const Captions: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {CHUNKS.map((c, i) => (
      <Sequence key={i} from={c.s} durationInFrames={Math.max(4, c.e - c.s)}>
        <ChunkView c={c} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
