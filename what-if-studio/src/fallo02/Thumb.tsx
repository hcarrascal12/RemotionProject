import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAVY } from '../components/motion';
import { Recreation } from '../components/fallo02/Recreate';

// Thumbnail for Fallo #02, for the TikTok and Instagram grids (3:4 centre crop: everything sits between y 240 and y 1680).
// The blue-screen scene from the film in a soft window, "20 != 21" above it, the hook figure below.
//   npx remotion still src/index.ts Fallo02Thumb out/fallo02/thumb.png
const WIN_TOP = 650;
const WIN_H = 720;
const SCENE_SHIFT = -650; // which part of the 1920 px scene shows in the window

export const Fallo02Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#05070A' }}>
    <div style={{ position: 'absolute', left: 0, top: WIN_TOP, width: 1080, height: WIN_H, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%)' }}>
      <div style={{ position: 'absolute', left: 0, top: SCENE_SHIFT, width: 1080, height: 1920, filter: 'saturate(1.2) brightness(1.08)' }}>
        <Recreation t={2.35} f={141} fps={60} dur={2.695} variant="bsod" mark={() => Number.NaN} />
      </div>
    </div>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" textAnchor="middle" fontFamily={HEAVY} fontWeight={900} style={{ position: 'absolute', inset: 0 }}>
      <rect x={345} y={262} width={390} height={92} rx={46} fill="#05182E" stroke="#FF2A2A" strokeWidth={5} />
      <text x={540} y={327} fontSize={48} fill="#FFF" letterSpacing={6}>FALLO #02</text>
      <g paintOrder="stroke" stroke="#000" strokeWidth={22} strokeLinejoin="round">
        <text x={228} y={590} fontSize={250} fill="#FFF">20</text>
        <text x={540} y={578} fontSize={220} fill="#FF2A2A">≠</text>
        <text x={852} y={590} fontSize={250} fill="#FFE600">21</text>
      </g>
      <g paintOrder="stroke" stroke="#000" strokeWidth={16} strokeLinejoin="round">
        <text x={540} y={1490} fontSize={84} fill="#FFF">8,5 MILLONES</text>
        <text x={540} y={1585} fontSize={84} fill="#FFE600">DE PCs CAÍDOS</text>
      </g>
    </svg>
  </AbsoluteFill>
);
