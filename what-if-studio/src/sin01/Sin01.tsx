import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { DEV } from '../design/devArtificial';
import { ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';

// "Sin resolver #01", Cicada 3301: a faceless short in the dark palette (terminal, glitch, kinetic text). No characters:
// every shot is SVG drawn in code and timed from timeline.json (tools/mkplan_sin01.py, then EPISODE=sin01
// tools/therac25_build.py), which also writes the mix played below. The last 0.32 s fades frame 0 back in (the loop).

type Shot = { id: string; kind: string; variant?: string; start: number; end: number };
type Timeline = { fps: number; width: number; height: number; duration: number; shots: Shot[]; fx: FxEvent[]; marks: Record<string, number>; visualLead?: Record<string, number>; subs: SubChunk[] };

export const SIN01: Timeline = timelineJson as Timeline;

const P = DEV.palette;
const W = 1080;
const H = 1920;
const finite = (v: number) => (Number.isFinite(v) ? v : 1e9);

const Layer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** Deep background: night gradient, faint grid, vignette (transparent gradients only, no blend modes). */
const Backdrop: React.FC<{ t: number }> = ({ t }) => (
  <Layer>
    <defs>
      <linearGradient id="sinbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={P.bg} />
        <stop offset="100%" stopColor={P.bg2} />
      </linearGradient>
      <radialGradient id="sinvig" cx="50%" cy="42%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.7} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sinbg)" />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={H} stroke={P.green} strokeOpacity={0.05} strokeWidth={2} />
    ))}
    {Array.from({ length: 25 }, (_, i) => (
      <line key={'h' + i} x1={0} y1={(i * 80 + t * 14) % H} x2={W} y2={(i * 80 + t * 14) % H} stroke={P.green} strokeOpacity={0.05} strokeWidth={2} />
    ))}
    <rect width={W} height={H} fill="url(#sinvig)" />
  </Layer>
);

/** Columns of falling hex digits at the sides: terminal rain, deterministic. */
const HexRain: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 0.35 }) => (
  <Layer>
    {Array.from({ length: 10 }, (_, c) => {
      const x = c < 5 ? 24 + c * 44 : W - 24 - (c - 5) * 44;
      return Array.from({ length: 22 }, (_, r) => {
        const y = ((r * 96 + t * (60 + c * 9) + c * 131) % (H + 100)) - 50;
        const ch = '0123456789ABCDEF'[Math.floor(rand(c * 97 + r * 13 + Math.floor(t * 4 + c)) * 16)];
        return (
          <text key={`${c}-${r}`} x={x} y={y} fontFamily={MONO} fontSize={34} fill={P.green} opacity={opacity * (0.35 + 0.65 * rand(c * 7 + r))}>
            {ch}
          </text>
        );
      });
    })}
  </Layer>
);

/** The series pill: dark, red border, the channel's NO button. */
const Pill: React.FC = () => (
  <g transform="translate(540 172)">
    <rect x={-270} y={-40} width={540} height={80} rx={40} fill={P.bg2} stroke={P.red} strokeWidth={6} />
    <rect x={-250} y={-27} width={54} height={54} rx={12} fill={P.red} />
    <text x={-223} y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={P.white}>NO</text>
    <text x={30} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill={P.white} letterSpacing={3}>SIN RESOLVER #01</text>
  </g>
);

/** A pseudo-random "image" of noise: the picture that hid the message. */
const Noise: React.FC<{ x: number; y: number; w: number; h: number; t: number; cell?: number }> = ({ x, y, w, h, t, cell = 20 }) => {
  const cols = Math.floor(w / cell);
  const rows = Math.floor(h / cell);
  const seedT = Math.floor(t * 8);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0A0E14" stroke={P.white} strokeOpacity={0.5} strokeWidth={4} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const v = rand(r * 131 + c * 17 + (c % 3 === 0 ? seedT : 0));
          return v > 0.55 ? <rect key={`${r}-${c}`} x={x + c * cell} y={y + r * cell} width={cell - 2} height={cell - 2} fill={P.white} opacity={0.04 + 0.12 * v} /> : null;
        }),
      )}
    </g>
  );
};

