import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, joints, toWorld, Study, Desk, LaptopBack, Kitchen, KITCHEN, KitchenIsland, Rooftop, stand, faceAt, Foreground, Bokeh, Glow, DuskSky, Sun, Schematic, DrawOn, SchLabel, SCH, Tabletop, LEG_LEN, rnd } from '../engine';
import { CineCamera, edgeFg, ef } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../components/motion';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, PhoneBody } from '../components/fallo04/parts';

// Fallo #04 (the Facebook, Instagram and WhatsApp outage, 4 October 2021), in the direction of "¿Sabías que…? #01": dusk light
// from a low sun, rim light on every edge, bokeh and a blurred foreground for depth, and a new shot size on every cut (wide,
// macro insert, close-up, low and high angles, top-down, a schematic). Almost no text: the title card and small mono readouts.
// Every shot is a pure function of its clock (seconds `t`, frames `f`) and the voice's marks.

const FR = 30;
const MONO = "'DejaVu Sans Mono', monospace";
const PIP = LOOKS.pip;
const HOOD = LOOKS.pipHood;
const MO = LOOKS.mo;
const SIS = LOOKS.sis;
const MOM = LOOKS.mom;
const SUIT = LOOKS.suit;
const SKIN = '#F2D3B5';

const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** A small mono readout on a dark translucent pill (the genre's only text besides the title). */
export const Readout: React.FC<{ x: number; y: number; text: string; k?: number; accent?: string }> = ({ x, y, text, k = 1, accent = '#FDBA74' }) => {
  if (k <= 0.01) return null;
  const w = text.length * 25 + 64;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill="#0E0A1A" opacity={0.84} />
      <circle cx={-w / 2 + 30} cy={0} r={8} fill={accent} />
      <text x={12} y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill="#F8EEDD" letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

const handOf = (pose: Pose, side: 'armR' | 'armL' = 'armR') => toWorld(pose, joints(pose)[side].end);

/** The dusk behind a macro: the series' sky and bokeh, in world units. */
const DuskBg: React.FC<{ id: string; t: number; seed?: number }> = ({ id, t, seed = 7 }) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A1B45" />
        <stop offset="55%" stopColor="#7A3A5A" />
        <stop offset="100%" stopColor="#E0864A" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-300} width={2720} height={1700} fill={`url(#${id})`} />
    <Bokeh seed={seed} n={16} x0={100} y0={150} w={1700} h={800} t={t * FR} o={0.32} />
  </g>
);

/** A phone in world space, its screen red: the message that will not go. */
const RedPhone: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
    <rect x={-36} y={-64} width={72} height={128} rx={14} fill="#111827" stroke="#0B0B0B" strokeWidth={4} />
    <rect x={-30} y={-56} width={60} height={112} rx={9} fill="#7F1D1D" opacity={0.85 + 0.15 * Math.sin(t * 9)} />
    <circle cx={0} cy={-4} r={15} fill="#EF4444" />
    <text y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#FFF">
      !
    </text>
    <line x1={-18} y1={34} x2={18} y2={34} stroke="#FCA5A5" strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------------------------------------------------------
// 1. The title card over the establishing shot (frame 0 is the thumbnail and the loop): Pip on the rooftop at dusk, his
//    phone red in his hand, the city behind him.
export const TitleRoof: React.FC<ShotProps> = ({ t, f }) => {
  const e = ef(t);
  const pose: Pose = { ...basePose, x: 960, y: 650, scale: 0.95, yaw: 0.2, look: 0.5, headTilt: 8 + 2 * Math.sin(t * 2), armR: { a: 64, b: 72 }, armL: { a: 14, b: 8 }, ...faceAt(e, [[0, 'shock']]) };
  const hand = handOf(pose);
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={510} zoom={1.9 + 0.06 * clamp(t / 4)} tint="amber" vignette={0.75}>
        <Rooftop t={e + 500} sunX={1330} sunY={700} cityLit={1.6} />
        <CharacterRig look={PIP} pose={pose} t={0.4 + t} rim="amber" seed={10} />
        <RedPhone x={hand.x - 6} y={hand.y - 18} s={0.8} t={t} />
        <Glow x={hand.x} y={hand.y} r={150} kind="red" o={0.45} />
      </CineCamera>
      <Over>
        <Readout x={540} y={262} text="3.500 MILLONES DE PERSONAS" k={springAt(f, FR, 0.15, HARD)} accent="#F87171" />
        <OutText x={540} y={400} size={86} fill="#FFFFFF" text="NADIE PUDO AVISAR" stroke={14} />
        <OutText x={540} y={508} size={100} fill="#FDBA74" text="QUE LLEGÓ BIEN" stroke={15} />
      </Over>
    </AbsoluteFill>
  );
};

