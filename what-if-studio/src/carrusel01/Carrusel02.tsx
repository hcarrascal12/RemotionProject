import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { HEAVY } from '../components/motion';
import { CU, NoSeal } from '../curio01/Curio01Board';
import { Txt, Note, Chip, Frame, Phone, INK, W } from './Carrusel01';

// Carousel 02 of "No Presiones": "Llevas el celular en el bolsillo… y esto hace sin que lo notes". 8 slides at 1080x1350, one per frame.
//   npx remotion still src/index.ts Carrusel02 out/carrusel02/slide-1.png --frame=0
// Sources for every number: canal/no-presiones/CARRUSEL-02-BOLSILLO.md.
export const Desc: React.FC<{ a: string; b?: string }> = ({ a, b }) => (
  <g>
    <Txt x={W / 2} y={1085} size={38} w={940}>
      {a}
    </Txt>
    {b && (
      <Txt x={W / 2} y={1133} size={38} w={940}>
        {b}
      </Txt>
    )}
  </g>
);

export const Title: React.FC<{ a: string; b: string; wa?: number; wb?: number }> = ({ a, b, wa = 900, wb = 940 }) => (
  <g>
    <Txt x={W / 2} y={365} size={100} w={wa}>
      {a}
    </Txt>
    <Txt x={W / 2} y={478} size={110} w={wb} fill={CU.coral} shadow={INK}>
      {b}
    </Txt>
  </g>
);

export const Lock: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 -20 L -34 -52 A 34 34 0 0 1 34 -52 L 34 -20" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
    <rect x={-52} y={-24} width={104} height={84} rx={16} fill={CU.sun} stroke="#fff" strokeWidth={6} />
    <circle cx={0} cy={14} r={9} fill={INK} />
  </g>
);

export const Pin: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 C -70 -70 -70 -150 0 -150 C 70 -150 70 -70 0 0 Z" fill={CU.coral} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={0} cy={-100} r={22} fill="#fff" stroke={INK} strokeWidth={6} />
  </g>
);

/* ---------- the eight slides ---------- */

const S1: React.FC = () => (
  <Frame n={0} dark>
    <circle cx={540} cy={880} r={520} fill="url(#cr-glow)" />
    <Txt x={540} y={300} size={80} fill="#fff" w={800}>
      LLEVAS EL CELULAR
    </Txt>
    <Txt x={540} y={445} size={150} fill={CU.sun} w={920} shadow="#7C2D12">
      EN EL BOLSILLO
    </Txt>
    <Txt x={540} y={540} size={62} fill="#fff" w={900}>
      Y ESTO HACE SIN QUE LO NOTES
    </Txt>
    {/* a jeans pocket with the phone peeking out, and signal arcs */}
    <g transform="translate(540 960)">
      {[1, 2, 3].map((i) => (
        <path key={i} d={`M ${-60 - i * 46} ${-250 - i * 8} A ${90 + i * 60} ${90 + i * 60} 0 0 1 ${60 + i * 46} ${-250 - i * 8}`} fill="none" stroke={CU.coral} strokeWidth={14} strokeLinecap="round" opacity={1 - i * 0.2} transform="translate(0 -20)" />
      ))}
      <rect x={-120} y={-250} width={240} height={330} rx={36} fill="#0B1220" stroke="#475569" strokeWidth={8} />
      <rect x={-102} y={-232} width={204} height={200} rx={24} fill="#1E293B" />
      <circle cx={0} cy={-134} r={34} fill={CU.coral} opacity={0.9} />
      <path d="M -14 -134 L -4 -122 L 16 -150" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -270 -60 Q -270 -90 -240 -90 L 240 -90 Q 270 -90 270 -60 L 270 170 Q 270 210 236 232 L 36 330 Q 0 346 -36 330 L -236 232 Q -270 210 -270 170 Z" fill="#1D4ED8" stroke="#0B1D4D" strokeWidth={10} />
      <path d="M -236 -52 L 236 -52" stroke="#93C5FD" strokeWidth={6} strokeDasharray="18 12" />
      <path d="M -238 -52 L -238 168 Q -238 190 -216 204 L -10 304 Q 0 308 10 304 L 216 204 Q 238 190 238 168 L 238 -52" fill="none" stroke="#93C5FD" strokeWidth={6} strokeDasharray="18 12" />
    </g>
  </Frame>
);

