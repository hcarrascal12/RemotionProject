import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, joints, toWorld, walkPose, DuskSky, Sun, Haze, Skyline, Dust, Bokeh, Glow, Foreground, Rooftop, Schematic, DrawOn, SchLabel, SCH, Tabletop, Tag, Sparkle, LEG_LEN, rnd } from '../engine';
import { CineCamera } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, ShotProps, springAt } from '../components/motion';
import { clamp, num, OutText } from '../components/fallo04/parts';

// "¿Sabías que…? #01", the What If direction: dusk light from a low sun, rim light on every edge, haze and dust in the beams,
// a blurred foreground for depth, and a new shot size on every cut (wide, macro insert, close-up, low and high angles,
// over the shoulder, top-down, a schematic for the science beat). Almost no text: the title card and small mono readouts.
// Every shot is a pure function of its clock (seconds `t`, frames `f`) and the voice's marks.

export const GRANNY = { ...LOOKS.mom, hair: '#E5E7EB', jacket: '#8B6BA8', jacketShade: '#715590', accent: '#F2C14E' };
const GROUND = 800; // the field's floor, in world units (feet)
const HORIZON = 612;
const MONO = "'DejaVu Sans Mono', monospace";
const FR = 30;

const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** A small mono readout on a dark translucent pill (the genre's only text besides the title). */
const Readout: React.FC<{ x: number; y: number; text: string; k?: number; accent?: string }> = ({ x, y, text, k = 1, accent = '#FDBA74' }) => {
  if (k <= 0.01) return null;
  const w = text.length * 25 + 64;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill="#0E0A1A" opacity={0.82} />
      <circle cx={-w / 2 + 30} cy={0} r={8} fill={accent} />
      <text x={12} y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill="#F8EEDD" letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

/** The dusk field in Georgia: sky, low sun with rays, far hills, haze, telegraph poles, the field and its path. */
const Field: React.FC<{ t: number; sunX?: number; sunY?: number; id: string }> = ({ t, sunX = 1180, sunY = 585, id }) => (
  <g>
    <DuskSky id={`${id}sky`} horizonY={HORIZON} />
    <Sun x={sunX} y={sunY} r={120} t={t * FR} />
    <Skyline y={HORIZON} seed={3} color="#4A2E5E" h={90} />
    <Haze y={HORIZON - 140} h={260} o={0.4} />
    <Skyline y={HORIZON + 22} seed={8} color="#33213F" h={55} />
    {/* telegraph poles and their wires, black against the sky */}
    {[220, 760, 1700].map((x, i) => (
      <g key={i}>
        <rect x={x - 7} y={HORIZON - 250 + i * 30} width={14} height={300 - i * 30} fill="#1B1224" />
        <rect x={x - 46} y={HORIZON - 236 + i * 30} width={92} height={10} fill="#1B1224" />
      </g>
    ))}
    <path d={`M 226 ${HORIZON - 230} Q 490 ${HORIZON - 150} 754 ${HORIZON - 200} Q 1230 ${HORIZON - 120} 1694 ${HORIZON - 170}`} stroke="#1B1224" strokeWidth={3} fill="none" />
    {/* the field: warm where the sun lies on it, dark to the front */}
    <defs>
      <linearGradient id={`${id}fld`} x1="0" y1={HORIZON} x2="0" y2={1200} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7A4A4E" />
        <stop offset="30%" stopColor="#4A2F3E" />
        <stop offset="100%" stopColor="#1E1424" />
      </linearGradient>
    </defs>
    <rect x={-400} y={HORIZON} width={2720} height={1200} fill={`url(#${id}fld)`} />
    <path d={`M 860 ${HORIZON} L 1060 ${HORIZON} L 1500 1300 L 300 1300 Z`} fill="#8A5A4A" opacity={0.35} />
    {Array.from({ length: 60 }, (_, i) => {
      const x = -200 + rnd(11, i) * 2300;
      const y = HORIZON + 30 + rnd(12, i) * 520;
      const h = 10 + (y - HORIZON) * 0.06;
      return <path key={i} d={`M ${x} ${y} l ${-h * 0.3} ${-h} M ${x} ${y} l ${h * 0.25} ${-h * 1.1}`} stroke="#2A1B30" strokeWidth={3 + (y - HORIZON) * 0.005} strokeLinecap="round" />;
    })}
    <Glow x={sunX} y={sunY} r={520} kind="warm" o={0.55} />
    <Dust t={t * FR} seed={5} x0={sunX - 420} y0={sunY - 260} w={700} h={420} n={30} o={0.5} />
  </g>
);

/** The spade, held by a world-space hand point, at an angle (0 = blade straight down). */
const Spade: React.FC<{ hand: { x: number; y: number }; ang: number; len?: number; s?: number }> = ({ hand, ang, len = 200, s = 1 }) => (
  <g transform={`translate(${hand.x} ${hand.y}) rotate(${ang}) scale(${s})`}>
    <rect x={-6} y={-30} width={12} height={len} rx={6} fill="#8A5A3C" stroke="#2A1810" strokeWidth={3} />
    <rect x={-20} y={-38} width={40} height={14} rx={7} fill="#8A5A3C" stroke="#2A1810" strokeWidth={3} />
    <path d={`M -28 ${len - 30} L 28 ${len - 30} L 22 ${len + 30} Q 0 ${len + 46} -22 ${len + 30} Z`} fill="#9AA3B0" stroke="#2A2F38" strokeWidth={4} />
    <path d={`M 18 ${len - 26} L 14 ${len + 26}`} stroke="#FDE7C8" strokeWidth={3} opacity={0.7} />
  </g>
);

const handOf = (pose: Pose, side: 'armR' | 'armL' = 'armR') => toWorld(pose, joints(pose)[side].end);

/** Dirt chunks thrown from a strike at time `at`. */
const Dirt: React.FC<{ t: number; at: number; x: number; y: number; n?: number; s?: number; color?: string }> = ({ t, at, x, y, n = 14, s = 1, color = '#3A2418' }) => {
  const k = t - at;
  if (k < 0 || k > 0.9) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const vx = (rnd(31, i) - 0.5) * 420 * s;
        const vy = (-240 - rnd(32, i) * 260) * s;
        return <circle key={i} cx={x + vx * k} cy={y + vy * k + 900 * s * k * k} r={(4 + rnd(33, i) * 9) * s} fill={i % 3 ? color : '#5A3A28'} opacity={1 - k / 0.9} />;
      })}
    </g>
  );
};

