import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../engine';
import { HEAVY } from '../components/motion';

// Thumbnail for Fallo #02: the blue screen's sad face as texture, the idea (20 != 21) and Pip in shock, all centred.
//   npx remotion still src/index.ts Fallo02Thumb out/fallo02/thumb.png
const POSE: Pose = { ...basePose, x: 540, y: 1430, scale: 2.8, yaw: 0, look: 0, expr: 'shock', armL: { a: 100, b: 70 }, armR: { a: 100, b: 70 }, headTilt: 0 };

export const Fallo02Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #0A86E8 0%, #0078D7 45%, #04427F 100%)' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" textAnchor="middle" fontFamily={HEAVY} fontWeight={900}>
      <KitDefs />
      <SetDefs />
      <text x={470} y={1250} fontSize={1000} fill="#FFF" opacity={0.11} letterSpacing={-40}>:(</text>
      <Hero look={LOOKS.pip} pose={POSE} shadow={0.35} />
      <defs><linearGradient id="fadeLegs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04427F" stopOpacity="0" /><stop offset="1" stopColor="#04427F" stopOpacity="1" /></linearGradient></defs>
      <rect x={0} y={1480} width={1080} height={240} fill="url(#fadeLegs)" />
      <rect x={0} y={1720} width={1080} height={200} fill="#04427F" />
      <g paintOrder="stroke" stroke="#04274A" strokeWidth={22} strokeLinejoin="round">
        <text x={215} y={640} fontSize={250} fill="#FFF">20</text>
        <text x={540} y={625} fontSize={220} fill="#FFE600">≠</text>
        <text x={865} y={640} fontSize={250} fill="#FFF">21</text>
      </g>
      <rect x={330} y={300} width={420} height={104} rx={52} fill="#05182E" stroke="#FF2A2A" strokeWidth={5} />
      <text x={540} y={374} fontSize={52} fill="#FFF" letterSpacing={6}>FALLO #02</text>
    </svg>
  </AbsoluteFill>
);
