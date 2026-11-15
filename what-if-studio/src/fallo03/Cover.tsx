import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../components/fonts';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../engine';
import { HEAVY } from '../components/motion';
import { BurningProbe, MarsLimb } from '../components/fallo03/HookScene';
import { Stars } from '../components/fallo03/parts';

// Cover of Fallo #03 for TikTok, Instagram, Shorts and Facebook. It must NOT look like the #02 cover (blue sunburst, centred
// tag, Pip's face in the middle, red strip). This one is a dark-space emergency: the probe burning across a Martian horizon,
// the cost tilted and huge, the series tag as a tab in the corner, the homework mistake corrected in red pen with the two
// units blacked out (the still asks the question, the video answers it), hazard tape instead of a strip, and Pip small,
// peeking over the tape in the corner. Everything important is inside the central square (y 420 to 1500).
//   npx remotion still src/index.ts Fallo03Cover out/fallo03/portada-fallo03.png
const INK = '#14040A';
const POSE: Pose = { ...basePose, x: 112, y: 1452, scale: 1.45, yaw: 0, look: 0, expr: 'shock', armL: { a: 150, b: 95 }, armR: { a: 150, b: 95 }, headTilt: -3 };

const Big: React.FC<{ x: number; y: number; size: number; fill: string; text: string; sw?: number; anchor?: 'middle' | 'start' }> = ({ x, y, size, fill, text, sw = 26, anchor = 'middle' }) => (
  <g>
    <text x={x + 9} y={y + 13} textAnchor={anchor} fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={sw} strokeLinejoin="round">
      {text}
    </text>
    <text x={x} y={y} textAnchor={anchor} fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={sw * 0.6} strokeLinejoin="round" paintOrder="stroke">
      {text}
    </text>
  </g>
);

export const Fallo03Cover: React.FC = () => (
  <AbsoluteFill style={{ background: '#07090F' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" textAnchor="middle">
      <KitDefs />
      <SetDefs />
      <defs>
        <radialGradient id="cv3-alarm" cx="50%" cy="48%" r="75%">
          <stop offset="35%" stopColor="#EF4444" stopOpacity={0} />
          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id="cv3-glow" cx="52%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#FB923C" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
        </radialGradient>
        <clipPath id="cv3-tape">
          <rect x={-900} y={-40} width={1800} height={80} />
        </clipPath>
      </defs>
      <rect width={1080} height={1920} fill="#0B0E17" />
      <Stars t={5} n={120} drift={0} />
      <circle cx={540} cy={1000} r={900} fill="url(#cv3-glow)" />
      <MarsLimb t={2} />
      {/* the probe, burning, big, across the middle */}
      <g transform="translate(205 -530)">
        <BurningProbe u={0.8} t={2.2} heat={1} id="cover" s={1.35} />
      </g>
      <rect width={1080} height={1920} fill="url(#cv3-alarm)" />
      {/* series tag: a tab in the corner, not a centred pill */}
      <g transform="translate(40 452) skewX(-8)">
        <rect x={0} y={0} width={400} height={92} fill="#FFE600" stroke={INK} strokeWidth={6} />
        <text x={200} y={66} fontFamily={HEAVY} fontWeight={900} fontSize={58} fill={INK} letterSpacing={4}>
          FALLO #03
        </text>
      </g>
      {/* the cost: huge, tilted, left-aligned */}
      <g transform="rotate(-6 540 780)">
        <Big x={540} y={835} size={370} fill="#FFE600" text="$125" sw={32} />
        <Big x={540} y={960} size={124} fill="#FFFFFF" text="MILLONES" sw={24} />
      </g>
      {/* the homework mistake corrected in red pen, the units blacked out */}
      <g transform="translate(620 1215) rotate(3) scale(0.86)">
        <rect x={-420} y={-82} width={840} height={164} rx={10} fill="#F8FAFC" stroke={INK} strokeWidth={7} />
        {[-36, 10, 56].map((y) => (
          <line key={y} x1={-420} y1={y + 16} x2={420} y2={y + 16} stroke="#93C5FD" strokeWidth={3} />
        ))}
        <line x1={-352} y1={-82} x2={-352} y2={82} stroke="#F87171" strokeWidth={4} />
        <text x={-318} y={-48} textAnchor="start" fontFamily={HEAVY} fontWeight={900} fontSize={24} letterSpacing={3} fill="#475569">
          EL SOFTWARE ASUMIÓ:
        </text>
        <g transform="skewX(-10)">
          <text x={-324} y={34} textAnchor="start" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#1E3A8A">1</text>
          <rect x={-284} y={-26} width={166} height={70} rx={8} fill="#0F172A" />
          <text x={-201} y={26} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">?</text>
          <text x={-62} y={34} fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#1E3A8A">=</text>
          <text x={-12} y={34} textAnchor="start" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#1E3A8A">1</text>
          <rect x={30} y={-26} width={246} height={70} rx={8} fill="#0F172A" />
          <text x={153} y={26} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">?</text>
        </g>
        <ellipse cx={-64} cy={6} rx={44} ry={38} fill="none" stroke="#DC2626" strokeWidth={8} />
      </g>
      <g transform="translate(955 1135) rotate(12) scale(0.85)">
        <path d="M -64 -64 L 64 64 M 64 -64 L -64 64" stroke={INK} strokeWidth={38} strokeLinecap="round" />
        <path d="M -64 -64 L 64 64 M 64 -64 L -64 64" stroke="#EF4444" strokeWidth={24} strokeLinecap="round" />
      </g>
      {/* Pip, small, peeking over the tape in the corner, hands on his head */}
      <Hero look={LOOKS.pip} pose={POSE} shadow={0} />
      {/* the ground under the tape: it hides Pip's body, like the dark bottom of the #02 */}
      <g transform="translate(540 1345) rotate(4)">
        <rect x={-900} y={30} width={1800} height={900} fill="#25080A" />
      </g>
      {/* hazard tape, the other way round from the #02 strip */}
      <g transform="translate(540 1345) rotate(4)">
        <rect x={-900} y={-40} width={1800} height={80} fill="#FACC15" />
        <g clipPath="url(#cv3-tape)">
          {Array.from({ length: 40 }, (_, i) => (
            <path key={i} d={`M ${-900 + i * 90} 40 L ${-870 + i * 90} -40 L ${-830 + i * 90} -40 L ${-860 + i * 90} 40 Z`} fill="#0B0B0B" />
          ))}
        </g>
        <rect x={-900} y={-40} width={1800} height={80} fill="none" stroke="#0B0B0B" strokeWidth={6} />
      </g>
      <text x={1020} y={1470} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#FFFFFF" stroke={INK} strokeWidth={12} paintOrder="stroke" letterSpacing={3}>
        ERROR DE PRIMARIA
      </text>
    </svg>
  </AbsoluteFill>
);
