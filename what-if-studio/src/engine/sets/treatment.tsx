import React from 'react';
import { makeRoom, Box, S3 } from '../room';
import { RoomShell, Pendant, pendantLight, FloorShadow } from '../furnish';
import { LightVeil, Glow, Dust } from '../light';
import { FONT } from '../fonts';

// A 1985 radiotherapy bunker, built with the room kit: tiled floor, cool painted walls, the treatment machine on its
// stand against the back wall with its arm over the table, the table across the room, a warning sign, a shielded
// door on the right wall, and a red warning lamp that can blink. The patient lies on the table at TREAT_BED.
//
//   <TreatmentRoom t id red alarm />      the room and the table
//   (the patient)                         Hero with lyingPose(...)
//   <TreatHead glow red />                the machine head, drawn after the patient (it hangs in front)
//   <EcgCart x y s trace />               a heart monitor on a cart (any depth)

export const TREAT = makeRoom({ x: 960, y: 470 }, { x0: 560, x1: 1360, y0: 300, y1: 740 }, 3.4);

const BEIGE = '#D9D2C2';
const BEIGE_SIDE = '#ACA493';
const BEIGE_TOP = '#ECE6D8';

/** The table: across the room, top at v 0.72, from u 0.24 to 0.8, w 0.4 to 0.56. */
export const TREAT_BED = { u0: 0.24, u1: 0.8, v: 0.72, w0: 0.4, w1: 0.56 };

/** Where the patient's hip point goes, and their scale, for a body lying along the table (head to the left). */
export const lyingAt = (u: number, w = 0.48) => {
  const p = TREAT.P(u, TREAT_BED.v, w);
  const scale = (0.62 * (TREAT.back.y1 - TREAT.back.y0) * TREAT.s(w)) / 378;
  // the rig spins about the chest (local 0, -90): with spin -90 the chest stays at (x, y - 90 scale) and the body
  // lies along that line, so put the chest just above the table top
  return { x: p.x, y: p.y + 45 * scale, scale };
};

/** The aperture of the machine head, in world space (where the beam leaves). */
export const TREAT_APERTURE = TREAT.P(0.44, 0.47, 0.47);

export const TreatmentRoom: React.FC<{ t: number; id?: string; red?: number; alarm?: boolean; veil?: number }> = ({
  t,
  id = 'trt',
  red = 0,
  alarm = false,
  veil = 0.42,
}) => {
  const R = TREAT;
  const lamp = alarm ? (Math.floor(t / 6) % 2 === 0 ? 1 : 0.25) : 0.2;
  const sign = R.P(0.12, 0.2, 0);
  const sign2 = R.P(0.24, 0.42, 0);
  const lampP = R.P(0.86, 0.1, 0);
  const label = R.P(0.44, 0.62, 0.22);
  const [lx, ly, lr] = pendantLight(R, 0.5, 0.45);
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall="#3E4C55" side="#2F3B43" floorC="#2A3339" ceiling="#182027" lines="#212A30" />
      {/* the warning sign */}
      <g>
        <rect x={sign.x} y={sign.y} width={sign2.x - sign.x} height={sign2.y - sign.y} fill="#E9C43A" stroke="#1A1A1A" strokeWidth={3} />
        <g transform={`translate(${(sign.x + sign2.x) / 2} ${sign.y + (sign2.y - sign.y) * 0.42}) scale(${(sign2.x - sign.x) / 220})`}>
          {[-90, 30, 150].map((a) => {
            const a0 = ((a - 30) * Math.PI) / 180;
            const a1 = ((a + 30) * Math.PI) / 180;
            return <path key={a} d={`M ${18 * Math.cos(a0)} ${18 * Math.sin(a0)} L ${62 * Math.cos(a0)} ${62 * Math.sin(a0)} A 62 62 0 0 1 ${62 * Math.cos(a1)} ${62 * Math.sin(a1)} L ${18 * Math.cos(a1)} ${18 * Math.sin(a1)} Z`} fill="#1A1A1A" />;
          })}
          <circle r={12} fill="#1A1A1A" />
        </g>
        <text x={(sign.x + sign2.x) / 2} y={sign2.y - 10} textAnchor="middle" fontFamily={FONT.ui} fontSize={15} fill="#1A1A1A">
          CAUTION · RADIATION
        </text>
      </g>
      {/* shielded door on the right wall */}
      <polygon points={R.Q([[1, 0.22, 0.12], [1, 1, 0.12], [1, 1, 0.42], [1, 0.22, 0.42]])} fill="#5E6670" stroke="#262B30" strokeWidth={4} />
      <polygon points={R.Q([[1, 0.55, 0.36], [1, 0.62, 0.36], [1, 0.62, 0.4], [1, 0.55, 0.4]])} fill="#C9CED4" />
      {/* red warning lamp over the door */}
      <circle cx={lampP.x} cy={lampP.y} r={20} fill={lamp > 0.5 ? '#FF3B30' : '#5A1512'} stroke="#111" strokeWidth={4} />
      <Glow x={lampP.x} y={lampP.y} r={260} kind="red" o={0.15 + 0.6 * lamp * (alarm ? 1 : 0.2)} />
      {/* wall panel with indicator lights */}
      {(() => {
        const a = R.P(0.66, 0.3, 0);
        const b = R.P(0.8, 0.5, 0);
        return (
          <g>
            <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} rx={6} fill="#2A3036" stroke="#151A1E" strokeWidth={3} />
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={i} cx={a.x + 18 + (i % 3) * 36} cy={a.y + 24 + Math.floor(i / 3) * 34} r={8} fill={(Math.floor(t / 8) + i) % 4 === 0 ? '#7CFFB2' : '#2E4A3A'} />
            ))}
          </g>
        );
      })()}
      {/* the machine: stand against the back wall, arm out over the table */}
      <FloorShadow r={R} u={[0.34, 0.54]} w={[0.04, 0.24]} o={0.45} />
      <Box r={R} u={[0.35, 0.53]} v={[0.12, 1]} w={[0.03, 0.22]} front={BEIGE} side={BEIGE_SIDE} top={BEIGE_TOP} rim />
      <Box r={R} u={[0.36, 0.52]} v={[0.12, 0.3]} w={[0.22, 0.44]} front={BEIGE} side={BEIGE_SIDE} top={BEIGE_TOP} rim />
      <text x={label.x} y={label.y} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#4A463C">
        THERAC-25
      </text>
      {/* the table */}
      <FloorShadow r={R} u={[TREAT_BED.u0, TREAT_BED.u1]} w={[TREAT_BED.w0, TREAT_BED.w1]} o={0.5} />
      <Box r={R} u={[0.46, 0.58]} v={[0.76, 1]} w={[0.44, 0.52]} front="#4A5058" side="#343940" top="#5A616A" />
      <Box r={R} u={[TREAT_BED.u0, TREAT_BED.u1]} v={[TREAT_BED.v, 0.77]} w={[TREAT_BED.w0, TREAT_BED.w1]} front="#2C3238" side="#22272C" top="#C8D2D8" rim />
      <Pendant r={R} u={0.5} w={0.45} t={t} />
      <LightVeil id={`${id}Veil`} lights={[[lx, ly, lr * 1.3]]} o={veil} />
      <Glow x={lx} y={ly + 80} r={lr} kind="cool" o={0.35} />
      <Dust t={t} seed={5} x0={lx - 160} y0={ly} w={320} h={340} n={24} o={0.4} />
      {red > 0 ? <rect x={-600} y={-400} width={3120} height={1880} fill="#FF1E1E" opacity={0.32 * red} style={{ mixBlendMode: 'multiply' }} /> : null}
      {red > 0 ? <Glow x={960} y={520} r={700} kind="red" o={0.4 * red} /> : null}
    </g>
  );
};

