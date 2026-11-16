import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { LOOKS, basePose, Pose, Bedroom, BEDROOM, Kitchen, KITCHEN, KitchenIsland, Study, Desk, LaptopBack, stand } from '../engine';
import { CineCamera, edgeFg } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HEAVY } from '../components/motion';
import { KineticCaptions } from '../components/DynamicSubtitles';
import { C4, OutText, PhoneBody } from '../components/fallo04/parts';

// "¿Sabías que…? #01": the emergency number can go down (911, April 2014). The storyboard: one frame per shot (frame n = shot n),
// drawn with the series' own pieces so the same shots can be animated afterwards.

const PIP = LOOKS.pip;
const MONO = "'DejaVu Sans Mono', monospace";

const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** The series pill: the channel's NO button and the curiosity series' name. */
const Pill: React.FC = () => (
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

const Cap: React.FC<{ words: { text: string; key: 'yellow' | 'red' | null }[] }> = ({ words }) => (
  <KineticCaptions subs={[{ start: 0, end: 99, words }]} f={30} fps={30} top={1380} />
);

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

const Night: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="cu1bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#0F1B33" />
        <stop offset="100%" stopColor="#03060C" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#cu1bg)" />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1={0} y1={260 + i * 110} x2={1080} y2={260 + i * 110} stroke="#1E3A5F" strokeWidth={1} opacity={0.35} />
    ))}
  </svg>
);

/** 1. Hook: Pip at night, phone to the ear; the call to 911 goes nowhere. */
const S1: React.FC = () => {
  const me = stand(BEDROOM, 0.42, 0.72, 0.6);
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.25, look: 0.3, headTilt: 8, armR: { a: 150, b: 125 }, armL: { a: 20, b: 18 }, expr: 'worried' };
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x + 20} cy={me.y - 200} zoom={2.1} tint="blue" vignette={0.8} light={{ x: me.x + 40, y: me.y - 160, r: 260, color: '#38BDF8', o: 0.45 }} fg={edgeFg(me.x + 20, me.y - 200, 2.1)}>
        <Bedroom t={80} id="cb1" clock="03:12" />
        <CharacterRig look={PIP} pose={pose} t={0.4} rim="blue" seed={3} />
      </CineCamera>
      <Over>
        <Pill />
        <OutText x={540} y={330} size={92} fill="#FFFFFF" text="MARCAS AL 911…" stroke={14} />
        <OutText x={540} y={440} size={92} fill={C4.red} text="Y NADIE CONTESTA" stroke={14} />
        <g transform="translate(800 980)">
          <rect x={-190} y={-70} width={380} height={140} rx={30} fill="#050A14" stroke={C4.red} strokeWidth={6} />
          <text y={-14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#F8FAFC">
            Llamando… 911
          </text>
          <text y={40} textAnchor="middle" fontFamily={MONO} fontSize={34} fill="#FCA5A5">
            sin respuesta
          </text>
        </g>
      </Over>
      <Cap words={[{ text: 'SE', key: null }, { text: 'PUEDE', key: null }, { text: 'CAER', key: 'red' }]} />
    </AbsoluteFill>
  );
};

