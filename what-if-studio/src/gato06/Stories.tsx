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
    <Hint text="VE A VERLO" y={1500} light />
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

/* ---- segunda tanda: otros ángulos (dato extra, cómo detectar IA, detrás de cámaras, semana, encuesta de horario) */
const Tip: React.FC<{ n: string; t: string; y: number }> = ({ n, t, y }) => (
  <div style={{ position: 'absolute', left: 110, right: 110, top: y, display: 'flex', alignItems: 'center', gap: 28 }}>
    <div style={{ width: 110, height: 110, flexShrink: 0, borderRadius: 55, background: COL.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 64 }}>{n}</div>
    <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 58, lineHeight: 1.05, color: COL.ink, letterSpacing: '-0.02em' }}>{t}</div>
  </div>
);
const S6 = () => ( // dato extra
  <>
    <Brand />
    <Headline text="¿SABÍAS|*QUE…?*" at={0} y={400} size={140} still />
    <Card src="gato06/disfraz-subasta.jpg" x={540} y={1050} w={600} h={480} rz={-3} pos="50% 22%" tape />
    <div style={{ position: 'absolute', left: 110, right: 110, top: 1340, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: COL.ink }}>
      El disfraz de la subasta es el que usó <span style={{ color: COL.red }}>Mike Myers</span> en la película de 2003
    </div>
  </>
);
const S7 = () => ( // cómo detectar una imagen de IA
  <>
    <Brand />
    <Headline text="¿CÓMO SABER SI|UNA FOTO ES *IA?*" at={0} y={400} size={110} still />
    <Tip n="1" t="Manos y dedos raros" y={800} />
    <Tip n="2" t="Letras o carteles deformados" y={980} />
    <Tip n="3" t="Luces y sombras que no cuadran" y={1160} />
    <Hint text="NO SIEMPRE FALLA… POR ESO ENGAÑA" y={1400} />
  </>
);
const S8 = () => ( // detrás de cámaras
  <Dark>
    <Headline text="ASÍ SE HIZO|*ESTE VIDEO*" at={0} y={330} size={130} still />
    {[['38', 'SEGUNDOS'], ['1.140', 'FOTOGRAMAS'], ['3', 'TOMAS DE VOZ'], ['0', 'RELLENO']].map(([n, t], i) => (
      <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: 720 + i * 190, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26 }}>
        <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 130, color: i === 3 ? COL.red : '#F4F1EA', letterSpacing: '-0.04em' }}>{n}</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: '#F4F1EA', letterSpacing: 4 }}>{t}</span>
      </div>
    ))}
  </Dark>
);
const S9 = () => ( // la semana
  <>
    <Brand />
    <Headline text="ESTA SEMANA|EN *NO PRESIONES*" at={0} y={400} size={110} still />
    <Card src="cicada01/s2-face2.jpg" x={300} y={980} w={330} h={400} rz={-6} pos="45% 25%" filter="grayscale(1) contrast(1.3) brightness(0.9)" caption="SATOSHI" />
    <Card src="polar05/oso-sin-texto-2023.jpg" x={780} y={900} w={320} h={370} rz={5} pos="72% 70%" caption="EL OSO POLAR" />
    <Card src="gato06/hook.jpg" x={540} y={1270} w={320} h={380} rz={-2} pos="50% 30%" caption="EL GATO" />
    <Hint text="¿CUÁL TE GUSTÓ MÁS?" y={1500} />
  </>
);
const S10 = () => ( // encuesta de horario
  <Red>
    <Headline text="¿A QUÉ HORA|VES MIS|VIDEOS?" at={0} y={420} size={140} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontSize: 180 }}>☀️ 🌙</div>
    <Hint text="AYÚDAME A ELEGIR CUÁNDO SUBIR EL PRÓXIMO" y={1240} light />
  </Red>
);

const S11 = () => ( // verdadero o falso
  <Dark>
    <Headline text="¿VERDADERO|O *FALSO?*" at={0} y={330} size={140} still />
    <div style={{ position: 'absolute', left: 110, right: 110, top: 760, padding: '46px 44px', background: '#F4F1EA', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', transform: 'rotate(-1.5deg)' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: COL.red }}>AGOSTO 2026 · IRLANDA</div>
      <div style={{ marginTop: 16, fontFamily: HEAD, fontWeight: 900, fontSize: 64, lineHeight: 1.08, color: COL.ink, letterSpacing: '-0.02em' }}>La policía confirmó que las fotos del Gato con Sombrero eran IA.</div>
    </div>
    <Hint text="LA RESPUESTA, EN EL REEL" y={1300} light />
  </Dark>
);
const S12 = () => ( // gracias
  <Red>
    <Headline text="GRACIAS" at={0} y={360} size={170} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 280, letterSpacing: '-0.05em', color: COL.ink, background: '#F4F1EA', padding: '0 44px', lineHeight: 1.05, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)' }}>+124</div>
      <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: '#F4F1EA', background: COL.ink, padding: '8px 18px', letterSpacing: 3 }}>NUEVOS SEGUIDORES CON SATOSHI</div>
    </div>
    <Hint text="SI ERES NUEVO, BIENVENIDO" y={1180} light />
    <Hint text="YA SALIÓ EL CASO DEL GATO" y={1240} light />
  </Red>
);

const LIST = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];
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
