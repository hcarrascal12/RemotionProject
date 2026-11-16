import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { LOOKS, basePose, Pose, BEDROOM, KITCHEN, stand } from '../engine';
import { CineCamera } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, ShotProps, springAt } from '../components/motion';
import { KineticCaptions } from '../components/DynamicSubtitles';
import { AppGlyph, C4, clamp, num, OutText, PhoneBody } from '../components/fallo04/parts';

// "¿Sabías que…? #01": the emergency number can go down (911, April 2014). The curiosity series is the friendly door into the
// Fallos: daylight, warm colours, Pip curious rather than scared; its last line is a second "¿y sabías que…?" that opens the
// dark door of a Fallo. Five shots animated from the voice's marks; the storyboard (Curio01Board) freezes the same shots.

const PIP = LOOKS.pip;
const MONO = "'DejaVu Sans Mono', monospace";
// the curiosity palette: daylight and warm, so it never looks like a Fallo
export const CU = { cream: '#FFF4DC', sand: '#FDE7C8', ink: '#1E293B', soft: '#64748B', coral: '#F25F5C', teal: '#14B8A6', sun: '#F59E0B', card: '#FFFFFF' };
const BoardCtx = React.createContext(false);

export const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** Pops a group in from a mark: scale 0.6 -> 1 with a light overshoot. */
export const Pop: React.FC<{ f: number; fps: number; at: number; x: number; y: number; children?: React.ReactNode; rot?: number }> = ({ f, fps, at, x, y, children, rot = 0 }) => {
  const k = springAt(f, fps, at, HARD);
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
      {children}
    </g>
  );
};

export const NoSeal: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-108} y={-96} width={240} height={240} rx={46} fill="#000" />
    <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={8} />
    <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={5} />
    <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
      NO
    </text>
  </g>
);

/** The series pill: white and sunny, the channel's NO button and the curiosity series' name. */
export const CurioPill: React.FC = () => (
  <g transform="translate(540 172)">
    <rect x={-250} y={-40} width={500} height={80} rx={40} fill={CU.card} stroke={CU.sun} strokeWidth={6} />
    <NoSeal x={-195} y={0} s={0.2} />
    <text x={30} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={CU.ink} letterSpacing={3}>
      ¿SABÍAS QUE…?
    </text>
  </g>
);

/** Storyboard only: the caption a shot will carry (the film draws the real, timed captions itself). */
const Cap: React.FC<{ words: { text: string; key: 'yellow' | 'red' | null }[] }> = ({ words }) =>
  React.useContext(BoardCtx) ? <KineticCaptions subs={[{ start: 0, end: 99, words }]} f={30} fps={30} top={1380} /> : null;

/** Daylight paper: warm gradient, soft floating circles. */
export const Day: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <linearGradient id="cu1day" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CU.cream} />
        <stop offset="100%" stopColor={CU.sand} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#cu1day)" />
    {Array.from({ length: 9 }, (_, i) => (
      <circle key={i} cx={(i * 211 + 40 * Math.sin(t * 0.6 + i)) % 1080} cy={300 + ((i * 397) % 1400) + 20 * Math.cos(t * 0.5 + i)} r={40 + (i % 3) * 30} fill={i % 2 ? '#FFFFFF' : '#FCD9A8'} opacity={0.35} />
    ))}
  </svg>
);