const Qr: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => {
  const n = 21;
  const m = size / n;
  const finder = (r: number, c: number) => {
    const inF = (rr: number, cc: number) => rr >= 0 && rr < 7 && cc >= 0 && cc < 7;
    const rr = r < 7 ? r : r >= n - 7 ? r - (n - 7) : -1;
    const cc = c < 7 ? c : c >= n - 7 ? c - (n - 7) : -1;
    if (!(r < 7 && c < 7) && !(r < 7 && c >= n - 7) && !(r >= n - 7 && c < 7)) return null;
    if (!inF(rr, cc)) return null;
    const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return ring || core;
  };
  return (
    <g>
      <rect x={x - 12} y={y - 12} width={size + 24} height={size + 24} rx={8} fill={P.white} />
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const f = finder(r, c);
          const on = f !== null ? f : rand(r * 31 + c * 7 + 3) > 0.52;
          return on ? <rect key={`${r}-${c}`} x={x + c * m} y={y + r * m} width={m + 0.5} height={m + 0.5} fill="#05070A" /> : null;
        }),
      )}
    </g>
  );
};

const Stamp: React.FC<{ k: number; x: number; y: number; rot: number; color: string; children: string; size?: number }> = ({ k, x, y, rot, color, children, size = 64 }) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1.5 - 0.5 * Math.min(1.05, k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-children.length * size * 0.32 - 28} y={-size * 0.8} width={children.length * size * 0.64 + 56} height={size * 1.4} rx={12} fill="none" stroke={color} strokeWidth={8} />
      <text x={0} y={size * 0.28} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={color} letterSpacing={4}>
        {children}
      </text>
    </g>
  );

const typed = (s: string, n: number) => s.slice(0, Math.max(0, Math.floor(n)));

/** 1. Hook. Frame 0 already shows the whole hook (it is the thumbnail and the loop target): the number and the title. */
export const Z1: React.FC<ShotProps> = ({ t, variant }) => {
  if (variant === 'b') {
    const bars = Array.from({ length: 7 }, (_, i) => i);
    return (
      <AbsoluteFill>
        <Backdrop t={t} />
        <HexRain t={t} opacity={0.2} />
        <Layer>
          {bars.map((i) => (
            <rect key={i} x={0} y={300 + i * 150 + (rand(i + Math.floor(t * 10)) - 0.5) * 20} width={W} height={6} fill={P.red} opacity={0.18} />
          ))}
          <text x={540} y={560} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={560} fill={P.red} opacity={0.9}>?</text>
          {['¿QUIÉN LO', 'ESCRIBIÓ?'].map((l, i) => (
            <text key={l} x={540} y={900 + i * 140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={128} fill={i ? P.key : P.white} stroke="#000" strokeWidth={14} paintOrder="stroke">{l}</text>
          ))}
        </Layer>
      </AbsoluteFill>
    );
  }
  const glitch = t % 1.7 < 0.14;
  const dx = glitch ? (rand(Math.floor(t * 30)) - 0.5) * 34 : 0;
  const cursor = Math.floor(t * 2.2) % 2 === 0;
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <HexRain t={t} />
      <Layer>
        <Pill />
        <g transform={`translate(${540 + dx} 640)`}>
          <text x={-7} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={330} fill={P.red} opacity={0.85}>3301</text>
          <text x={7} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={330} fill={P.cyan} opacity={0.7}>3301</text>
          <text x={0} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={330} fill={P.green} stroke="#001A0A" strokeWidth={10} paintOrder="stroke">3301</text>
        </g>
        {['EL ACERTIJO', 'QUE NADIE', 'PUDO CERRAR'].map((line, i) => (
          <text key={line} x={540} y={850 + i * 118} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={112} fill={i === 2 ? P.key : P.white} stroke="#000" strokeWidth={14} paintOrder="stroke">
            {line}
          </text>
        ))}
        <text x={540} y={1215} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={P.green}>{`> buscando${cursor ? ' █' : ''}`}</text>
      </Layer>
    </AbsoluteFill>
  );
};

/** 2. A picture appears on a forum, anonymous, 4 January 2012. */
export const Z2: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  const b = variant === 'b';
  const fecha = b ? springAt(f, fps, finite(mark('fecha'))) : 0;
  const anio = b ? springAt(f, fps, finite(mark('anio'))) : 0;
  const foro = b ? springAt(f, fps, finite(mark('foro'))) : 0;
  const slide = ease(t, 0, 0.4, 60, 0);
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Layer>
        <g transform={`translate(0 ${slide})`}>
          <rect x={90} y={300} width={900} height={74} rx={10} fill="#0F1620" stroke={P.green} strokeOpacity={0.6} strokeWidth={3} />
          <text x={116} y={349} fontFamily={MONO} fontSize={34} fill={P.green}>Anonymous 01/04/12 (Wed)</text>
          <Noise x={190} y={410} w={700} h={520} t={t} />
          <text x={540} y={690} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={P.white} opacity={0.14}>?</text>
        </g>
        <Stamp k={fecha} x={540} y={1060} rot={-5} color={P.amber} size={70}>4 · ENE</Stamp>
        <Stamp k={anio} x={760} y={1150} rot={4} color={P.red} size={74}>2012</Stamp>
        <Stamp k={foro} x={330} y={1160} rot={-3} color={P.cyan} size={46}>ANÓNIMO</Stamp>
      </Layer>
    </AbsoluteFill>
  );
};