/** A spark burst at a point, decaying over `life` seconds. */
const Sparks: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 1 }) =>
  k > 0.02 ? (
    <g>
      <circle cx={x} cy={y} r={(20 + 60 * (1 - k)) * r} fill="#FEF3C7" opacity={0.7 * k} style={{ mixBlendMode: 'screen' }} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + i;
        const l = (20 + 120 * (1 - k)) * r;
        return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={5 * r} strokeLinecap="round" opacity={k} />;
      })}
    </g>
  ) : null;

// ---------------------------------------------------------------------------------------------------------------
// 1. The title card over the establishing shot (frame 0 is the thumbnail and the loop): the grandma against the sun,
//    her spade planted where the cable sparks underground.
export const TitleWide: React.FC<ShotProps> = ({ t, f }) => {
  const pose: Pose = { ...basePose, x: 820, y: GROUND - LEG_LEN * 1.0, scale: 1, yaw: 0.4, look: 0.5, headTilt: 3 + 3 * Math.sin(t * 2), armR: { a: 22, b: 10 }, armL: { a: 14, b: 8 }, expr: 'smug' };
  const hand = handOf(pose);
  const sp = Math.max(0, 1 - ((t + 0.3) % 1.1) / 0.5); // the cut keeps sparking under the soil
  return (
    <AbsoluteFill>
      <CineCamera cx={930} cy={575} zoom={1.85 + 0.05 * clamp(t / 4)} tint="amber" vignette={0.75}>
        <Field t={t} id="tw" />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} floorShadow={0.5} />
        <Spade hand={hand} ang={-12} len={GROUND - hand.y + 6} />
        <Sparks x={hand.x + (GROUND - hand.y) * Math.sin((12 * Math.PI) / 180) + 4} y={GROUND + 28} k={sp} r={0.5} />
      </CineCamera>
      <Over>
        <text x={540} y={300} textAnchor="middle" fontFamily={HEAVY} fontWeight={800} fontSize={50} fill="#FDE7C8" letterSpacing={4}>
          ¿SABÍAS QUE…
        </text>
        <OutText x={540} y={410} size={96} fill="#FFFFFF" text="UNA ABUELA APAGÓ" stroke={14} />
        <OutText x={540} y={520} size={96} fill="#FDBA74" text="UN PAÍS ENTERO?" stroke={14} />
      </Over>
    </AbsoluteFill>
  );
};

