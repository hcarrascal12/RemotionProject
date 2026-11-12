import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Study, Desk, faceAt } from '../engine';
import { CineCamera, edgeFg, ef } from './CineCamera';
import { CharacterRig } from './CharacterRig';
import { COLOR, HARD, HEAVY, rand, ShotProps, springAt } from './motion';

// "Para ahorrar dinero": the man in the suit behind his desk, smug, as coins rain down; AHORRO stamps in on "dinero".

const SUIT = LOOKS.suit;

export const OfficeScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);
  const at = mark('dinero');
  const k = springAt(f, fps, at, HARD);
  const pose = {
    ...basePose,
    x: 960,
    y: 712,
    scale: 1,
    yaw: 0.1,
    armL: { a: 40 + 90 * k, b: 30 },
    armR: { a: 40 + 90 * k, b: 30 },
    headTilt: -6 * k,
    ...faceAt(e, [[0, 'smug'], [Math.round(at * 30), 'happy']]),
  };
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={560} zoom={2.1 + 0.25 * p} tint="amber" vignette={0.7} light={{ x: 1090, y: 470, r: 360, color: COLOR.amber, o: 0.35 }} fg={edgeFg(960, 560, 2.2)}>
        <Study t={e + 200} id="of" />
        <CharacterRig look={SUIT} pose={pose} t={t} rim="amber" gaze={-0.2} seed={11} />
        <Desk x0={560} x1={1360} y={700} laptop={false} />
        {Array.from({ length: 24 }, (_, i) => {
          const born = rand(i) * 1.2;
          const age = t - born;
          if (age < 0) return null;
          const x = 760 + rand(i * 7) * 400;
          const y = Math.min(690 - (i % 5) * 8, 280 + age * age * 900);
          const spin = Math.cos(t * 14 + i);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${Math.abs(spin) * 0.8 + 0.2} 1)`}>
              <circle r={16} fill={COLOR.yellow} stroke="#8C6A00" strokeWidth={3} />
              <text y={7} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={20} fill="#8C6A00">
                $
              </text>
            </g>
          );
        })}
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {k > 0.01 ? (
          <g transform={`translate(540 330) rotate(-8) scale(${2.5 - 1.5 * k})`} opacity={Math.min(1, k * 1.5)}>
            <rect x={-360} y={-120} width={720} height={220} rx={20} fill="#00000080" stroke={COLOR.yellow} strokeWidth={16} />
            <text y={60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={180} fill={COLOR.yellow}>
              AHORRO
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