/** 2. When and how big: April 2014, the US, 81 emergency centres dark for six hours. */
const S2: React.FC = () => {
  const centres: { x: number; y: number; off: boolean }[] = [];
  for (let i = 0; i < 81; i++) {
    const c = i % 9;
    const r = Math.floor(i / 9);
    centres.push({ x: 180 + c * 90 + (r % 2) * 40, y: 640 + r * 62, off: true }); // all 81 stopped getting calls
  }
  return (
    <AbsoluteFill>
      <Night />
      <Over>
        <Pill />
        <OutText x={540} y={330} size={84} fill="#FACC15" text="ABRIL DE 2014" stroke={13} />
        <OutText x={540} y={420} size={44} fill="#CBD5E1" text="ESTADOS UNIDOS" stroke={8} />
        <rect x={120} y={590} width={840} height={600} rx={60} fill="#0B1424" stroke="#1E3A5F" strokeWidth={5} />
        {centres.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={20} fill={p.off ? '#3B0A0F' : '#0EA5E9'} stroke={p.off ? C4.red : '#7DD3FC'} strokeWidth={4} />
            {p.off ? <path d={`M ${p.x - 8} ${p.y - 8} L ${p.x + 8} ${p.y + 8} M ${p.x + 8} ${p.y - 8} L ${p.x - 8} ${p.y + 8}`} stroke={C4.red} strokeWidth={4} strokeLinecap="round" /> : null}
          </g>
        ))}
        <text x={540} y={1240} textAnchor="middle" fontFamily={MONO} fontSize={32} fill="#94A3B8">
          81 CENTROS DE EMERGENCIA
        </text>
        <g transform="translate(540 1310)">
          <rect x={-170} y={-46} width={340} height={92} rx={46} fill="#050A14" stroke={C4.red} strokeWidth={6} />
          <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">
            ⏱ 6 HORAS
          </text>
        </g>
      </Over>
      <Cap words={[{ text: 'SEIS', key: 'yellow' }, { text: 'HORAS', key: null }]} />
    </AbsoluteFill>
  );
};

/** 3. The people: about 6,600 calls that nobody answered. */
const S3: React.FC = () => (
  <AbsoluteFill>
    <Night />
    <Over>
      <Pill />
      {Array.from({ length: 24 }, (_, i) => {
        const x = 150 + (i % 6) * 156;
        const y = 330 + Math.floor(i / 6) * 150;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={0.55}>
            <rect x={-36} y={-56} width={72} height={112} rx={14} fill="#111827" stroke="#334155" strokeWidth={4} />
            <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={C4.red} strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })}
      <rect x={60} y={880} width={960} height={330} rx={40} fill="#050A14" stroke={C4.red} strokeWidth={8} opacity={0.96} />
      <OutText x={540} y={1060} size={200} fill="#FACC15" text="6.600" stroke={18} />
      <OutText x={540} y={1160} size={46} fill="#F8FAFC" text="LLAMADAS SIN RESPUESTA" stroke={8} />
    </Over>
    <Cap words={[{ text: 'Y', key: null }, { text: 'NADIE', key: null }, { text: 'CONTESTÓ', key: 'red' }]} />
  </AbsoluteFill>
);

/** 4. The cause: a programming error that could have been avoided. */
const S4: React.FC = () => {
  // illustrative only: no cause is implied beyond "a programming error" (the counter detail is unconfirmed)
  const lines = ['enrutar(llamada) {', '  destino = centro911(llamada);', '  ████████████████', '  enviar(destino);', '}'];
  return (
    <AbsoluteFill>
      <CineCamera cx={1060} cy={600} zoom={2.0} tint="red" vignette={0.75} light={{ x: 1060, y: 640, r: 300, color: C4.red, o: 0.35 }} fg={edgeFg(1060, 600, 2.0)}>
        <Study t={200} id="cs4" night />
        <Desk x0={520} x1={1360} y={700} laptop={false} />
        <LaptopBack x={1060} y={700} w={250} glow={1} />
      </CineCamera>
      <Over>
        <Pill />
        <g transform="translate(540 760)">
          <rect x={-440} y={-230} width={880} height={460} rx={26} fill="#05070C" stroke="#334155" strokeWidth={6} opacity={0.97} />
          {lines.map((l, i) => (
            <g key={i}>
              {i === 2 ? <rect x={-420} y={-160 + i * 76} width={840} height={64} rx={8} fill={C4.red} opacity={0.35} /> : null}
              <text x={-400} y={-115 + i * 76} fontFamily={MONO} fontSize={40} fill={i === 2 ? '#FCA5A5' : '#86EFAC'}>
                {l}
              </text>
            </g>
          ))}
        </g>
        <g transform="translate(540 1130) rotate(-6)">
          <rect x={-300} y={-60} width={600} height={120} rx={14} fill="none" stroke={C4.red} strokeWidth={10} />
          <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={C4.red}>
            EVITABLE
          </text>
        </g>
        <text x={540} y={1300} textAnchor="middle" fontFamily={HEAVY} fontWeight={700} fontSize={26} fill="#CBD5E1">
          Código ilustrativo · Según la FCC
        </text>
      </Over>
      <Cap words={[{ text: 'ERROR', key: 'red' }, { text: 'DE', key: null }, { text: 'PROGRAMACIÓN', key: null }]} />
    </AbsoluteFill>
  );
};

