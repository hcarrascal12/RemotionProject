/**
 * Historias de Facebook para el Caso Nº 05 · Momo (1080x1920). Una por frame: 0..4.
 * Zona segura de historias: nada importante en los 250 px de arriba ni en los 300 de abajo (barra de respuesta).
 * Sin flechas, sin «etiqueta a…» (cebo) y solo datos verificados del caso. Los huecos quedan para los stickers.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COL, HEAD, MONO } from './theme';
import { Card, Finish, Headline, PaperBG } from './kit';

const Brand: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: COL.ink, background: 'rgba(244,241,234,0.95)', padding: '8px 16px 8px 8px', boxShadow: '0 6px 16px rgba(0,0,0,0.18)' }}>
      <span style={{ background: COL.ink, color: '#fff', padding: '4px 10px', fontFamily: HEAD, fontWeight: 900 }}>NP</span>
      CASOS REALES DE INTERNET
    </div>
  </div>
);
const Hint: React.FC<{ text: string; y: number; light?: boolean }> = ({ text, y, light }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, color: light ? '#F4F1EA' : COL.ink, letterSpacing: 3 }}>{text}</div>
);
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: '#0E0E0E' }}>{children}</AbsoluteFill>;
const Red: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: COL.red }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)' }} />
    {children}
  </AbsoluteFill>
);
const Stat: React.FC<{ n: string; t: string; y: number; red?: boolean }> = ({ n, t, y, red }) => (
  <div style={{ position: 'absolute', left: 90, right: 90, top: y, display: 'flex', alignItems: 'center', gap: 28 }}>
    <div style={{ minWidth: 300, flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 96, lineHeight: 1, color: '#fff', background: red ? COL.red : COL.ink, padding: '12px 20px', letterSpacing: '-0.03em', transform: 'rotate(-2deg)' }}>{n}</div>
    <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: COL.ink, letterSpacing: '-0.02em' }}>{t}</div>
  </div>
);

const S1 = () => ( // nuevo post: ve a verlo
  <Dark>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 5, color: '#fff', background: COL.red, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', display: 'inline-block' }} /> NUEVO POST
      </div>
    </div>
    <Card src="momo07/momo-cara.jpg" x={540} y={830} w={760} h={860} rz={-2} pos="57% 35%" />
    <Headline text="ESTA CARA ASUSTÓ|A *MEDIO MUNDO*" at={0} y={1170} size={110} maxW={960} still />
    <Hint text="VE A VERLO" y={1500} light />
  </Dark>
);
const S2 = () => ( // los números del caso
  <>
    <Brand />
    <Headline text="MOMO,|EN *NÚMEROS*" at={0} y={380} size={130} still />
    <Stat n="2018" t="el chat llega por WhatsApp" y={760} />
    <Stat n="9" t="países con alertas en 2019" y={1000} />
    <Stat n="0" t="casos reales confirmados" y={1240} red />
  </>
);
const S3 = () => ( // encuesta: la pregunta del fijado
  <Red>
    <Headline text="¿TE LLAMÓ|*MOMO?*" at={0} y={400} size={150} still />
    <div style={{ position: 'absolute', left: 90, right: 90, top: 830, display: 'flex', flexDirection: 'column', gap: 34 }}>
      {['ME LLEGÓ A MÍ', 'LO VI EN LAS NOTICIAS'].map((t) => (
        <div key={t} style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 66, textAlign: 'center', color: COL.ink, background: '#F4F1EA', padding: '26px 30px', boxShadow: '0 16px 34px rgba(0,0,0,0.3)' }}>{t}</div>
      ))}
    </div>
    <Hint text="ELIGE EN LA ENCUESTA" y={1230} light />
  </Red>
);
const S4 = () => ( // verdadero o falso
  <Dark>
    <Headline text="¿VERDADERO|O *FALSO?*" at={0} y={330} size={140} still />
    <div style={{ position: 'absolute', left: 110, right: 110, top: 760, padding: '46px 44px', background: '#F4F1EA', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', transform: 'rotate(-1.5deg)' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: COL.red }}>2019 · ALERTAS EN 9 PAÍSES</div>
      <div style={{ marginTop: 16, fontFamily: HEAD, fontWeight: 900, fontSize: 64, lineHeight: 1.08, color: COL.ink, letterSpacing: '-0.02em' }}>Las autoridades confirmaron un solo caso real del reto Momo.</div>
    </div>
    <Hint text="LA RESPUESTA, EN EL REEL" y={1300} light />
  </Dark>
);
const S5 = () => ( // los últimos casos + seguir
  <Red>
    <Headline text="CASOS REALES|DE INTERNET" at={0} y={330} size={130} still />
    <Card src="polar05/oso-sin-texto-2023.jpg" x={290} y={900} w={320} h={380} rz={-5} pos="72% 70%" caption="Nº 03" />
    <Card src="gato06/hook.jpg" x={790} y={880} w={320} h={380} rz={4} pos="50% 30%" caption="Nº 04" />
    <Card src="momo07/momo-cara.jpg" x={540} y={1240} w={360} h={420} rz={-2} pos="57% 35%" caption="Nº 05" />
    <Hint text="SÍGUENOS PARA MÁS CASOS" y={1520} light />
  </Red>
);

const LIST = [S1, S2, S3, S4, S5];
export const Momo07Stories: React.FC = () => {
  const S = LIST[Math.min(LIST.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill>
      <PaperBG />
      <S />
      <Finish />
    </AbsoluteFill>
  );
};