// 2. Macro insert: the spade's blade bites into the soil, side-on, low; clods fly.
export const BladeMacro: React.FC<ShotProps> = ({ t }) => {
  // the insert opens on the blade in the air and lands it 4 frames in: the hit itself, with the clods and a shudder
  const hit = 0.13;
  const down = clamp(t / hit);
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={790} zoom={4.2} tint="amber" vignette={0.8}>
        <Field t={t + 2} id="bm" sunX={1060} sunY={640} />
        <rect x={700} y={GROUND} width={520} height={300} fill="#2A1B22" />
        <Spade hand={{ x: 960 + (t > hit ? 3 * Math.sin(t * 60) * Math.exp(-(t - hit) / 0.15) : 0), y: GROUND - 230 + 160 * down }} ang={4} len={150} />
        <Dirt t={t} at={hit} x={960} y={GROUND} n={18} s={0.25} />
        <Foreground blur={6}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M ${820 + i * 40} ${GROUND + 70} l ${-8 + (i % 2) * 16} -60`} stroke="#120C18" strokeWidth={6} strokeLinecap="round" />
          ))}
        </Foreground>
      </CineCamera>
    </AbsoluteFill>
  );
};

// 3. Close-up: her face against the low sun, bokeh behind; the readout names her age.
export const FaceClose: React.FC<ShotProps> = ({ t, f, variant }) => {
  const happy = variant === 'free';
  const pose: Pose = { ...basePose, x: 960, y: GROUND - LEG_LEN, scale: 1, yaw: happy ? -0.3 : 0.35, look: happy ? -0.5 : 0.6, headTilt: 4 * Math.sin(t * 1.5), armR: { a: happy ? 150 : 20, b: happy ? 20 + 20 * Math.sin(t * 10) : 10 }, armL: { a: 14, b: 8 }, expr: happy ? 'happy' : 'smug' };
  return (
    <AbsoluteFill>
      <CineCamera cx={960 + 6 * t} cy={GROUND - LEG_LEN - 175} zoom={3.9 + 0.08 * t} tint="amber" vignette={0.8}>
        <Field t={t + 4} id={happy ? 'fcf' : 'fc'} sunX={happy ? 1120 : 820} sunY={560} />
        <Bokeh seed={4} n={12} x0={700} y0={420} w={520} h={220} t={t * FR} o={0.3} />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
      </CineCamera>
      <Over>
        {happy ? (
          <g transform="translate(540 1270)">
            <Readout x={0} y={0} text="LIBERADA" k={springAt(f, FR, 0.25, HARD)} accent="#4ADE80" />
          </g>
        ) : (
          <Readout x={540} y={1270} text="75 AÑOS" k={springAt(f, FR, 0.15, HARD)} />
        )}
      </Over>
    </AbsoluteFill>
  );
};

// 4. High angle over Armenia at dusk: the city still lit (it is the internet that goes, not the power), phones in the
//    windows flicking from blue to dead grey.
export const CityHigh: React.FC<ShotProps> = ({ t, f, mark }) => {
  const off = num(mark('armenia'), 0.4);
  return (
    <AbsoluteFill>
      <CineCamera cx={960 - 20 * t} cy={430 + 10 * t} zoom={1.9} tint="amber" vignette={0.7}>
        <Rooftop t={t * FR + 200} cityLit={1.6} />
        {Array.from({ length: 26 }, (_, i) => {
          const x = 300 + rnd(41, i) * 1320;
          const y = 360 + rnd(42, i) * 260;
          const dead = t > off + rnd(43, i) * 0.8;
          return <rect key={i} x={x} y={y} width={10} height={14} rx={2} fill={dead ? '#4B5563' : '#7DD3FC'} opacity={0.95} />;
        })}
      </CineCamera>
      <Over>
        <Readout x={540} y={300} text="ARMENIA" k={springAt(f, FR, 0.1, HARD)} />
      </Over>
    </AbsoluteFill>
  );
};

// 5. Low angle: she raises the spade against the sun and brings it down on "pala".
export const StrikeLow: React.FC<ShotProps> = ({ t, mark }) => {
  const hit = num(mark('pala'), 0.6);
  const up = t < hit - 0.25 ? clamp(t / 0.3) : clamp(1 - (t - hit + 0.25) / 0.2);
  const pose: Pose = { ...basePose, x: 900, y: GROUND - LEG_LEN, scale: 1, yaw: 0.5, look: 0.6, tilt: -6 * up + 8 * (1 - up), armR: { a: 40 + 120 * up, b: 10 }, armL: { a: 30 + 110 * up, b: 20 }, expr: t > hit ? 'oops' : 'neutral' };
  const hand = handOf(pose);
  return (
    <AbsoluteFill>
      <CineCamera cx={940} cy={560} zoom={2.2} rot={-4} tint="amber" vignette={0.75}>
        <Field t={t + 6} id="sl" sunX={1010} sunY={500} />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
        <Spade hand={hand} ang={-150 * up + 6} len={180} />
        <Dirt t={t} at={hit} x={hand.x + 30} y={GROUND} n={16} s={0.5} />
      </CineCamera>
    </AbsoluteFill>
  );
};

// 6. Establishing wide: 28 March 2011, Georgia; she walks the field with the spade on her shoulder, long shadow.
export const WalkWide: React.FC<ShotProps> = ({ t, f, dur }) => {
  const p = clamp(t / Math.max(1, dur));
  const x = 640 + 520 * p;
  const pose = walkPose(x, t * FR * 0.32, GROUND, 0.82, { yaw: 0.6, look: 0.7, armR: { a: 160, b: 150 } });
  const hand = handOf(pose);
  return (
    <AbsoluteFill>
      <CineCamera cx={x + 60} cy={560} zoom={1.85} tint="amber" vignette={0.72}>
        <Field t={t + 8} id="ww" sunX={1300} sunY={580} />
        <ellipse cx={x - 140} cy={GROUND + 6} rx={180} ry={10} fill="#120C18" opacity={0.45} />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
        <Spade hand={hand} ang={150} len={150} s={0.85} />
        <Foreground blur={10}>
          <path d={`M ${x - 700} 1100 Q ${x - 400} 920 ${x - 120} 1100 Z`} fill="#0E0912" />
        </Foreground>
      </CineCamera>
      <Over>
        <Readout x={540} y={300} text="28·03·2011 · GEORGIA" k={springAt(f, FR, 0.15, HARD)} />
      </Over>
    </AbsoluteFill>
  );
};

// 7. Top-down macro: scrap copper in the soil, glinting; her hand reaches in from the side.
export const CopperTop: React.FC<ShotProps> = ({ t, f, mark }) => {
  const cobre = num(mark('cobre'), 0.3);
  const reach = clamp((t - cobre + 0.2) / 0.4);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#2A1B22" />
        {Array.from({ length: 70 }, (_, i) => (
          <ellipse key={i} cx={rnd(51, i) * 1080} cy={rnd(52, i) * 1920} rx={14 + rnd(53, i) * 30} ry={10 + rnd(54, i) * 18} fill={i % 2 ? '#3A2418' : '#4A2E1E'} />
        ))}
        {/* copper wire coils, glinting in the low sun */}
        <g transform={`translate(540 980) rotate(${6 * Math.sin(t)})`}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={-60 + i * 30} cy={i * 8} rx={170 - i * 18} ry={70 - i * 6} fill="none" stroke={i % 2 ? '#C2410C' : '#EA7C2C'} strokeWidth={14} />
          ))}
          <circle cx={120 * Math.cos(t * 3)} cy={-40 + 30 * Math.sin(t * 3)} r={10 + 6 * Math.sin(t * 9)} fill="#FFF7D6" opacity={0.9} />
        </g>
        <circle cx={540} cy={980} r={420} fill="#FDBA74" opacity={0.16} style={{ mixBlendMode: 'screen' }} />
        {/* her sleeve and hand from the right edge */}
        <g transform={`translate(${1260 - 420 * reach} ${880 + 40 * reach}) rotate(-20)`}>
          <rect x={0} y={-70} width={420} height={140} rx={60} fill="#715590" />
          <ellipse cx={0} cy={0} rx={78} ry={66} fill="#F2D3B5" stroke="#2A1810" strokeWidth={5} />
        </g>
        <rect width={1080} height={1920} fill="url(#none)" />
      </svg>
      <Over>
        <Readout x={540} y={1300} text="COBRE = DINERO" k={springAt(f, FR, cobre, HARD)} />
      </Over>
    </AbsoluteFill>
  );
};

// 8. Medium: she digs, two spadefuls, clods flying, the sun behind her.
export const DigMedium: React.FC<ShotProps> = ({ t, mark }) => {
  const hits = [num(mark('cavo1'), 0.2), num(mark('cavo2'), 0.7)];
  let down = 0;
  hits.forEach((a) => {
    const d = t - a;
    if (d > -0.25 && d < 0.35) down = Math.max(down, d < 0 ? 1 + d / 0.25 : 1 - Math.max(0, d - 0.12) / 0.23);
  });
  const pose: Pose = { ...basePose, x: 900, y: GROUND - LEG_LEN + 10 * down, scale: 1, yaw: 0.55, look: 0.7, tilt: 10 + 16 * down, armR: { a: 70 - 30 * down, b: 20 }, armL: { a: 60 - 20 * down, b: 30 }, expr: 'neutral' };
  const hand = handOf(pose);
  return (
    <AbsoluteFill>
      <CineCamera cx={930 + 10 * Math.sin(t)} cy={GROUND - 210} zoom={2.6} tint="amber" vignette={0.78}>
        <Field t={t + 10} id="dg" sunX={760} sunY={560} />
        <ellipse cx={1010} cy={GROUND + 10} rx={90} ry={16} fill="#1A0F12" />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
        <Spade hand={hand} ang={-30 + 12 * down} len={150 + 30 * down} />
        {hits.map((a, i) => (
          <Dirt key={i} t={t} at={a} x={1010} y={GROUND} n={16} s={0.55} />
        ))}
      </CineCamera>
    </AbsoluteFill>
  );
};

// 9. Top-down into the hole: the orange fibre cable with light running in it; the blade comes down and cuts it.
export const CutTop: React.FC<ShotProps> = ({ t, mark }) => {
  const corto = num(mark('corto'), 0.6);
  // the wind-up: the blade lifts away slowly (and the camera pushes in), then drops in 6 frames onto the cable
  const lift = clamp(t / Math.max(0.3, corto - 0.2));
  const down = t < corto - 0.2 ? -0.25 * lift : clamp((t - corto + 0.2) / 0.2);
  const push = 1 + 0.08 * clamp(t / Math.max(0.5, corto));
  const cut = t >= corto;
  const sp = cut ? Math.max(0, 1 - (t - corto) / 0.7) : 0;
  const cy = 1000;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 ${cy}) scale(${push}) translate(-540 ${-cy})`}>
        <rect width={1080} height={1920} fill="#1E1418" />
        <ellipse cx={540} cy={cy} rx={520} ry={700} fill="#3A2418" />
        <ellipse cx={540} cy={cy} rx={420} ry={600} fill="#2A1A12" />
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={140 + rnd(61, i) * 800} cy={420 + rnd(62, i) * 1160} r={6 + rnd(63, i) * 14} fill="#4A2E1E" />
        ))}
        <rect x={120} y={cy - 26} width={cut ? 380 : 840} height={52} rx={26} fill="#F97316" stroke="#7C2D12" strokeWidth={5} />
        {cut ? <rect x={580} y={cy - 26} width={380} height={52} rx={26} fill="#F97316" stroke="#7C2D12" strokeWidth={5} /> : null}
        {Array.from({ length: 10 }, (_, i) => {
          const x = 120 + ((i * 90 + t * 600) % 840);
          if (cut && x > 480) return null;
          return <circle key={i} cx={x} cy={cy} r={10} fill="#FFF7AE" />;
        })}
        {/* the blade from above: a grey wedge dropping onto the cable */}
        <g transform={`translate(540 ${cy - 600 + 600 * down}) scale(${1.6 - 0.6 * down})`}>
          <path d="M -110 -40 L 110 -40 L 90 40 Q 0 70 -90 40 Z" fill="#9AA3B0" stroke="#2A2F38" strokeWidth={6} />
          <rect x={-16} y={-260} width={32} height={220} rx={16} fill="#8A5A3C" stroke="#2A1810" strokeWidth={4} />
        </g>
        <Sparks x={540} y={cy} k={sp} r={1.8} />
        </g>
        <rect width={1080} height={1920} fill="#FFF" opacity={cut ? Math.max(0, 0.5 - (t - corto) * 3) : 0} />
      </svg>
    </AbsoluteFill>
  );
};

