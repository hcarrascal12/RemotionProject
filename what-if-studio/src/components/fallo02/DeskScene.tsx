import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Study, Desk, faceAt, LaptopBack } from '../../engine';
import { CineCamera, edgeFg, ef } from '../CineCamera';
import { CharacterRig } from '../CharacterRig';
import { COLOR, HARD, ShotProps, springAt } from '../motion';
import { Stamp, BLUE } from './parts';

// Pip at his desk, the laptop's glow on his face. Variants:
//   wake   "Imagina despertar un viernes...": he rubs his eyes, then sees the blue light; the date stamps in on "diecinueve de julio"
//   alone  "Todo porque nadie pensó qué pasaría": the same desk, the same blue light, nobody to ask

const PIP = LOOKS.pip;
const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

export const DeskScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant = 'wake', mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);
  const wake = variant === 'wake';
  const apago = num(mark('apago'), 0.5);
  const fecha = num(mark('fecha'), 1.6);
  const shock = Math.round(apago * 30);
  const k = springAt(f, fps, fecha, HARD);
  const rub = wake ? Math.max(0, 1 - Math.max(0, t - apago + 0.1) / 0.3) : 0;
  const pose = {
    ...basePose,
    x: 960,
    y: 712,
    scale: 1,
    yaw: 0.1,
    armR: { a: 20 + 120 * rub, b: 20 + 50 * rub },
    armL: { a: 30, b: 20 },
    headTilt: wake ? 4 - 8 * Math.min(1, Math.max(0, (t - apago) / 0.5)) : -4,
    ...faceAt(e, wake ? [[0, 'tired'], [shock, 'shock']] : [[0, 'worried']]),
  };
  const glow = 0.8 + 0.2 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={560} zoom={2.1 + 0.2 * p} tint="blue" vignette={0.7} light={{ x: 990, y: 640, r: 380, color: BLUE, o: 0.5 * glow }} fg={edgeFg(960, 560, 2.2)}>
        <Study t={e + 200} id="dk" night />
        <CharacterRig look={PIP} pose={pose} t={t} rim="blue" gaze={0.3} seed={4} sweat={variant === 'alone' ? 0.8 : 0} />
        <Desk x0={560} x1={1360} y={700} laptop={false} />
        <LaptopBack x={990} y={700} w={250} glow={glow} />
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {wake ? <Stamp k={k} x={540} y={360} label="19 JUL 2024" sub="VIERNES" color={COLOR.yellow} w={760} size={120} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
