import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, HARD, HEAVY, ShotProps, springAt } from '../motion';
import { Strip } from '../fallo02/parts';
import { commas, Mars, num, OutText, P3, Probe, sm, Stars } from './parts';

// The hook (variants "count" and "alert"): frame 0 is already moving. The distance counter climbs to 670,000,000 km and the cost
// to $125,000,000 while the probe flies toward Mars; at "unidad" the picture flashes and a red alert says what went wrong.
//   count   from 0 s to the third phrase
//   alert   the third phrase: same layout, numbers locked, the probe at the planet, the alert
// The last frame of the film is HookScene t=0 (variant "count"), so the loop cuts invisibly.

const MARS = { x: 800, y: 1100, r: 150 };

export const HookScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant, mark }) => {
  const alert = variant === 'alert';
  const a1end = num(mark('a1end'), 2.4);
  const millones = num(mark('millones'), 3.4);
  const unidad = num(mark('unidad'), 1.4);
  // the numbers: both count up from frame 0; the cost locks on "millones"
  const pd = alert ? 1 : sm((t + 0.001) / (a1end + 0.35));
  const pm = alert ? 1 : sm((t - 0.35) / Math.max(0.5, millones + 0.2 - 0.35));
  const lockK = alert ? 1 : springAt(f, fps, millones + 0.05, HARD);
  const moneyDone = pm >= 0.999;
  // the probe: 0 to 0.82 of the journey during the count shot, then on to the planet during the alert
  const u = alert ? 0.82 + 0.18 * sm(t / Math.max(0.3, unidad + 0.2)) : 0.82 * sm(t / Math.max(1, dur));
  const px = 110 + (MARS.x - 150 - 110) * u;
  const py = 1270 - 190 * sm(u) - 20 * Math.sin(u * Math.PI);
  const hit = alert && t >= unidad;
  const flash = hit ? Math.max(0, 1 - (t - unidad) / 0.5) : 0;
  const strobe = hit && blink(t, 0.3, 0.18);
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="hk-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.blue} stopOpacity={0.16} />
            <stop offset="100%" stopColor={P3.blue} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <circle cx={540} cy={820} r={900} fill="url(#hk-glow)" />
        <Stars t={t} />
        {/* distance */}
        <OutText x={540} y={480} size={34} fill={P3.blue} text="DISTANCIA RECORRIDA" mono />
        <text x={540} y={590} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill={P3.white} stroke="#000" strokeWidth={12} strokeLinejoin="round" paintOrder="stroke">
          {commas(670e6 * pd)}
          <tspan fontSize={50} fill={P3.blue} dx={14}>KM</tspan>
        </text>
        {/* cost */}
        <OutText x={540} y={715} size={34} fill={P3.yellow} text="COSTO DE LA SONDA" mono />
        <g transform={`translate(540 835) scale(${moneyDone ? 1 + 0.08 * Math.max(0, 1 - lockK) : 1})`}>
          <OutText x={0} y={0} size={118} fill={P3.yellow} text={`$${commas(125e6 * pm)}`} />
        </g>
        {/* the journey */}
        <path d={`M 110 1270 Q 430 1090 ${MARS.x - 150} 1100`} stroke={P3.blue} strokeWidth={4} strokeDasharray="4 16" fill="none" opacity={0.55} strokeLinecap="round" />
        <Mars cx={MARS.x} cy={MARS.y} r={MARS.r} />
        <Probe x={px} y={py} s={0.62} rot={-12 + 10 * u} heat={hit ? 0.5 : 0} />
        {/* the alert at "unidad" */}
        {hit ? (
          <g>
            <rect width={1080} height={1920} fill={P3.red} opacity={0.1 + 0.25 * flash + (strobe ? 0.07 : 0)} />
            <Strip x={110} y={900} w={860} text="ERROR: UNIDADES" t={t} size={56} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