// 10. Extreme close-up: the cut end of the cable, glass fibres fanning out, their light dying.
export const FiberEcu: React.FC<ShotProps> = ({ t, f }) => {
  const die = clamp((t - 0.5) / 1.2);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#120B14" />
        <circle cx={300} cy={900} r={600} fill="#7A3A2A" opacity={0.35} />
        <rect x={-100} y={850} width={560} height={160} rx={80} fill="#F97316" stroke="#7C2D12" strokeWidth={8} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = -0.7 + (i / 15) * 1.4 + 0.03 * Math.sin(t * 3 + i);
          const L = 420 + rnd(71, i) * 160;
          const x2 = 460 + Math.cos(a) * L;
          const y2 = 930 + Math.sin(a) * L;
          const lit = 1 - die * (0.6 + 0.4 * rnd(72, i));
          return (
            <g key={i}>
              <line x1={450} y1={930} x2={x2} y2={y2} stroke="#E2E8F0" strokeWidth={4} opacity={0.7} />
              <circle cx={x2} cy={y2} r={10 + 6 * lit} fill="#A5F3FC" opacity={Math.max(0.08, lit)} />
              <circle cx={x2} cy={y2} r={40} fill="#22D3EE" opacity={0.25 * lit} style={{ mixBlendMode: 'screen' }} />
            </g>
          );
        })}
      </svg>
      <Over>
        <Readout x={540} y={1300} text="FIBRA ÓPTICA" k={springAt(f, FR, 0.15, HARD)} accent="#22D3EE" />
      </Over>
    </AbsoluteFill>
  );
};