/** The machine head hanging from the arm, with its aperture glowing toward the patient. */
export const TreatHead: React.FC<{ t: number; glow?: number; red?: number }> = ({ t, glow = 0.4, red = 0 }) => {
  const R = TREAT;
  const ap = TREAT_APERTURE;
  const color = red > 0.5 ? '#FF2A2A' : '#3FD8FF';
  return (
    <g>
      <Box r={R} u={[0.385, 0.495]} v={[0.3, 0.46]} w={[0.4, 0.47]} front="#B9B2A2" side="#958E7E" top={BEIGE_TOP} rim />
      <ellipse cx={ap.x} cy={ap.y + 4} rx={46} ry={12} fill="#0A1A22" />
      <ellipse cx={ap.x} cy={ap.y + 4} rx={30 + 6 * Math.sin(t * 0.9)} ry={8} fill={color} opacity={0.3 + 0.7 * glow} />
      <Glow x={ap.x} y={ap.y + 30} r={160 + 80 * glow} kind={red > 0.5 ? 'red' : 'cool'} o={0.2 + 0.6 * glow} />
    </g>
  );
};

/** A heart monitor on a wheeled cart. `trace` is a 0..1 function of x for the waveform; `flat` turns it red. */
export const EcgCart: React.FC<{ x: number; y: number; s?: number; trace: (x: number) => number; flat?: boolean }> = ({ x, y, s = 1, trace, flat = false }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) pts.push(`${-70 + i * (140 / 60)},${-150 - trace(i / 60) * 34}`);
  const c = flat ? '#FF3B30' : '#7CFFB2';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.35} />
      <rect x={-6} y={-110} width={12} height={110} fill="#6A7078" />
      <rect x={-50} y={-10} width={100} height={10} fill="#6A7078" />
      <circle cx={-44} cy={2} r={8} fill="#222" />
      <circle cx={44} cy={2} r={8} fill="#222" />
      <rect x={-86} y={-210} width={172} height={110} rx={10} fill="#C9C2B0" stroke="#7E7766" strokeWidth={4} />
      <rect x={-76} y={-200} width={152} height={90} rx={6} fill="#04140A" />
      <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth={3.5} />
      <Glow x={0} y={-155} r={120} kind={flat ? 'red' : 'cool'} o={0.35} />
    </g>
  );
};

export { S3 as TREAT_PALETTE };
