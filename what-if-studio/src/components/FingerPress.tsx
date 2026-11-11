import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS } from '../engine';
import { COLOR, ease, HEAVY, rand, ShotProps } from './motion';

const DOC = LOOKS.doc;

// "...y vuelve a presionar el botón": the doctor's hand (white coat sleeve, the rig's pointing mitten, scaled up)
// comes down on ENTER and a red shockwave rips outward.

export const FingerPress: React.FC<ShotProps> = ({ t, f, mark }) => {
  const pressAt = mark('boton');
  const hover = mark('presionar');
  const approach = ease(t, 0, Math.max(0.1, hover), -700, 440);
  const strike = ease(t, pressAt - 0.1, pressAt, 0, 1);
  const tremble = t < pressAt ? Math.sin(t * 60) * 6 : 0;
  const fingerY = approach + strike * 370 + tremble;
  const pressed = t >= pressAt;
  const wave = t - pressAt;
  const keyDown = pressed ? Math.max(0, 1 - Math.max(0, wave - 0.25) / 0.3) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={pressed ? '#1C0003' : '#0A0A10'} />
        {pressed
          ? [0, 0.1, 0.22].map((d, i) => {
              const a = wave - d;
              if (a < 0 || a > 0.9) return null;
              return <circle key={i} cx={540} cy={1060} r={120 + a * 1700} fill="none" stroke={COLOR.red} strokeWidth={60 * (1 - a / 0.9)} opacity={1 - a / 0.9} />;
            })
          : null}
        {pressed
          ? Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2 + rand(i) * 0.4;
              const len = Math.min(1, wave / 0.08) * (400 + rand(i * 5) * 400);
              let d = 'M 540 1060';
              for (let s = 1; s <= 4; s++) {
                const r = (len * s) / 4;
                d += ` L ${540 + Math.cos(a + (rand(i * 9 + s) - 0.5) * 0.4) * r} ${1060 + Math.sin(a + (rand(i * 9 + s) - 0.5) * 0.4) * r}`;
              }
              return <path key={i} d={d} stroke="#FFF" strokeWidth={6} fill="none" opacity={0.85} />;
            })
          : null}
        {/* ENTER */}
        <g transform={`translate(0 ${keyDown * 40})`}>
          <rect x={290} y={980} width={500} height={250} rx={40} fill="#300004" />
          <rect x={290} y={950} width={500} height={240} rx={40} fill={pressed ? COLOR.red : '#33333F'} stroke="#FFF" strokeWidth={8} />
          <text x={540} y={1100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill="#FFF">
            ENTER
          </text>
        </g>
        {/* the finger, from the top of frame */}
        <g>
          <path d={`M 560 ${fingerY - 130} Q 600 ${fingerY - 520} 760 -200`} stroke={DOC.line} strokeWidth={200} fill="none" strokeLinecap="round" />
          <path d={`M 560 ${fingerY - 130} Q 600 ${fingerY - 520} 760 -200`} stroke={DOC.limb} strokeWidth={176} fill="none" strokeLinecap="round" />
          <path d={`M 470 ${fingerY - 210} Q 560 ${fingerY - 180} 650 ${fingerY - 220}`} stroke={DOC.jacketShade} strokeWidth={14} fill="none" />
          <g transform={`translate(540 ${fingerY - 100}) scale(7.2)`}>
            <rect x={-4} y={10} width={8} height={24} rx={4} fill={DOC.hand} stroke={DOC.line} strokeWidth={2.2} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={DOC.hand} stroke={DOC.line} strokeWidth={2.4} strokeLinejoin="round" />
            <ellipse cx={-10} cy={6} rx={4.5} ry={7} fill={DOC.hand} stroke={DOC.line} strokeWidth={2.2} />
          </g>
        </g>
        <text x={540} y={400} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={pressed ? COLOR.red : '#FFF'} stroke="#000" strokeWidth={10} paintOrder="stroke" opacity={pressed ? 1 : 0}>
          OTRA VEZ
        </text>
      </svg>
    </AbsoluteFill>
  );
};
