import React from 'react';
import { COLOR, rand } from './motion';
import { DEV } from '../design/devArtificial';

// TechTerminal: the 1986 console as a reusable piece. A beige CRT with green phosphor that actually lights its
// surroundings: a halo of terminal light spills past the bezel, a faint technical grid and a vignette replace the flat
// background, and the glass has a reflection. Children draw the screen's content in the 1080 x 1920 frame (the tube
// is centred at (540, 860)).

export const TermDefs: React.FC = () => (
  <defs>
    <radialGradient id="crtGlass" cx="35%" cy="25%" r="90%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
      <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
    </radialGradient>
    <radialGradient id="termHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={DEV.palette.green} stopOpacity={0.55} />
      <stop offset="60%" stopColor={DEV.palette.green} stopOpacity={0.14} />
      <stop offset="100%" stopColor={DEV.palette.green} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="termVig" cx="50%" cy="45%" r="75%">
      <stop offset="40%" stopColor="#000" stopOpacity={0} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
    </radialGradient>
    <pattern id="termGrid" width={80} height={80} patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke={DEV.palette.green} strokeWidth={1.5} opacity={0.12} />
    </pattern>
  </defs>
);

/** The dark room around the terminal: deep palette, a faint grid and a vignette (never a flat fill). */
export const TermBackdrop: React.FC<{ t: number; color?: string }> = ({ t, color = DEV.palette.green }) => (
  <g>
    <rect width={1080} height={1920} fill={DEV.palette.bg} />
    <rect width={1080} height={1920} fill="url(#termGrid)" transform={`translate(0 ${(t * 14) % 80})`} />
    <ellipse cx={540} cy={860} rx={820} ry={900} fill={color} opacity={0.12} />
    <rect width={1080} height={1920} fill="url(#termVig)" />
  </g>
);

export const TechTerminal: React.FC<{
  t: number;
  f: number;
  scale?: number;
  ox?: number;
  oy?: number;
  tint?: string;
  /** spill the screen's light past the bezel (on by default) */
  emit?: boolean;
  children: React.ReactNode;
}> = ({ t, f, scale = 1, ox = 540, oy = 860, tint = COLOR.green, emit = true, children }) => {
  const flicker = 0.92 + 0.08 * rand(f * 1.7);
  const roll = (t * 260) % 700;
  return (
    <g transform={`translate(${ox} ${oy}) scale(${scale}) translate(-540 -860)`}>
      {emit ? <ellipse cx={540} cy={860} rx={760} ry={830} fill="url(#termHalo)" opacity={0.5 + 0.1 * flicker} /> : null}
      <rect x={30} y={350} width={1040} height={1060} rx={70} fill="#000" opacity={0.5} />
      <rect x={20} y={330} width={1040} height={1060} rx={70} fill="#CFC7B2" stroke="#8D8673" strokeWidth={10} />
      <rect x={70} y={380} width={940} height={850} rx={90} fill="#021006" />
      <g opacity={flicker} style={{ filter: `drop-shadow(0 0 10px ${tint})` }}>
        {children}
      </g>
      <rect x={70} y={380 + roll} width={940} height={60} fill={tint} opacity={0.06} />
      <rect x={70} y={380} width={940} height={850} rx={90} fill="url(#crtGlass)" />
      <path d="M 110 430 Q 300 410 520 420 L 440 520 Q 270 500 120 540 Z" fill="#FFFFFF" opacity={0.05} />
      <rect x={440} y={1270} width={200} height={60} rx={12} fill="#9C947F" />
      <circle cx={930} cy={1300} r={18} fill={COLOR.green} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
    </g>
  );
};
