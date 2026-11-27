/**
 * Historias de Facebook/Instagram para el Caso Nº 04 (1080x1920). Una por frame: 0..4.
 * Zona segura de historias: nada importante en los 250 px de arriba ni en los 300 de abajo (barra de respuesta).
 * Llamadas a la acción: ver el post, compartir, comentar, etiquetar y seguir. Los huecos quedan para los stickers.
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

const S1 = () => ( // nuevo post: ve a verlo
  <Dark>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 5, color: '#fff', background: COL.red, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', display: 'inline-block' }} /> NUEVO POST
      </div>
    </div>
    <Card src="gato06/hook.jpg" x={540} y={830} w={760} h={860} rz={-2} pos="50% 40%" />
    <Headline text="«CIERREN SUS|*PUERTAS*»" at={0} y={1170} size={120} still />
    <Hint text="VE A VERLO ↓" y={1500} light />
  </Dark>
);
const S2 = () => ( // compártelo
  <>
    <Brand />
    <Headline text="¿CONOCES A|ALGUIEN QUE SE LO|*HABRÍA CREÍDO?*" at={0} y={440} size={110} still />
    <Card src="gato06/hook.jpg" x={540} y={1060} w={460} h={520} rz={4} pos="50% 35%" tape />
    <Headline text="*COMPÁRTESELO* 📤" at={0} y={1370} size={110} still />
  </>
);
const S3 = () => ( // comenta
  <Red>
    <Headline text="¿TÚ HABRÍAS|CAÍDO?" at={0} y={420} size={150} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 840, display: 'flex', justifyContent: 'center', gap: 40 }}>
      {['😳 SÍ', '🤖 NO'].map((t) => (
        <div key={t} style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 90, color: COL.ink, background: '#F4F1EA', padding: '18px 40px', boxShadow: '0 16px 34px rgba(0,0,0,0.3)' }}>{t}</div>
      ))}
    </div>
    <Hint text="DÉJAMELO EN LOS COMENTARIOS DEL REEL" y={1110} light />
  </Red>
);
const S4 = () => ( // etiqueta
  <>
    <Brand />
    <Headline text="ETIQUETA A TU|AMIGO MÁS|*MIEDOSO*" at={0} y={460} size={130} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontSize: 200 }}>🎩👀</div>
    <Hint text="(Y QUE VEA EL REEL DE NOCHE)" y={1280} />
  </>
);
const S5 = () => ( // síguela
  <Red>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 130, color: '#F4F1EA', background: COL.ink, padding: '10px 36px', transform: 'rotate(-4deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>NP</div>
    </div>
    <Headline text="CASOS REALES|DE INTERNET" at={0} y={580} size={130} still />
    <Hint text="CONTADOS EN MENOS DE 1 MIN" y={930} light />
    <Headline text="SÍGUEME PARA|EL PRÓXIMO" at={0} y={1110} size={110} still />
  </Red>
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
