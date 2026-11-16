import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { LOOKS, basePose, Pose, Bedroom, BEDROOM, Kitchen, KITCHEN, KitchenIsland, Study, Desk, LaptopBack, stand } from '../engine';
import { CineCamera, edgeFg } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, ShotProps, springAt } from '../components/motion';
import { KineticCaptions } from '../components/DynamicSubtitles';
import { C4, clamp, num, OutText, PhoneBody } from '../components/fallo04/parts';

// "¿Sabías que…? #01": the emergency number can go down (911, April 2014). Six shots, animated from the voice's marks; the
// storyboard (Curio01Board) draws the same shots frozen at a moment where everything is on screen.

const PIP = LOOKS.pip;
const MONO = "'DejaVu Sans Mono', monospace";
const BoardCtx = React.createContext(false);

const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** Pops a group in from a mark: scale 0.6 -> 1 with a light overshoot. */
const Pop: React.FC<{ f: number; fps: number; at: number; x: number; y: number; children?: React.ReactNode; rot?: number }> = ({ f, fps, at, x, y, children, rot = 0 }) => {
  const k = springAt(f, fps, at, HARD);
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
      {children}
    </g>
  );
};

/** The series pill: the channel's NO button and the curiosity series' name. */
export const CurioPill: React.FC = () => (
  <g transform="translate(540 172)">
    <rect x={-250} y={-40} width={500} height={80} rx={40} fill="#050A14" stroke="#FACC15" strokeWidth={5} />
    <g transform="translate(-195 0) scale(0.2)">
      <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={10} />
      <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={6} />
      <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={122} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
        NO
      </text>
    </g>
    <text x={30} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#FACC15" letterSpacing={3}>
      ¿SABÍAS QUE…?
    </text>
  </g>
);

/** Storyboard only: the caption a shot will carry (the film draws the real, timed captions itself). */
const Cap: React.FC<{ words: { text: string; key: 'yellow' | 'red' | null }[] }> = ({ words }) =>
  React.useContext(BoardCtx) ? <KineticCaptions subs={[{ start: 0, end: 99, words }]} f={30} fps={30} top={1380} /> : null;

const NoSeal: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-108} y={-96} width={240} height={240} rx={46} fill="#000" />
    <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={8} />
    <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={5} />
    <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
      NO
    </text>
  </g>
);

const Night: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="cu1bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#0F1B33" />
        <stop offset="100%" stopColor="#03060C" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#cu1bg)" />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1={0} y1={260 + i * 110} x2={1080} y2={260 + i * 110} stroke="#1E3A5F" strokeWidth={1} opacity={0.25 + 0.1 * Math.sin(t * 2 + i)} />
    ))}
  </svg>
);