/** 3. The message, typed on a terminal, and the signature: 3301. */
export const Z3: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'b') {
    const k = springAt(f, fps, Math.max(0, finite(mark('firma'))));
    const sh = k > 0.05 && k < 0.9 ? (rand(Math.floor(t * 40)) - 0.5) * 18 : 0;
    return (
      <AbsoluteFill>
        <Backdrop t={t} />
        <HexRain t={t} opacity={0.25} />
        <Layer>
          <text x={540} y={430} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill={P.cyan} letterSpacing={4}>FIRMADO:</text>
          <g transform={`translate(${540 + sh} 900) scale(${0.75 + 0.25 * Math.min(1.1, Math.max(k, 0.5))})`}>
            <text x={-8} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={300} fill={P.red}>3301</text>
            <text x={8} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={300} fill={P.cyan} opacity={0.7}>3301</text>
            <text x={0} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={300} fill={P.white} stroke="#000" strokeWidth={12} paintOrder="stroke">3301</text>
          </g>
        </Layer>
      </AbsoluteFill>
    );
  }
  const lines = ['> mensaje.txt', 'HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.'];
  const sig = springAt(f, fps, finite(mark('firma')));
  let budget = Math.max(0, t - 0.15) * 34;
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Layer>
        <rect x={70} y={330} width={940} height={560} rx={18} fill="#06100A" stroke={P.green} strokeWidth={5} />
        <circle cx={112} cy={372} r={10} fill={P.red} />
        <circle cx={148} cy={372} r={10} fill={P.amber} />
        <circle cx={184} cy={372} r={10} fill={P.green} />
        {lines.map((l, i) => {
          const s = typed(l, budget);
          budget -= l.length + 3;
          return (
            <text key={i} x={110} y={470 + i * 78} fontFamily={MONO} fontSize={i === 0 ? 38 : 56} fill={i === 0 ? P.cyan : P.green}>
              {s}
              {s.length > 0 && s.length < l.length ? '█' : ''}
            </text>
          );
        })}
        <text x={540} y={1130} textAnchor="middle" fontFamily={MONO} fontSize={44} fill={P.green} opacity={0.8}>{`> firma: ${sig > 0 ? '3301' : '...'}`}</text>
      </Layer>
    </AbsoluteFill>
  );
};

