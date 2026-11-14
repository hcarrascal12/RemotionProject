import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, HARD, HEAVY, ShotProps, springAt } from '../motion';
import { Strip } from '../fallo02/parts';
import { commas, Mars, num, OutText, P3, Probe, sm, Stars } from './parts';

// The hook of Fallo #03 opens on the LOSS, not on the trip (variants "loss" and "count"):
//   loss    "Ciento veinticinco millones de dólares. Y se perdió por una unidad." Frame 0 is already the emergency: the probe
//           tumbling off course, glowing red, over a big $125,000,000 that is wiped to $0 on "perdió", and a red alert on "unidad".
//   count   "Nueve meses viajando a Marte." The trip, as context: the months and the distance climbing.
// The last frame of the film is HookScene t=0 (variant "loss"), so the loop cuts invisibly.

const MARS = { x: 830, y: 1330, r: 150 };
const SPARKS = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2 + (i % 3) * 0.3, s: 0.6 + (i % 5) * 0.2 }));

export const HookScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant, mark }) => {
  if (variant === 'count') return <TripScene t={t} f={f} fps={fps} dur={dur} mark={mark} />;
  const perdio = num(mark('perdio'), 2.2);
  const unidad = num(mark('unidad'), 3.0);
  const millones = num(mark('millones'), 1.0);
  const wipe = sm((t - perdio) / 0.9);
  const money = 125e6 * (1 - wipe);
  const pulse = t > millones ? 1 + 0.07 * Math.exp(-(t - millones) / 0.22) : 1;
  const hit = t >= unidad;
  const flash = hit ? Math.max(0, 1 - (t - unidad) / 0.5) : 0;
  const strobe = blink(t, 0.3, 0.18);
  const lost = wipe >= 0.999;
  const shake = lost ? 0 : t > perdio ? 14 * Math.sin(t * 90) : 3 * Math.sin(t * 40) * (t > millones ? 1 : 0.5);
  // the probe: off course, spinning, glowing, drifting away from the planet
  const px = 520 - 28 * t + 18 * Math.sin(t * 5);
  const py = 1260 - 18 * t + 14 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="hk-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.red} stopOpacity={0.3} />
            <stop offset="100%" stopColor={P3.red} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <circle cx={540} cy={860} r={900} fill="url(#hk-glow)" opacity={0.55 + 0.25 * (strobe ? 1 : 0)} />
        <Stars t={t} />
        {/* the cost: the one thing to read */}
        <OutText x={540} y={560} size={36} fill={P3.yellow} text="COSTO DE LA SONDA" mono />
        <g transform={`translate(${540 + shake} 760) scale(${pulse})`}>
          <OutText x={0} y={0} size={lost ? 190 : 122} fill={lost ? P3.red : P3.yellow} text={`$${commas(money)}`} stroke={14} />
        </g>
        {lost ? <OutText x={540} y={870} size={40} fill={P3.white} text="PERDIDOS" mono /> : null}
        {/* the lost probe */}
        <path d={`M 130 1480 Q 420 1330 ${MARS.x - 150} 1330`} stroke={P3.blue} strokeWidth={4} strokeDasharray="4 16" fill="none" opacity={0.5} strokeLinecap="round" />
        <Mars cx={MARS.x + 60} cy={MARS.y + 130} r={230} />
        {/* sparks off the tumbling probe */}
        {SPARKS.map((sp, i) => {
          const age = (t * 1.6 * sp.s + i * 0.23) % 1;
          return <circle key={i} cx={px + Math.cos(sp.a + t * 2) * (60 + 260 * age)} cy={py + Math.sin(sp.a + t * 2) * (60 + 260 * age)} r={9 * (1 - age)} fill={i % 2 ? P3.yellow : '#FB923C'} opacity={1 - age} />;
        })}
        <Probe x={px} y={py} s={1.25} rot={30 + t * 150} heat={0.7 + 0.3 * Math.sin(t * 9)} />
        <rect width={1080} height={1920} fill={P3.red} opacity={0.08 + 0.2 * flash} />
        {hit ? <Strip x={110} y={1005} w={860} text="ERROR: UNIDADES" t={t} size={60} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** "Nueve meses viajando a Marte": the months and the distance, the trip before the problem. */
const TripScene: React.FC<{ t: number; f: number; fps: number; dur: number; mark: ShotProps['mark'] }> = ({ t, f, fps, dur, mark }) => {
  const a1end = num(mark('a1end'), 2.0);
  const pd = sm(t / Math.max(1, a1end + 0.2));
  const months = Math.max(1, Math.round(9 * pd));
  const k = springAt(f, fps, 0.1, HARD);
  const u = 0.82 * sm(t / Math.max(1, dur));
  const px = 110 + (MARS.x - 150 - 110) * u;
  const py = 1480 - 150 * sm(u) - 20 * Math.sin(u * Math.PI);
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="tr-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.blue} stopOpacity={0.16} />
            <stop offset="100%" stopColor={P3.blue} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <circle cx={540} cy={860} r={900} fill="url(#tr-glow)" />
        <Stars t={t} />
        <OutText x={540} y={540} size={34} fill={P3.blue} text="TIEMPO DE VIAJE" mono />
        <g transform={`translate(540 700) scale(${0.8 + 0.2 * Math.min(1.1, k)})`}>
          <OutText x={0} y={0} size={140} fill={P3.white} text={`${months} ${months === 1 ? 'MES' : 'MESES'}`} stroke={14} />
        </g>
        <OutText x={540} y={830} size={64} fill={P3.blue} text={`${commas(670e6 * pd)} KM`} stroke={10} />
        <path d={`M 130 1480 Q 420 1330 ${MARS.x - 150} 1330`} stroke={P3.blue} strokeWidth={4} strokeDasharray="4 16" fill="none" opacity={0.55} strokeLinecap="round" />
        <Mars cx={MARS.x} cy={MARS.y} r={MARS.r} />
        <Probe x={px} y={py} s={0.62} rot={-12 + 10 * u} />
      </svg>
    </AbsoluteFill>
  );
};
