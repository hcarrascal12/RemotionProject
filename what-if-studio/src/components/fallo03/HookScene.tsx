import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, HARD, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { commas, Mars, num, OutText, P3, Probe, sm, Stars } from './parts';

// The hook of Fallo #03 opens on the LOSS, not on the trip (variants "loss" and "count"):
//   loss    "Ciento veinticinco millones de dólares. Y se perdió por una unidad." Frame 0 is already an explosion: the
//           $125,000,000 bursts in at 1.25x and bounces to 1x, sparks fly out of it, the camera shakes, and the probe flies a
//           red dotted course straight into Mars. On "perdió" the number collapses to a neon-red $0 with a white flash, and on
//           "unidad" an impact stamp lands: ERROR: 1 LBF ≠ 1 N.
//   count   "Nueve meses viajando a Marte." The trip, as context: the months and the distance climbing.
// The last frame of the film is HookScene t=0 (variant "loss"), so the loop cuts invisibly.

const MARS = { x: 830, y: 1330, r: 150 };
/** Mars in the hook (and in the closing card, so the loop joins on the same planet). */
export const HOOK_MARS = { x: 900, y: 1470, r: 240 };
const BURST = Array.from({ length: 26 }, (_, i) => ({ a: (i / 26) * Math.PI * 2 + (i % 4) * 0.21, s: 0.7 + (i % 5) * 0.18, c: i % 3 }));
/** The opening zoom: frame 0 is 1.12x, it lands on 1x with a quick bounce. */
const ZOOM = { stiffness: 260, damping: 9, mass: 0.6 };

/** The red dotted course the probe flies on, straight into Mars. */
export const COURSE = `M 70 1090 Q 420 1110 ${HOOK_MARS.x - 120} ${HOOK_MARS.y - 140}`;
export const pathPoint = (u: number) => {
  const p0 = { x: 70, y: 1090 };
  const c = { x: 420, y: 1110 };
  const p1 = { x: HOOK_MARS.x - 120, y: HOOK_MARS.y - 140 };
  const q = 1 - u;
  return { x: q * q * p0.x + 2 * q * u * c.x + u * u * p1.x, y: q * q * p0.y + 2 * q * u * c.y + u * u * p1.y };
};

export const HookScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant, mark }) => {
  if (variant === 'count') return <TripScene t={t} f={f} fps={fps} dur={dur} mark={mark} />;
  const perdio = num(mark('perdio'), 2.2);
  const unidad = num(mark('unidad'), 3.0);
  const millones = num(mark('millones'), 1.0);
  const zk = springAt(f, fps, 0, ZOOM);
  const zoom = 1.12 - 0.12 * zk;
  const wipe = sm((t - perdio) / 0.6);
  const money = 125e6 * (1 - wipe);
  const lost = wipe >= 0.999;
  const lostK = lost ? springAt(f, fps, perdio + 0.6, HARD) : 0;
  const pulse = t > millones ? 1 + 0.07 * Math.exp(-(t - millones) / 0.22) : 1;
  const stampK = springAt(f, fps, unidad - 0.05, HARD);
  const flash = t >= perdio ? Math.max(0, 1 - (t - perdio) / 0.35) : 0;
  const strobe = blink(t, 0.3, 0.18);
  // camera shake: strong on frame 0 and on the collapse, a tremor in between
  const amp = 9 * Math.exp(-t / 0.5) + 2.5 + (t > perdio ? 16 * Math.exp(-(t - perdio) / 0.4) : 0);
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  // the probe flies the red course into Mars
  const u = 0.45 + 0.5 * sm(t / Math.max(1, dur));
  const pr = pathPoint(u);
  const ahead = pathPoint(Math.min(1, u + 0.02));
  const ang = (Math.atan2(ahead.y - pr.y, ahead.x - pr.x) * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="hk-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.red} stopOpacity={0.32} />
            <stop offset="100%" stopColor={P3.red} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <g transform={`translate(${sx} ${sy})`}>
          <circle cx={540} cy={800} r={900} fill="url(#hk-glow)" opacity={0.55 + 0.25 * (strobe ? 1 : 0)} />
          <Stars t={t} />
          <path d={COURSE} stroke={P3.red} strokeWidth={6} strokeDasharray="6 18" strokeDashoffset={-t * 140} fill="none" strokeLinecap="round" opacity={0.85} />
          <Mars cx={HOOK_MARS.x} cy={HOOK_MARS.y} r={HOOK_MARS.r} />
          <Probe x={pr.x} y={pr.y} s={0.95} rot={ang + 90} heat={0.55 + 0.35 * Math.sin(t * 9)} />
          {/* the cost bursts in: zoom with a bounce, sparks flying out of it */}
          {BURST.map((b, i) => {
            const age = (t * 1.3 * b.s + i * 0.137) % 1;
            const r0 = 120 + 520 * age;
            return <circle key={i} cx={540 + Math.cos(b.a) * r0 * 1.2} cy={760 + Math.sin(b.a) * r0 * 0.75} r={10 * (1 - age)} fill={b.c === 0 ? P3.red : b.c === 1 ? '#FB923C' : P3.yellow} opacity={1 - age} />;
          })}
          <OutText x={540} y={560} size={36} fill={P3.yellow} text="COSTO DE LA SONDA" mono />
          <g transform={`translate(540 760) scale(${zoom * pulse * (lost ? 0.8 + 0.2 * Math.min(1.15, lostK) : 1)})`}>
            {lost ? <OutText x={0} y={0} size={240} fill="none" text="$0" stroke={46} opacity={0.35} /> : null}
            <OutText x={0} y={0} size={lost ? 240 : 112} fill={lost ? '#FF3B4D' : P3.yellow} text={lost ? '$0' : `$${commas(money)}`} stroke={lost ? 18 : 13} />
          </g>
          {lost ? <OutText x={540} y={880} size={40} fill={P3.white} text="PERDIDOS" mono /> : null}
        </g>
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={0.5 * flash} />
        <Stamp k={stampK} x={540} y={1060} label="ERROR: 1 LBF ≠ 1 N" sub="LIBRAS LEÍDAS COMO NEWTONS" color={P3.red} w={920} size={88} />
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
        <path d={`M 130 1480 Q 420 1330 ${MARS.x - 150} 1330`} stroke={P3.blue} strokeWidth={4} strokeDasharray="4 16" strokeDashoffset={-t * 60} fill="none" opacity={0.55} strokeLinecap="round" />
        <Mars cx={MARS.x} cy={MARS.y} r={MARS.r} />
        <Probe x={px} y={py} s={0.62} rot={-12 + 10 * u} />
      </svg>
    </AbsoluteFill>
  );
};
