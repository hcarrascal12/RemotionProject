/**
 * Word-synced karaoke captions: 1–3 word chunks in a fixed band under the scene titles (y ≈ 1470, inside the safe zone),
 * the word being spoken lit amber. Frames are global, from out/eldev02/voz-words.json with the 0.5 s splice at 29.3 s applied.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COL, HEAD, SAFE, ci } from './theme';

const WORDS: [string, number, number][] = [
  ['inventó', 0, 18],
  ['bitcoin', 18, 29],
  ['y', 29, 47],
  ['nadie', 47, 59],
  ['sabe', 59, 70],
  ['quién', 70, 78],
  ['es.', 78, 89],
  ['Nunca', 103, 112],
  ['tocó', 112, 121],
  ['su', 121, 124],
  ['fortuna.', 124, 138],
  ['El', 151, 154],
  ['31', 154, 163],
  ['de', 163, 172],
  ['octubre', 172, 182],
  ['de', 182, 185],
  ['2008', 185, 202],
  ['publicó', 202, 221],
  ['bitcoin.', 221, 235],
  ['Lo', 250, 256],
  ['firmó', 256, 265],
  ['como', 265, 271],
  ['Satoshi', 271, 289],
  ['Nakamoto.', 289, 305],
  ['En', 320, 323],
  ['el', 323, 326],
  ['primer', 326, 332],
  ['bloque', 332, 342],
  ['dejó', 342, 357],
  ['un', 357, 360],
  ['mensaje', 360, 371],
  ['oculto.', 371, 386],
  ['Un', 396, 401],
  ['segundo', 401, 414],
  ['rescate', 414, 431],
  ['a', 431, 434],
  ['los', 434, 438],
  ['bancos.', 438, 453],
  ['Años', 465, 471],
  ['después', 471, 482],
  ['envió', 482, 505],
  ['un', 505, 511],
  ['último', 511, 518],
  ['correo', 518, 536],
  ['y', 536, 551],
  ['se', 551, 554],
  ['esfumó.', 554, 565],
  ['Se', 577, 581],
  ['calcula', 581, 592],
  ['que', 592, 595],
  ['tiene', 595, 601],
  ['más', 601, 608],
  ['de', 608, 613],
  ['750', 613, 632],
  ['mil', 632, 656],
  ['bitcoins.', 656, 671],
  ['Ninguno', 682, 699],
  ['se', 699, 706],
  ['ha', 706, 708],
  ['movido.', 708, 719],
  ['Varios', 728, 740],
  ['dijeron', 740, 755],
  ['ser', 755, 761],
  ['él.', 761, 767],
  ['En', 779, 782],
  ['2024,', 782, 807],
  ['un', 817, 821],
  ['tribunal', 821, 833],
  ['confirmó', 833, 848],
  ['que', 848, 852],
  ['uno', 852, 860],
  ['no', 860, 868],
  ['lo', 868, 872],
  ['era.', 872, 879],
  ['Bastaría', 904, 917],
  ['con', 917, 925],
  ['mover', 925, 933],
  ['una', 933, 941],
  ['sola', 941, 950],
  ['moneda', 950, 963],
  ['para', 963, 968],
  ['probarlo.', 968, 982],
  ['Nadie', 993, 1008],
  ['lo', 1008, 1012],
  ['ha', 1012, 1016],
  ['hecho.', 1016, 1024],
  ['¿Quién', 1034, 1043],
  ['crees', 1043, 1051],
  ['que', 1051, 1055],
  ['es', 1055, 1061],
  ['Satoshi?', 1061, 1072]
];

// Where the big title on screen already says the exact line, a caption under it would only repeat it:
// the hook, "Y SE ESFUMÓ.", "NADIE LO HA HECHO." and the closing question.
const MUTED: [number, number][] = [[0, 145], [536, 566], [993, 1031], [1031, 99999]];
const isMuted = (fr: number) => MUTED.some(([a, b]) => fr >= a && fr < b);

// Hand-phrased chunks: each one a unit of meaning, never ending on an article or preposition. Word counts are
// matched in order against the non-muted WORDS, so the timing still comes straight from the voice.
const PHRASES = [
  'El 31 de octubre', 'de 2008', 'publicó bitcoin.', 'Lo firmó como', 'Satoshi Nakamoto.',
  'En el primer bloque', 'dejó un', 'mensaje oculto.', 'Un segundo rescate', 'a los bancos.',
  'Años después envió', 'un último correo', 'Se calcula que tiene', 'más de 750 mil', 'bitcoins.',
  'Ninguno', 'se ha movido.', 'Varios dijeron', 'ser él.', 'En 2024,', 'un tribunal confirmó', 'que uno no lo era.',
  'Bastaría con mover', 'una sola moneda', 'para probarlo.',
];

type Chunk = { words: [string, number, number][]; from: number; to: number };

const CHUNKS: Chunk[] = (() => {
  const live = WORDS.filter((w) => !isMuted(w[1]));
  let i = 0;
  const out: Chunk[] = PHRASES.map((ph) => {
    const words = live.slice(i, (i += ph.split(' ').length));
    return { words, from: words[0][1], to: words[words.length - 1][2] };
  });
  // each chunk holds until the next one starts (or ~0.3 s after its last word), so there's no flicker between them
  out.forEach((c, i) => {
    const next = out[i + 1];
    c.to = next ? Math.min(next.from, c.to + 9) : c.to + 9;
  });
  return out;
})();

export const Captions: React.FC<{ y?: number }> = ({ y = 1470 }) => {
  const f = useCurrentFrame();
  const c = CHUNKS.find((k) => f >= k.from - 1 && f < k.to);
  if (!c) return null;
  const p = ci(f, c.from - 1, c.from + 3, 0, 1);
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: y, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.92 + 0.08 * p})` }}>
      <div style={{ padding: '10px 26px', borderRadius: 22, background: 'rgba(5,6,8,0.72)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 64, lineHeight: 1.1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        {c.words.map(([t, s], i) => {
          const end = c.words[i + 1]?.[1] ?? c.to;
          const on = f >= s && f < end;
          const said = f >= s;
          const pop = ci(f, s, s + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 18 : 0, color: on ? COL.amber : COL.white, opacity: said ? 1 : 0.55, transform: `scale(${on ? pop : 1})`, textShadow: on ? '0 0 22px rgba(247,147,26,0.6), 0 4px 14px rgba(0,0,0,0.9)' : '0 4px 14px rgba(0,0,0,0.9)' }}>{t}</span>
          );
        })}
      </div>
    </div>
  );
};
