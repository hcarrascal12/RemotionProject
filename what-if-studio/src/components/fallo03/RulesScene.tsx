import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { num, OutText, P3, Stars } from './parts';

// RulesScene: "Las reglas de la misión pedían newtons. El software entregó libras… y nadie lo comprobó."
//   1. The spec card (blue) slides in on "reglas" and gets its green tick on "newtons".
//   2. The ground-software card (yellow) slides in on "entregó libras", and a red ≠ slams between the two cards.
//   3. The review row: an empty box that nobody ticks, pulsing; on "nadie" the stamp SIN REVISAR lands on it.
// Everything floats and flickers a little, so no frame is still.

export const RulesScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const reglas = num(mark('a2'), 0) * 0; // (the shot starts just before the phrase; cards come in at the shot start)
  void reglas;
  const pedian = num(mark('newtons3'), 1.0);
  const entrego = num(mark('entrego'), 2.4);
  const nadie = num(mark('nadie'), 3.8);
  const kA = springAt(f, fps, 0.0, HARD);
  const tick = springAt(f, fps, pedian, { stiffness: 300, damping: 10, mass: 0.6 });
  const kB = springAt(f, fps, entrego - 0.1, HARD);
  const kNe = springAt(f, fps, entrego + 0.25, { stiffness: 240, damping: 9, mass: 0.7 });
  const kC = springAt(f, fps, nadie - 0.9, HARD);
  const stamp = springAt(f, fps, nadie, HARD);
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
  const amp = t >= nadie ? 9 * Math.exp(-(t - nadie) / 0.3) : 0;
  const sx = (rand(f * 2 + 91) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 92) - 0.5) * 2 * amp;
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg2} />
        <Stars t={t} n={60} />
        <g transform={`translate(${sx} ${sy})`}>
          {/* 1. the spec */}
          <g transform={`translate(${-(1 - Math.min(1, kA)) * 700} ${5 * Math.sin(t * 2.1)})`} opacity={Math.min(1, kA * 2)}>
            <rect x={90} y={330} width={900} height={230} rx={30} fill="#0B1220" stroke={P3.blue} strokeWidth={8} />
            <OutText x={540} y={388} size={28} fill={P3.blue} text="REGLAS DE LA MISIÓN" mono />
            <OutText x={500} y={500} size={96} fill={P3.white} text="NEWTONS" stroke={12} />
            <g transform={`translate(870 470) scale(${Math.min(1.15, tick)})`} opacity={Math.min(1, tick * 2)}>
              <circle r={50} fill="#16A34A" stroke="#052E16" strokeWidth={6} />
              <path d="M -24 2 L -6 22 L 28 -20" stroke="#FFFFFF" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          {/* 2. what the software delivered */}
          <g transform={`translate(${(1 - Math.min(1, kB)) * 700} ${5 * Math.sin(t * 2.1 + 2)})`} opacity={Math.min(1, kB * 2)}>
            <rect x={90} y={700} width={900} height={230} rx={30} fill="#0B1220" stroke={P3.yellow} strokeWidth={8} />
            <OutText x={540} y={758} size={28} fill={P3.yellow} text="SOFTWARE DE TIERRA ENTREGÓ" mono />
            <OutText x={540} y={870} size={96} fill={P3.white} text="LIBRAS" stroke={12} />
          </g>
          {kNe > 0.01 ? (
            <g transform={`translate(540 630) scale(${(2.2 - 1.2 * Math.min(1.1, kNe)) * (1 + 0.07 * glow)})`} opacity={Math.min(1, kNe * 2)}>
              <circle r={70} fill={P3.red} opacity={0.2 + 0.12 * glow} />
              <OutText x={0} y={40} size={110} fill={P3.red} text="≠" stroke={12} />
            </g>
          ) : null}
          {/* 3. the review nobody did */}
          <g transform={`translate(0 ${(1 - Math.min(1, kC)) * 90 + 4 * Math.sin(t * 2.3 + 1)})`} opacity={Math.min(1, kC * 2)}>
            <rect x={90} y={1020} width={900} height={190} rx={30} fill="#0B1220" stroke={P3.steel} strokeWidth={6} strokeDasharray={t >= nadie ? undefined : '14 12'} />
            <OutText x={400} y={1100} size={34} fill={P3.steel} text="REVISIÓN" anchor="end" mono />
            <rect x={470} y={1055} width={110} height={110} rx={16} fill="none" stroke={P3.white} strokeWidth={8} opacity={0.6 + 0.4 * glow} />
            <OutText x={620} y={1100} size={30} fill={P3.steel} text="¿VERIFICADO?" anchor="start" mono />
          </g>
          <Stamp k={stamp} x={540} y={1115} label="SIN REVISAR" sub="NADIE LO COMPROBÓ" color={P3.red} w={760} size={84} rot={-5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
