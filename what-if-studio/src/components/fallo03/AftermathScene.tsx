import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CineCamera, ef } from '../CineCamera';
import { ShotProps } from '../motion';
import { MissionRoom, deskPose, faceAt } from './MissionRoom';
import { clamp, commas, num, OutText, P3, sm } from './parts';

// AftermathScene: the control room after the signal goes. The big screen is static, Pip puts his hands on his head, and the
// cost falls from $125,000,000 to $0. Nobody was hurt (it was an uncrewed probe): the tone is loss, not horror.

export const AftermathScene: React.FC<ShotProps> = ({ t, dur, mark }) => {
  const e = ef(t);
  const p = clamp(t / Math.max(0.01, dur));
  const perdieron = num(mark('perdieron'), dur - 0.6);
  const hands = sm((t - 0.2) / 0.5);
  const pose = deskPose({
    ...faceAt(e, [[0, 'shock'], [Math.round((perdieron - 0.2) * 30), 'worried']]),
    armL: { a: 20 + 140 * hands, b: 20 + 90 * hands },
    armR: { a: 20 + 140 * hands, b: 20 + 90 * hands },
    headTilt: -3 * hands,
    look: 0,
  });
  const money = 125e6 * (1 - sm((t - 0.3) / Math.max(0.6, perdieron + 0.3 - 0.3)));
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={500} zoom={1.9 + 0.1 * p} tint="red" vignette={0.85} light={{ x: 960, y: 340, r: 520, color: P3.red, o: 0.18 }}>
        <MissionRoom t={t} signal={false} pose={pose} rim="red" />
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <OutText x={540} y={430} size={28} fill={P3.yellow} text="PÉRDIDA" mono />
        <OutText x={540} y={525} size={92} fill={money < 1 ? P3.red : P3.yellow} text={`$${commas(money)}`} />
      </svg>
    </AbsoluteFill>
  );
};
