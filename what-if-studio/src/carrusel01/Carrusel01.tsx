import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { HEAVY, MONO } from '../components/motion';
import { CU, NoSeal } from '../curio01/Curio01Board';

// Carousel 01 of "No Presiones": "¿Qué le pasa a tu cuerpo si sueltas el celular?" 8 slides at 1080x1350 (4:5), one per frame.
//   npx remotion still src/index.ts Carrusel01 out/carrusel01/slide-1.png --frame=0
// Every number on a slide is from a source listed in canal/no-presiones/CARRUSEL-01-CUERPO-CELULAR.md.
export const W = 1080;
export const H = 1350;
export const INK = CU.ink;
export const DARK = '#0F172A';
export const N = 8;

type TxtProps = { x: number; y: number; size: number; fill?: string; w?: number; anchor?: 'start' | 'middle' | 'end'; font?: string; shadow?: string; rot?: number; children: React.ReactNode };
/** Heavy display text; `w` forces the line to an exact width so nothing ever overflows; `shadow` adds the flat offset the series uses. */
export const Txt: React.FC<TxtProps> = ({ x, y, size, fill = INK, w, anchor = 'middle', font = HEAVY, shadow, rot = 0, children }) => {
  const common = { textAnchor: anchor, fontFamily: font, fontWeight: 900, fontSize: size, textLength: w, lengthAdjust: 'spacingAndGlyphs' as const };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {shadow && (
        <text x={7} y={9} {...common} fill={shadow}>
          {children}
        </text>
      )}
      <text {...common} fill={fill}>
        {children}
      </text>
    </g>
  );
};

export const Note: React.FC<{ lines: string[]; dark?: boolean }> = ({ lines, dark }) => (
  <g>
    {lines.map((l, i) => (
      <text key={i} x={W / 2} y={1196 + i * 34} textAnchor="middle" fontFamily={MONO} fontSize={25} fill={dark ? '#94A3B8' : CU.soft}>
        {l}
      </text>
    ))}
  </g>
);

export const Chip: React.FC<{ y: number; text: string; w: number; fill?: string; color?: string }> = ({ y, text, w, fill = CU.coral, color = '#fff' }) => (
  <g transform={`translate(${W / 2} ${y})`}>
    <rect x={-w / 2} y={-30} width={w} height={60} rx={30} fill={fill} />
    <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill={color} letterSpacing={3}>
      {text}
    </text>
  </g>
);

/** Chrome shared by every slide: the series pill on top, the progress dots and the brand at the bottom. */
export const Frame: React.FC<{ n: number; dark?: boolean; children: React.ReactNode }> = ({ n, dark, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id="cr-day" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CU.cream} />
        <stop offset="100%" stopColor={CU.sand} />
      </linearGradient>
      <linearGradient id="cr-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor={DARK} />
      </linearGradient>
      <radialGradient id="cr-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={CU.coral} stopOpacity={0.55} />
        <stop offset="100%" stopColor={CU.coral} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={dark ? 'url(#cr-night)' : 'url(#cr-day)'} />
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx={(i * 263 + n * 71) % W} cy={260 + ((i * 331 + n * 97) % 900)} r={50 + (i % 3) * 34} fill={dark ? '#fff' : i % 2 ? '#FFFFFF' : '#FCD9A8'} opacity={dark ? 0.04 : 0.4} />
    ))}
    {/* the series pill */}
    <g transform="translate(540 92)">
      <rect x={-250} y={-40} width={500} height={80} rx={40} fill="#fff" stroke={CU.sun} strokeWidth={6} />
      <NoSeal x={-195} y={0} s={0.2} />
      <text x={30} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={INK} letterSpacing={3}>
        ¿SABÍAS QUE…?
      </text>
    </g>
    {children}
    {/* progress dots and the brand */}
    <g transform="translate(0 1294)">
      {Array.from({ length: N }, (_, i) => (
        <circle key={i} cx={70 + i * 30} cy={0} r={i === n ? 9 : 6} fill={i === n ? CU.coral : dark ? '#475569' : '#D6C4A8'} />
      ))}
      <text x={W - 70} y={9} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={dark ? '#CBD5E1' : CU.soft} letterSpacing={2}>
        {n < N - 1 ? 'DESLIZA  ›' : 'NO PRESIONES'}
      </text>
    </g>
  </svg>
);

