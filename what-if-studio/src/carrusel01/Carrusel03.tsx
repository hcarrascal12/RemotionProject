import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { HEAVY } from '../components/motion';
import { CU, NoSeal } from '../curio01/Curio01Board';
import { Txt, Note, Chip, Frame, Phone, INK, W } from './Carrusel01';
import { Desc, Title, Pin } from './Carrusel02';

// Carousel 03 of "No Presiones": "El GPS no te dice dónde estás: te dice qué hora es". 8 slides at 1080x1350, one per frame.
//   npx remotion still src/index.ts Carrusel03 out/carrusel03/slide-1.png --frame=0
// Sources: canal/no-presiones/CARRUSEL-03-GPS.md.
const Sat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -30 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-18} width={80} height={36} fill="#3B82F6" stroke={INK} strokeWidth={6} />
    <rect x={40} y={-18} width={80} height={36} fill="#3B82F6" stroke={INK} strokeWidth={6} />
    <rect x={-32} y={-30} width={64} height={60} rx={10} fill="#CBD5E1" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={0} r={12} fill={CU.sun} stroke={INK} strokeWidth={5} />
  </g>
);

const Clock: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#fff" stroke={INK} strokeWidth={r / 16} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-r * 0.88} x2={0} y2={i % 3 === 0 ? -r * 0.7 : -r * 0.79} stroke={INK} strokeWidth={i % 3 === 0 ? r / 20 : r / 32} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.62} stroke={INK} strokeWidth={r / 13} strokeLinecap="round" transform="rotate(30)" />
    <line x1={0} y1={0} x2={r * 0.44} y2={0} stroke={CU.coral} strokeWidth={r / 13} strokeLinecap="round" transform="rotate(-50)" />
    <circle r={r / 11} fill={INK} />
  </g>
);

const Eye: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 Q 0 -90 110 0 Q 0 90 -110 0 Z" fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle r={36} fill={CU.teal} stroke={INK} strokeWidth={7} />
    <circle r={14} fill={INK} />
    <circle cx={140 * 0} cy={0} r={0} />
    <circle r={128} fill="none" stroke="#EF4444" strokeWidth={14} />
    <line x1={-90} y1={-90} x2={90} y2={90} stroke="#EF4444" strokeWidth={14} strokeLinecap="round" />
  </g>
);

