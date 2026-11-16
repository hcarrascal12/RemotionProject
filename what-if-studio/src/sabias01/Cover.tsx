import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../components/fonts';
import { Hero, basePose, KitDefs, SetDefs, Pose, joints, toWorld, LEG_LEN, Rays } from '../engine';
import { HEAVY } from '../components/motion';
import { GRANNY } from './WhatIfShots';

// Cover of "¿Sabías que…? #01, la hacker de la pala" (TikTok, Instagram, Shorts, Facebook). New, and different from the Fallo
// covers: it is daylight-gold, not an alarm. A huge low sun with rays behind the grandma's face, the spade slanting across
// the frame into the soil where the cut cable sparks, and the nickname set enormous in white and hot orange. Everything that
// matters sits in the central square (y 420 to 1500); the pill and the strip live just outside it.
//   npx remotion still src/index.ts Sabias01Cover out/sabias01/portada.png
const INK = '#1B0A2A';
const POSE: Pose = { ...basePose, x: 560, y: 1425, scale: 2.5, yaw: -0.3, look: -0.5, headTilt: -5, expr: 'smug', armR: { a: 28, b: 10 }, armL: { a: 38, b: 24 } };

const Big: React.FC<{ y: number; size: number; fill: string; text: string; width: number; rot?: number }> = ({ y, size, fill, text, width, rot = 0 }) => (
  <g transform={`translate(540 ${y}) rotate(${rot})`}>
    <text x={10} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.2} strokeLinejoin="round" textLength={width} lengthAdjust="spacingAndGlyphs">
      {text}
    </text>
    <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.1} strokeLinejoin="round" paintOrder="stroke" textLength={width} lengthAdjust="spacingAndGlyphs">
      {text}
    </text>
  </g>
);

export const Sabias01Cover: React.FC = () => {
  const hand = toWorld(POSE, joints(POSE).armR.end);
  const bladeY = 1540;
  return (
    <AbsoluteFill style={{ background: '#1B0A2A' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <SetDefs />
        <defs>
          <linearGradient id="cvs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1B45" />
            <stop offset="45%" stopColor="#8A3A66" />
            <stop offset="75%" stopColor="#F0884A" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <radialGradient id="cvs-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="55%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>
          <radialGradient id="cvs-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#cvs-sky)" />
        {/* the huge low sun behind her, with rays turning from its centre */}
        <g transform="translate(540 1000)">
          <circle r={640} fill="url(#cvs-halo)" />
          <Rays x={0} y={0} t={40} len={1500} n={22} o={0.22} color="#FFF1C1" />
          <circle r={400} fill="url(#cvs-sun)" />
        </g>
        {/* far hills and a telegraph pole */}
        <path d="M -40 1360 Q 220 1230 480 1320 T 1120 1300 L 1120 1500 L -40 1500 Z" fill="#5A2F55" />
        <path d="M -40 1420 Q 300 1330 640 1410 T 1120 1400 L 1120 1520 L -40 1520 Z" fill="#3B2048" />
        <rect x={86} y={1050} width={16} height={430} fill="#241230" />
        <rect x={34} y={1072} width={120} height={12} fill="#241230" />
        <path d="M 94 1078 Q 400 1180 1100 1060" stroke="#241230" strokeWidth={4} fill="none" />
        {/* the grandma, big, against the sun; her spade slants down to the cut */}
        <Hero pose={POSE} look={GRANNY} rimId="rimR" shadow={0} />
        {/* the soil, and the orange fibre cable cut under the blade, sparking */}
        <rect x={0} y={1500} width={1080} height={420} fill="#4A2A24" />
        <rect x={0} y={1500} width={1080} height={22} fill="#6B8F4E" />
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={(i * 211) % 1080} cy={1580 + ((i * 97) % 280)} rx={14 + (i % 4) * 7} ry={9 + (i % 3) * 4} fill="#3A201C" />
        ))}
        <rect x={0} y={1640} width={500} height={44} rx={22} fill="#F97316" stroke="#7C2D12" strokeWidth={6} />
        <rect x={600} y={1640} width={480} height={44} rx={22} fill="#F97316" stroke="#7C2D12" strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={40 + i * 100} cy={1662} r={9} fill="#FFF7AE" />
        ))}
        <circle cx={550} cy={1662} r={120} fill="#FEF08A" opacity={0.55} style={{ mixBlendMode: 'screen' }} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + 0.2;
          const l = 70 + (i % 3) * 55;
          return <line key={i} x1={550} y1={1662} x2={550 + Math.cos(a) * l} y2={1662 + Math.sin(a) * l} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={9} strokeLinecap="round" />;
        })}
        <g>
          <line x1={hand.x} y1={hand.y} x2={550} y2={bladeY} stroke="#2A1810" strokeWidth={34} strokeLinecap="round" />
          <line x1={hand.x} y1={hand.y} x2={550} y2={bladeY} stroke="#9A6440" strokeWidth={22} strokeLinecap="round" />
          <rect x={hand.x - 50} y={hand.y - 18} width={90} height={22} rx={11} fill="#9A6440" stroke="#2A1810" strokeWidth={6} transform={`rotate(-8 ${hand.x} ${hand.y})`} />
          <path d={`M 480 ${bladeY - 10} L 620 ${bladeY - 10} L 600 ${bladeY + 120} Q 550 ${bladeY + 150} 500 ${bladeY + 120} Z`} fill="#B6BFCC" stroke="#2A2F38" strokeWidth={8} />
          <path d={`M 590 ${bladeY} L 580 ${bladeY + 100}`} stroke="#FFFFFF" strokeWidth={8} opacity={0.7} strokeLinecap="round" />
        </g>
        {/* top pill: the series, and the channel's seal */}
        <g transform="translate(540 330)">
          <rect x={-290} y={-50} width={580} height={100} rx={50} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={8} />
          <g transform="translate(-238 0) scale(0.34)">
            <rect x={-108} y={-96} width={240} height={240} rx={46} fill="#000" />
            <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={8} />
            <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={5} />
            <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
              NO
            </text>
          </g>
          <text x={52} y={19} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill={INK} letterSpacing={2}>
            ¿SABÍAS QUE…?
          </text>
        </g>
        {/* the nickname, enormous */}
        <Big y={545} size={196} fill="#FFFFFF" text="LA HACKER" width={940} rot={-3} />
        <Big y={735} size={196} fill="#FF8A1F" text="DE LA PALA" width={940} rot={-3} />
        {/* stickers: her age, and the cost */}
        <g transform="translate(900 1090) rotate(10)">
          <circle r={118} fill="#EF4444" stroke={INK} strokeWidth={10} />
          <text y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill="#FFFFFF" stroke={INK} strokeWidth={8} paintOrder="stroke">
            75
          </text>
          <text y={56} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#FFFFFF">
            AÑOS
          </text>
        </g>
        <g transform="translate(300 1462) rotate(-5)">
          <rect x={-300} y={-52} width={600} height={104} rx={14} fill="#FDE047" stroke={INK} strokeWidth={9} />
          <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill={INK}>
            APAGÓ UN PAÍS
          </text>
        </g>
        {/* the year and place, small, under the nickname */}
        <text x={540} y={1850} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={42} fill="#FDE7C8" letterSpacing={5}>
          ARMENIA · 2011
        </text>
      </svg>
    </AbsoluteFill>
  );
};
