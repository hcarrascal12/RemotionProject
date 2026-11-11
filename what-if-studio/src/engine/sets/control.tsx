import React from 'react';
import { makeRoom, Box } from '../room';
import { RoomShell, Pendant, pendantLight, WallClock, FloorShadow } from '../furnish';
import { LightVeil, Glow } from '../light';
import { FONT } from '../fonts';

// The control room next to the bunker, 1985: brown walls, a lead-glass window onto the treatment room on the back
// wall (the table and the machine inside, a red lamp that can blink), a BEAM ON light, a wall calendar for 1985,
// a clock. The console desk stands near camera, so the operator works behind it facing us, lit green by the
// terminal; the desk hides their legs.
//
//   <ControlRoom t id alarm beam />
//   (the characters)  at standAt(u, w)
//   <ConsoleDesk t screen keys />  the near layer: desk, the terminal from behind, the keyboard

export const CTRL = makeRoom({ x: 960, y: 460 }, { x0: 520, x1: 1400, y0: 290, y1: 735 }, 3.4);

export const ControlRoom: React.FC<{ t: number; id?: string; alarm?: boolean; beam?: boolean; veil?: number }> = ({ t, id = 'ctl', alarm = false, beam = false, veil = 0.4 }) => {
  const R = CTRL;
  const w0 = R.P(0.28, 0.2, 0);
  const w1 = R.P(0.74, 0.56, 0);
  const ww = w1.x - w0.x;
  const wh = w1.y - w0.y;
  const lampOn = alarm && Math.floor(t / 5) % 2 === 0;
  const beamBox = R.P(0.8, 0.14, 0);
  const cal = R.P(0.07, 0.24, 0);
  const clock = R.P(0.9, 0.3, 0);
  const [lx, ly, lr] = pendantLight(R, 0.5, 0.42);
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall="#4C4036" side="#3A3029" floorC="#2E2723" ceiling="#1E1915" lines="#231D19" />
      {/* the window onto the bunker */}
      <rect x={w0.x - 12} y={w0.y - 12} width={ww + 24} height={wh + 24} rx={6} fill="#2A2420" />
      <rect x={w0.x} y={w0.y} width={ww} height={wh} fill={lampOn ? '#3A1618' : '#1C2A30'} />
      <g opacity={0.85}>
        {/* inside: the table and the machine, small */}
        <rect x={w0.x + ww * 0.36} y={w0.y + wh * 0.18} width={ww * 0.16} height={wh * 0.82} fill="#9C968A" />
        <rect x={w0.x + ww * 0.36} y={w0.y + wh * 0.18} width={ww * 0.3} height={wh * 0.14} fill="#9C968A" />
        <rect x={w0.x + ww * 0.52} y={w0.y + wh * 0.32} width={ww * 0.12} height={wh * 0.16} fill="#7E786C" />
        <rect x={w0.x + ww * 0.15} y={w0.y + wh * 0.7} width={ww * 0.7} height={wh * 0.08} fill="#B9C3C8" />
        <ellipse cx={w0.x + ww * 0.5} cy={w0.y + wh * 0.66} rx={ww * 0.09} ry={wh * 0.05} fill="#3B4A68" />
        <circle cx={w0.x + ww * 0.88} cy={w0.y + wh * 0.12} r={8} fill={lampOn ? '#FF3B30' : '#5A1512'} />
      </g>
      <rect x={w0.x} y={w0.y} width={ww} height={wh} fill="url(#ctlGlass)" />
      <defs>
        <linearGradient id="ctlGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      {lampOn ? <Glow x={w0.x + ww * 0.5} y={w0.y + wh * 0.5} r={ww * 0.7} kind="red" o={0.45} /> : null}
      {/* BEAM ON light box */}
      <rect x={beamBox.x - 60} y={beamBox.y - 22} width={120} height={44} rx={6} fill={beam ? '#FF3B30' : '#3A1A18'} stroke="#111" strokeWidth={3} />
      <text x={beamBox.x} y={beamBox.y + 8} textAnchor="middle" fontFamily={FONT.ui} fontSize={20} fill={beam ? '#FFF' : '#7A4A44'}>
        BEAM ON
      </text>
      {beam ? <Glow x={beamBox.x} y={beamBox.y} r={180} kind="red" o={0.5} /> : null}
      {/* a 1985 wall calendar */}
      <g>
        <rect x={cal.x} y={cal.y} width={110} height={130} fill="#EDE6D6" stroke="#2A2420" strokeWidth={3} />
        <rect x={cal.x} y={cal.y} width={110} height={34} fill="#B23A3A" />
        <text x={cal.x + 55} y={cal.y + 25} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#FFF">
          1985
        </text>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={cal.x + 8 + (i % 5) * 20} y={cal.y + 44 + Math.floor(i / 5) * 20} width={14} height={14} fill="#B9B0A0" />
        ))}
      </g>
      <WallClock x={clock.x} y={clock.y} r={30} t={t} />
      {/* a filing cabinet on the left wall */}
      <FloorShadow r={R} u={[0.02, 0.14]} w={[0.1, 0.3]} />
      <Box r={R} u={[0, 0.12]} v={[0.45, 1]} w={[0.1, 0.3]} front="#6E6A5E" side="#57534A" top="#807B6E" />
      <Pendant r={R} u={0.5} w={0.42} t={t} />
      <LightVeil id={`${id}Veil`} lights={[[lx, ly, lr * 1.3]]} o={veil} />
      <Glow x={lx} y={ly + 60} r={lr} o={0.32} />
    </g>
  );
};

