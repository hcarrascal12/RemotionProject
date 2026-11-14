import React from 'react';
import { HEAVY, MONO, rand } from '../motion';

// Shared pieces for Fallo #03 (Mars Climate Orbiter, 1999): the palette, stars, the probe, Mars and small helpers.
// Everything is plain SVG so the scenes render fast (no blend modes or blurs over the whole frame).

export const P3 = { bg: '#07090F', bg2: '#0B0E17', white: '#FFFFFF', yellow: '#FACC15', red: '#EF4444', blue: '#38BDF8', green: '#4ADE80', steel: '#94A3B8' };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const sm = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
export const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);
export const commas = (n: number) => Math.round(n).toLocaleString('en-US');

/** A slowly drifting, twinkling star field over the whole 1080 x 1920 frame. */
export const Stars: React.FC<{ t: number; n?: number; drift?: number }> = ({ t, n = 90, drift = 5 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = rand(i * 3 + 1) * 1080;
      const y = (rand(i * 3 + 2) * 1920 + t * drift * (0.3 + rand(i * 3 + 4))) % 1920;
      const r = 0.8 + rand(i * 3 + 5) * 1.8;
      const o = 0.2 + 0.55 * Math.abs(Math.sin(t * (0.6 + rand(i) * 1.4) + i));
      return <circle key={i} cx={x} cy={y} r={r} fill="#CFE8FF" opacity={o} />;
    })}
  </g>
);

export const MarsDefs: React.FC = () => (
  <defs>
    <radialGradient id="marsG" cx="35%" cy="32%" r="80%">
      <stop offset="0%" stopColor="#F97316" />
      <stop offset="55%" stopColor="#C2410C" />
      <stop offset="100%" stopColor="#5B1A08" />
    </radialGradient>
  </defs>
);

export const Mars: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <MarsDefs />
    <circle cx={cx} cy={cy} r={r * 1.12} fill="#F97316" opacity={0.12} />
    <circle cx={cx} cy={cy} r={r} fill="url(#marsG)" />
    <ellipse cx={cx - r * 0.3} cy={cy + r * 0.1} rx={r * 0.22} ry={r * 0.1} fill="#7C2D12" opacity={0.55} />
    <ellipse cx={cx + r * 0.25} cy={cy - r * 0.25} rx={r * 0.16} ry={r * 0.08} fill="#7C2D12" opacity={0.5} />
    <ellipse cx={cx + r * 0.1} cy={cy + r * 0.45} rx={r * 0.2} ry={r * 0.07} fill="#7C2D12" opacity={0.45} />
    <ellipse cx={cx - r * 0.05} cy={cy - r * 0.92} rx={r * 0.28} ry={r * 0.07} fill="#FDE8D8" opacity={0.7} />
  </g>
);

/** The orbiter: a silver body with a gold wrap, a dish, two solar panels and a nozzle; `heat` 0..1 lights it up red. */
export const Probe: React.FC<{ x: number; y: number; s?: number; rot?: number; heat?: number }> = ({ x, y, s = 1, rot = 0, heat = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {heat > 0.01 ? <ellipse cx={0} cy={10} rx={150 + 90 * heat} ry={110 + 60 * heat} fill={P3.red} opacity={0.18 + 0.3 * heat} /> : null}
    {[-1, 1].map((d) => (
      <g key={d} transform={`scale(${d} 1)`}>
        <rect x={46} y={-12} width={20} height={8} fill="#64748B" />
        <rect x={64} y={-34} width={104} height={64} fill="#1D4ED8" stroke="#BFDBFE" strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={64 + 26 * (i + 1)} y1={-34} x2={64 + 26 * (i + 1)} y2={30} stroke="#BFDBFE" strokeWidth={2} />
        ))}
        <line x1={64} y1={-1} x2={168} y2={-1} stroke="#BFDBFE" strokeWidth={2} />
      </g>
    ))}
    <rect x={-46} y={-34} width={92} height={68} rx={8} fill="#E2E8F0" stroke="#0F172A" strokeWidth={4} />
    <rect x={-46} y={6} width={92} height={28} rx={6} fill={P3.yellow} stroke="#0F172A" strokeWidth={3} />
    <path d="M -34 -34 Q 0 -82 34 -34 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth={4} />
    <line x1={0} y1={-58} x2={0} y2={-96} stroke="#94A3B8" strokeWidth={4} />
    <circle cx={0} cy={-98} r={6} fill={P3.blue} />
    <path d="M -14 34 L 14 34 L 24 54 L -24 54 Z" fill="#475569" stroke="#0F172A" strokeWidth={3} />
    {heat > 0.01 ? <path d={`M -16 54 L 16 54 L 0 ${70 + 80 * heat} Z`} fill="#FDBA74" opacity={0.9} /> : null}
  </g>
);

/** Text with a dark outline so it holds on any background at phone size. */
export const OutText: React.FC<{
  x: number;
  y: number;
  size: number;
  fill: string;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  stroke?: number;
  mono?: boolean;
  opacity?: number;
  spacing?: number;
}> = ({ x, y, size, fill, text, anchor = 'middle', stroke = 12, mono = false, opacity = 1, spacing }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={mono ? MONO : HEAVY}
    fontWeight={mono ? 700 : 900}
    fontSize={size}
    fill={fill}
    stroke="#000"
    strokeWidth={mono ? 0 : stroke}
    strokeLinejoin="round"
    paintOrder="stroke"
    opacity={opacity}
    letterSpacing={spacing}
  >
    {text}
  </text>
);