const S2: React.FC = () => (
  <Frame n={1}>
    <Chip y={225} text="ANDROID" w={300} fill={CU.teal} />
    <Title a="PUEDE SER UN" b="SISMÓGRAFO" />
    <g transform="translate(0 800)">
      <path d="M 0 0 L 160 0 L 200 -18 L 240 22 L 290 -30 L 340 40 L 400 -70 L 460 90 L 520 -130 L 580 120 L 650 -80 L 710 60 L 770 -30 L 820 14 L 880 0 L 1080 0" fill="none" stroke={CU.coral} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
      {[1, 2].map((i) => (
        <circle key={i} cx={540} cy={0} r={170 + i * 60} fill="none" stroke={CU.coral} strokeWidth={6} opacity={0.5 - i * 0.15} />
      ))}
    </g>
    <Phone x={540} y={800} s={0.7}>
      <circle cx={0} cy={-20} r={62} fill={CU.coral} />
      <text y={4} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill="#fff">
        !
      </text>
      <text y={130} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#fff" letterSpacing={2}>
        SISMO
      </text>
    </Phone>
    <Desc a="SU ACELERÓMETRO DETECTA LA PRIMERA ONDA" b="DE UN TERREMOTO Y AVISA A OTROS USUARIOS" />
    <Note lines={['Google Research · Alertas de terremotos de Android', 'Solo Android; la cobertura es desigual']} />
  </Frame>
);

const S3: React.FC = () => (
  <Frame n={2}>
    <Chip y={225} text="TU MAPA" w={300} fill={CU.sun} color={INK} />
    <Title a="FUNCIONA GRACIAS" b="A EINSTEIN" />
    <g transform="translate(540 760)">
      <circle r={160} fill="#fff" stroke={INK} strokeWidth={10} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-140} x2={0} y2={i % 3 === 0 ? -112 : -126} stroke={INK} strokeWidth={i % 3 === 0 ? 8 : 5} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-100} stroke={INK} strokeWidth={12} strokeLinecap="round" transform="rotate(30)" />
      <line x1={0} y1={0} x2={70} y2={0} stroke={CU.coral} strokeWidth={12} strokeLinecap="round" transform="rotate(-50)" />
      <circle r={14} fill={INK} />
      {/* the satellite */}
      <g transform="translate(250 -170) rotate(-30)">
        <rect x={-30} y={-26} width={60} height={52} rx={8} fill="#CBD5E1" stroke={INK} strokeWidth={6} />
        <rect x={-120} y={-18} width={80} height={36} fill="#3B82F6" stroke={INK} strokeWidth={6} />
        <rect x={40} y={-18} width={80} height={36} fill="#3B82F6" stroke={INK} strokeWidth={6} />
      </g>
      <path d="M 160 -40 Q 200 -90 210 -130" stroke={CU.coral} strokeWidth={8} strokeDasharray="14 12" fill="none" />
    </g>
    <g transform="translate(540 985) rotate(-3)">
      <rect x={-250} y={-44} width={500} height={88} rx={16} fill={CU.coral} stroke={INK} strokeWidth={8} />
      <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#fff" textLength={440} lengthAdjust="spacingAndGlyphs">
        +38 MILLONÉSIMAS
      </text>
    </g>
    <Desc a="LOS RELOJES DE LOS SATÉLITES AVANZAN 38 MILLONÉSIMAS" b="DE SEGUNDO AL DÍA Y SE CORRIGEN A PROPÓSITO" />
    <Note lines={['Ohio State University · Penn State (GPS y relatividad)', 'Sin la corrección, el GPS se desviaría kilómetros al día']} />
  </Frame>
);