/** 4. The image hid a message: a scan reveals it, and it leads to a book, coordinates and posters with QR codes in many cities. */
export const Z4: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  const b = variant === 'b'; // 'a': the scan on the image; 'b': the three leads and the pins
  const oculto = finite(mark('oculto'));
  const top = b ? 330 : 380;
  const imgH = b ? 460 : 800;
  const scanY = b ? 790 : top + lin(t, Math.max(0, oculto - 0.1), Math.max(oculto + 1.6, 1.8), 0, imgH);
  const libro = b ? springAt(f, fps, finite(mark('libro'))) : 0;
  const coord = b ? springAt(f, fps, finite(mark('coord'))) : 0;
  const qr = b ? springAt(f, fps, finite(mark('qr'))) : 0;
  const ciud = b ? springAt(f, fps, finite(mark('ciudades'))) : 0;
  const pins: [number, number][] = [[260, 460], [420, 560], [560, 430], [700, 600], [820, 470], [340, 690], [640, 720]];
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Layer>
        <Noise x={110} y={top} w={860} h={imgH} t={t} />
        {/* the hidden bits, revealed above the scan line */}
        {Array.from({ length: b ? 6 : 11 }, (_, r) => (
          <text key={r} x={140} y={top + 50 + r * 70} fontFamily={MONO} fontSize={40} fill={P.green} opacity={scanY > top + 50 + r * 70 ? 0.95 : 0}>
            {Array.from({ length: 22 }, (_, c) => (rand(r * 29 + c * 5 + Math.floor(t * 3)) > 0.5 ? '1' : '0')).join('')}
          </text>
        ))}
        {t > oculto - 0.1 && scanY < top + imgH ? <rect x={110} y={scanY - 4} width={860} height={12} fill={P.green} opacity={0.95} /> : null}
        {pins.map(([x, y], i) => (ciud > 0.01 ? <circle key={i} cx={x} cy={y} r={14 + 8 * Math.abs(Math.sin(t * 5 + i))} fill={P.red} opacity={Math.min(1, ciud * 1.5) * (i / pins.length < ciud ? 1 : 0)} /> : null))}
        {/* three leads */}
        <g opacity={Math.min(1, libro * 2)} transform={`translate(0 ${(1 - Math.min(1, libro)) * 40})`}>
          <rect x={60} y={880} width={300} height={300} rx={20} fill="#0F1620" stroke={P.amber} strokeWidth={6} />
          <rect x={125} y={930} width={170} height={170} rx={8} fill={P.amber} />
          <rect x={140} y={948} width={140} height={14} fill="#05070A" opacity={0.7} />
          <rect x={140} y={978} width={110} height={14} fill="#05070A" opacity={0.7} />
          <text x={210} y={1160} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={P.white}>LIBRO</text>
        </g>
        <g opacity={Math.min(1, coord * 2)} transform={`translate(0 ${(1 - Math.min(1, coord)) * 40})`}>
          <rect x={390} y={880} width={300} height={300} rx={20} fill="#0F1620" stroke={P.cyan} strokeWidth={6} />
          <circle cx={540} cy={1020} r={70} fill="none" stroke={P.cyan} strokeWidth={8} />
          <line x1={540} y1={920} x2={540} y2={1120} stroke={P.cyan} strokeWidth={6} />
          <line x1={440} y1={1020} x2={640} y2={1020} stroke={P.cyan} strokeWidth={6} />
          <text x={540} y={1160} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={P.white}>COORDENADAS</text>
        </g>
        <g opacity={Math.min(1, qr * 2)} transform={`translate(0 ${(1 - Math.min(1, qr)) * 40})`}>
          <rect x={720} y={880} width={300} height={300} rx={20} fill="#0F1620" stroke={P.green} strokeWidth={6} />
          <Qr x={785} y={925} size={170} />
          <text x={870} y={1160} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={P.white}>QR</text>
        </g>
        <text x={540} y={1235} textAnchor="middle" fontFamily={MONO} fontSize={38} fill={P.white} opacity={ciud > 0.2 ? Math.min(1, ciud) * 0.9 : 0}>
          CARTELES EN VARIAS CIUDADES
        </text>
      </Layer>
    </AbsoluteFill>
  );
};

/** 5. Three rounds (2012, 2013, 2014), then nothing confirmed. */
export const Z5: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  const b = variant === 'b';
  const r12 = b ? 1 : springAt(f, fps, finite(mark('r12')));
  const r13 = b ? 1 : springAt(f, fps, finite(mark('r13')));
  const r14 = b ? 1 : springAt(f, fps, finite(mark('r14')));
  const nadie = finite(mark('nadie'));
  const det = b ? springAt(f, fps, finite(mark('detras'))) : 0;
  const tick = (k: number, x: number, year: string, color: string) => (
    <g opacity={Math.min(1, k * 2)}>
      <circle cx={x} cy={640} r={26 * Math.min(1.1, k)} fill={color} stroke="#000" strokeWidth={6} />
      <text x={x} y={560} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={74} fill={P.white} stroke="#000" strokeWidth={8} paintOrder="stroke">{year}</text>
      <text x={x} y={790} textAnchor="middle" fontFamily={MONO} fontSize={36} fill={color}>{year === '2012' ? 'RONDA 1' : year === '2013' ? 'RONDA 2' : 'RONDA 3'}</text>
    </g>
  );
  const dashLen = b ? lin(t, Math.max(0, nadie), Math.max(0, nadie) + 1.2, 0, 300) : 0;
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Layer>
        <line x1={110} y1={640} x2={110 + 560 * Math.max(r12, r13, r14) * 0 + 700} y2={640} stroke={P.white} strokeOpacity={0.35} strokeWidth={6} />
        {tick(r12, 200, '2012', P.green)}
        {tick(r13, 450, '2013', P.cyan)}
        {tick(r14, 700, '2014', P.amber)}
        <line x1={700} y1={640} x2={700 + dashLen} y2={640} stroke={P.red} strokeWidth={8} strokeDasharray="22 16" />
        {b && t > nadie ? (
          <text x={900} y={690} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={170} fill={P.red} opacity={Math.min(1, lin(t, nadie + 0.5, nadie + 1.1))}>?</text>
        ) : null}
        <Stamp k={det} x={540} y={1010} rot={-4} color={P.red} size={78}>SIN CONFIRMAR</Stamp>
      </Layer>
    </AbsoluteFill>
  );
};

