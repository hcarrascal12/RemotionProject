import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../components/fonts';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../engine';
import { HEAVY, MONO } from '../components/motion';

// Cover of Fallo #02 for TikTok, Instagram and Facebook: one focal point (Pip's shocked face), the idea in two big numbers
// (20 != 21) and one short line. Everything important sits inside the central square (y 420 to 1500), so the 9:16, the 3:4 grid
// and the 1:1 feed crops all keep it.
//   npx remotion still src/index.ts Fallo02Cover out/fallo02/cover.png

const BLUE = '#0A6CD8';
const POSE: Pose = { ...basePose, x: 540, y: 1612, scale: 3.2, yaw: 0, look: 0, expr: 'shock', armL: { a: 28, b: 20 }, armR: { a: 28, b: 20 }, headTilt: -3 };

const Rays: React.FC<{ cx: number; cy: number; n?: number }> = ({ cx, cy, n = 18 }) => (
  <g opacity={0.16}>
    {Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / n / 2;
      const R = 2200;
      return <polygon key={i} points={`${cx},${cy} ${cx + Math.cos(a0) * R},${cy + Math.sin(a0) * R} ${cx + Math.cos(a1) * R},${cy + Math.sin(a1) * R}`} fill="#FFFFFF" />;
    })}
  </g>
);

const Big: React.FC<{ x: number; y: number; size: number; fill: string; text: string; sw?: number }> = ({ x, y, size, fill, text, sw = 26 }) => (
  <g>
    <text x={x + 8} y={y + 12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill="#02122B" stroke="#02122B" strokeWidth={sw} strokeLinejoin="round">
      {text}
    </text>
    <text x={x} y={y} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={fill} stroke="#02122B" strokeWidth={sw * 0.6} strokeLinejoin="round" paintOrder="stroke">
      {text}
    </text>
  </g>
);

export const Fallo02Cover: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 52%, #1E92FF 0%, ${BLUE} 40%, #05306B 78%, #020E24 100%)` }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" textAnchor="middle">
      <KitDefs />
      <SetDefs />
      <defs>
        <linearGradient id="cv2-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020E24" stopOpacity={0} />
          <stop offset="1" stopColor="#020E24" stopOpacity={1} />
        </linearGradient>
      </defs>
      <Rays cx={540} cy={1010} />
      {/* the blue screen's sad face, huge and faint, as texture */}
      <text x={540} y={1260} fontFamily={HEAVY} fontWeight={900} fontSize={1100} fill="#FFFFFF" opacity={0.08} letterSpacing={-50}>
        :(
      </text>
      {/* Pip, big, face and shoulders; the legs go under the strip */}
      <g>
        <Hero look={LOOKS.pip} pose={POSE} shadow={0} />
      </g>
      {/* series tag */}
      <g transform="translate(540 498)">
        <rect x={-190} y={-44} width={380} height={88} rx={44} fill="#02122B" stroke="#FF2A2A" strokeWidth={6} />
        <text y={15} fontFamily={HEAVY} fontWeight={900} fontSize={48} fill="#FFE600" letterSpacing={5}>
          FALLO #02
        </text>
      </g>
      {/* the idea */}
      <Big x={222} y={778} size={240} fill="#FFFFFF" text="20" />
      <g>
        <Big x={540} y={768} size={220} fill="#FF2A2A" text="≠" sw={22} />
      </g>
      <Big x={858} y={778} size={240} fill="#FFE600" text="21" />
      {/* the legs and the bottom: a strip with the stake */}
      <rect x={0} y={1120} width={1080} height={230} fill="url(#cv2-fade)" />
      <rect x={0} y={1350} width={1080} height={570} fill="#020E24" />
      <g transform="rotate(-2 540 1285)">
        <rect x={-20} y={1232} width={1120} height={104} fill="#FF2A2A" stroke="#FFFFFF" strokeWidth={7} />
        <text x={540} y={1308} fontFamily={HEAVY} fontWeight={900} fontSize={72} fill="#FFFFFF" stroke="#7A0A0A" strokeWidth={8} paintOrder="stroke">
          8,5 MILLONES CAÍDOS
        </text>
      </g>
      <text x={540} y={1415} fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#FFFFFF" stroke="#02122B" strokeWidth={10} paintOrder="stroke" letterSpacing={6}>
        UN SOLO ERROR
      </text>
    </svg>
  </AbsoluteFill>
);
