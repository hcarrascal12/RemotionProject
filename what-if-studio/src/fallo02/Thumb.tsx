import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAVY } from '../components/motion';
import { Recreation } from '../components/fallo02/Recreate';

// Thumbnail for Fallo #02, for the TikTok and Instagram grids (3:4 centre crop: everything sits between y 240 and y 1680).
// Everything sits inside the central square (y 420 to 1500), so the 1:1 crop of the Instagram feed keeps it all too.
// The blue-screen scene from the film in a soft window, "20 != 21" above it, the hook figure below.
//   npx remotion still src/index.ts Fallo02Thumb out/fallo02/thumb.png
const WIN_TOP = 790;
const WIN_H = 450;
const SCENE_SCALE = 0.85;
const SCENE_SHIFT = -560; // which part of the 1920 px scene shows in the window

export const Fallo02Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#05070A' }}>
    <div style={{ position: 'absolute', left: 0, top: WIN_TOP, width: 1080, height: WIN_H, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%)' }}>
      <div style={{ position: 'absolute', left: (1080 - 1080 * SCENE_SCALE) / 2, top: SCENE_SHIFT, width: 1080, height: 1920, transform: `scale(${SCENE_SCALE})`, transformOrigin: 'top left', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)', filter: 'saturate(1.2) brightness(1.08)' }}>
        <Recreation t={2.35} f={141} fps={60} dur={2.695} variant="bsod" mark={() => Number.NaN} />
      </div>
    </div>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" textAnchor="middle" fontFamily={HEAVY} fontWeight={900} style={{ position: 'absolute', inset: 0 }}>
      <rect x={355} y={452} width={370} height={84} rx={42} fill="#05182E" stroke="#FF2A2A" strokeWidth={5} />
      <text x={540} y={511} fontSize={44} fill="#FFF" letterSpacing={6}>FALLO #02</text>
      <g paintOrder="stroke" stroke="#000" strokeWidth={22} strokeLinejoin="round">
        <text x={235} y={760} fontSize={205} fill="#FFF">20</text>
        <text x={540} y={750} fontSize={180} fill="#FF2A2A">≠</text>
        <text x={845} y={760} fontSize={205} fill="#FFE600">21</text>
      </g>
      <g paintOrder="stroke" stroke="#000" strokeWidth={16} strokeLinejoin="round">
        <text x={540} y={1325} fontSize={76} fill="#FFF">8,5 MILLONES</text>
        <text x={540} y={1410} fontSize={76} fill="#FFE600">DE PCs CAÍDOS</text>
      </g>
    </svg>
  </AbsoluteFill>
);