/** 1. Hook: Pip at night calls 911, the call rings out and nobody answers. Frame 0 shows the whole hook (thumbnail and loop). */
export const S1: React.FC<ShotProps> = ({ t }) => {
  const me = stand(BEDROOM, 0.42, 0.72, 0.6);
  const lift = clamp(t / 0.35); // the phone goes up to the ear
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.25, look: 0.3, headTilt: 8, armR: { a: 40 + 110 * lift, b: 20 + 105 * lift }, armL: { a: 20, b: 18 }, expr: t > 1.6 ? 'shock' : 'worried' };
  const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
  const ring = [0.45, 1.25].map((a) => (t > a && t < a + 0.5 ? (t - a) / 0.5 : -1));
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x + 20} cy={me.y - 200} zoom={2.1 + 0.06 * clamp(t / 3)} tint="blue" vignette={0.8} light={{ x: me.x + 40, y: me.y - 160, r: 260, color: '#38BDF8', o: 0.45 }} fg={edgeFg(me.x + 20, me.y - 200, 2.1)}>
        <Bedroom t={80 + t} id="cb1" clock="03:12" />
        <CharacterRig look={PIP} pose={pose} t={0.4 + t} rim="blue" seed={3} />
      </CineCamera>
      <Over>
        <CurioPill />
        <OutText x={540} y={330} size={92} fill="#FFFFFF" text="MARCAS AL 911…" stroke={14} />
        <OutText x={540} y={440} size={92} fill={C4.red} text="Y NADIE CONTESTA" stroke={14} />
        <g transform="translate(800 980)">
          {ring.map((r, i) => (r >= 0 ? <rect key={i} x={-190 - 40 * r} y={-70 - 30 * r} width={380 + 80 * r} height={140 + 60 * r} rx={40} fill="none" stroke="#38BDF8" strokeWidth={6} opacity={1 - r} /> : null))}
          <rect x={-190} y={-70} width={380} height={140} rx={30} fill="#050A14" stroke={t > 2 ? C4.red : '#38BDF8'} strokeWidth={6} />
          <text y={-14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#F8FAFC">
            {`Llamando${dots} 911`}
          </text>
          <text y={40} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={t > 2 ? '#FCA5A5' : '#94A3B8'}>
            {t > 2 ? 'sin respuesta' : '00:0' + Math.min(9, Math.floor(t * 3))}
          </text>
        </g>
      </Over>
      <Cap words={[{ text: 'SE', key: null }, { text: 'PUEDE', key: null }, { text: 'CAER', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** 2. When and how big: April 2014, part of the US, all 81 emergency centres stop getting calls, for six hours. */
export const S2: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const anio = num(mark('anio'), 0.4);
  const off0 = num(mark('n911'), 2.5);
  const off1 = num(mark('llamadas'), off0 + 1.2);
  const seis = num(mark('seis'), off1 + 0.6);
  const centres: { x: number; y: number; at: number }[] = [];
  for (let i = 0; i < 81; i++) {
    const c = i % 9;
    const r = Math.floor(i / 9);
    centres.push({ x: 180 + c * 90 + (r % 2) * 40, y: 640 + r * 62, at: off0 + (off1 - off0) * (((i * 37) % 81) / 80) });
  }
  const hours = Math.min(6, Math.max(0, (t - seis + 0.3) * 8));
  return (
    <AbsoluteFill>
      <Night t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={anio - 0.05} x={540} y={330}>
          <OutText x={0} y={0} size={84} fill="#FACC15" text="ABRIL DE 2014" stroke={13} />
        </Pop>
        <OutText x={540} y={420} size={44} fill="#CBD5E1" text="PARTE DE ESTADOS UNIDOS" stroke={8} />
        <rect x={120} y={590} width={840} height={600} rx={60} fill="#0B1424" stroke="#1E3A5F" strokeWidth={5} />
        {centres.map((p, i) => {
          const off = t >= p.at;
          const blink = off && t < p.at + 0.15;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={20} fill={off ? '#3B0A0F' : '#0EA5E9'} stroke={off ? C4.red : '#7DD3FC'} strokeWidth={4} />
              {blink ? <circle cx={p.x} cy={p.y} r={32} fill="none" stroke="#FFFFFF" strokeWidth={4} /> : null}
              {off ? <path d={`M ${p.x - 8} ${p.y - 8} L ${p.x + 8} ${p.y + 8} M ${p.x + 8} ${p.y - 8} L ${p.x - 8} ${p.y + 8}`} stroke={C4.red} strokeWidth={4} strokeLinecap="round" /> : null}
            </g>
          );
        })}
        <text x={540} y={1240} textAnchor="middle" fontFamily={MONO} fontSize={32} fill="#94A3B8">
          81 CENTROS DE EMERGENCIA
        </text>
        <Pop f={f} fps={fps} at={seis - 0.3} x={540} y={1310}>
          <rect x={-170} y={-46} width={340} height={92} rx={46} fill="#050A14" stroke={C4.red} strokeWidth={6} />
          <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">
            {`⏱ ${Math.round(hours)} HORAS`}
          </text>
        </Pop>
      </Over>
      <Cap words={[{ text: 'SEIS', key: 'yellow' }, { text: 'HORAS', key: null }]} />
    </AbsoluteFill>
  );
};

/** 3. The people: the counter climbs to about 6,600 calls that nobody answered. */
export const S3: React.FC<ShotProps> = ({ t, mark }) => {
  const cifra = num(mark('cifra'), 0.3);
  const nadie = num(mark('nadie'), cifra + 1.5);
  const n = Math.round(6600 * Math.min(1, Math.max(0, (t - cifra + 0.4) / Math.max(0.6, nadie - cifra))) ** 0.6);
  const shown = Math.min(24, Math.floor(Math.max(0, t - 0.1) / 0.06));
  const txt = n >= 1000 ? `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, '0')}` : String(n);
  return (
    <AbsoluteFill>
      <Night t={t} />
      <Over>
        <CurioPill />
        {Array.from({ length: shown }, (_, i) => {
          const x = 150 + (i % 6) * 156;
          const y = 330 + Math.floor(i / 6) * 150;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={0.6}>
              <rect x={-36} y={-56} width={72} height={112} rx={14} fill="#111827" stroke="#334155" strokeWidth={4} />
              <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={C4.red} strokeWidth={6} strokeLinecap="round" />
            </g>
          );
        })}
        <rect x={60} y={880} width={960} height={330} rx={40} fill="#050A14" stroke={C4.red} strokeWidth={8} opacity={0.96} />
        <OutText x={540} y={1060} size={200} fill="#FACC15" text={txt} stroke={18} />
        <OutText x={540} y={1160} size={46} fill="#F8FAFC" text="LLAMADAS SIN RESPUESTA" stroke={8} />
      </Over>
      <Cap words={[{ text: 'Y', key: null }, { text: 'NADIE', key: null }, { text: 'CONTESTÓ', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** 4. The cause: a programming error that could have been avoided (the code is illustrative and implies no specific cause). */
export const S4: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const error = num(mark('error'), 0.6);
  const evitado = num(mark('evitado'), error + 1.4);
  const lines = ['enrutar(llamada) {', '  destino = centro911(llamada);', '  ████████████████', '  enviar(destino);', '}'];
  const typed = Math.max(0, (t - 0.05) / 0.12);
  return (
    <AbsoluteFill>
      <CineCamera cx={1060} cy={600} zoom={2.0 + 0.05 * clamp(t / 3)} tint="red" vignette={0.75} light={{ x: 1060, y: 640, r: 300, color: C4.red, o: 0.35 }} fg={edgeFg(1060, 600, 2.0)}>
        <Study t={200 + t} id="cs4" night />
        <Desk x0={520} x1={1360} y={700} laptop={false} />
        <LaptopBack x={1060} y={700} w={250} glow={1} />
      </CineCamera>
      <Over>
        <CurioPill />
        <g transform="translate(540 760)">
          <rect x={-440} y={-230} width={880} height={460} rx={26} fill="#05070C" stroke="#334155" strokeWidth={6} opacity={0.97} />
          {lines.map((l, i) =>
            i < typed ? (
              <g key={i}>
                {i === 2 && t >= error - 0.05 ? <rect x={-420} y={-160 + i * 76} width={840} height={64} rx={8} fill={C4.red} opacity={0.35 + 0.25 * Math.abs(Math.sin(t * 6))} /> : null}
                <text x={-400} y={-115 + i * 76} fontFamily={MONO} fontSize={40} fill={i === 2 ? '#FCA5A5' : '#86EFAC'}>
                  {l}
                </text>
              </g>
            ) : null,
          )}
        </g>
        <Pop f={f} fps={fps} at={evitado - 0.08} x={540} y={1130} rot={-6}>
          <rect x={-300} y={-60} width={600} height={120} rx={14} fill="none" stroke={C4.red} strokeWidth={10} />
          <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={C4.red}>
            EVITABLE
          </text>
        </Pop>
        <text x={540} y={1300} textAnchor="middle" fontFamily={HEAVY} fontWeight={700} fontSize={26} fill="#CBD5E1">
          Código ilustrativo · Según la FCC
        </text>
      </Over>
      <Cap words={[{ text: 'ERROR', key: 'red' }, { text: 'DE', key: null }, { text: 'PROGRAMACIÓN', key: null }]} />
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
      <CineCamera cx={me.x - 40} cy={me.y - 120} zoom={2.1} tint="amber" vignette={0.65} light={{ x: me.x - 60, y: me.y - 100, r: 300, color: '#FDE68A', o: 0.4 }} fg={edgeFg(me.x - 40, me.y - 120, 2.1)}>
        <Kitchen t={120 + t} id="ck5" veil={0.4} />
        <CharacterRig look={PIP} pose={pose} t={0.4 + t} rim="amber" seed={6} />
        <KitchenIsland stools={false} />
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

/** 6. The close: the channel's signature, the series number and the way into Fallo #04. */
export const S6: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const fallo = num(mark('fallo'), 2);
  const tap = t > fallo;
  return (
    <AbsoluteFill>
      <Night t={t} />
      <Over>
        <Pop f={f} fps={fps} at={0.05} x={0} y={0}>
          <NoSeal x={135} y={420} s={0.5} />
          <OutText x={625} y={455} size={92} fill="#FF2A2A" text="NO PRESIONES" stroke={14} />
        </Pop>
        <Pop f={f} fps={fps} at={0.25} x={540} y={640}>
          <OutText x={0} y={0} size={80} fill="#FACC15" text="¿SABÍAS QUE…? #01" stroke={13} />
        </Pop>
        <Pop f={f} fps={fps} at={0.45} x={540} y={1020}>
          <PhoneBody x={0} y={0} s={0.42} glow={0.4}>
            <text x={0} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#F8FAFC">
              Ya llegué
            </text>
            <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#FCA5A5">
              No se pudo enviar
            </text>
          </PhoneBody>
        </Pop>
        <Pop f={f} fps={fps} at={0.65} x={540} y={1330}>
          <g transform={`scale(${tap ? 0.94 : 1 + 0.04 * Math.sin(t * 7)})`}>
            <rect x={-330} y={-58} width={660} height={116} rx={58} fill={tap ? '#FFFFFF' : '#FACC15'} stroke="#000" strokeWidth={8} />
            <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000">
              MIRA EL FALLO #04 ▶
            </text>
          </g>
        </Pop>
      </Over>
    </AbsoluteFill>
  );
};

export const CURIO_SHOTS: Record<string, React.FC<ShotProps>> = { c1: S1, c2: S2, c3: S3, c4: S4, c5: S5, c6: S6 };

/** The storyboard: frame n is shot n, frozen at a moment where everything in it is on screen. */
export const Curio01Board: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(5, f);
  const Shot = [S1, S2, S3, S4, S5, S6][i];
  const t = i === 0 ? 2.4 : 6;
  return (
    <BoardCtx.Provider value>
      <AbsoluteFill style={{ background: '#03060C' }}>
        <Shot t={t} f={Math.round(t * 30)} fps={30} dur={8} mark={() => 0.5} />
      </AbsoluteFill>
    </BoardCtx.Provider>
  );
};