// 2. Macro insert: the message sits on "enviando", then turns red.
export const PhoneMacro: React.FC<ShotProps> = ({ t, f, fps }) => {
  const fail = springAt(f, fps, 0.3, HARD);
  const buzz = fail > 0.3 ? 5 * Math.sin(t * 70) * Math.exp(-(t - 0.3) / 0.25) : 0;
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={540} zoom={1.9} tint="amber" vignette={0.85}>
        <DuskBg id="pmbg" t={t} seed={6} />
      </CineCamera>
      <Over>
        <g transform={`translate(${540 + buzz} 1010) rotate(${-4 + 0.8 * Math.sin(t * 2)}) scale(${1 + 0.05 * (t / 0.9)})`}>
          <PhoneBody x={0} y={0} s={0.95} glow={0.25 + 0.3 * fail}>
            <rect x={-262} y={-482} width={524} height={964} rx={56} fill={C4.red} opacity={0.08 + 0.28 * fail} />
            <text x={-220} y={-330} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#E2E8F0">
              Mamá
            </text>
            <Bubble x={50} y={-110} w={420} h={130} side="out" fill={C4.bubble}>
              <text x={-170} y={16} fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#F8FAFC">
                Ya llegué
              </text>
            </Bubble>
            {fail > 0.4 ? (
              <g transform={`translate(-200 -110) scale(${1 + 0.2 * Math.exp(-(t - 0.4) / 0.2)})`}>
                <circle r={36} fill={C4.red} />
                <text y={19} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#FFF">
                  !
                </text>
              </g>
            ) : (
              <PendingClock x={-200} y={-110} r={26} t={t} color="#94A3B8" />
            )}
          </PhoneBody>
        </g>
        <Readout x={540} y={330} text={fail > 0.4 ? 'NO SE PUDO ENVIAR' : 'ENVIANDO…'} k={springAt(f, fps, 0.05, HARD)} accent={fail > 0.4 ? '#F87171' : '#FDBA74'} />
      </Over>
    </AbsoluteFill>
  );
};