/** 5. The takeaway: write down the direct numbers. */
const S5: React.FC = () => {
  const me = stand(KITCHEN, 0.58, 0.7, 0.62);
  const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: -0.2, look: -0.3, armL: { a: 150, b: 20 }, armR: { a: 30, b: 20 }, expr: 'happy' };
  return (
    <AbsoluteFill>
      <CineCamera cx={me.x - 40} cy={me.y - 120} zoom={2.1} tint="amber" vignette={0.65} light={{ x: me.x - 60, y: me.y - 100, r: 300, color: '#FDE68A', o: 0.4 }} fg={edgeFg(me.x - 40, me.y - 120, 2.1)}>
        <Kitchen t={120} id="ck5" veil={0.4} />
        <CharacterRig look={PIP} pose={pose} t={0.4} rim="amber" seed={6} />
        <KitchenIsland stools={false} />
      </CineCamera>
      <Over>
        <Pill />
        <g transform="translate(270 600) rotate(-4) scale(0.85)">
          <rect x={-200} y={-170} width={400} height={340} fill="#FDE68A" stroke="#0B0B0B" strokeWidth={6} />
          <rect x={-40} y={-190} width={80} height={36} fill="#FCA5A5" opacity={0.85} />
          <text x={-170} y={-70} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#0B1220">
            POLICÍA
          </text>
          <line x1={-170} y1={-20} x2={170} y2={-20} stroke="#0B1220" strokeWidth={4} strokeDasharray="10 10" />
          <text x={-170} y={60} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#0B1220">
            BOMBEROS
          </text>
          <line x1={-170} y1={110} x2={170} y2={110} stroke="#0B1220" strokeWidth={4} strokeDasharray="10 10" />
        </g>
      </Over>
      <Cap words={[{ text: 'POR', key: null }, { text: 'SI', key: null }, { text: 'ACASO', key: 'yellow' }]} />
    </AbsoluteFill>
  );
};

/** 6. The close: the channel, and the way into Fallo #04. */
const S6: React.FC = () => (
  <AbsoluteFill>
    <Night />
    <Over>
      <NoSeal x={135} y={420} s={0.5} />
      <OutText x={625} y={455} size={92} fill="#FF2A2A" text="NO PRESIONES" stroke={14} />
      <OutText x={540} y={640} size={80} fill="#FACC15" text="¿SABÍAS QUE…? #01" stroke={13} />
      <PhoneBody x={540} y={1020} s={0.42} glow={0.4}>
        <text x={0} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#F8FAFC">
          Ya llegué
        </text>
        <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#FCA5A5">
          No se pudo enviar
        </text>
      </PhoneBody>
      <g transform="translate(540 1330)">
        <rect x={-330} y={-58} width={660} height={116} rx={58} fill="#FACC15" stroke="#000" strokeWidth={8} />
        <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000">
          MIRA EL FALLO #04 ▶
        </text>
      </g>
    </Over>
  </AbsoluteFill>
);

const SHOTS = [S1, S2, S3, S4, S5, S6];

export const Curio01Board: React.FC = () => {
  const f = useCurrentFrame();
  const Shot = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#03060C' }}>
      <Shot />
    </AbsoluteFill>
  );
};
