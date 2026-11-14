import React from 'react';
import { basePose, Desk, LOOKS, Pose, faceAt } from '../../engine';
import { CharacterRig } from '../CharacterRig';
import { MONO, rand } from '../motion';
import { Mars, MarsDefs, P3 } from './parts';

// The mission-control room of Fallo #03, in the What If engine's 1920 x 1080 world: a dark hall, the big screen with Mars and
// the planned orbit, two side consoles and Pip at the desk. Used by MissionControlScene and AftermathScene.

export const PIP = LOOKS.pip;

/** Pip at the control desk. */
export const deskPose = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: 960, y: 712, scale: 1, yaw: 0.1, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, ...o });
export { faceAt, CharacterRig };

/** The big screen. `signal` false: static and NO SIGNAL. */
export const BigScreen: React.FC<{ t: number; signal: boolean; x?: number; y?: number; w?: number; h?: number }> = ({ t, signal, x = 700, y = 150, w = 520, h = 380 }) => {
  const mx = x + w * 0.62;
  const my = y + h * 0.52;
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={14} fill="#111827" stroke="#334155" strokeWidth={6} />
      <rect x={x} y={y} width={w} height={h} fill="#050810" />
      {signal ? (
        <g>
          <MarsDefs />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={x + rand(i * 2 + 1) * w} cy={y + rand(i * 2 + 2) * h} r={1.5} fill="#CFE8FF" opacity={0.6} />
          ))}
          <Mars cx={mx} cy={my} r={92} />
          <ellipse cx={mx} cy={my} rx={170} ry={74} fill="none" stroke={P3.green} strokeWidth={3} strokeDasharray="10 8" transform={`rotate(-18 ${mx} ${my})`} />
          <path d={`M ${x + 20} ${y + h * 0.84} Q ${x + w * 0.3} ${y + h * 0.5} ${mx - 150} ${my - 40}`} stroke={P3.blue} strokeWidth={3} strokeDasharray="3 10" fill="none" strokeLinecap="round" />
          <circle cx={mx - 150} cy={my - 40} r={8 + 2 * Math.sin(t * 6)} fill={P3.blue} />
          <text x={x + 16} y={y + h - 40} fontFamily={MONO} fontWeight={700} fontSize={17} fill={P3.blue}>MARS CLIMATE ORBITER</text>
          <text x={x + 16} y={y + h - 14} fontFamily={MONO} fontWeight={700} fontSize={17} fill={P3.green}>TRAYECTORIA NOMINAL</text>
        </g>
      ) : (
        <g>
          {Array.from({ length: 34 }, (_, i) => (
            <rect key={i} x={x + rand(i + Math.floor(t * 18) * 7) * w} y={y + rand(i * 3 + Math.floor(t * 18)) * h} width={20 + rand(i + 9) * 80} height={3} fill="#E2E8F0" opacity={0.25 + 0.25 * rand(i + 4)} />
          ))}
          <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={P3.red}>NO SIGNAL</text>
        </g>
      )}
    </g>
  );
};

const SideConsole: React.FC<{ x: number; t: number; seed: number }> = ({ x, t, seed }) => (
  <g>
    <rect x={x} y={560} width={420} height={150} rx={10} fill="#0F172A" stroke="#1E293B" strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x + 22 + i * 132} y={578} width={112} height={78} rx={6} fill="#0B1220" stroke="#334155" strokeWidth={3} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={x + 32 + i * 132} y={590 + k * 15} width={20 + 60 * rand(seed + i * 5 + k + Math.floor(t * 1.2)) } height={5} fill={k % 2 ? P3.blue : P3.green} opacity={0.7} />
        ))}
      </g>
    ))}
  </g>
);

export const MissionRoom: React.FC<{ t: number; signal?: boolean; pose?: Pose; rim?: 'blue' | 'red' | 'amber'; showPip?: boolean }> = ({ t, signal = true, pose, rim = 'blue', showPip = true }) => (
  <g>
    <rect width={1920} height={1080} fill={P3.bg2} />
    <rect y={740} width={1920} height={340} fill="#06080E" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={120 + i * 215} y={0} width={4} height={740} fill="#101826" />)}
    {[420, 960, 1500].map((cx) => <rect key={cx} x={cx - 120} y={40} width={240} height={10} rx={5} fill="#1E3A5F" opacity={0.6} />)}
    <SideConsole x={150} t={t} seed={3} />
    <SideConsole x={1350} t={t} seed={11} />
    <BigScreen t={t} signal={signal} />
    {showPip ? <CharacterRig look={PIP} pose={pose ?? deskPose({ ...faceAt(t * 30, [[0, 'worried']]) })} t={t} rim={rim} seed={5} /> : null}
    <Desk x0={600} x1={1320} y={700} laptop={false} />
  </g>
);
