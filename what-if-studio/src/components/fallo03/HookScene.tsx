import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { clamp, commas, Mars, num, OutText, P3, Probe, sm, Stars } from './parts';

// The hook of Fallo #03 (variants "loss" and "count"):
//   loss    "Se perdió por una unidad. Ciento veinticinco millones de dólares."
//           Frame 0 is already the catastrophe: the probe streaks into the Martian atmosphere like a meteor, on fire, the camera
//           shaking. On "perdió" a solar panel tears off. On "unidad" the picture FREEZES: it drains to grey, the camera punches
//           in on the probe, a red ring circles it and the stamp lands: ERROR: 1 LBF ≠ 1 N. On "Ciento veinticinco millones" it
//           unfreezes with a bang: the probe bursts into a fireball on the horizon while $125,000,000 slams in and the banknotes
//           rain down and burn up in the atmosphere. At the end of the line the figure turns red and is struck through: PERDIDOS.
//   count   "Nueve meses viajando a Marte." The trip, as context: the months and the distance climbing.
// The last frame of the film is HookScene t=0 (variant "loss"), and the closing card flies the same probe down the same line,
// so the loop joins in mid-flight.

const MARS = { x: 830, y: 1330, r: 150 };
/** The Martian limb: a huge planet whose horizon crosses the lower third. */
export const LIMB = { cx: 540, cy: 2580, r: 1400 };
/** The meteor line: the probe enters from the upper left and hits the atmosphere right of centre. */
const P0 = { x: -120, y: 300 };
const P1 = { x: 720, y: 1230 };
export const meteorPoint = (u: number) => ({ x: P0.x + (P1.x - P0.x) * u, y: P0.y + (P1.y - P0.y) * u });
export const METEOR_ANGLE = (Math.atan2(P1.y - P0.y, P1.x - P0.x) * 180) / Math.PI;
/** Where the probe is on frame 0 (and on the last frame of the film). */
export const U0 = 0.6;
/** How fast it travels along the line, per second. */
export const USPEED = 0.36;

export const MarsLimb: React.FC<{ t: number; glow?: number }> = ({ t, glow = 1 }) => (
  <g>
    <defs>
      <radialGradient id="limb-atm" cx="50%" cy="50%" r="50%">
        <stop offset="88%" stopColor="#F97316" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="limb-body" cx="50%" cy="0%" r="70%">
        <stop offset="0%" stopColor="#C2410C" />
        <stop offset="100%" stopColor="#431407" />
      </radialGradient>
    </defs>
    <circle cx={LIMB.cx} cy={LIMB.cy} r={LIMB.r + 110} fill="url(#limb-atm)" opacity={(0.75 + 0.1 * Math.sin(t * 3)) * glow} />
    <circle cx={LIMB.cx} cy={LIMB.cy} r={LIMB.r} fill="url(#limb-body)" />
    {/* craters drifting slowly: the planet turns under us */}
    {[0, 1, 2, 3, 4].map((i) => {
      const x = ((i * 260 + 140 - t * 14) % 1300) - 110;
      return <ellipse key={i} cx={x} cy={1262 + (i % 2) * 70 + Math.abs(x - 540) * 0.06} rx={70 + (i % 3) * 30} ry={14 + (i % 2) * 6} fill="#7C2D12" opacity={0.5} />;
    })}
    <circle cx={LIMB.cx} cy={LIMB.cy} r={LIMB.r} fill="none" stroke="#FDBA74" strokeWidth={5} opacity={0.65} />
  </g>
);