// 11. The science beat, as a schematic: the line from Georgia to Armenia draws on, light runs down it, then it breaks.
export const MapSchematic: React.FC<ShotProps> = ({ t, f, mark }) => {
  const desco = num(mark('desco'), 99);
  const dark = t >= desco;
  const T = t * FR;
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={540} zoom={1.8} tint="blue" vignette={0.6}>
        <Schematic t={T} id="s11" />
        <g transform="translate(960 560) scale(0.78) translate(-960 -540)">
        <DrawOn d="M 640 260 Q 900 210 1160 280 Q 1300 330 1250 400 Q 1000 450 760 420 Q 600 380 640 260 Z" t={T} dur={10} />
        <DrawOn d="M 820 560 Q 980 520 1120 580 Q 1150 700 1060 790 Q 940 820 840 770 Q 770 660 820 560 Z" t={T - 6} dur={10} color={dark ? '#F87171' : SCH.line} />
        <SchLabel x={950} y={340} t={T - 4} text="GEORGIA" />
        <SchLabel x={980} y={680} t={T - 10} text="ARMENIA" color={dark ? '#F87171' : SCH.line} />
        <path d="M 900 410 C 920 470 950 520 970 580" stroke={dark ? '#7F1D1D' : '#F97316'} strokeWidth={10} fill="none" strokeDasharray={dark ? '12 14' : undefined} />
        {!dark
          ? [0, 1, 2].map((i) => {
              const q = (t * 0.9 + i / 3) % 1;
              return <circle key={i} cx={900 + 70 * q} cy={410 + 170 * q} r={9} fill="#FFF7AE" />;
            })
          : null}
        <g transform="translate(900 410)">
          <circle r={18} fill="#F87171" />
          <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#FFF" strokeWidth={4} />
        </g>
        {dark ? <SchLabel x={960} y={170} t={(t - desco) * FR} text="SIN CONEXIÓN" color="#F87171" size={40} /> : null}
        </g>
      </CineCamera>
    </AbsoluteFill>
  );
};