/** A daylight room in world space: cream wall, a sunny window, a frame, a plant and a warm floor (the night sets stay for the Fallos). */
const DayRoom: React.FC<{ cx: number; floorY: number; t: number; fridge?: boolean }> = ({ cx, floorY, t, fridge = false }) => (
  <g>
    <rect x={cx - 900} y={floorY - 900} width={1800} height={900} fill={CU.cream} />
    <rect x={cx - 900} y={floorY} width={1800} height={600} fill={CU.sand} />
    <line x1={cx - 900} y1={floorY} x2={cx + 900} y2={floorY} stroke="#E9C9A0" strokeWidth={6} />
    {/* the window with the sun */}
    <rect x={cx - 380} y={floorY - 520} width={230} height={260} rx={14} fill="#BEE7F5" stroke={CU.ink} strokeWidth={6} />
    <circle cx={cx - 300} cy={floorY - 440} r={34 + 3 * Math.sin(t * 2)} fill="#FCD34D" />
    <line x1={cx - 265} y1={floorY - 520} x2={cx - 265} y2={floorY - 260} stroke={CU.ink} strokeWidth={5} />
    <line x1={cx - 380} y1={floorY - 390} x2={cx - 150} y2={floorY - 390} stroke={CU.ink} strokeWidth={5} />
    {fridge ? (
      <g>
        <rect x={cx + 120} y={floorY - 560} width={220} height={560} rx={18} fill="#F8FAFC" stroke={CU.ink} strokeWidth={6} />
        <line x1={cx + 120} y1={floorY - 360} x2={cx + 340} y2={floorY - 360} stroke={CU.ink} strokeWidth={5} />
        <rect x={cx + 140} y={floorY - 520} width={14} height={90} rx={7} fill={CU.soft} />
      </g>
    ) : (
      <g>
        <rect x={cx + 170} y={floorY - 500} width={150} height={120} rx={8} fill="#FDE68A" stroke={CU.ink} strokeWidth={5} />
        <path d={`M ${cx + 185} ${floorY - 395} L ${cx + 230} ${floorY - 450} L ${cx + 260} ${floorY - 420} L ${cx + 300} ${floorY - 465} L ${cx + 305} ${floorY - 395} Z`} fill={CU.teal} />
      </g>
    )}
    {/* a plant */}
    <rect x={cx + 380} y={floorY - 90} width={80} height={90} rx={10} fill={CU.coral} stroke={CU.ink} strokeWidth={5} />
    {[-30, 0, 30].map((a, i) => (
      <ellipse key={i} cx={cx + 420 + a} cy={floorY - 140 - (i === 1 ? 30 : 0)} rx={22} ry={52} fill="#4ADE80" stroke={CU.ink} strokeWidth={4} transform={`rotate(${a} ${cx + 420 + a} ${floorY - 140})`} />
    ))}
  </g>
);

/** 1. Hook: Pip calls 911 in daylight; it rings and nobody answers. Frame 0 shows the whole hook (thumbnail and loop). */
export const S1: React.FC<ShotProps> = ({ t }) => {
  const me = stand(BEDROOM, 0.42, 0.72, 0.6);
  const lift = clamp(t / 0.35); // the phone goes up to the ear
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.25, look: 0.3, headTilt: 8, armR: { a: 40 + 110 * lift, b: 20 + 105 * lift }, armL: { a: 20, b: 18 }, expr: t > 1.6 ? 'oops' : 'neutral' };
  const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
  const ring = [0.45, 1.25].map((a) => (t > a && t < a + 0.5 ? (t - a) / 0.5 : -1));
  const dead = t > 2;
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x + 20} cy={me.y - 200} zoom={2.1 + 0.06 * clamp(t / 3)} tint="amber" vignette={0.12} bg={CU.cream} light={{ x: me.x + 40, y: me.y - 160, r: 360, color: '#FFF1C1', o: 0.5 }}>
        <DayRoom cx={me.x} floorY={BEDROOM.P(0.42, 1, 0.72).y} t={t} />
        <CharacterRig look={PIP} pose={pose} t={0.4 + t} rim="amber" seed={3} />
      </CineCamera>
      <Over>
        <CurioPill />
        <OutText x={540} y={330} size={100} fill="#FFFFFF" text="¿EL 911" stroke={15} />
        <OutText x={540} y={445} size={100} fill={CU.coral} text="SE PUEDE CAER?" stroke={15} />
        <g transform="translate(540 540)">
          <rect x={-230} y={-34} width={460} height={68} rx={34} fill={CU.card} stroke={CU.sun} strokeWidth={5} />
          <circle cx={-185} cy={0} r={18} fill="#FCD34D" stroke={CU.sun} strokeWidth={4} />
          <text x={20} y={13} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill={CU.ink}>
            UN DÍA NORMAL
          </text>
        </g>
        <g transform="translate(800 980)">
          {ring.map((r, i) => (r >= 0 ? <rect key={i} x={-190 - 40 * r} y={-70 - 30 * r} width={380 + 80 * r} height={140 + 60 * r} rx={40} fill="none" stroke={CU.teal} strokeWidth={6} opacity={1 - r} /> : null))}
          <rect x={-190} y={-70} width={380} height={140} rx={30} fill={CU.card} stroke={dead ? CU.coral : CU.teal} strokeWidth={6} />
          <text y={-14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
            {`Llamando${dots} 911`}
          </text>
          <text y={40} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={dead ? CU.coral : CU.soft}>
            {dead ? 'sin respuesta' : '00:0' + Math.min(9, Math.floor(t * 3))}
          </text>
        </g>
      </Over>
      <Cap words={[{ text: 'SIN', key: null }, { text: 'TORMENTA', key: 'yellow' }]} />
    </AbsoluteFill>
  );
};