const S4: React.FC = () => (
  <Frame n={3}>
    <Chip y={225} text="iPHONE 14 O MÁS · PIXEL" w={560} fill={CU.coral} />
    <Title a="PUEDE DETECTAR" b="UN CHOQUE GRAVE" />
    <g transform="translate(330 800)">
      <path d="M -190 40 L -190 -10 Q -190 -40 -160 -48 L -110 -62 L -70 -110 Q -60 -124 -40 -124 L 80 -124 Q 100 -124 112 -108 L 150 -60 L 180 -52 Q 200 -46 200 -20 L 200 40 Z" fill="#60A5FA" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -50 -100 L 8 -100 L 8 -62 L -90 -62 Z M 28 -100 L 78 -100 L 120 -62 L 28 -62 Z" fill="#E0F2FE" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={-110} cy={46} r={36} fill={INK} />
      <circle cx={-110} cy={46} r={14} fill="#CBD5E1" />
      <circle cx={120} cy={46} r={36} fill={INK} />
      <circle cx={120} cy={46} r={14} fill="#CBD5E1" />
    </g>
    <g transform="translate(640 770)">
      <path d="M 0 -90 L 24 -34 L 84 -50 L 46 -2 L 100 34 L 38 36 L 40 96 L 0 52 L -40 96 L -38 36 L -100 34 L -46 -2 L -84 -50 L -24 -34 Z" fill={CU.sun} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
    <Phone x={870} y={840} s={0.5}>
      <circle cx={0} cy={-20} r={70} fill={CU.coral} />
      <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill="#fff">
        SOS
      </text>
    </Phone>
    <Desc a="Y LLAMAR A EMERGENCIAS SI NO RESPONDES" />
    <Note lines={['Apple (iPhone 14 o más) · Google (Pixel)', 'No detecta todos los choques (prueba del WSJ)']} />
  </Frame>
);