/** The probe on fire: a long plasma tail back along the line, sparks shed behind it, the craft tumbling. */
export const BurningProbe: React.FC<{ u: number; t: number; heat?: number; panel?: number; id: string }> = ({ u, t, heat = 1, panel = 0, id }) => {
  const p = meteorPoint(u);
  const a = (METEOR_ANGLE * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const L = 560 + 40 * Math.sin(t * 17);
  const W = 64 + 10 * Math.sin(t * 23);
  const tail = { x: p.x - dx * L, y: p.y - dy * L };
  const nx = -dy;
  const ny = dx;
  const poly = (w: number, l: number) =>
    `${p.x + nx * w} ${p.y + ny * w} ${p.x - dx * l} ${p.y - dy * l} ${p.x - nx * w} ${p.y - ny * w} ${p.x + dx * w * 0.6} ${p.y + dy * w * 0.6}`;
  return (
    <g>
      <defs>
        <linearGradient id={`trail-${id}`} gradientUnits="userSpaceOnUse" x1={p.x} y1={p.y} x2={tail.x} y2={tail.y}>
          <stop offset="0%" stopColor="#FFF7D6" stopOpacity={1} />
          <stop offset="25%" stopColor="#FDBA74" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#EF4444" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={poly(W * 2.2, L * 1.1)} fill={`url(#trail-${id})`} opacity={0.35 * heat} />
      <polygon points={poly(W, L)} fill={`url(#trail-${id})`} opacity={heat} />
      {Array.from({ length: 28 }, (_, i) => {
        const age = (t * 2.6 + i / 28) % 1;
        const side = (rand(i + 70) - 0.5) * 2;
        const back = 40 + 520 * age;
        const spread = side * (20 + 120 * age);
        return (
          <circle key={i} cx={p.x - dx * back + nx * spread} cy={p.y - dy * back + ny * spread} r={7 * (1 - age) + 1} fill={i % 3 === 0 ? P3.yellow : i % 3 === 1 ? '#FB923C' : '#FFF7D6'} opacity={(1 - age) * heat} />
        );
      })}
      <circle cx={p.x} cy={p.y} r={95 + 12 * Math.sin(t * 19)} fill="#FDBA74" opacity={0.28 * heat} />
      <Probe x={p.x} y={p.y} s={0.8} rot={METEOR_ANGLE + 90 + 22 * Math.sin(t * 5) + t * 30} heat={heat} />
      {/* the panel that tore off, spinning away */}
      {panel > 0 ? (
        <g transform={`translate(${p.x + nx * 60 * panel * 3 - dx * 140 * panel} ${p.y + ny * 60 * panel * 3 - dy * 140 * panel}) rotate(${panel * 540})`} opacity={clamp(1.4 - panel)}>
          <rect x={-40} y={-24} width={80} height={48} fill="#1D4ED8" stroke="#FDBA74" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

/** A falling banknote, burning up as it reaches the atmosphere. */
const Bill: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const sp = 520 + rand(i + 3) * 380;
  const x0 = 60 + rand(i + 11) * 960;
  const y = -120 + ((t - rand(i + 5) * 0.5) * sp);
  if (y < -140) return null;
  const burn = clamp((y - 980) / 200);
  if (burn >= 1) return null;
  const x = x0 + 40 * Math.sin(t * 3 + i);
  const r = (i % 2 ? 1 : -1) * (t * 220 + i * 37);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${1 - 0.6 * burn})`}>
      <rect x={-56} y={-28} width={112} height={56} rx={6} fill={burn > 0.05 ? '#FB923C' : '#16A34A'} stroke="#052E16" strokeWidth={4} />
      <circle r={16} fill="none" stroke={burn > 0.05 ? '#FDE68A' : '#BBF7D0'} strokeWidth={4} />
      <text y={9} textAnchor="middle" fontSize={24} fontWeight={900} fill={burn > 0.05 ? '#FDE68A' : '#BBF7D0'}>$</text>
      {burn > 0.05 ? <circle r={70 * burn} fill="#FDBA74" opacity={0.6 * (1 - burn)} /> : null}
    </g>
  );
};

export const HookScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant, mark }) => {
  if (variant === 'count') return <TripScene t={t} f={f} fps={fps} dur={dur} mark={mark} />;
  const perdio = num(mark('perdio'), 0.22);
  const unidad = num(mark('unidad'), 0.83);
  const a2 = num(mark('a2'), 1.57);
  const millones = num(mark('millones'), 2.56);
  const a2end = num(mark('a2end'), 3.72);
  // the freeze: from "unidad" until the cost starts; time stands still in it
  const fr0 = unidad - 0.03;
  const fr1 = Math.max(fr0 + 0.3, a2 - 0.08);
  const frozen = t >= fr0 && t < fr1;
  const tv = t < fr0 ? t : t < fr1 ? fr0 : t - (fr1 - fr0);
  // the probe: down the line until the freeze, then it hits the atmosphere and bursts
  const uHit = U0 + USPEED * fr0 + 0.08;
  const u = Math.min(uHit, U0 + USPEED * tv + (t >= fr1 ? 0.3 * (t - fr1) : 0));
  const boomAt = fr1 + 0.18;
  const exploded = t >= boomAt;
  const boom = exploded ? clamp((t - boomAt) / 1.1) : 0;
  const pr = meteorPoint(u);
  const panel = tv > perdio ? clamp((tv - perdio) / 1.2) : 0;
  // camera shake: strong on frame 0, on "perdió" and on the burst; none in the freeze
  const amp = frozen ? 0 : 10 * Math.exp(-t / 0.5) + 3 + (tv > perdio ? 14 * Math.exp(-(tv - perdio) / 0.35) : 0) + (exploded ? 22 * Math.exp(-(t - boomAt) / 0.35) : 0);
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  // the punch-in on the frozen probe, and back out on the unfreeze
  const zIn = t >= fr0 ? springAt(f, fps, fr0, { stiffness: 320, damping: 22, mass: 0.6 }) : 0;
  const zOut = t >= fr1 ? springAt(f, fps, fr1, { stiffness: 260, damping: 16, mass: 0.6 }) : 0;
  const zk = clamp(zIn) * (1 - clamp(zOut));
  const Z = 1 + 0.75 * zk;
  const cx = pr.x + (540 - pr.x) * zk;
  const cy = pr.y + (820 - pr.y) * zk;
  const ring = frozen ? clamp((t - fr0) / 0.22) : 0;
  const stampK = springAt(f, fps, fr0 + 0.04, HARD);
  // the cost
  const mk = t >= fr1 ? springAt(f, fps, fr1, HARD) : 0;
  const pulse = t > millones ? 1 + 0.08 * Math.exp(-(t - millones) / 0.22) : 1;
  const struck = t >= a2end - 0.3;
  const strikeK = struck ? springAt(f, fps, a2end - 0.3, HARD) : 0;
  const unfreezeFlash = t >= fr1 ? Math.max(0, 1 - (t - fr1) / 0.3) : 0;
  const perdioFlash = t >= perdio && t < fr0 ? Math.max(0, 1 - (t - perdio) / 0.2) * 0.3 : 0;
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="hk-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.red} stopOpacity={0.3} />
            <stop offset="100%" stopColor={P3.red} stopOpacity={0} />
          </radialGradient>
          <filter id="hk-freeze">
            <feColorMatrix type="saturate" values="0.08" />
          </filter>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <g filter={frozen ? 'url(#hk-freeze)' : undefined}>
          <g transform={`translate(${sx} ${sy}) translate(${cx} ${cy}) scale(${Z}) translate(${-pr.x} ${-pr.y})`}>
            <circle cx={540} cy={900} r={1000} fill="url(#hk-glow)" opacity={0.6 + 0.25 * Math.sin(tv * 9)} />
            <Stars t={tv * 4} />
            <MarsLimb t={tv} glow={1 + 0.6 * (1 - boom) * (exploded ? 1 : 0)} />
            {!exploded ? <BurningProbe u={u} t={tv} heat={0.75 + 0.25 * Math.sin(tv * 11)} panel={panel} id="hk" /> : null}
            {/* the fireball on the horizon */}
            {exploded ? (
              <g>
                <circle cx={P1.x} cy={P1.y - 30} r={60 + 420 * sm(boom)} fill="#F97316" opacity={0.8 * (1 - boom)} />
                <circle cx={P1.x} cy={P1.y - 30} r={40 + 230 * sm(boom)} fill="#FDE68A" opacity={0.95 * (1 - boom)} />
                {Array.from({ length: 22 }, (_, i) => {
                  const ang = -Math.PI * (0.05 + 0.9 * rand(i + 90));
                  const r0 = 40 + 520 * sm(boom) * (0.5 + rand(i + 91));
                  return <rect key={i} x={P1.x + Math.cos(ang) * r0} y={P1.y - 30 + Math.sin(ang) * r0 + 260 * boom * boom} width={14} height={8} fill={i % 2 ? '#94A3B8' : '#FB923C'} opacity={1 - boom} transform={`rotate(${i * 40 + t * 400} ${P1.x + Math.cos(ang) * r0} ${P1.y - 30 + Math.sin(ang) * r0 + 260 * boom * boom})`} />;
                })}
              </g>
            ) : null}
            {/* the ring on the frozen probe */}
            {ring > 0 ? (
              <circle cx={pr.x} cy={pr.y} r={135} fill="none" stroke={P3.red} strokeWidth={9 / Z} strokeDasharray={`${848 * ring} 900`} transform={`rotate(-90 ${pr.x} ${pr.y})`} />
            ) : null}
          </g>
        </g>
        {/* the freeze-frame: darker edges and viewfinder corners */}
        {frozen ? (
          <g>
            <rect width={1080} height={1920} fill="#000" opacity={0.28} />
            {[
              [120, 300, 1, 1],
              [960, 300, -1, 1],
              [120, 1300, 1, -1],
              [960, 1300, -1, -1],
            ].map(([x, y, a, b], i) => (
              <path key={i} d={`M ${x} ${y + 70 * b} L ${x} ${y} L ${x + 70 * a} ${y}`} stroke="#FFFFFF" strokeWidth={7} fill="none" opacity={0.85} />
            ))}
          </g>
        ) : null}
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={Math.max(perdioFlash, 0.7 * unfreezeFlash)} />
        {/* the cost: it slams in on the unfreeze, the notes rain down and burn */}
        {t >= fr1 ? (
          <g>
            {Array.from({ length: 16 }, (_, i) => (
              <Bill key={i} i={i} t={t - fr1} />
            ))}
            <g transform={`translate(${540 + sx * 0.4} ${790 + sy * 0.4}) scale(${(1.9 - 0.9 * Math.min(1.06, mk)) * pulse})`} opacity={clamp(mk * 2)}>
              <OutText x={0} y={0} size={122} fill={struck ? '#FF3B4D' : P3.yellow} text="$125,000,000" stroke={14} />
              {struck ? <rect x={-470 * clamp(strikeK)} y={-52} width={940 * clamp(strikeK)} height={16} rx={8} fill="#FFFFFF" transform="rotate(-4)" /> : null}
            </g>
            {struck ? <OutText x={540} y={890} size={44} fill={P3.white} text="PERDIDOS" mono opacity={clamp(strikeK * 2)} /> : null}
          </g>
        ) : null}
        <Stamp k={stampK} x={540} y={t >= fr1 ? 500 : 470} label="ERROR: 1 LBF ≠ 1 N" sub="LIBRAS LEÍDAS COMO NEWTONS" color={P3.red} w={820} size={74} />
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
        {/* a sparkling trail behind the probe */}
        {Array.from({ length: 12 }, (_, i) => {
          const back = (i + ((t * 6) % 1)) * 0.012;
          const ub = Math.max(0, u - back);
          const bx = 110 + (MARS.x - 150 - 110) * ub;
          const by = 1480 - 150 * sm(ub) - 20 * Math.sin(ub * Math.PI);
          return <circle key={i} cx={bx - 30} cy={by + 18} r={5 * (1 - i / 12)} fill={i % 3 ? '#CFE8FF' : P3.yellow} opacity={(1 - i / 12) * 0.7} />;
        })}
        <g transform={`translate(0 ${8 * Math.sin(t * 3)})`}>
          <Probe x={px} y={py} s={0.62} rot={-12 + 10 * u + 4 * Math.sin(t * 2.5)} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