export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; body?: string }> = ({ x, y, s = 1, rot = 0, children, body = '#0B1220' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-135} y={-270} width={270} height={540} rx={44} fill={body} stroke="#334155" strokeWidth={6} />
    <rect x={-118} y={-252} width={236} height={504} rx={32} fill="#1E293B" />
    <rect x={-34} y={-240} width={68} height={16} rx={8} fill={body} />
    {children}
  </g>
);

const HEART = 'M 0 120 C -220 -20 -140 -170 0 -70 C 140 -170 220 -20 0 120 Z';
const PULSE = 'M -520 0 L -300 0 L -240 -40 L -190 90 L -130 -170 L -70 120 L -30 0 L 520 0';

export const Heart: React.FC<{ x: number; y: number; s: number; fill?: string }> = ({ x, y, s, fill = CU.coral }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={HEART} fill="#7F1D1D" transform="translate(8 10)" />
    <path d={HEART} fill={fill} stroke={INK} strokeWidth={8 / s} strokeLinejoin="round" />
    <path d="M -110 -50 C -100 -100 -60 -120 -30 -100" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
  </g>
);

const Person: React.FC<{ x: number; y: number; fill: string; opacity?: number }> = ({ x, y, fill, opacity = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <circle cx={0} cy={-62} r={30} fill={fill} stroke={INK} strokeWidth={6} />
    <path d="M -46 40 L -46 -8 Q -46 -26 -28 -26 L 28 -26 Q 46 -26 46 -8 L 46 40 Z" fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

export const Up: React.FC<{ x: number; y: number; s?: number; fill?: string; down?: boolean }> = ({ x, y, s = 1, fill = CU.coral, down }) => (
  <path d="M 0 -34 L 38 26 L 12 26 L 12 48 L -12 48 L -12 26 L -38 26 Z" fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" transform={`translate(${x} ${y}) scale(${s}) ${down ? 'scale(1 -1)' : ''}`} />
);

/* ---------- the eight slides ---------- */

const S1: React.FC = () => (
  <Frame n={0} dark>
    <circle cx={540} cy={900} r={520} fill="url(#cr-glow)" />
    <Txt x={540} y={300} size={84} fill="#fff" w={760}>
      ¿QUÉ LE PASA A
    </Txt>
    <Txt x={540} y={470} size={178} fill={CU.sun} w={900} shadow="#7C2D12">
      TU CUERPO
    </Txt>
    <Txt x={540} y={560} size={68} fill="#fff" w={900}>
      SI SUELTAS EL CELULAR?
    </Txt>
    <Phone x={540} y={915} s={1.05} rot={-4}>
      <Heart x={0} y={-10} s={0.5} />
      <text y={150} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#fff" letterSpacing={2}>
        SIN SEÑAL
      </text>
    </Phone>
    <g transform="translate(540 915)">
      <path d={PULSE} stroke={CU.coral} strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </g>
    <g transform="translate(360 1195) rotate(-4)">
      <rect x={-300} y={-44} width={600} height={88} rx={14} fill={CU.sun} stroke={INK} strokeWidth={8} />
      <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={INK} textLength={540} lengthAdjust="spacingAndGlyphs">
        CON ESTUDIOS REALES
      </text>
    </g>
  </Frame>
);

const S2: React.FC = () => (
  <Frame n={1}>
    <Chip y={225} text="PRIMEROS MINUTOS" w={520} />
    <Txt x={540} y={355} size={104} w={900}>
      EL CUERPO SE
    </Txt>
    <Txt x={540} y={470} size={118} fill={CU.coral} w={940} shadow={INK}>
      PONE NERVIOSO
    </Txt>
    <g transform="translate(540 760)">
      <path d={PULSE} stroke={INK} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.25} />
    </g>
    <Heart x={540} y={730} s={1.15} />
    {[
      { x: 195, t: 'ANSIEDAD' },
      { x: 540, t: 'PULSO' },
      { x: 885, t: 'PRESIÓN' },
    ].map((c) => (
      <g key={c.t} transform={`translate(${c.x} 1030)`}>
        <rect x={-162} y={-80} width={324} height={160} rx={26} fill="#fff" stroke={INK} strokeWidth={7} />
        <Up x={-118} y={-4} s={0.9} />
        <text x={-74} y={14} textAnchor="start" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={INK} textLength={c.t.length * 25} lengthAdjust="spacingAndGlyphs">
          {c.t}
        </text>
      </g>
    ))}
    <Note lines={['Universidad de Missouri · 40 usuarios de iPhone', 'Estudio pequeño: una pista, no una regla']} />
  </Frame>
);

const S3: React.FC = () => {
  const r = 175;
  const c = 2 * Math.PI * r;
  return (
    <Frame n={2}>
      <Chip y={225} text="TIENE NOMBRE" w={420} fill={CU.teal} />
      <Txt x={540} y={410} size={186} fill={CU.coral} w={960} shadow={INK}>
        NOMOFOBIA
      </Txt>
      <Txt x={540} y={490} size={50} w={820}>
        EL MIEDO A QUEDARTE SIN CELULAR
      </Txt>
      <g transform="translate(540 790)">
        <circle r={r} fill="none" stroke="#F3DDBA" strokeWidth={76} />
        <circle r={r} fill="none" stroke={CU.teal} strokeWidth={76} strokeDasharray={`${c * 0.53} ${c}`} transform="rotate(-90)" strokeLinecap="butt" />
        <circle r={r + 38} fill="none" stroke={INK} strokeWidth={6} />
        <circle r={r - 38} fill="none" stroke={INK} strokeWidth={6} />
        <Txt x={0} y={42} size={124} w={250}>
          53 %
        </Txt>
      </g>
      <Txt x={540} y={1075} size={40} w={900}>
        DE LOS USUARIOS BRITÁNICOS SENTÍA ANSIEDAD
      </Txt>
      <Txt x={540} y={1124} size={40} w={900}>
        AL PERDER EL CELULAR O QUEDARSE SIN BATERÍA
      </Txt>
      <Note lines={['Estudio del Post Office del Reino Unido, 2008']} />
    </Frame>
  );
};

const S4: React.FC = () => {
  const rows = [
    { y: 690, label: 'ANSIEDAD', v: '−16 %', w: 16.1, color: CU.teal },
    { y: 860, label: 'DEPRESIÓN', v: '−25 %', w: 24.8, color: CU.coral },
    { y: 1030, label: 'INSOMNIO', v: '−14,5 %', w: 14.5, color: CU.sun },
  ];
  return (
    <Frame n={3}>
      <Chip y={225} text="1 SEMANA SIN REDES" w={560} />
      <Txt x={540} y={365} size={108} w={900}>
        MENOS SÍNTOMAS
      </Txt>
      <Txt x={540} y={480} size={86} fill={CU.coral} w={760} shadow={INK}>
        EN SOLO 7 DÍAS
      </Txt>
      {rows.map((r) => (
        <g key={r.label}>
          <Txt x={70} y={r.y - 22} size={44} anchor="start">
            {r.label}
          </Txt>
          <rect x={70} y={r.y} width={940} height={86} rx={20} fill="#F3DDBA" stroke={INK} strokeWidth={6} />
          <rect x={70} y={r.y} width={Math.max(260, (r.w / 25) * 940)} height={86} rx={20} fill={r.color} stroke={INK} strokeWidth={6} />
          <Txt x={70 + Math.max(260, (r.w / 25) * 940) - 24} y={r.y + 62} size={58} fill="#fff" anchor="end" shadow={INK}>
            {r.v}
          </Txt>
        </g>
      ))}
      <Note lines={['Jóvenes de 18 a 24 años · JAMA Network Open, 2025', 'Sin grupo de control: mejoraron, no está demostrado']} />
    </Frame>
  );
};

const S5: React.FC = () => (
  <Frame n={4}>
    <Chip y={225} text="DATO CURIOSO" w={440} fill={CU.sun} color={INK} />
    <Txt x={540} y={380} size={140} fill={CU.coral} w={700} shadow={INK}>
      LO RARO:
    </Txt>
    <Txt x={540} y={480} size={84} w={900}>
      EL USO TOTAL DEL CELULAR
    </Txt>
    <Txt x={540} y={570} size={104} w={520} fill={CU.coral}>
      SUBIÓ
    </Txt>
    {[
      { x: 290, label: 'REDES', sub: 'SOCIALES', arrow: <Up x={0} y={0} s={1.6} fill={CU.teal} down />, word: 'BAJARON', fill: CU.teal },
      { x: 790, label: 'CELULAR', sub: 'EN TOTAL', arrow: <Up x={0} y={0} s={1.6} fill={CU.coral} />, word: 'SUBIÓ', fill: CU.coral },
    ].map((c) => (
      <g key={c.label} transform={`translate(${c.x} 840)`}>
        <rect x={-215} y={-190} width={430} height={380} rx={34} fill="#fff" stroke={INK} strokeWidth={8} />
        <Txt x={0} y={-120} size={52} w={300}>
          {c.label}
        </Txt>
        <Txt x={0} y={-72} size={40} fill={CU.soft} w={260}>
          {c.sub}
        </Txt>
        <g transform="translate(0 18)">{c.arrow}</g>
        <Txt x={0} y={160} size={52} fill={c.fill} w={280}>
          {c.word}
        </Txt>
      </g>
    ))}
    <Txt x={540} y={1100} size={38} w={940}>
      LO QUE AYUDÓ, SEGÚN LOS AUTORES: DEJAR EL USO
    </Txt>
    <Txt x={540} y={1146} size={38} w={940}>
      PROBLEMÁTICO (COMPARARTE, SCROLL SIN PARAR)
    </Txt>
    <Note lines={['Mismo estudio de JAMA Network Open, 2025']} />
  </Frame>
);

export const Moon: React.FC = () => (
  <g>
    <path d="M 40 -120 A 130 130 0 1 0 40 120 A 100 100 0 1 1 40 -120 Z" fill={CU.sun} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={105} cy={-90} r={10} fill={CU.sun} stroke={INK} strokeWidth={5} />
    <circle cx={140} cy={-30} r={7} fill={CU.sun} stroke={INK} strokeWidth={5} />
  </g>
);

const Target: React.FC = () => (
  <g>
    <circle r={125} fill="#fff" stroke={INK} strokeWidth={8} />
    <circle r={82} fill={CU.coral} stroke={INK} strokeWidth={8} />
    <circle r={40} fill="#fff" stroke={INK} strokeWidth={8} />
    <circle r={12} fill={INK} />
  </g>
);

const S6: React.FC = () => (
  <Frame n={5}>
    <Chip y={225} text="2 SEMANAS SIN INTERNET MÓVIL" w={800} fill={CU.teal} />
    <Txt x={540} y={365} size={104} w={900}>
      DUERMEN MEJOR
    </Txt>
    <Txt x={540} y={466} size={68} fill={CU.coral} w={860} shadow={INK}>
      Y SE CONCENTRAN MÁS
    </Txt>
    {[
      { x: 290, icon: <Moon />, big: '+20 MIN', small: ['DE SUEÑO POR NOCHE', '(APROXIMADO)'] },
      { x: 790, icon: <Target />, big: '10 AÑOS', small: ['MÁS JOVEN EN UNA PRUEBA', 'DE ATENCIÓN (AUTORES)'] },
    ].map((c) => (
      <g key={c.big} transform={`translate(${c.x} 790)`}>
        <rect x={-228} y={-190} width={456} height={470} rx={34} fill="#fff" stroke={INK} strokeWidth={8} />
        <g transform="translate(0 -40)">{c.icon}</g>
        <Txt x={0} y={170} size={78} w={380} fill={CU.coral}>
          {c.big}
        </Txt>
        <Txt x={0} y={218} size={29} w={400}>
          {c.small[0]}
        </Txt>
        <Txt x={0} y={254} size={29} w={400} fill={CU.soft}>
          {c.small[1]}
        </Txt>
      </g>
    ))}
    <Txt x={540} y={1145} size={36} w={940}>
      PODÍAN LLAMAR Y MANDAR SMS: SOLO BLOQUEARON EL INTERNET
    </Txt>
    <Note lines={['PNAS Nexus · 467 personas de 18 a 74 años']} />
  </Frame>
);

const S7: React.FC = () => (
  <Frame n={6}>
    <Chip y={225} text="LA TRAMPA" w={360} fill={CU.sun} color={INK} />
    <Txt x={540} y={365} size={100} w={760}>
      ES DIFÍCIL
    </Txt>
    <Txt x={540} y={480} size={104} fill={CU.coral} w={940} shadow={INK}>
      DEJARLO DEL TODO
    </Txt>
    <g transform="translate(0 810)">
      {[0, 1, 2, 3].map((i) => (
        <Person key={i} x={165 + i * 250} y={0} fill={i === 0 ? CU.teal : '#E5D5BC'} opacity={i === 0 ? 1 : 0.9} />
      ))}
      <g transform="translate(165 -150)">
        <circle r={36} fill={CU.teal} stroke={INK} strokeWidth={7} />
        <path d="M -16 2 L -4 15 L 18 -12" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
    <Txt x={540} y={1000} size={104} fill={CU.coral} w={860} shadow={INK}>
      1 DE CADA 4
    </Txt>
    <Txt x={540} y={1070} size={44} w={800}>
      LOGRÓ CUMPLIR LAS 2 SEMANAS COMPLETAS
    </Txt>
    <Note lines={['Mismo estudio de PNAS Nexus']} />
  </Frame>
);

const S8: React.FC = () => (
  <Frame n={7} dark>
    <Txt x={540} y={270} size={92} fill="#fff" w={860}>
      NO HACE FALTA
    </Txt>
    <Txt x={540} y={385} size={112} fill={CU.sun} w={940} shadow="#7C2D12">
      DEJARLO DEL TODO
    </Txt>
    {[
      { y: 510, n: '1', t: 'CARGA EL CELULAR', t2: 'FUERA DE LA CAMA' },
      { y: 650, n: '2', t: 'PON LÍMITES DE', t2: 'HORAS A LAS APPS' },
      { y: 790, n: '3', t: 'SILENCIA LAS', t2: 'NOTIFICACIONES' },
    ].map((r) => (
      <g key={r.n} transform={`translate(0 ${r.y})`}>
        <rect x={70} y={-52} width={940} height={116} rx={30} fill="#1E293B" stroke="#334155" strokeWidth={5} />
        <circle cx={140} cy={6} r={40} fill={CU.coral} stroke="#fff" strokeWidth={5} />
        <Txt x={140} y={26} size={58} fill="#fff" w={36}>
          {r.n}
        </Txt>
        <Txt x={210} y={-2} size={44} fill="#fff" anchor="start" w={520}>
          {r.t}
        </Txt>
        <Txt x={210} y={44} size={44} fill={CU.sun} anchor="start" w={520}>
          {r.t2}
        </Txt>
      </g>
    ))}
    {/* the channel card */}
    <g transform="translate(540 1024)">
      <rect x={-470} y={-135} width={940} height={270} rx={36} fill="#fff" stroke={CU.sun} strokeWidth={8} />
      <NoSeal x={-350} y={-44} s={0.5} />
      <Txt x={-250} y={-62} size={56} anchor="start" w={420}>
        NO PRESIONES
      </Txt>
      <text x={-250} y={-18} fontFamily={HEAVY} fontWeight={900} fontSize={31} fill={CU.soft}>
        Fallos y curiosidades tecnológicas
      </text>
      <text x={-250} y={22} fontFamily={HEAVY} fontWeight={900} fontSize={31} fill={CU.soft}>
        en menos de 1 minuto
      </text>
      <g transform="translate(0 86)">
        <rect x={-190} y={-34} width={380} height={68} rx={34} fill={CU.coral} stroke={INK} strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" letterSpacing={2}>
          + SEGUIR
        </text>
      </g>
    </g>
    <Note dark lines={['Fuentes de cada dato en la descripción']} />
  </Frame>
);

const SLIDES = [S1, S2, S3, S4, S5, S6, S7, S8];

/** Frame n is slide n+1. */
export const Carrusel01: React.FC = () => {
  const f = useCurrentFrame();
  const Slide = SLIDES[Math.min(N - 1, f)];
  return (
    <AbsoluteFill style={{ background: CU.cream }}>
      <Slide />
    </AbsoluteFill>
  );
};
