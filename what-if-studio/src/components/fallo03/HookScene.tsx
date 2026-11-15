import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { clamp, commas, Mars, num, OutText, P3, Probe, sm, Stars } from './parts';

// The hook of Fallo #03 (variants "loss" and "count"):
//   loss    Frame 0 (CostOpener): "Ciento veinticinco millones de dólares." $125,000,000, 9 MESES DE VIAJE and 1 LIBRA ≠ 1 NEWTON
//           over the burning probe: the disaster in numbers first, the cause as the open question.
//   unit    "Se perdió por una unidad."
//           Frame 0: 1 LIBRA ≠ 1 NEWTON, big, over the probe streaking into the Martian atmosphere like a meteor, on fire, the
//           camera shaking. On "perdió" a solar panel tears off. On "unidad" the picture FREEZES to the cut: it drains to grey,
//           the camera punches in on the probe, and only the ≠ keeps its colour, swelling inside a red ring.
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
export const U0 = 0.86;
/** How fast it travels along the line, per second. */
export const USPEED = 0.16;

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
export const BurningProbe: React.FC<{ u: number; t: number; heat?: number; panel?: number; id: string; s?: number }> = ({ u, t, heat = 1, panel = 0, id, s = 0.8 }) => {
  const p = meteorPoint(u);
  const a = (METEOR_ANGLE * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const L = (560 + 40 * Math.sin(t * 17)) * (0.6 + 0.5 * s);
  const W = (64 + 10 * Math.sin(t * 23)) * (0.4 + 0.75 * s);
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
      <Probe x={p.x} y={p.y} s={s} rot={METEOR_ANGLE + 90 + 22 * Math.sin(t * 5) + t * 30} heat={heat} />
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
export const Bill: React.FC<{ i: number; t: number }> = ({ i, t }) => {
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
  if (variant !== 'unit') return <CostOpener t={t} f={f} fps={fps} dur={dur} mark={mark} />;
  const perdio = num(mark('perdio'), 0.22);
  const unidad = num(mark('unidad'), 0.83);
  // the freeze: from "unidad" to the cut; time stands still in it
  const fr0 = unidad - 0.03;
  const frozen = t >= fr0;
  const tv = Math.min(t, fr0);
  const u = 0.76 + USPEED * tv;
  const pr = meteorPoint(u);
  const panel = tv > perdio ? clamp((tv - perdio) / 1.2) : 0;
  // camera shake: strong on frame 0 and on "perdió"; none in the freeze
  const amp = frozen ? 0 : 10 * Math.exp(-t / 0.5) + 3 + (tv > perdio ? 14 * Math.exp(-(tv - perdio) / 0.35) : 0);
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  // the punch-in on the frozen probe
  const zk = frozen ? clamp(springAt(f, fps, fr0, { stiffness: 320, damping: 22, mass: 0.6 })) : 0;
  const Z = 1 + 0.35 * zk;
  const cx = pr.x + (540 - pr.x) * zk * 0.5;
  const cy = pr.y + (900 - pr.y) * zk * 0.5;
  // the inequality: on screen from frame 0; in the freeze everything goes grey but the ≠, which swells and gets a red ring
  const neqK = frozen ? springAt(f, fps, fr0, { stiffness: 260, damping: 10, mass: 0.6 }) : 0;
  const ring = frozen ? clamp((t - fr0) / 0.22) : 0;
  const neqPulse = 1 + 0.05 * Math.sin(t * 9);
  const jolt = tv > perdio ? 1 + 0.06 * Math.exp(-(tv - perdio) / 0.18) : 1;
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
            <MarsLimb t={tv} />
            <BurningProbe u={u} t={tv} heat={0.75 + 0.25 * Math.sin(tv * 11)} panel={panel} id="hk" />
          </g>
          {/* the two units (they go grey with the world in the freeze) */}
          <g transform={`translate(${540 + sx * 0.5} ${sy * 0.5}) scale(${jolt}) translate(-540 0)`}>
            <OutText x={540} y={455} size={138} fill={P3.yellow} text={frozen ? "1 LIBRA" : "1 ?????"} stroke={16} />
            <OutText x={540} y={805} size={138} fill={P3.blue} text={frozen ? "1 NEWTON" : "1 ??????"} stroke={16} />
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
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={perdioFlash} />
        {/* the ≠: always in colour, it swells in the freeze */}
        <g transform={`translate(${540 + sx * 0.7} ${612 + sy * 0.7}) scale(${neqPulse * jolt * (1 + 0.35 * Math.min(1.1, neqK))})`}>
          <circle r={120} fill={P3.red} opacity={0.2 + 0.15 * Math.sin(t * 9) + 0.2 * neqK} />
          <OutText x={0} y={70} size={210} fill={frozen ? P3.red : P3.white} text={frozen ? "≠" : "?"} stroke={16} />
          {ring > 0 ? <circle r={150} fill="none" stroke={P3.red} strokeWidth={8} strokeDasharray={`${942 * ring} 1000`} transform="rotate(-90)" /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Frame 0 of the film (variant "loss"): the disaster in numbers, under the first spoken word ("Ciento veinticinco millones de
 * dólares"): $125,000,000, 9 MESES DE VIAJE and the cause, 1 LIBRA ≠ 1 NEWTON, over the probe streaking into the Martian
 * atmosphere on fire. Everything is already on screen on frame 0 (the closing card hands over to this exact frame).
 */
const CostOpener: React.FC<ShotProps> = ({ t, f, mark }) => {
  const millones = num(mark('millones'), 1.0);
  const u = U0 + USPEED * t;
  const amp = 10 * Math.exp(-t / 0.5) + 3 + (t > millones ? 10 * Math.exp(-(t - millones) / 0.3) : 0);
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  const pulse = t > millones ? 1 + 0.1 * Math.exp(-(t - millones) / 0.22) : 1;
  const glow = 0.5 + 0.5 * Math.sin(t * 9);
  const pr0 = meteorPoint(u);
  const split = 16 * Math.exp(-t / 0.18) + 2;
  const alarm = 0.5 + 0.5 * Math.cos(t * Math.PI * 4); // 2 flashes a second, full on frame 0
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="op-alarm" cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor="#EF4444" stopOpacity={0} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6} />
          </radialGradient>
          <radialGradient id="op-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={P3.red} stopOpacity={0.3} />
            <stop offset="100%" stopColor={P3.red} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={P3.bg2} />
        <g transform={`translate(${sx} ${sy})`}>
          <circle cx={540} cy={900} r={1000} fill="url(#op-glow)" opacity={0.6 + 0.25 * Math.sin(t * 9)} />
          <Stars t={t * 4} />
          <MarsLimb t={t} />
          {/* hazard tape across the frame */}
        <g transform="translate(540 1275) rotate(-5)">
          <clipPath id="op-tape">
            <rect x={-900} y={-34} width={1800} height={68} />
          </clipPath>
          <rect x={-900} y={-34} width={1800} height={68} fill="#FACC15" />
          <g clipPath="url(#op-tape)">
            {Array.from({ length: 40 }, (_, i) => (
              <path key={i} d={`M ${-900 + i * 90 - ((t * 120) % 90)} 34 L ${-870 + i * 90 - ((t * 120) % 90)} -34 L ${-840 + i * 90 - ((t * 120) % 90)} -34 L ${-870 + i * 90 - ((t * 120) % 90)} 34 Z`} fill="#0B0B0B" />
            ))}
          </g>
          <rect x={-900} y={-34} width={1800} height={68} fill="none" stroke="#0B0B0B" strokeWidth={5} />
        </g>
          {/* shockwaves rolling off the probe: already mid-flight on frame 0 */}
          {[0, 1, 2].map((k) => {
            const age = (t * 1.2 + k / 3) % 1;
            return <circle key={k} cx={pr0.x} cy={pr0.y} r={70 + 460 * age} fill="none" stroke="#FDBA74" strokeWidth={10 * (1 - age) + 2} opacity={0.75 * (1 - age)} />;
          })}
          <BurningProbe u={u} t={t} heat={0.85 + 0.15 * Math.sin(t * 11)} id="op" s={1.25} />
          {/* the money burning: notes already falling on frame 0 */}
          {Array.from({ length: 12 }, (_, i) => (
            <Bill key={i} i={i + 20} t={t + 0.9} />
          ))}
        </g>
        <g transform={`translate(${sx * 0.5} ${sy * 0.5})`}>
          <OutText x={540} y={325} size={46} fill={P3.white} text="LA NASA PERDIÓ" mono />
          <g transform={`translate(540 620) scale(${pulse})`}>
            {/* RGB split on the number: it is torn apart on frame 0 and snaps together */}
            <OutText x={-split} y={4} size={320} fill="#22D3EE" text="$125" stroke={0} opacity={0.85} />
            <OutText x={split} y={-4} size={320} fill="#FF3B4D" text="$125" stroke={0} opacity={0.85} />
            <OutText x={0} y={0} size={320} fill={P3.yellow} text="$125" stroke={22} />
            <OutText x={0} y={125} size={120} fill={P3.yellow} text="MILLONES" stroke={15} />
          </g>
          {/* the school-homework mistake, corrected in red pen: the visual question of the film */}
          <g transform={`translate(540 925) rotate(${-4 + 0.6 * Math.sin(t * 3)})`}>
            <rect x={-400} y={-92} width={800} height={184} rx={10} fill="#F8FAFC" stroke="#0F172A" strokeWidth={6} />
            {[-46, 0, 46].map((y) => (
              <line key={y} x1={-400} y1={y + 20} x2={400} y2={y + 20} stroke="#93C5FD" strokeWidth={3} />
            ))}
            <line x1={-330} y1={-92} x2={-330} y2={92} stroke="#F87171" strokeWidth={4} />
            {/* what the plate is: the wrong assumption, not a fact */}
            <text x={-300} y={-52} fontFamily={HEAVY} fontWeight={900} fontSize={24} letterSpacing={3} fill="#475569">
              EL SOFTWARE ASUMIÓ:
            </text>
            {/* the two units are blacked out like a redacted file: the question stays open until the freeze reveals them */}
            <g transform="skewX(-10)">
              <text x={-300} y={26} fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#1E3A8A">1</text>
              <rect x={-262} y={-26} width={150} height={66} rx={8} fill="#0F172A" />
              <text x={-187} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#F8FAFC" opacity={0.55 + 0.45 * glow}>?</text>
              <text x={-70} y={26} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#1E3A8A">=</text>
              <text x={-20} y={26} fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#1E3A8A">1</text>
              <rect x={18} y={-26} width={230} height={66} rx={8} fill="#0F172A" />
              <text x={133} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#F8FAFC" opacity={0.55 + 0.45 * (1 - glow)}>?</text>
            </g>
            {/* the red pen: the "=" circled, and a big cross */}
            <ellipse cx={-72} cy={2} rx={42} ry={36} fill="none" stroke="#DC2626" strokeWidth={7} opacity={0.95} />
          </g>
          <g transform={`translate(885 885) rotate(12) scale(${0.8 * (1 + 0.06 * glow)})`}>
            <path d="M -62 -62 L 62 62 M 62 -62 L -62 62" stroke="#000" strokeWidth={34} strokeLinecap="round" />
            <path d="M -62 -62 L 62 62 M 62 -62 L -62 62" stroke="#EF4444" strokeWidth={22} strokeLinecap="round" />
          </g>
        </g>
        <rect width={1080} height={1920} fill="url(#op-alarm)" opacity={0.45 + 0.55 * alarm} />
      </svg>
    </AbsoluteFill>
  );
};

/** "Nueve meses viajando a Marte": the months and the distance, the trip before the problem. */
const TripScene: React.FC<{ t: number; f: number; fps: number; dur: number; mark: ShotProps['mark'] }> = ({ t, f, fps, dur, mark }) => {
  const a1end = num(mark('a1end'), 2.0);
  const pd = sm(t / Math.max(1, a1end + 0.2));

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
          <OutText x={0} y={0} size={140} fill={P3.white} text="9 MESES" stroke={14} />
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
