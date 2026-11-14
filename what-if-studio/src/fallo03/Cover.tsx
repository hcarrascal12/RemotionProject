import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../components/fonts';
import { Mars, OutText, P3, Probe, Stars } from '../components/fallo03/parts';

// The cover of Fallo #03 for TikTok, Instagram and Shorts: a clean frame with everything inside the central square
// (y 420 to 1500), so the 1:1 crop of the Instagram feed and the 3:4 grids keep it all.
//   npx remotion still src/index.ts Fallo03Cover out/fallo03/portada-fallo03.png
export const Fallo03Cover: React.FC = () => (
  <AbsoluteFill style={{ background: P3.bg }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <radialGradient id="cv-glow" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor={P3.blue} stopOpacity={0.2} />
          <stop offset="100%" stopColor={P3.blue} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={P3.bg2} />
      <circle cx={540} cy={900} r={900} fill="url(#cv-glow)" />
      <Stars t={3} n={110} drift={0} />
      <Mars cx={900} cy={1500} r={160} />
      <Probe x={230} y={1440} s={0.7} rot={-14} heat={0.1} />
      <rect x={355} y={440} width={370} height={84} rx={42} fill="#07090F" stroke={P3.red} strokeWidth={5} />
      <OutText x={540} y={499} size={44} fill={P3.yellow} text="FALLO #03" stroke={0} spacing={5} />
      <OutText x={540} y={730} size={175} fill={P3.white} text="LIBRAS" stroke={16} />
      <OutText x={540} y={900} size={190} fill={P3.red} text="≠" stroke={14} />
      <OutText x={540} y={1070} size={175} fill={P3.blue} text="NEWTONS" stroke={16} />
      <OutText x={540} y={1215} size={64} fill={P3.yellow} text="$125 MILLONES" stroke={10} />
      <OutText x={540} y={1290} size={64} fill={P3.white} text="PERDIDOS" stroke={10} />
    </svg>
  </AbsoluteFill>
);