/** 2. When and how much: 2014, six hours, the phones that got no answer (about 6,600 calls). */
export const S2: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const anio = num(mark('anio'), 0.3);
  const horas = num(mark('horas'), anio + 0.8);
  const miles = num(mark('miles'), horas + 0.5);
  const nadie = num(mark('nadie'), miles + 1);
  const n = Math.round(6600 * Math.min(1, Math.max(0, (t - miles + 0.2) / Math.max(0.6, nadie - miles + 0.3))) ** 0.6);
  const shown = Math.min(24, Math.floor(Math.max(0, t - miles + 0.3) / 0.05));
  const txt = n >= 1000 ? `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, '0')}` : String(n);
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={anio - 0.05} x={540} y={330}>
          <OutText x={0} y={0} size={96} fill={CU.sun} text="2014" stroke={14} />
        </Pop>
        <Pop f={f} fps={fps} at={horas - 0.1} x={540} y={430}>
          <rect x={-170} y={-46} width={340} height={92} rx={46} fill={CU.card} stroke={CU.coral} strokeWidth={6} />
          <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={CU.ink}>
            {`⏱ ${Math.round(Math.min(6, Math.max(0, (t - horas + 0.3) * 10)))} HORAS`}
          </text>
        </Pop>
        {Array.from({ length: shown }, (_, i) => {
          const x = 150 + (i % 6) * 156;
          const y = 560 + Math.floor(i / 6) * 120;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${((i % 3) - 1) * 4}) scale(0.85)`}>
              <rect x={-36} y={-56} width={72} height={112} rx={14} fill={CU.card} stroke={CU.ink} strokeWidth={4} />
              <circle cx={0} cy={0} r={18} fill="#FDE2E1" />
              <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={CU.coral} strokeWidth={5} strokeLinecap="round" />
            </g>
          );
        })}
        {t > miles - 0.2 ? (
          <g>
            <rect x={60} y={1050} width={960} height={250} rx={40} fill={CU.card} stroke={CU.coral} strokeWidth={8} />
            <OutText x={540} y={1190} size={150} fill={CU.sun} text={txt} stroke={16} />
            <text x={540} y={1268} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
              LLAMADAS SIN RESPUESTA
            </text>
          </g>
        ) : null}
      </Over>
      <Cap words={[{ text: 'SIN', key: null }, { text: 'RESPUESTA', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** A small phone icon travelling along the route. */
const MiniCall: React.FC<{ x: number; y: number; s?: number; stuck?: boolean }> = ({ x, y, s = 1, stuck = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-34} width={44} height={68} rx={10} fill={CU.card} stroke={CU.ink} strokeWidth={4} />
    <circle cx={0} cy={0} r={10} fill={stuck ? CU.coral : CU.teal} />
  </g>
);

/** 3. The strangest bit: calls from Washington got stuck at a routing centre in Colorado. */
export const S3: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const wash = num(mark('wash'), 0.6);
  const atasc = num(mark('atasc'), wash + 1.2);
  const colorado = num(mark('colorado'), atasc + 1.5);
  const W = { x: 300, y: 560 };
  const C = { x: 640, y: 1010 };
  const calls = Array.from({ length: 14 }, (_, i) => {
    const st = wash - 0.2 + i * 0.16;
    const p = Math.min(1, Math.max(0, (t - st) / 0.7));
    const pile = { x: C.x - 70 + (i % 5) * 36, y: C.y - 70 - Math.floor(i / 5) * 46 };
    return { p, x: W.x + (pile.x - W.x) * p, y: W.y + (pile.y - W.y) * p - 120 * Math.sin(Math.PI * p), on: t >= st };
  });
  const stuck = t >= atasc - 0.05;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={86} fill={CU.coral} text="¿LO MÁS RARO?" stroke={14} />
        </Pop>
        {/* a soft paper map */}
        <rect x={90} y={420} width={900} height={760} rx={50} fill={CU.card} stroke="#F5D0A9" strokeWidth={6} />
        <path d="M 160 520 Q 300 470 470 500 T 900 520 L 930 1080 Q 700 1120 470 1100 T 150 1060 Z" fill="#E8F6F3" stroke="#B9E4DC" strokeWidth={4} />
        <path d={`M ${W.x} ${W.y} Q ${(W.x + C.x) / 2 - 60} ${(W.y + C.y) / 2 - 140} ${C.x} ${C.y}`} fill="none" stroke={CU.soft} strokeWidth={5} strokeDasharray="14 12" />
        <g transform={`translate(${W.x} ${W.y})`}>
          <circle r={24} fill={CU.teal} stroke={CU.ink} strokeWidth={4} />
          <text y={-40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
            WASHINGTON
          </text>
        </g>
        <g transform={`translate(${C.x} ${C.y})`}>
          <rect x={-60} y={-40} width={120} height={80} rx={12} fill={stuck ? '#FDE2E1' : '#F1F5F9'} stroke={stuck ? CU.coral : CU.ink} strokeWidth={5} />
          <text y={78} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink} opacity={t > colorado - 0.3 ? 1 : 0.35}>
            COLORADO
          </text>
        </g>
        {calls.map((c, i) => (c.on ? <MiniCall key={i} x={c.x} y={c.y} s={0.9} stuck={stuck && c.p >= 1} /> : null))}
        <Pop f={f} fps={fps} at={atasc - 0.05} x={860} y={880} rot={8}>
          <rect x={-150} y={-44} width={300} height={88} rx={20} fill={CU.coral} stroke={CU.ink} strokeWidth={5} />
          <text y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF">
            ATASCADAS
          </text>
        </Pop>
      </Over>
      <Cap words={[{ text: 'ATASCADAS', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** A friendly bug: the "programming error", walking along the bad line of code. */
const Bug: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const step = Math.sin(t * 22) * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-1, 0, 1].map((i) => (
        <g key={i}>
          <line x1={i * 18} y1={0} x2={i * 22 - 8 + step * (i % 2 ? 1 : -1)} y2={34} stroke={CU.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={i * 18} y1={0} x2={i * 22 + 8 - step * (i % 2 ? 1 : -1)} y2={-34} stroke={CU.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={46} ry={30} fill={CU.coral} stroke={CU.ink} strokeWidth={5} />
      <line x1={0} y1={-28} x2={0} y2={28} stroke={CU.ink} strokeWidth={4} />
      <circle cx={-14} cy={-6} r={6} fill={CU.ink} />
      <circle cx={14} cy={8} r={6} fill={CU.ink} />
      <circle cx={52} cy={0} r={18} fill={CU.ink} />
      <circle cx={58} cy={-6} r={5} fill="#FFF" />
      <circle cx={58} cy={6} r={5} fill="#FFF" />
      <path d="M 64 -12 Q 84 -36 92 -30 M 64 12 Q 84 36 92 30" stroke={CU.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** 4. Why: each call got a number from a counter capped at 40 million; at the cap the system stopped passing calls. */
export const S4: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const contador = num(mark('contador'), 0.5);
  const tope = num(mark('tope'), contador + 1.5);
  const millones = num(mark('millones'), tope + 0.8);
  const dejo = num(mark('dejo'), millones + 1.2);
  const cap = 40000000;
  const run = Math.min(1, Math.max(0, (t - contador + 0.2) / Math.max(0.6, tope - contador + 0.2)));
  const value = t >= tope ? cap : Math.floor(cap * (1 - Math.pow(1 - run, 3)) * 0.99999);
  const digits = String(value).padStart(8, '0').split('');
  const hit = t >= tope ? Math.exp(-(t - tope) / 0.25) : 0;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={96} fill={CU.sun} text="¿POR QUÉ?" stroke={14} />
        </Pop>
        <text x={540} y={500} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
          CONTADOR DE LLAMADAS
        </text>
        <g transform={`translate(540 680) translate(${(Math.sin(t * 90) * 10 * hit).toFixed(1)} 0)`}>
          <rect x={-470} y={-120} width={940} height={240} rx={34} fill={CU.ink} stroke={t >= tope ? CU.coral : CU.ink} strokeWidth={10} />
          {digits.map((d, i) => (
            <g key={i} transform={`translate(${-385 + i * 110} 0)`}>
              <rect x={-46} y={-86} width={92} height={172} rx={14} fill={t >= tope ? '#FDE2E1' : '#F8FAFC'} />
              <text y={46} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={120} fill={t >= tope ? CU.coral : CU.ink}>
                {d}
              </text>
            </g>
          ))}
        </g>
        <Pop f={f} fps={fps} at={tope - 0.05} x={540} y={900} rot={-5}>
          <rect x={-200} y={-58} width={400} height={116} rx={16} fill={CU.card} stroke={CU.coral} strokeWidth={10} />
          <text y={24} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill={CU.coral}>
            TOPE
          </text>
        </Pop>
        <Pop f={f} fps={fps} at={millones - 0.05} x={540} y={1050}>
          <OutText x={0} y={0} size={70} fill={CU.ink} text="40.000.000" stroke={0} />
        </Pop>
        {t > dejo - 0.1 ? (
          <g transform="translate(540 1180)">
            {[-2, -1, 0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 120} 0)`}>
                <MiniCall x={0} y={0} s={1.1} stuck />
              </g>
            ))}
            <line x1={-320} y1={-60} x2={320} y2={60} stroke={CU.coral} strokeWidth={14} strokeLinecap="round" />
          </g>
        ) : null}
        {t >= tope ? <Bug x={540 + 380} y={540} t={t} /> : null}
        <text x={540} y={1300} textAnchor="middle" fontFamily={HEAVY} fontWeight={700} fontSize={26} fill={CU.soft}>
          Según la FCC (Comisión Federal de Comunicaciones de EE. UU.)
        </text>
      </Over>
      <Cap words={[{ text: 'LLEGÓ', key: null }, { text: 'A', key: null }, { text: 'SU', key: null }, { text: 'TOPE', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** 5. The takeaway: Pip sticks a note with the direct numbers on the fridge. */
export const S5: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const me = stand(KITCHEN, 0.58, 0.7, 0.62);
  const stick = 0.35;
  const sk = springAt(f, fps, stick, HARD);
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: -0.2, look: -0.3, armL: { a: 150 - 20 * Math.min(1, sk), b: 20 }, armR: { a: 30, b: 20 }, expr: t > stick + 0.2 ? 'happy' : 'neutral' };
  const policia = num(mark('policia'), 1.5);
  const bomberos = num(mark('bomberos'), 2.5);
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x - 40} cy={me.y - 120} zoom={2.1} tint="amber" vignette={0.12} bg={CU.cream} light={{ x: me.x - 60, y: me.y - 100, r: 380, color: '#FFF1C1', o: 0.5 }}>
        <DayRoom cx={me.x} floorY={KITCHEN.P(0.58, 1, 0.7).y} t={t} fridge />
        <CharacterRig look={PIP} pose={pose} t={0.4 + t} rim="amber" seed={6} />
      </CineCamera>
      <Over>
        <CurioPill />
        <g transform={`translate(270 ${600 - 120 * (1 - Math.min(1, sk))}) rotate(${-4 + 8 * (1 - Math.min(1, sk))}) scale(0.85)`} opacity={Math.min(1, sk * 2)}>
          <rect x={-200} y={-170} width={400} height={340} fill="#FDE68A" stroke="#0B0B0B" strokeWidth={6} />
          <rect x={-40} y={-190} width={80} height={36} fill="#FCA5A5" opacity={0.85} />
          <text x={-170} y={-70} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#0B1220" opacity={t > policia - 0.1 ? 1 : 0.25}>
            POLICÍA
          </text>
          <line x1={-170} y1={-20} x2={170} y2={-20} stroke="#0B1220" strokeWidth={4} strokeDasharray="10 10" />
          <text x={-170} y={60} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#0B1220" opacity={t > bomberos - 0.1 ? 1 : 0.25}>
            BOMBEROS
          </text>
          <line x1={-170} y1={110} x2={170} y2={110} stroke="#0B1220" strokeWidth={4} strokeDasharray="10 10" />
        </g>
      </Over>
      <Cap words={[{ text: 'POR', key: null }, { text: 'SI', key: null }, { text: 'ACASO', key: 'yellow' }]} />
    </AbsoluteFill>
  );
};

