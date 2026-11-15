import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, lin, rand, ShotProps, springAt } from '../motion';
import { BurningProbe, HookScene, MarsLimb, U0, USPEED } from './HookScene';
import { clamp, OutText, P3, Stars } from './parts';

// CloseScene: the last beat, right after "¿Del software o de quien no lo revisó?" (no voice here, music only).
//   The signal is gone: the picture glitches to static and the telemetry strip reads SIN SEÑAL · PERDIDA A 57 KM. Over it
//   the one ask of the film, MÁNDASELO A ALGUIEN QUE REVISA TODO DOS VECES (drawn by Fallo03's ShareCta on ctaIn..ctaOut).
//   Meanwhile the burning probe streaks down the hook's line and reaches, on the last frame, the spot it holds on frame 0;
//   the picture hands over to HookScene t=0 in the last 0.32 s, and the voice loops into "Ciento veinticinco millones".

export const CloseScene: React.FC<ShotProps> = ({ t, f, fps, dur }) => {
  const stripK = springAt(f, fps, 0.05, HARD);
  // the glitch: hard on the cut, then it keeps flickering
  const hard = Math.max(0, 1 - t / 0.35);
  const bands = Array.from({ length: 9 }, (_, i) => {
    const seed = i * 13 + Math.floor(t * 12);
    return { y: rand(seed) * 1920, h: 6 + rand(seed + 1) * (30 + 90 * hard), o: (0.08 + 0.25 * rand(seed + 2)) * (0.4 + hard), c: i % 3 === 0 ? P3.red : i % 3 === 1 ? P3.blue : '#E2E8F0' };
  });
  const amp = 14 * hard + 1.5;
  const sx = (rand(f * 2 + 61) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 62) - 0.5) * 2 * amp;
  const u = U0 - USPEED * Math.max(0, dur - t);
  const handoff = lin(t, dur - 0.32, dur - 0.04);
  const blinkOn = Math.floor(t * 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg2} />
        <g transform={`translate(${sx} ${sy})`}>
          <Stars t={t * 3} />
          <MarsLimb t={t} />
          <BurningProbe u={u} t={t} heat={0.9} id="close" />
          {/* the telemetry strip */}
          <g transform={`translate(540 360) scale(${0.7 + 0.3 * Math.min(1.08, stripK)})`} opacity={clamp(stripK * 1.6)}>
            <rect x={-450} y={-82} width={900} height={164} rx={24} fill="#06101F" stroke={P3.red} strokeWidth={5} />
            <circle cx={-395} cy={-30} r={12} fill={blinkOn ? P3.red : '#5A1010'} />
            <OutText x={-370} y={-20} size={28} fill={blinkOn ? P3.red : '#9B2A2A'} text="SIN SEÑAL" anchor="start" mono />
            <OutText x={400} y={-20} size={28} fill={P3.yellow} text="FALLO #03" anchor="end" mono />
            <OutText x={0} y={52} size={64} fill={P3.red} text="PERDIDA A 57 KM" stroke={10} />
          </g>
        </g>
        {bands.map((b, i) => (
          <rect key={i} x={0} y={b.y} width={1080} height={b.h} fill={b.c} opacity={b.o} />
        ))}
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={0.35 * Math.max(0, 1 - t / 0.15)} />
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
