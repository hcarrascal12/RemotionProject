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
  // the total loss climbs fast to the full cost, then holds with an alarm blink
  const money = 125e6 * sm((t - 0.15) / 1.2);
  const full = money >= 125e6 - 1;
  const alarm = Math.floor(t * 4) % 2 === 0;
  void perdieron;
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={500} zoom={1.9 + 0.1 * p} tint="red" vignette={0.85} light={{ x: 960, y: 340, r: 520, color: P3.red, o: 0.18 }}>
        <MissionRoom t={t} signal={false} pose={pose} rim="red" />
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect x={70} y={372} width={940} height={196} rx={26} fill="#1A0306" stroke={P3.red} strokeWidth={6} opacity={full ? (alarm ? 1 : 0.7) : 0.9} />
        <OutText x={540} y={428} size={32} fill={full && alarm ? P3.white : P3.red} text="PÉRDIDA TOTAL" mono />
        <OutText x={540} y={530} size={92} fill={P3.red} text={`$${commas(money)}`} stroke={12} />
      </svg>
    </AbsoluteFill>
  );
};