const S5: React.FC = () => (
  <Frame n={4}>
    <Chip y={225} text="AUNQUE ESTÉ BLOQUEADO" w={600} fill={CU.teal} />
    <Title a="PUEDE LLAMAR A" b="EMERGENCIAS" />
    <Phone x={330} y={810} s={0.72}>
      <Lock x={0} y={-20} s={1.1} />
      <text y={140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#CBD5E1" letterSpacing={2}>
        BLOQUEADO
      </text>
    </Phone>
    <path d="M 470 800 L 600 800" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d="M 580 770 L 620 800 L 580 830" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <g transform="translate(830 800)">
      <rect x={-190} y={-150} width={380} height={300} rx={40} fill={CU.coral} stroke={INK} strokeWidth={10} />
      <Txt x={0} y={70} size={170} fill="#fff" w={290} shadow={INK}>
        112
      </Txt>
      <text y={-100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#fff" letterSpacing={3}>
        EMERGENCIAS
      </text>
    </g>
    <Desc a="EL 112 ESTÁ EN EL ESTÁNDAR GSM Y LA RED" b="LO REDIRIGE AL NÚMERO DE EMERGENCIAS LOCAL" />
    <Note lines={['Depende del país, la red y la cobertura', 'ScienceABC · Southern Phone · 3GPP']} />
  </Frame>
);

const S6: React.FC = () => (
  <Frame n={5}>
    <Chip y={225} text="EN UNA LLAMADA DE EMERGENCIA" w={880} fill={CU.sun} color={INK} />
    <Title a="MANDA TU" b="UBICACIÓN SOLO" />
    <Phone x={280} y={830} s={0.6}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    <path d="M 420 760 Q 520 700 600 760" stroke={CU.coral} strokeWidth={9} strokeDasharray="16 12" fill="none" strokeLinecap="round" />
    <g transform="translate(790 790)">
      <rect x={-210} y={-170} width={420} height={340} rx={34} fill="#DCFCE7" stroke={INK} strokeWidth={9} />
      <path d="M -210 -40 L 210 -90 M -60 -170 L -20 170 M 100 -170 L 150 170 M -210 70 L 210 40" stroke="#fff" strokeWidth={14} />
      <Pin x={10} y={50} s={1.1} />
      <circle cx={10} cy={50} r={70} fill="none" stroke={CU.coral} strokeWidth={6} opacity={0.5} />
    </g>
    <Desc a="AL LLAMAR, ACTIVA LA UBICACIÓN Y LA ENVÍA" b="A LOS SERVICIOS DE EMERGENCIA (SE LLAMA AML)" />
    <Note lines={['EENA · 9to5Mac · en Android puede requerir activarlo', 'Varía por país y por versión del sistema']} />
  </Frame>
);

const S7: React.FC = () => (
  <Frame n={6}>
    <Chip y={225} text="Y A VECES TE ENGAÑA" w={520} fill={CU.sun} color={INK} />
    <Title a="SIENTES QUE VIBRA" b="Y NO VIBRÓ" />
    <g transform="translate(540 810)">
      {[-1, 1].map((d) =>
        [1, 2, 3].map((i) => <path key={`${d}${i}`} d={`M ${d * (170 + i * 42)} ${-70 - i * 14} Q ${d * (200 + i * 46)} 0 ${d * (170 + i * 42)} ${70 + i * 14}`} fill="none" stroke={CU.coral} strokeWidth={12} strokeLinecap="round" opacity={1 - i * 0.22} />),
      )}
    </g>
    <Phone x={540} y={810} s={0.65}>
      <text y={-10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#94A3B8" letterSpacing={1}>
        SIN
      </text>
      <text y={36} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#94A3B8" letterSpacing={1}>
        MENSAJES
      </text>
    </Phone>
    <g transform="translate(860 640) rotate(8)">
      <circle r={118} fill={CU.coral} stroke={INK} strokeWidth={9} />
      <Txt x={0} y={26} size={86} fill="#fff" w={180} shadow={INK}>
        68 %
      </Txt>
    </g>
    <Desc a="EL 68 % DEL PERSONAL MÉDICO ENCUESTADO" b="DIJO HABER SENTIDO VIBRACIONES QUE NO EXISTÍAN" />
    <Note lines={['BMJ, 2010 · 169 personas que respondieron', 'Otros estudios dan entre ~30 % y 95 %']} />
  </Frame>
);

const S8: React.FC = () => (
  <Frame n={7} dark>
    <Txt x={540} y={300} size={84} fill="#fff" w={880}>
      TU BOLSILLO ESCONDE
    </Txt>
    <Txt x={540} y={430} size={120} fill={CU.sun} w={900} shadow="#7C2D12">
      MÁS DE LO QUE CREES
    </Txt>
    {[
      { y: 560, t: 'DETECTA TERREMOTOS', c: CU.teal },
      { y: 680, t: 'CORRIGE EL TIEMPO COMO EINSTEIN', c: CU.sun },
      { y: 800, t: 'AVISA A EMERGENCIAS POR TI', c: CU.coral },
    ].map((r) => (
      <g key={r.t} transform={`translate(0 ${r.y})`}>
        <rect x={70} y={-48} width={940} height={96} rx={28} fill="#1E293B" stroke="#334155" strokeWidth={5} />
        <circle cx={135} cy={0} r={26} fill={r.c} stroke="#fff" strokeWidth={5} />
        <path d="M 122 2 L 132 13 L 150 -10" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={190} y={16} size={42} fill="#fff" anchor="start" w={r.t.length * 25}>
          {r.t}
        </Txt>
      </g>
    ))}
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
export const Carrusel02: React.FC = () => {
  const f = useCurrentFrame();
  const Slide = SLIDES[Math.min(SLIDES.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: CU.cream }}>
      <Slide />
    </AbsoluteFill>
  );
};
