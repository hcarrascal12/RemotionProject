import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CineCamera, ef } from '../CineCamera';
import { HARD, rand, ShotProps, springAt } from '../motion';
import { MissionRoom, deskPose, faceAt } from './MissionRoom';
import { clamp, commas, num, OutText, P3, sm } from './parts';

// AftermathScene: "Nueve meses de trabajo, desaparecidos." The control room after the signal goes: the big screen is static,
// Pip puts his hands on his head, and the panel's 9 MESES is struck through on "desaparecidos" (the cost is saved for the
// close, CloseScene). The tone is loss, not horror (it was an uncrewed probe).
// It never sits still: the picture trembles on the cut and settles, the screen flickers, the number beats with the alarm.

export const AftermathScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const e = ef(t);
  const p = clamp(t / Math.max(0.01, dur));
  const perdieron = num(mark('perdieron'), dur - 0.6);
  const hands = sm((t - 0.2) / 0.5);
  const pose = deskPose({
    ...faceAt(e, [[0, 'shock'], [Math.round((perdieron - 0.2) * 30), 'worried']]),
    armL: { a: 20 + 140 * hands, b: 20 + 90 * hands },
    armR: { a: 20 + 140 * hands, b: 20 + 90 * hands },
    headTilt: -3 * hands + 2 * Math.sin(t * 2.3),
    look: 0,
  });
  // the total loss climbs fast to the full cost, then holds with an alarm blink
  const money = 125e6 * sm((t - 0.15) / 1.2);
  const full = money >= 125e6 - 1;
  const alarm = Math.floor(t * 4) % 2 === 0;
  // a tremor on the cut that settles into a slow breath, and a hit when the figure tops out
  const fullAt = 1.35;
  const amp = 12 * Math.exp(-t / 0.35) + 1.2 + (t > fullAt ? 8 * Math.exp(-(t - fullAt) / 0.25) : 0);
  const sx = (rand(f * 2 + 31) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 32) - 0.5) * 2 * amp;
  const beat = full ? 1 + 0.06 * Math.exp(-((t * 4) % 1) / 0.25) : 1 + 0.04 * Math.sin(t * 20);
  const flicker = 0.06 + 0.08 * rand(Math.floor(t * 12) + 5);
  const gone = t >= perdieron - 0.08;
  const strikeK = gone ? springAt(f, fps, perdieron - 0.08, HARD) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <CineCamera cx={960} cy={500} zoom={1.9 + 0.1 * p} tint="red" vignette={0.85} light={{ x: 960, y: 340, r: 520, color: P3.red, o: 0.18 + 0.08 * (alarm ? 1 : 0) }}>
          <MissionRoom t={t} signal={false} pose={pose} rim="red" />
        </CineCamera>
      </AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* the red alarm light washing the room */}
        <rect width={1080} height={1920} fill={P3.red} opacity={alarm ? 0.07 : 0.02} />
        {/* screen flicker lines */}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={0} y={Math.round(rand(i * 7 + Math.floor(t * 10)) * 1300 + 250)} width={1080} height={2 + rand(i + 3) * 3} fill="#FFFFFF" opacity={flicker} />
        ))}
        <g transform={`translate(540 470) scale(${beat}) translate(-540 -470)`}>
          <rect x={70} y={410} width={940} height={160} rx={26} fill="#1A0306" stroke={P3.red} strokeWidth={6} opacity={full ? (alarm ? 1 : 0.7) : 0.9} />
          {/* "Nueve meses de trabajo, desaparecidos": the months, then the word, glitching in (the cost is saved for the close) */}
          <g transform={`translate(${gone ? (rand(f + 77) - 0.5) * 18 * Math.exp(-(t - perdieron) / 0.2) : 0} 0)`} opacity={gone ? 0.75 + 0.25 * (alarm ? 1 : 0) : 1}>
            <OutText x={540} y={530} size={92} fill={gone ? P3.red : P3.white} text="9 MESES" stroke={12} />
            {gone ? <rect x={540 - 230 * clamp(strikeK)} y={482} width={460 * clamp(strikeK)} height={14} rx={7} fill="#FFFFFF" transform="rotate(-4 540 490)" /> : null}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