const Arcs: React.FC<{ x: number; y: number; rot: number; n?: number; color?: string }> = ({ x, y, rot, n = 3, color = CU.coral }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: n }, (_, i) => (
      <path key={i} d={`M ${-50 - i * 40} ${70 + i * 46} A ${100 + i * 70} ${100 + i * 70} 0 0 0 ${50 + i * 40} ${70 + i * 46}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" opacity={1 - i * 0.25} />
    ))}
  </g>
);

/* ---------- the eight slides ---------- */

const S1: React.FC = () => (
  <Frame n={0} dark>
    <circle cx={540} cy={900} r={540} fill="url(#cr-glow)" />
    <Txt x={540} y={285} size={84} fill="#fff" w={640}>
      ESE SATÉLITE
    </Txt>
    <Txt x={540} y={440} size={170} fill={CU.sun} w={800} shadow="#7C2D12">
      NO SABE
    </Txt>
    <Txt x={540} y={540} size={86} fill="#fff" w={760}>
      DÓNDE ESTÁS
    </Txt>
    <Sat x={250} y={800} s={1.35} />
    <Arcs x={330} y={790} rot={-40} />
    <Phone x={800} y={1010} s={0.5}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    <Eye x={800} y={780} s={0.95} />
  </Frame>
);

const S2: React.FC = () => (
  <Frame n={1}>
    <Chip y={225} text="LO QUE NADIE TE CUENTA" w={620} fill={CU.teal} />
    <Txt x={540} y={365} size={84} w={900}>
      TU TELÉFONO SOLO ESCUCHA
    </Txt>
    <Txt x={540} y={478} size={104} w={800} fill={CU.coral} shadow={INK}>
      NO LE ENVÍA NADA
    </Txt>
    <Sat x={540} y={640} s={1.15} rot={0} />
    <Arcs x={540} y={640} rot={0} n={2} />
    {[
      { x: 165, label: 'POSICIÓN', icon: <Pin x={0} y={26} s={0.42} /> },
      { x: 915, label: 'HORA EXACTA', icon: <Clock x={0} y={-4} r={30} /> },
    ].map((c) => (
      <g key={c.label} transform={`translate(${c.x} 840)`}>
        <rect x={-140} y={-46} width={280} height={92} rx={24} fill="#fff" stroke={INK} strokeWidth={6} />
        <g transform="translate(-96 0)">{c.icon}</g>
        <Txt x={-58} y={10} size={28} anchor="start" w={c.label.length * 17}>
          {c.label}
        </Txt>
      </g>
    ))}
    <Phone x={540} y={942} s={0.32}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    <path d="M 630 990 L 630 880" stroke="#94A3B8" strokeWidth={8} strokeDasharray="12 10" strokeLinecap="round" />
    <path d="M 608 902 L 630 872 L 652 902" stroke="#94A3B8" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={630} cy={930} r={28} fill="#EF4444" stroke={INK} strokeWidth={5} />
    <path d="M 617 917 L 643 943 M 643 917 L 617 943" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
    <Desc a="EL SATÉLITE SOLO EMITE SU POSICIÓN Y LA HORA" />
    <Note lines={['GPS.gov (póster "How GPS Works") · Fox News']} />
  </Frame>
);

const S3: React.FC = () => (
  <Frame n={2}>
    <Chip y={225} text="EL TRUCO" w={300} fill={CU.sun} color={INK} />
    <Title a="MIDE CUÁNTO" b="TARDÓ EN LLEGAR" />
    <Sat x={220} y={660} s={1.1} />
    <path d="M 300 690 L 800 860" stroke={CU.coral} strokeWidth={9} strokeDasharray="18 14" strokeLinecap="round" />
    <Phone x={880} y={880} s={0.5}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    <g transform="translate(440 800) rotate(-5)">
      <rect x={-350} y={-52} width={700} height={104} rx={20} fill="#fff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={13} size={34} w={640}>
        DISTANCIA = TIEMPO × VELOCIDAD DE LA LUZ
      </Txt>
    </g>
    <Desc a="SI SABES CUÁNTO TARDÓ LA SEÑAL," b="SABES A QUÉ DISTANCIA ESTÁ EL SATÉLITE" />
    <Note lines={['GPS.gov (póster "How GPS Works")', 'La señal viaja a la velocidad de la luz']} />
  </Frame>
);

const S4: React.FC = () => (
  <Frame n={3}>
    <Chip y={225} text="EL GIRO" w={300} fill={CU.coral} />
    <Title a="CON 4 SEÑALES" b="TE UBICAS SOLO" />
    <Phone x={540} y={820} s={0.52}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    {[
      { x: 190, y: 640, n: '1' },
      { x: 890, y: 640, n: '2' },
      { x: 190, y: 980, n: '3' },
      { x: 890, y: 980, n: '4' },
    ].map((p) => (
      <g key={p.n}>
        <path d={`M ${p.x} ${p.y} L 540 820`} stroke={CU.coral} strokeWidth={7} strokeDasharray="14 12" opacity={0.7} />
        <Sat x={p.x} y={p.y} s={0.62} rot={p.x < 500 ? -30 : 30} />
        <circle cx={p.x + (p.x < 500 ? 70 : -70)} cy={p.y - 40} r={26} fill={CU.sun} stroke={INK} strokeWidth={5} />
        <text x={p.x + (p.x < 500 ? 70 : -70)} y={p.y - 28} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={INK}>
          {p.n}
        </text>
      </g>
    ))}
    <Desc a="TRES FIJAN LA POSICIÓN; LA CUARTA CORRIGE" b="EL RELOJ DE TU TELÉFONO" />
    <Note lines={['Wikipedia (Pseudorange) · Live Science · GIM International', 'Nadie te está mirando desde arriba: tú calculas tu lugar']} />
  </Frame>
);

const S5: React.FC = () => (
  <Frame n={4}>
    <Chip y={225} text="POR QUÉ IMPORTA" w={480} fill={CU.teal} />
    <Title a="SI EL RELOJ FALLA" b="EL MAPA FALLA" />
    <Clock x={290} y={770} r={140} />
    <Txt x={540} y={795} size={110} w={90}>
      =
    </Txt>
    <g transform="translate(770 750)">
      <rect x={-210} y={-40} width={420} height={80} rx={14} fill="#FDE68A" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 15 }, (_, i) => (
        <line key={i} x1={-195 + i * 27.9} y1={-40} x2={-195 + i * 27.9} y2={i % 5 === 0 ? 0 : -16} stroke={INK} strokeWidth={5} />
      ))}
      <Txt x={0} y={124} size={60} fill={CU.coral} w={250} shadow={INK}>
        30 CM
      </Txt>
    </g>
    <g transform="translate(290 960) rotate(-3)">
      <rect x={-230} y={-40} width={460} height={80} rx={16} fill={CU.coral} stroke={INK} strokeWidth={8} />
      <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" textLength={400} lengthAdjust="spacingAndGlyphs">
        1 NANOSEGUNDO DE ERROR
      </text>
    </g>
    <Desc a="POR ESO LOS SATÉLITES LLEVAN RELOJES ATÓMICOS" />
    <Note lines={['GIM International · ESA', '1 nanosegundo = 1 milmillonésima de segundo']} />
  </Frame>
);

const S6: React.FC = () => (
  <Frame n={5}>
    <Chip y={225} text="Y EINSTEIN LO COMPLICA" w={640} fill={CU.sun} color={INK} />
    <Txt x={540} y={365} size={100} w={900}>
      UN RELOJ DESVIADO
    </Txt>
    <Txt x={540} y={478} size={88} w={900} fill={CU.coral} shadow={INK}>
      = KILÓMETROS DE ERROR
    </Txt>
    <g transform="translate(540 765)">
      <rect x={-400} y={-180} width={800} height={360} rx={36} fill="#DCFCE7" stroke={INK} strokeWidth={9} />
      <path d="M -400 -40 L 400 -90 M -150 -180 L -110 180 M 150 -180 L 200 180 M -400 70 L 400 30" stroke="#fff" strokeWidth={14} />
      <Pin x={-250} y={60} s={0.9} />
      <path d="M -190 -10 L 220 -50" stroke={CU.coral} strokeWidth={9} strokeDasharray="16 12" strokeLinecap="round" />
      <g opacity={0.55}>
        <Pin x={290} y={-10} s={0.9} />
      </g>
    </g>
    <g transform="translate(560 972) rotate(-3)">
      <rect x={-290} y={-40} width={580} height={80} rx={16} fill={CU.coral} stroke={INK} strokeWidth={8} />
      <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" textLength={520} lengthAdjust="spacingAndGlyphs">
        38 MILLONÉSIMAS DE SEGUNDO ≈ 11 KM
      </text>
    </g>
    <Desc a="ESE ERROR SE CORRIGE A PROPÓSITO CADA DÍA" />
    <Note lines={['Ohio State · Penn State', '11 km = 38 microsegundos × velocidad de la luz (cálculo)']} />
  </Frame>
);

const S7: React.FC = () => (
  <Frame n={6}>
    <Chip y={225} text="UN MATIZ IMPORTANTE" w={620} fill={CU.coral} />
    <Title a="EL GPS NO TE VIGILA" b="TUS APPS PUEDEN" wa={940} wb={900} />
    <Sat x={230} y={740} s={1} />
    <path d="M 330 770 L 470 860" stroke={CU.coral} strokeWidth={9} strokeLinecap="round" />
    <path d="M 440 830 L 480 868 L 430 880" stroke={CU.coral} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Txt x={230} y={850} size={34} w={240}>
      SOLO EMITE
    </Txt>
    <Phone x={600} y={850} s={0.5}>
      <Pin x={0} y={40} s={0.8} />
    </Phone>
    <g transform="translate(860 850)">
      <rect x={-170} y={-150} width={340} height={300} rx={34} fill="#fff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={-80} size={36} w={280}>
        PERMISO DE
      </Txt>
      <Txt x={0} y={-36} size={36} w={280}>
        UBICACIÓN
      </Txt>
      <rect x={-90} y={20} width={180} height={90} rx={45} fill={CU.teal} stroke={INK} strokeWidth={7} />
      <circle cx={45} cy={65} r={34} fill="#fff" stroke={INK} strokeWidth={6} />
    </g>
    <Desc a="EL GPS SOLO RECIBE; LO QUE SE COMPARTE" b="LO DECIDEN LOS PERMISOS DE CADA APP" />
    <Note lines={['Consejo general: revisa Ajustes → Ubicación en tu celular', 'GPS.gov: el sistema GPS es de solo recepción']} />
  </Frame>
);

const S8: React.FC = () => (
  <Frame n={7} dark>
    <Txt x={540} y={285} size={84} fill="#fff" w={880}>
      TU MAPA NO TE VE
    </Txt>
    <Txt x={540} y={410} size={120} fill={CU.sun} w={700} shadow="#7C2D12">
      CALCULA
    </Txt>
    {[
      { y: 540, t: 'EL SATÉLITE SOLO EMITE', c: CU.teal },
      { y: 660, t: 'TU TELÉFONO CALCULA CON EL TIEMPO', c: CU.sun },
      { y: 780, t: 'EL GPS NO TE VIGILA, TUS APPS PUEDEN', c: CU.coral },
    ].map((r) => (
      <g key={r.t} transform={`translate(0 ${r.y})`}>
        <rect x={70} y={-48} width={940} height={96} rx={28} fill="#1E293B" stroke="#334155" strokeWidth={5} />
        <circle cx={135} cy={0} r={26} fill={r.c} stroke="#fff" strokeWidth={5} />
        <path d="M 122 2 L 132 13 L 150 -10" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={190} y={16} size={42} fill="#fff" anchor="start" w={Math.min(r.t.length * 25, 800)}>
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
export const Carrusel03: React.FC = () => {
  const f = useCurrentFrame();
  const Slide = SLIDES[Math.min(SLIDES.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: CU.cream }}>
      <Slide />
    </AbsoluteFill>
  );
};
