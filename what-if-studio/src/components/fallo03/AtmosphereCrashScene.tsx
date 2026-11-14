import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, rand, ShotProps, springAt } from '../motion';
import { Strip } from '../fallo02/parts';
import { clamp, num, OutText, P3, Probe, sm, Stars } from './parts';

// AtmosphereCrashScene ("dive"): the altitude. The green dotted line is the safe orbit at 150 km; at "57" the real path drops
// away from it, the probe heats up red, and at "señal perdida" the picture cuts to static and NO SIGNAL.
// What happened to the probe after the pass is not known, so the picture shows the signal going, nothing more.

const Y150 = 760;
const Y57 = 1010;
const SURFACE = 1150;

export const AtmosphereCrashScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const km150 = num(mark('km150'), 0.5);
  const km57 = num(mark('km57'), 3.0);
  const lost = num(mark('perdida'), dur - 1.2);
  const k150 = springAt(f, fps, km150 - 0.05, HARD);
  const k57 = springAt(f, fps, km57 - 0.05, HARD);
  // the probe: along the safe path until "57", then down the real one
  const a = clamp(t / Math.max(0.5, km57)); // 0..1 before the drop
  const d = clamp((t - km57) / Math.max(0.5, lost - km57)); // 0..1 during the drop
  const sx = -60 + 520 * a + 360 * sm(d);
  const nominalY = 690 + 70 * sm(a);
  const sy = nominalY + (Y57 + 40 - nominalY) * sm(d) * sm(d);
  const heat = clamp(d * 1.4);
  const rot = 8 + 40 * sm(d);
  const cut = t >= lost;
  const cd = (t - lost) * fps;
  const alt = t < km57 ? 150 : Math.max(57, 150 - 93 * sm((t - km57) / 0.9));
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="atm-g" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#F97316" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <Stars t={t} n={50} />
        {/* the planet's limb and its atmosphere */}
        <circle cx={540} cy={SURFACE + 1000} r={1090} fill="url(#atm-g)" opacity={0.7} />
        <circle cx={540} cy={SURFACE + 1000} r={1000} fill="#9A3412" />
        <circle cx={540} cy={SURFACE + 1000} r={1000} fill="none" stroke="#FDBA74" strokeWidth={4} opacity={0.6} />
        {/* the altitude readout */}
        <OutText x={540} y={470} size={32} fill={P3.blue} text="ALTITUD" mono />
        <OutText x={540} y={585} size={cut ? 100 : 130} fill={cut ? P3.steel : alt < 140 ? P3.red : P3.white} text={cut ? '--- KM' : `${Math.round(alt)} KM`} />
        {/* the safe orbit */}
        <line x1={0} y1={Y150} x2={1080} y2={Y150} stroke={P3.green} strokeWidth={5} strokeDasharray="6 18" strokeLinecap="round" opacity={Math.min(1, k150)} />
        <OutText x={960} y={Y150 - 22} size={30} fill={P3.green} text="150 KM" anchor="end" opacity={Math.min(1, k150)} />
        {/* the real path */}
        {k57 > 0.01 ? (
          <g opacity={Math.min(1, k57)}>
            <line x1={0} y1={Y57} x2={1080} y2={Y57} stroke={P3.red} strokeWidth={5} strokeDasharray="6 18" strokeLinecap="round" />
            <OutText x={960} y={Y57 - 22} size={34} fill={P3.red} text="57 KM" anchor="end" />
            <path d={`M 500 ${nominalY + 6} Q 650 ${nominalY + 20} 820 ${Y57 + 40}`} stroke={P3.red} strokeWidth={4} fill="none" strokeDasharray="3 10" strokeLinecap="round" opacity={0.8} />
          </g>
        ) : null}
        {!cut ? <Probe x={sx} y={sy} s={0.5} rot={rot} heat={heat} /> : null}
        {/* the cut: static and NO SIGNAL */}
        {cut ? (
          <g>
            <rect width={1080} height={1920} fill={cd < 2 ? '#FFFFFF' : '#05070C'} />
            {cd >= 2
              ? Array.from({ length: 70 }, (_, i) => (
                  <rect key={i} x={rand(i + Math.floor(t * 20) * 5) * 1080} y={rand(i * 3 + Math.floor(t * 20)) * 1920} width={60 + rand(i + 7) * 260} height={3 + rand(i + 2) * 4} fill="#E2E8F0" opacity={0.18 + 0.3 * rand(i + 9)} />
                ))
              : null}
            {cd >= 2 ? <Strip x={110} y={880} w={860} text="NO SIGNAL" t={t} size={64} /> : null}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