/** Where a character stands in the control room. */
export const CTRL_DESK = { u0: 0.2, u1: 0.8, v: 0.72, w0: 0.56, w1: 0.7 };

/** The console desk near camera, the terminal seen from behind (its screen lights the operator), the keyboard. */
export const ConsoleDesk: React.FC<{ t: number; screen?: string; keyHit?: number }> = ({ t, screen = '#39FF88', keyHit = 0 }) => {
  const R = CTRL;
  const top = R.P(0.5, CTRL_DESK.v, CTRL_DESK.w0);
  return (
    <g>
      <Box r={R} u={[CTRL_DESK.u0, CTRL_DESK.u1]} v={[CTRL_DESK.v, 1]} w={[CTRL_DESK.w0, CTRL_DESK.w1]} front="#5E5246" side="#4A4038" top="#86786A" rim />
      {/* the terminal from behind: a beige box, vents, the screen's light spilling round it */}
      <Glow x={top.x - 40} y={top.y - 150} r={330} kind="cool" o={0.45} />
      <g transform={`translate(${top.x - 40} ${top.y - 10})`}>
        <path d="M -120 0 L -100 -190 L 100 -190 L 120 0 Z" fill="#CFC7B2" stroke="#8D8673" strokeWidth={4} />
        <rect x={-104} y={-206} width={208} height={24} rx={6} fill={screen} opacity={0.55} />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={-60} y1={-150 + i * 20} x2={60} y2={-150 + i * 20} stroke="#8D8673" strokeWidth={4} />
        ))}
      </g>
      {/* keyboard, on the operator's side */}
      <g transform={`translate(${top.x + 150} ${top.y - 4})`}>
        <path d="M -90 0 L -76 -26 L 76 -26 L 90 0 Z" fill="#3A3630" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-74 + (i % 6) * 25} y={-24 + Math.floor(i / 6) * 11} width={20} height={8} fill={keyHit > 0 && (i + Math.floor(t)) % 5 === 0 ? '#7CFFB2' : '#5A5448'} />
        ))}
      </g>
      {/* papers and a mug on the desk */}
      <rect x={top.x - 300} y={top.y - 6} width={120} height={14} fill="#EDE6D6" transform={`rotate(-6 ${top.x - 240} ${top.y})`} />
    </g>
  );
};
