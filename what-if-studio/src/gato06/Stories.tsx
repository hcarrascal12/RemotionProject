/**
 * Historias de Facebook/Instagram para el Caso Nº 04 (1080x1920). Una por frame: 0..4.
 * Zona segura de historias: nada importante en los 250 px de arriba ni en los 300 de abajo (barra de respuesta).
 * Los huecos marcados se dejan libres para los stickers (encuesta, enlace al reel, pregunta).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COL, HEAD, MONO } from './theme';
import { Card, Finish, Headline, PaperBG } from './kit';

const Brand: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: COL.ink, background: 'rgba(244,241,234,0.95)', padding: '8px 16px 8px 8px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
      <span style={{ background: COL.ink, color: '#fff', padding: '4px 10px', fontFamily: HEAD, fontWeight: 900 }}>NP</span>
      CASOS REALES DE INTERNET
    </div>
  </div>
);
const Big: React.FC<{ n: string; sub: string; y: number }> = ({ n, sub, y }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 250, letterSpacing: '-0.05em', color: '#fff', background: COL.red, padding: '0 40px', lineHeight: 1.05, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)' }}>{n}</div>
    <div style={{ marginTop: 22, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: '#fff', background: COL.ink, padding: '8px 18px', letterSpacing: 3 }}>{sub}</div>
  </div>
);
const Row: React.FC<{ d: string; t: string; red?: boolean; y: number }> = ({ d, t, red, y }) => (
  <div style={{ position: 'absolute', left: 120, right: 120, top: y, display: 'flex', alignItems: 'center', gap: 26 }}>
    <div style={{ width: 210, flexShrink: 0, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 38, color: '#fff', background: red ? COL.red : COL.ink, padding: '10px 0', letterSpacing: 2 }}>{d}</div>
    <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 54, lineHeight: 1.05, color: COL.ink, letterSpacing: '-0.02em' }}>{t}</div>
  </div>
);

const S1 = () => ( // encuesta
  <>
    <Brand />
    <Card src="gato06/hook.jpg" x={540} y={830} w={700} h={820} rz={-2.5} pos="50% 40%" tape />
    <Headline text="¿TÚ HABRÍAS|*CAÍDO?*" at={0} y={1270} size={130} still />
  </>
);
const S2 = () => ( // ¿real o IA? → enlace al reel
  <AbsoluteFill style={{ background: '#0E0E0E' }}>
    <Card src="gato06/hook.jpg" x={540} y={770} w={780} h={900} rz={2} pos="50% 40%" filter="contrast(1.15) brightness(0.9)" />
    <Headline text="¿REAL O *IA?*" at={0} y={1270} size={150} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, color: '#F4F1EA', letterSpacing: 3 }}>LA RESPUESTA, EN EL REEL ↓</div>
  </AbsoluteFill>
);
const S3 = () => ( // el dato
  <>
    <Brand />
    <Headline text="UN SOLO VIDEO" at={0} y={440} size={110} still />
    <Big n="14,6 M" sub="DE VISTAS EN 3 SEMANAS" y={660} />
    <Headline text="Y TODO|ERA *FALSO*" at={0} y={1120} size={130} still />
  </>
);
const S4 = () => ( // la cronología
  <>
    <Brand />
    <Headline text="ASÍ PASÓ|EN *12 DÍAS*" at={0} y={400} size={120} still />
    <Row d="8 AGO" t="El disfraz original sale a subasta" y={760} />
    <Row d="18 AGO" t="Primeros «avistamientos» en Irlanda" y={950} />
    <Row d="20 AGO" t="La policía: era IA" red y={1140} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 32, color: COL.muted, letterSpacing: 3 }}>LA HISTORIA COMPLETA, EN EL REEL</div>
  </>
);
const S5 = () => ( // pregunta: próximo caso
  <AbsoluteFill style={{ background: COL.red }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 120, color: '#F4F1EA', background: COL.ink, padding: '10px 34px', transform: 'rotate(-4deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>NP</div>
    </div>
    <Headline text="¿QUÉ CASO|CUENTO|AHORA?" at={0} y={560} size={140} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: '#F4F1EA', letterSpacing: 3 }}>EL MÁS PEDIDO ES EL CASO Nº 05</div>
  </AbsoluteFill>
);

const LIST = [S1, S2, S3, S4, S5];
export const Gato06Stories: React.FC = () => {
  const S = LIST[Math.min(LIST.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill>
      <PaperBG />
      <S />
      <Finish />
    </AbsoluteFill>
  );
};
