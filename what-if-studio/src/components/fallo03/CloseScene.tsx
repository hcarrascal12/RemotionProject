import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, lin, rand, ShotProps, springAt } from '../motion';
import { Bill, BurningProbe, HookScene, MarsLimb, U0, USPEED } from './HookScene';
import { clamp, num, OutText, P3, Stars } from './parts';

// CloseScene: the cost, saved for the end. "Ciento veinticinco millones de dólares."
//   The figure slams in over the Martian limb while the banknotes rain down and burn up in the atmosphere; at the end of the
//   line it turns red and is struck through: PERDIDOS. Then the telemetry strip (SIN SEÑAL · PERDIDA A 57 KM · FALLO #03)
//   while the burning probe streaks down the hook's line and reaches, on the last frame, the spot it holds on frame 0. The
//   picture hands over to HookScene t=0 in the last 0.32 s, and the voice loops into "Se perdió por una unidad".

export const CloseScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const a2 = num(mark('a2'), 0.1);
  const millones = num(mark('millones'), 1.1);
  const a2end = num(mark('a2end'), 2.3);
  const mk = springAt(f, fps, a2 - 0.05, HARD);
  const pulse = t > millones ? 1 + 0.08 * Math.exp(-(t - millones) / 0.22) : 1;
  const struck = t >= a2end - 0.3;
  const strikeK = struck ? springAt(f, fps, a2end - 0.3, HARD) : 0;
  const stripK = springAt(f, fps, a2end + 0.1, HARD);
  const slamFlash = Math.max(0, 1 - (t - a2 + 0.05) / 0.25) * (t >= a2 - 0.05 ? 0.5 : 0);
  // a shake on the slam and on the strike
  const amp = (t >= a2 - 0.05 ? 16 * Math.exp(-(t - a2 + 0.05) / 0.3) : 0) + (struck ? 10 * Math.exp(-(t - a2end + 0.3) / 0.25) : 0) + 1.5;
  const sx = (rand(f * 2 + 51) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 52) - 0.5) * 2 * amp;
  // the probe: off-screen until the last ~1.6 s, then down the line to frame 0's spot
  const u = U0 - USPEED * Math.max(0, dur - t);
  const handoff = lin(t, dur - 0.32, dur - 0.04);
  const blinkOn = Math.floor(t * 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg2} />
        <g transform={`translate(${sx} ${sy})`}>
          <Stars t={t * 3} />
          <MarsLimb t={t} glow={1.2} />
          {/* the money rains and burns */}
          {Array.from({ length: 18 }, (_, i) => (
            <Bill key={i} i={i} t={t - a2 + 0.1} />
          ))}
          <g transform={`translate(540 600) scale(${(1.9 - 0.9 * Math.min(1.06, mk)) * pulse})`} opacity={clamp(mk * 2)}>
            <OutText x={0} y={0} size={124} fill={struck ? '#FF3B4D' : P3.yellow} text="$125,000,000" stroke={14} />
            {struck ? <rect x={-470 * clamp(strikeK)} y={-52} width={940 * clamp(strikeK)} height={16} rx={8} fill="#FFFFFF" transform="rotate(-4)" /> : null}
          </g>
          {struck ? <OutText x={540} y={700} size={46} fill={P3.white} text="PERDIDOS" mono opacity={clamp(strikeK * 2)} /> : null}
          {/* the telemetry strip */}
          {stripK > 0.01 ? (
            <g transform={`translate(540 860) scale(${0.7 + 0.3 * Math.min(1.08, stripK)})`} opacity={clamp(stripK * 1.6)}>
              <rect x={-450} y={-82} width={900} height={164} rx={24} fill="#06101F" stroke={P3.blue} strokeWidth={5} />
              <circle cx={-395} cy={-30} r={12} fill={blinkOn ? P3.red : '#5A1010'} />
              <OutText x={-370} y={-20} size={28} fill={blinkOn ? P3.red : '#9B2A2A'} text="SIN SEÑAL" anchor="start" mono />
              <OutText x={400} y={-20} size={28} fill={P3.yellow} text="FALLO #03" anchor="end" mono />
              <OutText x={0} y={52} size={64} fill={P3.red} text="PERDIDA A 57 KM" stroke={10} />
            </g>
          ) : null}
          {u > -0.15 ? <BurningProbe u={u} t={t} heat={0.9} id="close" /> : null}
        </g>
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={slamFlash} />
      </svg>
      {/* the last frame IS frame 0 of the hook, so the loop cuts invisibly */}
      {handoff > 0.001 ? (
        <AbsoluteFill style={{ opacity: handoff }}>
          <HookScene t={0} f={0} fps={fps} dur={1} variant="loss" mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
