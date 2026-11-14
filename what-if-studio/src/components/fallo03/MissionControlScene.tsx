import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CineCamera, ef } from '../CineCamera';
import { HARD, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { MissionRoom, deskPose, faceAt } from './MissionRoom';
import { OutText, P3, clamp, num } from './parts';

// MissionControlScene: the control room at NASA on 23 September 1999.
//   room     Pip at the console under the big screen; the date stamps in
//   screen   the push-in on the big screen while the probe is about to enter orbit: a countdown to the arrival

export const MissionControlScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant, mark }) => {
  const e = ef(t);
  const p = clamp(t / Math.max(0.01, dur));
  const screen = variant === 'screen';
  const sept = num(mark('sept'), 0.1);
  const orbita = num(mark('orbita'), 1.6);
  const pose = deskPose({ ...faceAt(e, [[0, 'worried']]), headTilt: 3 * Math.sin(t * 1.2), look: -0.2 });
  const k = springAt(f, fps, sept + 0.15, HARD);
  // the countdown to the orbit insertion: from 04:00 to 00:00 over the shot
  const secs = Math.max(0, Math.round(240 * (1 - clamp(p * 1.15))));
  const cd = `00:0${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill>
      <CineCamera
        cx={screen ? 960 : 960}
        cy={screen ? 370 - 10 * p : 470}
        zoom={screen ? 1.9 + 0.12 * p : 1.9 + 0.12 * p}
        tint="blue"
        vignette={0.75}
        light={{ x: 960, y: 340, r: 520, color: P3.blue, o: 0.35 }}
      >
        <MissionRoom t={t} signal pose={pose} showPip={!screen} />
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {screen ? (
          <g>
            <OutText x={540} y={425} size={30} fill={P3.blue} text="ENTRADA EN ÓRBITA EN" mono />
            <OutText x={540} y={525} size={92} fill={orbita - t < 0.5 ? P3.red : P3.white} text={cd} />
          </g>
        ) : (
          <Stamp k={k} x={540} y={450} label="23 SEPT 1999" sub="CONTROL DE MISIÓN, NASA" color={P3.yellow} w={760} size={92} rot={-3} />
        )}
      </svg>
    </AbsoluteFill>
  );
};