// 3. Top-down insert: the calendar page slides onto the table, the 4 gets circled in red marker.
export const CalendarTop: React.FC<ShotProps> = ({ t, f, mark }) => {
  const fecha = num(mark('fecha'), 0.1);
  const k = springAt(f, FR, 0.03, { stiffness: 110, damping: 15, mass: 0.8 });
  const circ = clamp((t - fecha) / 0.5);
  const cells: [number, number, number][] = [];
  const first = 4; // 1 October 2021 was a Friday: the 5th column of a week that starts on Monday
  for (let d = 1; d <= 31; d++) cells.push([d, (first + d - 1) % 7, Math.floor((first + d - 1) / 7)]);
  const ang = -Math.PI / 2 + circ * Math.PI * 2 * 1.04;
  const pen = { x: -324 + 66 * Math.cos(ang), y: -60 + 66 * Math.sin(ang) };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${1.05 + 0.04 * t}) translate(-960 -540)`}>
          <Tabletop edge={1400} />
        </g>
        <circle cx={300} cy={420} r={500} fill="#FDBA74" opacity={0.18} style={{ mixBlendMode: 'screen' }} />
        <g transform={`translate(${540 + 700 * (1 - Math.min(1, k))} 960) rotate(${-4 + 30 * (1 - Math.min(1, k))})`}>
          <rect x={-400} y={-560} width={800} height={1120} rx={14} fill="#F4EEDF" stroke="#2A1F1A" strokeWidth={6} />
          <rect x={-400} y={-560} width={800} height={190} rx={14} fill="#B91C1C" />
          <text y={-450} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill="#FFFFFF">
            OCTUBRE
          </text>
          <text y={-396} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill="#FECACA" letterSpacing={8}>
            2021
          </text>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
            <text key={d} x={-324 + i * 108} y={-300} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#6B5E52">
              {d}
            </text>
          ))}
          {cells.map(([d, c, r]) => (
            <text key={d} x={-324 + c * 108} y={-96 + 0 + (r - 1) * 120 + 36 - 0} textAnchor="middle" fontFamily={HEAVY} fontWeight={800} fontSize={60} fill={c > 4 ? '#B45309' : '#1E1A16'}>
              {d}
            </text>
          ))}
          {/* the marker circle around the 4 */}
          <g transform="translate(-324 -60) rotate(-14)">
            <ellipse rx={76} ry={64} fill="none" stroke="#DC2626" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} transform="rotate(-90)" />
          </g>
          {circ > 0 && circ < 1 ? (
            <g transform={`translate(${pen.x} ${pen.y}) rotate(40)`}>
              <rect x={-12} y={-150} width={24} height={150} rx={8} fill="#DC2626" stroke="#2A1F1A" strokeWidth={4} />
              <path d="M -12 0 L 0 26 L 12 0 Z" fill="#2A1F1A" />
            </g>
          ) : null}
        </g>
        <rect width={1080} height={1920} fill="#000" opacity={0.15} />
      </svg>
    </AbsoluteFill>
  );
};

// 4. High angle over the city: the sun is a clock racing to six, and the three apps' signs go out one by one.
export const CityClock: React.FC<ShotProps> = ({ t, f, mark }) => {
  const e = ef(t);
  const seis = num(mark('seis'), 0.1);
  const horas = num(mark('horas'), 0.3);
  const offs = [horas + 0.3, horas + 0.55, horas + 0.8];
  const kinds = ['wa', 'ig', 'fb'] as const;
  const red = clamp((t - horas) / 1.8) * 0.45;
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={450} zoom={1.75 + 0.05 * t} tint="amber" vignette={0.72}>
        <Rooftop t={e + 700} sunX={960} sunY={570} clock spin={t * 520} red={red} cityLit={1.6} />
        {kinds.map((kd, i) => {
          const dead = t >= offs[i];
          const fall = dead ? clamp((t - offs[i]) / 0.5) : 0;
          return (
            <g key={kd} transform={`translate(${960 + (i - 1) * 200} ${240 + 70 * fall * fall}) rotate(${(i - 1) * 12 * fall})`} opacity={1 - 0.35 * fall}>
              <rect x={-70} y={-70} width={140} height={140} rx={30} fill="#0E0A1A" opacity={0.78} />
              <AppGlyph kind={kd} x={0} y={0} r={50} on={dead ? 0 : 1} />
              {dead ? <Glow x={0} y={0} r={90} kind="red" o={0.55 * (1 - fall)} /> : null}
            </g>
          );
        })}
      </CineCamera>
      <Over>
        <Readout x={540} y={1290} text="SEIS HORAS" k={springAt(f, FR, seis - 0.05, HARD)} accent="#F87171" />
      </Over>
    </AbsoluteFill>
  );
};

// 5. Low angle: the hooded hacker everybody pictured; the cross lands on "hackeo".
export const HackerLow: React.FC<ShotProps> = ({ t, f, mark }) => {
  const e = ef(t);
  const hackeo = num(mark('hackeo'), 0.7);
  const fue = num(mark('fue'), hackeo + 0.05);
  const x = springAt(f, FR, fue - 0.03, HARD);
  const pose: Pose = { ...basePose, x: 960, y: 712, scale: 1, yaw: 0.1, armL: { a: 38, b: 34 }, armR: { a: 38, b: 34 }, headTilt: 4, ...faceAt(e, [[0, 'smug']]) };
  return (
    <AbsoluteFill>
      <CineCamera cx={900} cy={600} zoom={2.35 - 0.1 * clamp(t / 1.2)} rot={-2} tint="red" vignette={0.8} light={{ x: 990, y: 600, r: 380, color: C4.red, o: 0.5 }} fg={edgeFg(900, 600, 2.35)}>
        <Study t={e + 200} id="h4w" night />
        <CharacterRig look={HOOD} pose={pose} t={t} rim="red" seed={5} />
        <Desk x0={520} x1={1360} y={700} laptop={false} />
        <LaptopBack x={1060} y={700} w={250} glow={0.9 + 0.1 * Math.sin(t * 9)} />
      </CineCamera>
      <Over>
        {x > 0.01 ? (
          <g transform={`translate(560 1000) rotate(${-14 * (1 - Math.min(1, x))}) scale(${2.2 - 1.2 * x})`} opacity={Math.min(1, x * 1.5)}>
            <line x1={-200} y1={-190} x2={200} y2={210} stroke="#000" strokeWidth={46} strokeLinecap="round" />
            <line x1={200} y1={-190} x2={-200} y2={210} stroke="#000" strokeWidth={46} strokeLinecap="round" />
            <line x1={-200} y1={-190} x2={200} y2={210} stroke={C4.red} strokeWidth={28} strokeLinecap="round" />
            <line x1={200} y1={-190} x2={-200} y2={210} stroke={C4.red} strokeWidth={28} strokeLinecap="round" />
          </g>
        ) : null}
      </Over>
    </AbsoluteFill>
  );
};

// 6 and 12. Macro: a finger comes down on ENTER. 'first' is the routine command; 'anchor' is the same key, once more, heavier.
export const EnterMacro: React.FC<ShotProps> = ({ t, f, mark, variant }) => {
  const anchor = variant === 'anchor';
  const at = num(mark(anchor ? 'comando2' : 'comando'), 0.5);
  const hover = t < at - 0.12 ? 150 - 90 * clamp(t / Math.max(0.2, at - 0.12)) : t < at ? 60 * (1 - (t - (at - 0.12)) / 0.12) : 60 * clamp((t - at - 0.06) / 0.3);
  const down = t >= at && t < at + 0.22 ? 1 : 0;
  const shake = t >= at ? (anchor ? 14 : 7) * Math.exp(-(t - at) / 0.18) : 0;
  const sx = (rand(f * 2 + 5) - 0.5) * 2 * shake;
  const sy = (rand(f * 2 + 6) - 0.5) * 2 * shake;
  const ring = t >= at ? clamp((t - at) / 0.5) : 0;
  return (
    <AbsoluteFill>
      <CineCamera cx={960 + sx / 1.9} cy={560 + sy / 1.9} zoom={1.95 + 0.05 * clamp(t / 1.4)} tint={anchor ? 'red' : 'amber'} vignette={0.85}>
        <DuskBg id={anchor ? 'embg2' : 'embg'} t={t + (anchor ? 5 : 0)} seed={anchor ? 9 : 8} />
        {/* the keyboard around it, out of focus */}
        <Foreground blur={6}>
          {[-1, 1].map((d) =>
            [0, 1].map((r) => <rect key={`${d}${r}`} x={960 + d * 360 - 130} y={470 + r * 130} width={260} height={110} rx={22} fill="#2A2438" stroke="#14101E" strokeWidth={5} />),
          )}
        </Foreground>
        {down || ring > 0 ? <Glow x={960} y={600} r={380} kind={anchor ? 'red' : 'warm'} o={0.6 * (1 - ring * 0.6)} /> : null}
        <g transform={`translate(960 ${590 + 10 * down})`}>
          <rect x={-190} y={-60 + 12 * (1 - down)} width={380} height={170} rx={26} fill="#4B4458" />
          <rect x={-190} y={-60 + 12 * (1 - down) - 18 * (1 - down) * 0} width={380} height={150 - 6 * down} rx={26} fill={down ? (anchor ? '#FCA5A5' : '#FDE68A') : '#E8E1D6'} stroke="#14101E" strokeWidth={6} />
          <text y={34 + 6 * down} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#1E1A16">
            ENTER
          </text>
        </g>
        {/* the finger, from above */}
        <g transform={`translate(${1010 + 8 * down} ${370 - hover + 90 * down}) rotate(-8)`}>
          <rect x={-46} y={-260} width={92} height={290} rx={46} fill={SKIN} stroke="#2A1F1A" strokeWidth={6} />
          <path d="M -28 -6 Q 0 14 28 -6" stroke="#D9B79A" strokeWidth={5} fill="none" />
          <rect x={-60} y={-290} width={120} height={120} rx={40} fill={anchor ? '#3A2F4A' : '#8A5A6A'} stroke="#2A1F1A" strokeWidth={6} />
        </g>
      </CineCamera>
      <Over>
        {anchor ? (
          <Readout x={540} y={1280} text="UN COMANDO · SEIS HORAS" k={springAt(f, FR, Math.max(0, at - 0.15), HARD)} accent="#F87171" />
        ) : (
          <Readout x={540} y={1280} text="COMANDO DE RUTINA" k={springAt(f, FR, Math.max(0, at - 0.3), HARD)} />
        )}
      </Over>
    </AbsoluteFill>
  );
};

// 7. The science beat, as a schematic: three data centres joined by their own streets; the command cuts them and the rest of the
//    internet can no longer find them.
export const NetSchem: React.FC<ShotProps> = ({ t, f, mark }) => {
  const internet = num(mark('internet'), 0.2);
  const tres = num(mark('tres'), 1.6);
  const T = t * FR;
  const cut = t >= internet + 0.1;
  const gone = t >= tres - 0.1;
  const nodes = [
    { x: 810, y: 450, k: 'wa' as const },
    { x: 1110, y: 450, k: 'ig' as const },
    { x: 960, y: 680, k: 'fb' as const },
  ];
  const links: [number, number][] = [[0, 1], [1, 2], [2, 0]];
  const col = cut ? '#F87171' : '#F97316';
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={560} zoom={1.78} tint="blue" vignette={0.62}>
        <Schematic t={T} id="s4n" />
        {links.map(([a, b], i) => (
          <g key={i}>
            <path d={`M ${nodes[a].x} ${nodes[a].y} L ${nodes[b].x} ${nodes[b].y}`} stroke={cut ? '#7F1D1D' : col} strokeWidth={9} fill="none" strokeDasharray={cut ? '12 16' : undefined} />
            {!cut
              ? [0, 1].map((q) => {
                  const u = (t * 0.8 + q / 2 + i / 3) % 1;
                  return <circle key={q} cx={nodes[a].x + (nodes[b].x - nodes[a].x) * u} cy={nodes[a].y + (nodes[b].y - nodes[a].y) * u} r={9} fill="#FFF7AE" />;
                })
              : null}
            {cut ? (
              <g transform={`translate(${(nodes[a].x + nodes[b].x) / 2} ${(nodes[a].y + nodes[b].y) / 2})`}>
                <circle r={20} fill="#F87171" />
                <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#FFF" strokeWidth={4} />
              </g>
            ) : null}
          </g>
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={78} fill="#0E0A1A" opacity={0.7} stroke={gone ? '#7F1D1D' : SCH.line} strokeWidth={5} />
            <AppGlyph kind={n.k} x={n.x} y={n.y} r={46} on={gone ? 0 : 1} />
          </g>
        ))}
        {/* the rest of the internet, looking for them */}
        <g transform="translate(960 270)">
          <rect x={-120} y={-40} width={240} height={80} rx={40} fill="#0E0A1A" opacity={0.8} stroke={SCH.dim} strokeWidth={4} />
          <text y={11} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#F8EEDD">
            INTERNET
          </text>
        </g>
        {nodes.map((n, i) => (
          <path key={`s${i}`} d={`M ${960 + (i - 1) * 60} 312 Q ${960 + (i - 1) * 190} ${(312 + n.y) / 2} ${n.x} ${n.y - 80}`} stroke={gone ? '#F87171' : SCH.dim} strokeWidth={4} fill="none" strokeDasharray="10 12" opacity={gone ? 0.9 : 0.45} />
        ))}
        {gone ? <SchLabel x={960} y={880} t={(t - tres + 0.1) * FR} text="NO SE ENCUENTRA" color="#F87171" size={40} /> : null}
      </CineCamera>
      <Over>
        {gone ? <Readout x={540} y={1280} text="facebook.com ✗" k={springAt(f, FR, tres - 0.1, HARD)} accent="#F87171" /> : null}
      </Over>
    </AbsoluteFill>
  );
};

// 8. Medium shot: Mo in his shop, the WhatsApp sign behind him, and not one order.
export const ShopMo: React.FC<ShotProps> = ({ t, f, mark }) => {
  const e = ef(t);
  const me = stand(KITCHEN, 0.63, 0.42);
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: -0.25, look: -0.5, headTilt: -6 + 2 * Math.sin(t * 2), armR: { a: 30, b: 60 }, armL: { a: 30, b: 60 }, ...faceAt(e, [[0, 'worried']]) };
  const sign = KITCHEN.P(0.44, 0.3, 0.02);
  const ped = num(mark('pedidos'), 0.5);
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x - 110 + 14 * t} cy={me.y - 80} zoom={2.05 + 0.06 * clamp(t / 2)} tint="amber" vignette={0.75} fg={edgeFg(me.x - 110, me.y - 80, 2.05)}>
        <Kitchen t={e + 40} id="s4w" veil={0.4} />
        <g transform={`translate(${sign.x} ${sign.y}) rotate(-3)`}>
          <rect x={-150} y={-56} width={300} height={112} rx={12} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={5} />
          <text y={-12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#0B1220">
            PEDIDOS POR
          </text>
          <text x={22} y={36} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={C4.wa}>
            WHATSAPP
          </text>
          <g transform="translate(-104 24)">
            <AppGlyph kind="wa" x={0} y={0} r={20} on={1} />
          </g>
        </g>
        <CharacterRig look={MO} pose={pose} t={t} rim="amber" seed={7} />
        <KitchenIsland stools={false} />
      </CineCamera>
      <Over>
        <Readout x={540} y={1280} text={`PEDIDOS: 0`} k={springAt(f, FR, Math.max(0.05, ped - 0.2), HARD)} accent="#F87171" />
      </Over>
    </AbsoluteFill>
  );
};

/** A chat card floating over the scene, like a phone's screen in close-up: a message that stays on "enviando". */
const ChatCard: React.FC<{ x: number; y: number; k: number; from: string; text: string; t: number }> = ({ x, y, k, from, text, t }) => (
  <g transform={`translate(${x} ${y + 30 * (1 - Math.min(1, k))}) scale(${0.8 + 0.2 * Math.min(1.06, k)})`} opacity={Math.min(1, k * 1.6)}>
    <Bubble x={0} y={0} w={620} h={160} side="in" fill={C4.bubble} stroke="#475569" strokeW={6}>
      <text x={-270} y={-24} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#FDE68A">
        {from}
      </text>
      <text x={-270} y={32} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">
        {text}
      </text>
      <PendingClock x={250} y={40} r={20} t={t} color={C4.red} />
    </Bubble>
  </g>
);

// 9. Close-up: mum in the kitchen, her question unanswered.
export const MomClose: React.FC<ShotProps> = ({ t, f, fps }) => {
  const e = ef(t);
  const me = stand(KITCHEN, 0.5, 0.42);
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.2, look: 0.5, headTilt: 8 + 2 * Math.sin(t * 1.2), armR: { a: 60, b: 74 }, armL: { a: 22, b: 18 }, ...faceAt(e, [[0, 'worried']]) };
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x + 40 - 8 * t} cy={me.y - 150} zoom={3.0 + 0.1 * t} tint="blue" vignette={0.82} light={{ x: me.x + 70, y: me.y - 60, r: 280, color: '#38BDF8', o: 0.4 }} fg={edgeFg(me.x + 40, me.y - 150, 3.0)}>
        <Kitchen t={e + 120} id="m4w" veil={0.55} />
        <Bokeh seed={12} n={10} x0={me.x - 400} y0={me.y - 520} w={700} h={300} t={e} o={0.22} />
        <CharacterRig look={MOM} pose={pose} t={t} rim="blue" seed={6} />
        <KitchenIsland stools={false} />
      </CineCamera>
      <Over>
        <ChatCard x={540} y={420} k={springAt(f, fps, 0.1, HARD)} from="Pip" text="¿Ya llegaste?" t={t} />
      </Over>
    </AbsoluteFill>
  );
};

/** The data centre's door at dusk: a steel door, a badge reader beside it, floodlights, the last of the sun. */
const DoorWorld: React.FC<{ t: number; denied: number }> = ({ t, denied }) => {
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <g>
      <DuskSky id="dcsky" horizonY={700} />
      <Sun x={1560} y={560} r={110} t={t * FR} />
      <rect x={300} y={250} width={1320} height={620} fill="#2B2638" />
      <rect x={300} y={250} width={1320} height={30} fill="#1B1626" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={340 + i * 210} y={310} width={150} height={60} rx={6} fill="#1B1626" opacity={0.8} />
      ))}
      <text x={960} y={400} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={38} fill="#8E87A5" letterSpacing={4}>
        CENTRO DE DATOS
      </text>
      <rect x={826} y={430} width={268} height={440} rx={8} fill="#3A3548" stroke="#14101E" strokeWidth={8} />
      <line x1={960} y1={430} x2={960} y2={870} stroke="#14101E" strokeWidth={6} />
      <rect x={930} y={640} width={14} height={110} rx={7} fill="#8E87A5" />
      <rect x={976} y={640} width={14} height={110} rx={7} fill="#8E87A5" />
      {/* the badge reader */}
      <rect x={1124} y={560} width={76} height={140} rx={12} fill="#1B1824" stroke="#0B0910" strokeWidth={5} />
      <rect x={1138} y={578} width={48} height={34} rx={5} fill="#0B0910" />
      <circle cx={1162} cy={650} r={13} fill={denied > 0.5 ? '#EF4444' : blink ? '#F59E0B' : '#78350F'} />
      {denied > 0.5 ? <Glow x={1162} y={650} r={150} kind="red" o={0.75} /> : null}
      <Glow x={560} y={300} r={420} kind="warm" o={0.4} />
      <Glow x={1380} y={300} r={420} kind="warm" o={0.4} />
      <rect x={-400} y={870} width={2720} height={400} fill="#1B1424" />
      <rect x={-400} y={870} width={2720} height={14} fill="#3A2E48" />
    </g>
  );
};

// 10. Low angle: the engineers cannot get in; one swipes, one bangs on the door.
export const DoorWide: React.FC<{} & ShotProps> = ({ t, f, mark }) => {
  const e = ef(t);
  const den = num(mark('denegado'), 0.9);
  const denied = t >= den ? 1 : 0;
  const swipe = clamp((t - 0.1) / 0.3);
  const bang = t > den ? Math.max(0, Math.sin(t * 16)) : 0;
  const A: Pose = { ...basePose, x: 1040, y: 870 - LEG_LEN * 0.95, scale: 0.95, yaw: 0.5, look: 0.8, headTilt: 4, armR: { a: 70 + 40 * swipe, b: 30 }, armL: { a: 14, b: 8 }, ...faceAt(e, [[0, 'worried'], [Math.round(den * 30), 'shock']]) };
  const B: Pose = { ...basePose, x: 830, y: 870 - LEG_LEN * 0.88, scale: 0.88, yaw: -0.3, look: -0.4, headTilt: 6, armR: { a: 118 + 34 * bang, b: 22 }, armL: { a: 100 + 26 * (1 - bang), b: 22 }, ...faceAt(e, [[0, 'worried'], [Math.round(den * 30), 'shock']]) };
  return (
    <AbsoluteFill>
      <CineCamera cx={960 + 10 * Math.sin(t * 40) * (denied ? Math.exp(-(t - den) / 0.3) : 0)} cy={610 - 14 * clamp(t / 2.2)} zoom={1.95} rot={-2} tint="red" vignette={0.8} fg={edgeFg(960, 610, 1.95)}>
        <DoorWorld t={t} denied={denied} />
        <CharacterRig look={SUIT} pose={B} t={t + 0.3} rim="amber" seed={13} />
        <CharacterRig look={{ ...SUIT, jacket: '#3A3F4E', jacketShade: '#2C303C' }} pose={A} t={t} rim="red" seed={12} />
      </CineCamera>
      <Over>
        <Readout x={540} y={1280} text="ACCESO DENEGADO" k={denied ? springAt(f, FR, den, HARD) : 0} accent="#F87171" />
      </Over>
    </AbsoluteFill>
  );
};

// 11. Macro on the reader: the badge is refused, three times.
export const BadgeMacro: React.FC<ShotProps> = ({ t, f, mark }) => {
  const m = [num(mark('tarjetas'), 0.3), num(mark('abrian'), 0.9), num(mark('puerta'), 1.4)];
  const hit = (i: number) => (t >= m[i] ? Math.exp(-(t - m[i]) / 0.18) : 0);
  const n = m.filter((a) => t >= a).length;
  // the card slides toward the reader before each beat and backs off after it (the last one stays)
  let cardX = 0;
  m.forEach((a, i) => {
    const near = clamp((t - (a - 0.28)) / 0.26);
    const away = i === 2 ? 0 : clamp((t - a - 0.1) / 0.2);
    if (t >= a - 0.28 && (i === 2 || t < a + 0.3)) cardX = 260 * (1 - near * (1 - away));
  });
  if (t < m[0] - 0.28) cardX = 260;
  const shake = hit(2) * 12 * (rand(f * 3 + 1) - 0.5) * 2;
  return (
    <AbsoluteFill>
      <CineCamera cx={1120 + shake} cy={640} zoom={4.3 + 0.2 * clamp(t / 3)} tint="red" vignette={0.85}>
        <DoorWorld t={t} denied={1} />
        {/* the card */}
        <g transform={`translate(${1162 - 54 + cardX} ${640}) rotate(-6)`}>
          <rect x={-60} y={-38} width={120} height={76} rx={8} fill="#E5E7EB" stroke="#14101E" strokeWidth={4} />
          <rect x={-60} y={-18} width={120} height={14} fill="#1E293B" />
          <circle cx={-34} cy={14} r={10} fill="#64748B" />
        </g>
        {[0, 1, 2].map((i) => (hit(i) > 0.05 ? <Glow key={i} x={1162} y={650} r={90 + 80 * hit(i)} kind="red" o={0.7 * hit(i)} /> : null))}
      </CineCamera>
      <Over>
        <Readout x={540} y={1280} text={n ? `TARJETA RECHAZADA ×${n}` : 'TARJETA…'} k={springAt(f, FR, 0.05, HARD)} accent="#F87171" />
        <text x={540} y={1190} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={27} fill="#F8EEDD" stroke="#0E0A1A" strokeWidth={6} paintOrder="stroke" opacity={Math.min(1, springAt(f, FR, m[0], HARD) * 1.5)}>
          SEGÚN KREBSONSECURITY Y THE NEW YORK TIMES
        </text>
      </Over>
    </AbsoluteFill>
  );
};

// 13. Pip, Mo and his sister on the rooftop at dusk, phones in hand: the messages arrive at last.
export const FriendsRoof: React.FC<ShotProps> = ({ t, f, fps }) => {
  const e = ef(t);
  const p = clamp(t / 2.6);
  const arrive = [0.05, 0.25, 0.45];
  const cast = [
    { look: MO, x: 760, s: 0.86, a: 0.3, seed: 21 },
    { look: PIP, x: 960, s: 0.95, a: 0, seed: 22 },
    { look: SIS, x: 1150, s: 0.7, a: -0.3, seed: 23 },
  ];
  const msgs = ['Ya llegué', '¿Llegaste?', 'Todo bien', 'Ya volvió', 'Por fin', '¿Estás?', 'Aquí estoy', 'Ya llegué'];
  return (
    <AbsoluteFill>
      <CineCamera cx={960} cy={510 - 20 * p} zoom={1.6 + 0.3 * p} tint="amber" vignette={0.62}>
        <Rooftop t={e + 600} sunX={1320} sunY={700} cityLit={1.2} />
        {cast.map((c, i) => {
          const d = t - arrive[i];
          const jump = d > 0 ? Math.max(0, Math.sin(clamp(d / 0.45) * Math.PI)) * 46 * c.s : 0;
          const buzz = d > -0.15 && d < 0.05 ? 4 * Math.sin(t * 90) : 0;
          const pose = { ...basePose, x: c.x + buzz, y: 690 - (1 - c.s) * 140 - jump, scale: c.s, yaw: c.a, look: 0.2, headTilt: 6 + 3 * Math.sin(t * 3 + i), armR: { a: 64, b: 72 }, armL: d > 0 ? { a: 150 + 12 * Math.sin(t * 9 + i), b: 30 } : { a: 20, b: 14 }, ...faceAt(e, [[0, 'worried'], [Math.round(arrive[i] * 30), 'happy']]) };
          return <CharacterRig key={i} look={c.look} pose={pose} t={t} rim="amber" seed={c.seed} />;
        })}
      </CineCamera>
      <Over>
        {msgs.map((m, i) => {
          const d0 = 0.1 + i * 0.16;
          if (t < d0) return null;
          const k = springAt(f, fps, d0, HARD);
          const rise = (t - d0) * 90;
          const x = 300 + ((i * 263) % 480);
          const y = 760 - (i % 3) * 150 - rise;
          return (
            <g key={i} transform={`translate(0 ${30 * (1 - Math.min(1, k))})`} opacity={Math.min(1, k * 1.6)}>
              <Bubble x={x} y={y} w={300} h={120} side={i % 2 ? 'in' : 'out'} fill="#14532D" stroke={C4.wa} strokeW={6}>
                <text x={-120} y={16} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#F8FAFC">
                  {m}
                </text>
              </Bubble>
            </g>
          );
        })}
        {Array.from({ length: 22 }, (_, i) => {
          const age = (t * 0.9 + i / 22) % 1;
          return <circle key={i} cx={((i * 197) % 1080) + 20 * Math.sin(t * 3 + i)} cy={1300 - age * 900} r={5 * (1 - age) + 2} fill={i % 3 ? '#FDE047' : C4.wa} opacity={(1 - age) * 0.8} />;
        })}
      </Over>
    </AbsoluteFill>
  );
};

/** The storyboard list: one frame per shot, at a moment where everything in it is on screen. */
export const BOARD: [React.FC<ShotProps>, string | undefined, number, Record<string, number>][] = [
  [TitleRoof, undefined, 1.0, {}],
  [PhoneMacro, undefined, 0.8, {}],
  [CalendarTop, undefined, 1.4, { fecha: 0.2 }],
  [CityClock, undefined, 1.6, { seis: 0.1, horas: 0.3 }],
  [HackerLow, undefined, 0.8, { hackeo: 0.2, fue: 0.25 }],
  [EnterMacro, 'first', 0.7, { comando: 0.5 }],
  [NetSchem, undefined, 2.0, { internet: 0.2, tres: 1.6 }],
  [ShopMo, undefined, 1.2, { pedidos: 0.4 }],
  [MomClose, undefined, 0.9, {}],
  [DoorWide, undefined, 1.8, { denegado: 0.9 }],
  [BadgeMacro, undefined, 1.8, { tarjetas: 0.3, abrian: 0.9, puerta: 1.4 }],
  [EnterMacro, 'anchor', 0.5, { comando2: 0.4 }],
  [FriendsRoof, undefined, 1.4, {}],
];
export const WHATIF_SHOTS_04: Record<string, React.FC<ShotProps>> = {
  title: TitleRoof, phone: PhoneMacro, cal: CalendarTop, city: CityClock, hacker: HackerLow, enter: EnterMacro, schem: NetSchem,
  shop: ShopMo, mom: MomClose, door: DoorWide, badge: BadgeMacro, friends: FriendsRoof,
};