/** 6. The open question and the series card. The camera cut back to frame 0 is made by the wrapper below. */
export const Z6: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'b') {
    const k = springAt(f, fps, Math.max(0, finite(mark('serie'))), HARD);
    return (
      <AbsoluteFill>
        <Backdrop t={t} />
        <HexRain t={t} opacity={0.22} />
        <Layer>
          <text x={540} y={500} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill={P.white} stroke="#000" strokeWidth={12} paintOrder="stroke">DIME TU</text>
          <text x={540} y={670} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={P.green} stroke="#000" strokeWidth={14} paintOrder="stroke">TEORÍA</text>
          <g transform={`translate(540 950) scale(${0.8 + 0.2 * Math.min(1.1, Math.max(k, 0.4))})`}>
            <rect x={-390} y={-80} width={780} height={160} rx={36} fill={P.red} stroke="#000" strokeWidth={8} />
            <text x={0} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={72} fill={P.white} letterSpacing={2}>SIN RESOLVER #01</text>
          </g>
        </Layer>
      </AbsoluteFill>
    );
  }
  const a = springAt(f, fps, finite(mark('espia')));
  const b = springAt(f, fps, finite(mark('exper')));
  const c = springAt(f, fps, finite(mark('teoria')));
  const s = springAt(f, fps, finite(mark('serie')), HARD);
  const pill = (k: number, y: number, text: string, color: string, rot: number) =>
    k <= 0.01 ? null : (
      <g transform={`translate(540 ${y}) rotate(${rot}) scale(${0.7 + 0.3 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 2)}>
        <rect x={-420} y={-70} width={840} height={140} rx={30} fill="#0F1620" stroke={color} strokeWidth={8} />
        <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={color}>{text}</text>
      </g>
    );
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <HexRain t={t} opacity={0.22} />
      <Layer>
        {pill(a, 430, '¿AGENCIA?', P.cyan, -2)}
        {pill(b, 640, '¿EXPERIMENTO?', P.amber, 2)}
        {pill(c, 850, 'TU TEORÍA', P.green, -1)}
        {s > 5 ? null : null}
      </Layer>
    </AbsoluteFill>
  );
};

export const SIN_SHOTS: Record<string, React.FC<ShotProps>> = { z1: Z1, z2: Z2, z3: Z3, z4: Z4, z5: Z5, z6: Z6 };

export const Sin01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = SIN01;
  let idx = 0;
  for (let i = 0; i < T.shots.length; i++) if (T.shots[i].start <= t + 1e-6) idx = i;
  const shot = T.shots[idx];
  const View = SIN_SHOTS[shot.kind];
  const props: ShotProps = {
    t: t - shot.start,
    f: f - Math.round(shot.start * fps),
    fps,
    dur: shot.end - shot.start,
    variant: shot.variant,
    mark: (name: string) => (T.marks[name] ?? Number.NaN) - (T.visualLead?.[name] ?? 0) - shot.start,
  };
  const last = idx === T.shots.length - 1;
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, 0, idx, 0.6);
  const w = last ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const lt = t - shot.start;
  const kb = idx === 0 ? 0 : Math.min(1, lt / Math.max(0.5, shot.end - shot.start)) * (1 - w);
  const side = idx % 2 ? 1 : -1;
  const swipe = idx > 0 ? Math.exp(-lt / 0.07) : 0;
  const cam = { x: cam0.x * (1 - w) + side * 22 * kb + side * 260 * swipe, y: cam0.y * (1 - w) - 12 * kb, scale: (1 + (cam0.scale - 1) * (1 - w)) * (1 + 0.05 * kb), rot: cam0.rot * (1 - w) };
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Audio src={staticFile('sin01/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : undefined }}>
        <View {...props} />
      </AbsoluteFill>
      {w > 0 ? (
        <AbsoluteFill style={{ opacity: w }}>
          <Z1 t={0} f={0} fps={fps} dur={2} mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
      <Finish f={f} />
      {w > 0.5 ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};