/** 6. The hand-over: "¿Y sabías que…?" the three apps fall, and the dark door of the Fallos opens on Fallo #04. */
export const S6: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const apps = num(mark('apps'), 0.6);
  const vez = num(mark('vez'), apps + 1.6);
  const fallo = num(mark('fallo'), vez + 0.8);
  // the door rises as the apps fall ("a la vez"), so FALLO #04 is on screen while it is said
  const door = springAt(f, fps, Math.min(vez + 0.15, fallo - 0.45), { stiffness: 140, damping: 18, mass: 0.8 });
  const doorY = 1920 - 1240 * Math.min(1, door);
  const tap = t > fallo + 0.5;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={96} fill={CU.sun} text="¿Y SABÍAS QUE…?" stroke={14} />
        </Pop>
        {(['wa'] as const).map((k, i) => {
          const at = apps + i * 0.25;
          const kk = springAt(f, fps, at, HARD);
          const fall = t > vez ? (t - vez) * (t - vez) * 900 : 0;
          return kk > 0.01 ? (
            <g key={k} transform={`translate(${540 + i * 240} ${600 + fall}) rotate(${t > vez ? (i - 1) * 30 * (t - vez) : 0}) scale(${0.6 + 0.4 * Math.min(1.08, kk)})`}>
              <AppGlyph kind={k} x={0} y={0} r={130} on={t > vez ? 0 : 1} />
            </g>
          ) : null;
        })}
        {/* the dark door of the Fallos: the other series, one tap away */}
        <g transform={`translate(0 ${doorY})`}>
          <rect x={40} y={0} width={1000} height={1300} rx={60} fill="#050A14" stroke={C4.red} strokeWidth={10} />
          <NoSeal x={210} y={120} s={0.42} />
          <OutText x={630} y={150} size={80} fill="#FF2A2A" text="NO PRESIONES" stroke={12} />
          <OutText x={540} y={330} size={130} fill="#FACC15" text="FALLO #04" stroke={16} />
          <PhoneBody x={540} y={640} s={0.36} glow={0.4}>
            <text x={0} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#F8FAFC">
              Ya llegué
            </text>
            <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#FCA5A5">
              No se pudo enviar
            </text>
          </PhoneBody>
          <g transform={`translate(540 940) scale(${tap ? 0.94 : 1 + 0.04 * Math.sin(t * 7)})`}>
            <rect x={-330} y={-58} width={660} height={116} rx={58} fill={tap ? '#FFFFFF' : '#FACC15'} stroke="#000" strokeWidth={8} />
            <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000">
              VER EL FALLO #04 ▶
            </text>
          </g>
        </g>
      </Over>
    </AbsoluteFill>
  );
};

export const CURIO_SHOTS: Record<string, React.FC<ShotProps>> = { c1: S1, c2: S2, c3: S3, c4: S4, c6: S6 };

/** The storyboard: frame n is shot n, frozen at a moment where everything in it is on screen. */
export const Curio01Board: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(4, f);
  const Shot = [S1, S2, S3, S4, S6][i];
  const t = i === 0 ? 2.4 : 6;
  return (
    <BoardCtx.Provider value>
      <AbsoluteFill style={{ background: CU.cream }}>
        <Shot t={t} f={Math.round(t * 30)} fps={30} dur={8} mark={(n) => (i === 4 ? ({ apps: 0.3, vez: 9, fallo: 1.2 } as Record<string, number>)[n] ?? 0.5 : ({ wash: 0.3, atasc: 2.5, colorado: 3, contador: 0.3, tope: 1.5, millones: 2, dejo: 3, anio: 0.2, horas: 0.6, miles: 1, nadie: 2 } as Record<string, number>)[n] ?? 0.5)} />
      </AbsoluteFill>
    </BoardCtx.Provider>
  );
};