/** A phone in world space, its screen lit (or dead), the no-signal mark on it. */
const HandPhone: React.FC<{ x: number; y: number; s?: number; dead: number; t: number }> = ({ x, y, s = 1, dead, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
    <rect x={-36} y={-64} width={72} height={128} rx={14} fill="#111827" stroke="#0B0B0B" strokeWidth={4} />
    <rect x={-30} y={-56} width={60} height={112} rx={9} fill={dead > 0.5 ? '#334155' : '#38BDF8'} />
    <circle cx={0} cy={-6} r={16} fill="none" stroke="#E2E8F0" strokeWidth={5} opacity={0.4} />
    <path d="M 0 -22 A 16 16 0 0 1 16 -6" fill="none" stroke="#F8FAFC" strokeWidth={5} transform={`rotate(${t * 400} 0 -6)`} />
    <line x1={-18} y1={30} x2={18} y2={30} stroke="#F87171" strokeWidth={5} strokeLinecap="round" />
  </g>
);

// 12. Over the shoulder, on a rooftop in Armenia: Mo blurred in the foreground, Pip with his phone, no connection.
export const OtsRoof: React.FC<ShotProps> = ({ t, f, mark }) => {
  const horas = num(mark('horas'), 1.2);
  const pose: Pose = { ...basePose, x: 1040, y: 820 - LEG_LEN * 0.95, scale: 0.95, yaw: -0.35, look: -0.4, headTilt: -6 + 3 * Math.sin(t * 2), armL: { a: 120, b: 80 }, armR: { a: 18, b: 10 }, expr: 'worried' };
  const hand = handOf(pose, 'armL');
  return (
    <AbsoluteFill>
      <CineCamera cx={1000} cy={560} zoom={2.1 + 0.05 * t} tint="amber" vignette={0.75}>
        <Rooftop t={t * FR + 300} cityLit={1.4} />
        <CharacterRig look={LOOKS.pip} pose={pose} t={0.4 + t} rim="amber" seed={3} />
        <HandPhone x={hand.x - 6} y={hand.y - 20} s={0.7} dead={1} t={t} />
        <Foreground blur={16}>
          <ellipse cx={720} cy={640} rx={210} ry={330} fill="#1A1222" />
          <circle cx={720} cy={330} r={120} fill="#1A1222" />
        </Foreground>
      </CineCamera>
      <Over>
        <Readout x={540} y={300} text="SIN CONEXIÓN" k={springAt(f, FR, 0.15, HARD)} accent="#F87171" />
        {t > horas - 0.3 ? <Readout x={540} y={1300} text={`DURANTE HORAS`} k={springAt(f, FR, horas - 0.3, HARD)} /> : null}
      </Over>
    </AbsoluteFill>
  );
};

// 13. Close-up: Mo's face lit blue by his dead phone; "and part of Georgia too".
export const MoClose: React.FC<ShotProps> = ({ t, f, mark }) => {
  const g = num(mark('georgia2'), 0.6);
  const pose: Pose = { ...basePose, x: 960, y: 820 - LEG_LEN, scale: 1, yaw: 0.35, look: 0.3, headTilt: 5, armR: { a: 125, b: 85 }, armL: { a: 15, b: 8 }, expr: t > g ? 'shock' : 'worried' };
  const hand = handOf(pose);
  return (
    <AbsoluteFill>
      <CineCamera cx={980 - 8 * t} cy={820 - LEG_LEN - 160} zoom={3.8 + 0.1 * t} tint="blue" vignette={0.82} light={{ x: hand.x, y: hand.y - 40, r: 220, color: '#38BDF8', o: 0.45 }}>
        <Rooftop t={t * FR + 380} cityLit={1.4} />
        <Bokeh seed={9} n={14} x0={700} y0={300} w={560} h={260} t={t * FR} o={0.3} />
        <CharacterRig look={LOOKS.mo} pose={pose} t={0.6 + t} rim="blue" seed={4} />
        <HandPhone x={hand.x + 10} y={hand.y - 6} s={0.45} dead={1} t={t} />
      </CineCamera>
      <Over>
        {t > g - 0.25 ? <Readout x={540} y={1300} text="Y PARTE DE GEORGIA" k={springAt(f, FR, g - 0.25, HARD)} /> : null}
      </Over>
    </AbsoluteFill>
  );
};

/** A police car in world space, its light bar alternating red and blue. */
const PoliceCar: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const red = Math.floor(t * 8) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={8} rx={250} ry={18} fill="#0E0912" opacity={0.6} />
      <rect x={-230} y={-120} width={460} height={110} rx={34} fill="#E5E7EB" stroke="#1B1224" strokeWidth={6} />
      <path d="M -130 -120 L -90 -190 L 110 -190 L 150 -120 Z" fill="#CBD5E1" stroke="#1B1224" strokeWidth={6} />
      <rect x={-230} y={-80} width={460} height={26} fill="#1D4ED8" />
      <rect x={-50} y={-214} width={100} height={26} rx={8} fill={red ? '#EF4444' : '#3B82F6'} stroke="#1B1224" strokeWidth={4} />
      <Glow x={0} y={-200} r={320} kind={red ? 'red' : 'cool'} o={0.7} />
      {[-140, 140].map((wx) => (
        <circle key={wx} cx={wx} cy={-6} r={40} fill="#111827" stroke="#334155" strokeWidth={8} />
      ))}
    </g>
  );
};

