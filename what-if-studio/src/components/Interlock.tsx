import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';

// "Para ahorrar dinero, le quitaron los frenos físicos de seguridad."
// The hardware interlock lifted out of the schematic, a red X on "seguridad"

export const Brakes: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const liftAt = mark('frenos') - 0.25;
  const lift = ease(t, liftAt, liftAt + 0.45, 0, 1);
  const xK = springAt(f, fps, mark('seguridad'), HARD);
  const off = (f * 2) % 60;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <pattern id="bp2" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${off})`}>
            <rect width={60} height={60} fill={COLOR.navy} />
            <path d="M 60 0 L 0 0 0 60" stroke="#123064" strokeWidth={2} fill="none" />
          </pattern>
        </defs>
        <rect x={-50} y={-80} width={1180} height={2080} fill="url(#bp2)" />
        {/* the safety chain: software and the physical brake, both wired to the beam */}
        <g stroke="#9FE8FF" strokeWidth={6} fill="none">
          <rect x={130} y={420} width={330} height={200} rx={16} />
          <rect x={620} y={420} width={330} height={200} rx={16} strokeDasharray={lift > 0.5 ? '18 14' : undefined} />
          <rect x={330} y={900} width={420} height={180} rx={16} />
          <path d="M 295 620 L 295 760 L 540 760 L 540 900" />
          <path d="M 785 620 L 785 760 L 540 760" strokeDasharray={lift > 0.5 ? '18 14' : undefined} />
        </g>
        <text x={295} y={540} textAnchor="middle" fontFamily={MONO} fontSize={40} fill="#9FE8FF">
          SOFTWARE
        </text>
        <text x={540} y={1005} textAnchor="middle" fontFamily={MONO} fontSize={44} fill="#9FE8FF">
          RAYO
        </text>
        {/* the physical brake: a lock block that lifts out */}
        <g transform={`translate(785 ${520 - lift * 520}) rotate(${lift * 18})`} opacity={1 - lin(lift, 0.7, 1)}>
          <rect x={-150} y={-90} width={300} height={180} rx={18} fill={COLOR.yellow} stroke="#000" strokeWidth={6} />
          <path d="M -45 -20 L -45 -60 A 45 45 0 0 1 45 -60 L 45 -20" stroke="#000" strokeWidth={16} fill="none" />
          <rect x={-70} y={-25} width={140} height={90} rx={10} fill="#000" />
          <text x={0} y={140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={COLOR.yellow}>
            FRENO FÍSICO
          </text>
        </g>
        {xK > 0.01 ? (
          <g transform={`translate(785 520) scale(${2.4 - 1.4 * xK})`}>
            <path d="M -150 -150 L 150 150 M 150 -150 L -150 150" stroke={COLOR.red} strokeWidth={50} strokeLinecap="round" />
          </g>
        ) : null}
        {xK > 0.01 ? (
          <g transform={`translate(540 1190) scale(${xK})`}>
            <rect x={-330} y={-70} width={660} height={120} rx={60} fill={COLOR.red} />
            <text y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={62} fill="#FFF">
              SOLO SOFTWARE
            </text>
          </g>
        ) : null}
        <text x={540} y={300} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={COLOR.yellow} opacity={0.75 + 0.25 * Math.sin(t * 3)}>
          SISTEMA DE SEGURIDAD
        </text>
      </svg>
    </AbsoluteFill>
  );
};