// 14. Low angle wide: the police car on the dirt road at dusk, lights sweeping, her silhouette by the hole.
export const PoliceLow: React.FC<ShotProps> = ({ t }) => {
  const arrive = 1 - Math.pow(1 - clamp(t / 0.9), 3);
  const pose: Pose = { ...basePose, x: 870, y: GROUND - LEG_LEN * 0.9, scale: 0.9, yaw: 0.6, look: 0.8, armR: { a: 150, b: 20 }, armL: { a: 150, b: 20 }, expr: 'shock' };
  return (
    <AbsoluteFill>
      <CineCamera cx={980} cy={600} zoom={2.0} rot={3} tint="red" vignette={0.75}>
        <Field t={t + 12} id="pl" sunX={1400} sunY={600} />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="red" seed={8} />
        <PoliceCar x={1700 - 500 * arrive} y={GROUND + 10} t={t} s={0.7} />
        <Foreground blur={10}>
          <rect x={600} y={940} width={900} height={200} fill="#0E0912" />
        </Foreground>
      </CineCamera>
    </AbsoluteFill>
  );
};

// 15 is FaceClose with variant "free" (she smiles and waves: released).

// 16. Top-down insert: the newspaper slides onto a table and settles: LA HACKER DE LA PALA.
export const PaperTop: React.FC<ShotProps> = ({ t, f, mark }) => {
  const hk = num(mark('hacker'), 1.0);
  const k = springAt(f, FR, 0.05, { stiffness: 110, damping: 15, mass: 0.8 });
  const head = springAt(f, FR, hk - 0.1, HARD);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${1.05 + 0.04 * t}) translate(-960 -540)`}>
          <Tabletop edge={1400} />
        </g>
        <circle cx={300} cy={420} r={500} fill="#FDBA74" opacity={0.18} style={{ mixBlendMode: 'screen' }} />
        <g transform={`translate(${540 + 700 * (1 - Math.min(1, k))} 960) rotate(${-6 + 30 * (1 - Math.min(1, k))})`}>
          <rect x={-380} y={-520} width={760} height={1040} rx={8} fill="#F4EEDF" stroke="#2A1F1A" strokeWidth={6} />
          <text y={-420} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={74} fill="#1E1A16">
            LA NOTICIA
          </text>
          <line x1={-340} y1={-385} x2={340} y2={-385} stroke="#1E1A16" strokeWidth={5} />
          <text y={-345} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#5B5248">
            ABRIL DE 2011
          </text>
          <g transform={`scale(${0.7 + 0.3 * Math.min(1.08, head)})`} opacity={Math.min(1, head * 1.6)}>
            <text y={-230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={88} fill="#B91C1C">
              LA HACKER
            </text>
            <text y={-130} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={88} fill="#B91C1C">
              DE LA PALA
            </text>
          </g>
          <rect x={-280} y={-60} width={560} height={400} fill="#CFC6B4" stroke="#2A1F1A" strokeWidth={5} />
          <circle cx={-40} cy={90} r={66} fill="#E9DCC6" stroke="#2A1F1A" strokeWidth={5} />
          <path d="M -106 60 Q -40 -6 26 60" fill="#D8D2C6" stroke="#2A1F1A" strokeWidth={5} />
          <rect x={-104} y={156} width={130} height={184} rx={28} fill="#8B6BA8" stroke="#2A1F1A" strokeWidth={5} />
          <rect x={86} y={20} width={14} height={290} rx={7} fill="#8A5A3C" stroke="#2A1F1A" strokeWidth={3} />
          <path d="M 66 300 L 120 300 L 112 340 Q 93 352 74 340 Z" fill="#9AA3B0" stroke="#2A1F1A" strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-280} y={370 + i * 30} width={560 - (i % 2) * 110} height={12} rx={6} fill="#BDB3A2" />
          ))}
        </g>
        <rect width={1080} height={1920} fill="#000" opacity={0.18} />
      </svg>
    </AbsoluteFill>
  );
};

/** The storyboard list: one frame per shot, at a moment where everything in it is on screen. */
export const BOARD: [React.FC<ShotProps>, string | undefined, number, Record<string, number>][] = [
  [TitleWide, undefined, 1.2, {}],
  [BladeMacro, undefined, 0.6, { pala: 0.4 }],
  [FaceClose, undefined, 0.8, {}],
  [CityHigh, undefined, 1.2, { armenia: 0.4 }],
  [StrikeLow, undefined, 0.3, { pala: 0.9 }],
  [WalkWide, undefined, 1.6, {}],
  [CopperTop, undefined, 1.2, { cobre: 0.3 }],
  [DigMedium, undefined, 0.2, { cavo1: 0.2, cavo2: 0.9 }],
  [CutTop, undefined, 0.75, { corto: 0.6 }],
  [FiberEcu, undefined, 0.6, {}],
  [MapSchematic, undefined, 2.0, { desco: 1.6 }],
  [OtsRoof, undefined, 2.0, { horas: 1.0 }],
  [MoClose, undefined, 1.2, { georgia2: 0.6 }],
  [PoliceLow, undefined, 1.4, {}],
  [FaceClose, 'free', 0.8, {}],
  [PaperTop, undefined, 1.6, { hacker: 0.8 }],
];
export const WHATIF_SHOTS: Record<string, React.FC<ShotProps>> = {
  title: TitleWide, blade: BladeMacro, face: FaceClose, city: CityHigh, strike: StrikeLow, walk: WalkWide, copper: CopperTop,
  dig: DigMedium, cut: CutTop, fiber: FiberEcu, schem: MapSchematic, ots: OtsRoof, mo: MoClose, police: PoliceLow, paper: PaperTop,
};
