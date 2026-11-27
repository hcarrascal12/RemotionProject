/**
 * Satoshi Nakamoto · formato largo 16:9 (5 min, sin voz todavía). Mismo lenguaje que el Caso Nº 04:
 * tablero de papel, fotos en 3D, titulares de rotuladora (negro + un acento rojo), marcador, hilo y sellos.
 * Sin voz, el texto en pantalla cuenta la historia: cada titular se queda el tiempo de leerlo con calma.
 *
 * Hechos: canal/no-presiones/sin-resolver-02/CASO-02-SATOSHI.md (Wikipedia) + Wikipedia (Hal Finney, Bitcoin Pizza Day,
 * Lehman Brothers). Nada de valor actual en dólares; los candidatos se presentan como señalados que lo negaron.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COL, H, HEAD, MONO, SCENES, W, ci, punch, rnd, shake } from './theme';
import { Card, Headline, RedString, Scribble, Stage, Stamp, enter } from './kit';

/* ------------------------------------------------------------------ helpers */
/** Columna de titulares: limita el ancho y la posición horizontal (los Headline se centran dentro). */
const Col: React.FC<{ x: number; w: number; children: React.ReactNode }> = ({ x, w, children }) => (
  <div style={{ position: 'absolute', left: x, width: w, top: 0, height: H }}>{children}</div>
);
type Beat = { at: number; out?: number; text: string; y: number; size?: number };
const Beats: React.FC<{ x: number; w: number; beats: Beat[] }> = ({ x, w, beats }) => (
  <Col x={x} w={w}>
    {beats.map((b, i) => (
      <Headline key={i} text={b.text} at={b.at} out={b.out} y={b.y} size={b.size ?? 88} maxW={w - 40} />
    ))}
  </Col>
);
/** Etiqueta de capítulo arriba a la izquierda (cinta roja + número). */
const Chapter: React.FC<{ n: string; t: string }> = ({ n, t }) => {
  const f = useCurrentFrame();
  const k = enter(f, 2, 260, 16);
  return (
    <div style={{ position: 'absolute', left: 110, top: 150, display: 'flex', boxShadow: '0 12px 26px rgba(0,0,0,0.25)', transform: `translateX(${(1 - k) * -500}px) rotate(-1.5deg)`, opacity: Math.min(1, k * 2) }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: '#fff', background: COL.red, padding: '10px 16px' }}>CAP. {n}</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: COL.ink, background: '#FBFAF6', padding: '10px 16px' }}>{t}</span>
    </div>
  );
};
/** Placa de texto pequeña (dato de apoyo, cita, fuente). */
const Note: React.FC<{ at: number; out?: number; x: number; y: number; w: number; text: string; kicker?: string; size?: number; red?: boolean; rot?: number }> = ({ at, out, x, y, w, text, kicker, size = 40, red = false, rot = -1.2 }) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f > out)) return null;
  const k = enter(f, at, 230, 15);
  const o = out === undefined ? 1 : ci(f, out - 6, out, 1, 0);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, padding: '22px 28px', background: '#FBFAF6', borderLeft: `10px solid ${red ? COL.red : COL.ink}`, boxShadow: '0 22px 44px rgba(0,0,0,0.25)', transform: `translateY(${(1 - k) * 60}px) rotate(${rot}deg)`, opacity: Math.min(1, k * 2) * o }}>
      {kicker ? <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: COL.red, marginBottom: 8 }}>{kicker}</div> : null}
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: size, lineHeight: 1.12, letterSpacing: '-0.015em', color: COL.ink }}>{text}</div>
    </div>
  );
};
/** Número gigante en cinta roja. */
const BigNum: React.FC<{ at: number; out?: number; x: number; y: number; n: string; sub: string; size?: number }> = ({ at, out, x, y, n, sub, size = 200 }) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f > out)) return null;
  const o = out === undefined ? 1 : ci(f, out - 6, out, 1, 0);
  const pop = 1 + 0.14 * Math.exp(-(f - at) / 4);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(-50%) scale(${pop})`, opacity: o }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: size, letterSpacing: '-0.05em', color: '#fff', background: COL.red, padding: '0 36px', lineHeight: 1.05, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>{n}</div>
      <div style={{ marginTop: 16, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: '#fff', background: COL.ink, padding: '8px 16px', letterSpacing: 3, whiteSpace: 'nowrap' }}>{sub}</div>
    </div>
  );
};
/** Teclea un texto (correo, terminal). */
const typed = (f: number, at: number, text: string, cps = 1.2) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));
const caret = (f: number) => (Math.floor(f / 12) % 2 ? '▌' : ' ');

/* ------------------------------------------------------------------ 1 · gancho (0:00–0:20) */
export const HookView: React.FC<{ t: number }> = ({ t }) => {
  const SNAP = 18;
  const snap = ci(t, SNAP, SNAP + 9, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const s = shake(t, SNAP + 9, 14, 8);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
      <Stage dolly={interpolate(snap, [0, 1], [380 + Math.min(t, SNAP) * 2, 120]) + interpolate(t, [SNAP, 600], [0, 140], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) + 60 * (punch(t, [150, 300, 420], 1) - 1)}>
        <Card src="satoshi07/busto.jpg" x={1360} y={560} w={760} h={860} border={14 * snap} rz={(2.5 + Math.sin(t / 25) * 0.8) * snap} ry={-5 * snap} pos="50% 30%" imgScale={1.08 + t * 0.0004} imgOrigin="50% 30%" filter="contrast(1.12) saturate(0.9)">
          {/* censura sobre los ojos: es el creador sin rostro */}
          <div style={{ position: 'absolute', left: '22%', right: '22%', top: '30%', height: '9%', background: '#0A0A0A', transform: `scaleX(${ci(t, 40, 52, 0, 1)})` }} />
        </Card>
        <Scribble cx={1360} cy={420} rx={250} ry={230} at={SNAP + 14} dur={10} />
      </Stage>
      <Beats x={110} w={900} beats={[
        { at: 30, out: 150, text: 'INVENTÓ|*BITCOIN*', y: 360, size: 150 },
        { at: 150, out: 300, text: 'Y NADIE SABE|*QUIÉN ES*', y: 360, size: 130 },
        { at: 300, out: 420, text: 'NUNCA TOCÓ|SU *FORTUNA*', y: 360, size: 130 },
        { at: 420, text: '¿QUIÉN ES|*SATOSHI*|*NAKAMOTO?*', y: 300, size: 120 },
      ]} />
    </AbsoluteFill>
  );
};
export const Hook: React.FC = () => <HookView t={useCurrentFrame()} />;

/* ------------------------------------------------------------------ 2 · expediente (0:20–0:32) */
const INDEX = ['LA CRISIS', 'EL DOCUMENTO', 'EL PRIMER BLOQUE', 'EL PRIMER ENVÍO', 'LAS PIZZAS', 'LA DESAPARICIÓN', 'LA FORTUNA', 'LOS SEÑALADOS', 'LA PRUEBA'];
export const Title: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 360], [0, 120])}>
        <div style={{ position: 'absolute', left: 1020, top: 170, width: 760, height: 760, background: '#FBFAF6', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', transform: `translateZ(${(1 - enter(f, 4, 200, 16)) * 600}px) rotateZ(${2 - (1 - enter(f, 4, 200, 16)) * 10}deg)`, padding: '50px 60px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: COL.red }}>EXPEDIENTE · ÍNDICE</div>
          <div style={{ marginTop: 12, height: 4, background: COL.ink }} />
          {INDEX.map((t, i) => (
            <div key={t} style={{ marginTop: 18, display: 'flex', gap: 22, alignItems: 'baseline', opacity: f >= 30 + i * 12 ? 1 : 0, transform: `translateX(${(1 - enter(f, 30 + i * 12, 300, 18)) * 40}px)` }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: COL.red }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 44, color: COL.ink, letterSpacing: '-0.01em' }}>{t}</span>
            </div>
          ))}
        </div>
      </Stage>
      <Beats x={110} w={880} beats={[{ at: 6, text: 'SATOSHI|*NAKAMOTO*', y: 300, size: 150 }]} />
      <Note at={60} x={170} y={720} w={760} kicker="CASOS REALES DE INTERNET" text="El creador de Bitcoin. Sin cara, sin voz, sin rastro." size={44} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 3 · la crisis (0:32–0:55) */
const Crash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = ci(f, at, at + 90, 0, 1, (x) => x);
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    const y = 0.25 + 0.08 * Math.sin(i * 1.7) * (1 - x) + (x > 0.55 ? (x - 0.55) * 1.4 : 0) + rnd(i) * 0.04;
    return [80 + x * 640, 60 + y * 380];
  });
  const n = Math.max(2, Math.floor(p * pts.length));
  return (
    <svg width={800} height={520} style={{ position: 'absolute', left: 0, top: 0 }}>
      {[0, 1, 2, 3].map((i) => <line key={i} x1={80} x2={720} y1={100 + i * 100} y2={100 + i * 100} stroke="#D8D2C8" strokeWidth={2} />)}
      <polyline points={pts.slice(0, n).map((q) => q.join(',')).join(' ')} fill="none" stroke={COL.red} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
export const Crisis: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Chapter n="01" t="LA CRISIS" />
      <Stage dolly={interpolate(f, [0, 690], [0, 150])} ry={interpolate(f, [0, 690], [6, -6])}>
        <div style={{ position: 'absolute', left: 1030, top: 250, width: 800, height: 520, background: '#FBFAF6', boxShadow: '0 30px 60px rgba(0,0,0,0.25)', transform: `rotateZ(-2deg) scale(${0.6 + 0.4 * enter(f, 20, 200, 15)})`, opacity: Math.min(1, enter(f, 20, 200, 15) * 2) }}>
          <Crash at={40} />
          <div style={{ position: 'absolute', left: 30, bottom: 20, fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: COL.muted }}>GRÁFICO ILUSTRATIVO</div>
        </div>
      </Stage>
      {f >= 170 ? <Stamp text="QUIEBRA" at={170} x={1430} y={480} size={120} rot={-10} sub="LEHMAN BROTHERS · 15 SEP 2008" /> : null}
      <Beats x={110} w={880} beats={[
        { at: 20, out: 260, text: '*2008*', y: 330, size: 220 },
        { at: 260, out: 470, text: 'LOS BANCOS|SE *DERRUMBAN*', y: 360, size: 120 },
        { at: 470, text: 'Y ALGUIEN|ESTABA *ESCRIBIENDO…*', y: 360, size: 110 },
      ]} />
      <Note at={300} out={465} x={170} y={720} w={760} text="Los gobiernos usan dinero público para rescatar a los bancos." size={40} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 4 · el documento (0:55–1:25) */
export const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const NAME = 420;
  return (
    <AbsoluteFill>
      <Chapter n="02" t="EL DOCUMENTO" />
      <Stage dolly={interpolate(f, [0, 900], [60, 240]) + 70 * (punch(f, [NAME], 1) - 1)}>
        <Card src="satoshi07/whitepaper.png" x={1330} y={520} w={900} h={600} rz={-1.5} ry={-6} pos="50% 0%" k={enter(f, 10, 200, 15)} tape filter="contrast(1.1)">
          {/* el nombre y el correo, marcados */}
          {f >= NAME ? <div style={{ position: 'absolute', left: '30%', right: '30%', top: '25%', height: '13%', border: `6px solid ${COL.red}`, borderRadius: 40, transform: `scale(${ci(f, NAME, NAME + 8, 1.4, 1)})`, opacity: ci(f, NAME, NAME + 6, 0, 1) }} /> : null}
        </Card>
      </Stage>
      {f >= 640 ? <Stamp text="DESCONOCIDO" at={640} x={1330} y={800} size={90} rot={-8} sub="NADIE CONOCÍA ESE NOMBRE" /> : null}
      <Beats x={110} w={880} beats={[
        { at: 20, out: 200, text: '31 OCT|*2008*', y: 330, size: 170 },
        { at: 200, out: NAME, text: 'UN DOCUMENTO|DE *9 PÁGINAS*', y: 360, size: 120 },
        { at: NAME, out: 640, text: 'FIRMADO:|*SATOSHI NAKAMOTO*', y: 360, size: 100 },
        { at: 640, text: 'DINERO DE PERSONA|A PERSONA, *SIN BANCOS*', y: 360, size: 84 },
      ]} />
      <Note at={230} out={410} x={170} y={720} w={780} kicker="LO PUBLICÓ EN UNA LISTA DE CORREO DE CRIPTOGRAFÍA" text="«Bitcoin: A Peer-to-Peer Electronic Cash System»" size={42} />
      <Note at={460} out={630} x={170} y={720} w={780} kicker="CORREO DE CONTACTO" text="satoshin@gmx.com" size={54} red />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 5 · el bloque génesis (1:25–1:55) */
export const Genesis: React.FC = () => {
  const f = useCurrentFrame();
  const MSG = 330;
  return (
    <AbsoluteFill>
      <Chapter n="03" t="EL PRIMER BLOQUE" />
      <Stage dolly={interpolate(f, [0, 900], [40, 220]) + 70 * (punch(f, [MSG], 1) - 1)} rx={4}>
        <Card src="satoshi07/genesis.jpg" x={1330} y={540} w={880} h={610} rz={1.5} ry={-5} k={enter(f, 10, 200, 15)} pos="50% 50%" filter="contrast(1.05)">
          {f >= MSG ? <div style={{ position: 'absolute', right: '2%', width: '33%', top: '8%', height: '30%', border: `6px solid ${COL.red}`, borderRadius: 18, opacity: ci(f, MSG, MSG + 6, 0, 1) }} /> : null}
        </Card>
      </Stage>
      <Beats x={110} w={880} beats={[
        { at: 20, out: 200, text: '3 ENE|*2009*', y: 330, size: 170 },
        { at: 200, out: MSG, text: 'NACE EL|*PRIMER BLOQUE*', y: 360, size: 120 },
        { at: MSG, out: 700, text: 'Y DENTRO,|UN *MENSAJE*', y: 300, size: 120 },
        { at: 700, text: '¿UNA FECHA…|O UNA *PROTESTA?*', y: 360, size: 110 },
      ]} />
      <Note at={MSG + 40} out={690} x={150} y={600} w={820} kicker="ESCRITO EN EL BLOQUE" text="«The Times 03/Jan/2009 Chancellor on brink of second bailout for banks»" size={36} />
      <Note at={MSG + 150} out={690} x={170} y={850} w={800} kicker="TRADUCCIÓN" text="El ministro de Hacienda, a punto de un segundo rescate a los bancos." size={34} red rot={1} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 6 · Hal Finney y el primer envío (1:55–2:22) */
export const Hal: React.FC = () => {
  const f = useCurrentFrame();
  const TX = 330;
  const btc = Math.round(interpolate(f, [TX + 40, TX + 90], [0, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <AbsoluteFill>
      <Chapter n="04" t="EL PRIMER ENVÍO" />
      <Stage dolly={interpolate(f, [0, 810], [40, 200])}>
        <Card src="satoshi07/running.png" x={1330} y={380} w={840} h={380} rz={-2} ry={-4} k={enter(f, 10, 200, 15)} pos="50% 50%" tape />
        <RedString a={[1330, 560]} b={[1330, 700]} at={TX} dur={10} />
      </Stage>
      {f >= TX ? (
        <div style={{ position: 'absolute', left: 1330, top: 700, transform: `translateX(-50%) scale(${enter(f, TX, 260, 14)})`, display: 'flex', alignItems: 'center', gap: 24, padding: '22px 30px', background: '#FBFAF6', boxShadow: '0 24px 50px rgba(0,0,0,0.3)' }}>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: COL.ink }}>SATOSHI</span>
          <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 60, color: COL.red, whiteSpace: 'nowrap' }}>→ {btc} BTC →</span>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: COL.ink }}>HAL FINNEY</span>
        </div>
      ) : null}
      <Beats x={110} w={880} beats={[
        { at: 20, out: 180, text: '11 ENE|*2009*', y: 330, size: 170 },
        { at: 180, out: TX, text: '«RUNNING|*BITCOIN*»', y: 360, size: 120 },
        { at: TX, out: 580, text: 'EL PRIMER ENVÍO|DE LA *HISTORIA*', y: 360, size: 100 },
        { at: 580, text: 'DE SATOSHI|A *HAL FINNEY*', y: 360, size: 110 },
      ]} />
      <Note at={200} out={320} x={170} y={720} w={780} kicker="HAL FINNEY · PROGRAMADOR" text="Fue de los primeros en descargar y ejecutar Bitcoin." size={40} />
      <Note at={380} out={570} x={170} y={720} w={780} kicker="12 ENE 2009" text="Satoshi le envía 10 bitcoins." size={46} red />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 7 · las pizzas (2:22–2:42) */
export const Pizza: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Chapter n="05" t="LAS PIZZAS" />
      <Stage dolly={interpolate(f, [0, 600], [40, 200])}>
        {Array.from({ length: 14 }, (_, i) => {
          const k = enter(f, 60 + i * 6, 260, 14);
          return <Card key={i} src="satoshi07/logo.png" x={1100 + (i % 7) * 110 + (rnd(i) - 0.5) * 30} y={360 + Math.floor(i / 7) * 280 + (rnd(i * 3) - 0.5) * 40} w={150} h={150} border={0} rz={(rnd(i * 7) - 0.5) * 30} k={k} pos="50% 50%" />;
        })}
      </Stage>
      <BigNum at={90} x={1440} y={760} n="10.000 BTC" sub="POR DOS PIZZAS" size={150} />
      <Beats x={110} w={880} beats={[
        { at: 20, out: 260, text: '22 MAY|*2010*', y: 330, size: 170 },
        { at: 260, text: 'LA PRIMERA|COMPRA *REAL*', y: 360, size: 120 },
      ]} />
      <Note at={300} x={170} y={720} w={780} kicker="LASZLO HANYECZ · FLORIDA" text="Pagó dos pizzas con bitcoins. Hoy se recuerda como el «Bitcoin Pizza Day»." size={38} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 8 · la desaparición (2:42–3:12) */
const MAIL = "I've moved on to other things.";
export const Gone: React.FC = () => {
  const f = useCurrentFrame();
  const MAILAT = 330;
  const fade = ci(f, 700, 820, 1, 0);
  return (
    <AbsoluteFill>
      <Chapter n="06" t="LA DESAPARICIÓN" />
      <Stage dolly={interpolate(f, [0, 900], [40, 220])}>
        <Card src="satoshi07/lugano-metal.png" x={1420} y={540} w={560} h={820} rz={2} ry={-6} k={enter(f, 10, 200, 15)} pos="50% 40%" filter={`contrast(1.1) grayscale(${ci(f, 600, 800, 0, 1)})`} />
      </Stage>
      {f >= MAILAT ? (
        <div style={{ position: 'absolute', left: 150, top: 640, width: 820, padding: '26px 32px', background: '#FBFAF6', boxShadow: '0 24px 50px rgba(0,0,0,0.25)', opacity: fade, transform: `translateY(${(1 - fade) * -40}px)` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: COL.muted }}>DE: SATOSHI NAKAMOTO · ABRIL 2011</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: COL.ink }}>{typed(f, MAILAT + 20, MAIL, 0.9)}{caret(f)}</div>
          <div style={{ marginTop: 12, fontFamily: HEAD, fontWeight: 900, fontSize: 32, color: COL.red, opacity: ci(f, MAILAT + 70, MAILAT + 80, 0, 1) }}>«Me dedico a otras cosas.»</div>
        </div>
      ) : null}
      <Beats x={110} w={880} beats={[
        { at: 20, out: 200, text: 'DIC|*2010*', y: 330, size: 170 },
        { at: 200, out: MAILAT, text: 'SU ÚLTIMO MENSAJE|EN EL *FORO*', y: 360, size: 96 },
        { at: MAILAT, out: 700, text: 'Y UN|*ÚLTIMO CORREO*', y: 330, size: 120 },
        { at: 720, text: 'DESPUÉS…|*NADA*', y: 380, size: 150 },
      ]} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 9 · la fortuna (3:12–3:40) */
export const Fortune: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [60, 220], [0, 1100000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <AbsoluteFill>
      <Chapter n="07" t="LA FORTUNA" />
      <Stage dolly={interpolate(f, [0, 840], [40, 200])}>
        <Card src="satoshi07/granja.jpg" x={1360} y={400} w={820} h={470} rz={-2} ry={-5} k={enter(f, 10, 200, 15)} pos="50% 50%" dim={0.25} />
      </Stage>
      <BigNum at={60} out={430} x={1360} y={700} n={`${n.toLocaleString('es-ES')} BTC`.replace(/,/g, '.')} sub="ESTIMACIÓN: ENTRE 750.000 Y 1.100.000 BTC" size={120} />
      <BigNum at={430} x={1360} y={700} n="73.000 M USD" sub="LO QUE LLEGARON A VALER · NOV 2021" size={120} />
      <Beats x={110} w={880} beats={[
        { at: 20, out: 430, text: 'UNA FORTUNA|*MINADA*', y: 330, size: 130 },
        { at: 430, out: 640, text: 'UNA DE LAS MAYORES|DEL *MUNDO*', y: 360, size: 96 },
        { at: 640, text: 'Y NO SE CONOCE|NINGÚN *MOVIMIENTO*', y: 360, size: 96 },
      ]} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 10 · los señalados (3:40–4:28) */
const SUSPECTS: { name: string; when: string; why: string; verdict: string }[] = [
  { name: 'DORIAN NAKAMOTO', when: '2014', why: 'Newsweek dijo que era él por su apellido.', verdict: 'LO NEGÓ' },
  { name: 'HAL FINNEY', when: '2009–2014', why: 'Recibió el primer envío.', verdict: 'LO NEGÓ' },
  { name: 'NICK SZABO', when: '1998', why: 'Diseñó «bit gold», una idea parecida.', verdict: 'LO NEGÓ' },
  { name: 'CRAIG WRIGHT', when: '2016', why: 'Dijo públicamente que era Satoshi.', verdict: 'TRIBUNAL: NO ES ÉL' },
  { name: 'PETER TODD', when: '2024', why: 'Un documental de HBO lo señaló.', verdict: 'LO NEGÓ' },
];
const Silhouette: React.FC = () => (
  <svg viewBox="0 0 200 240" width="100%" height="100%" style={{ background: '#2A2A2A' }}>
    <circle cx={100} cy={92} r={46} fill="#151515" />
    <path d="M20 240 C 30 160, 170 160, 180 240 Z" fill="#151515" />
    <text x={100} y={112} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={60} fill="#3A3A3A">?</text>
  </svg>
);
export const Suspects: React.FC = () => {
  const f = useCurrentFrame();
  const STEP = 240;
  const cur = Math.min(SUSPECTS.length - 1, Math.max(0, Math.floor((f - 120) / STEP)));
  return (
    <AbsoluteFill>
      <Chapter n="08" t="LOS SEÑALADOS" />
      <Beats x={110} w={1700} beats={[{ at: 20, out: 120, text: 'LOS QUE FUERON|*SEÑALADOS*', y: 380, size: 130 }]} />
      {f >= 110 ? (
        <Stage dolly={interpolate(f, [110, 1440], [0, 120])}>
          {SUSPECTS.map((s, i) => {
            const at = 120 + i * STEP;
            const k = enter(f, at, 220, 15);
            if (k <= 0) return null;
            const x = 260 + i * 350;
            const active = i === cur;
            return (
              <div key={s.name} style={{ position: 'absolute', left: x - 150, top: 260, width: 300, transformStyle: 'preserve-3d', transform: `translateZ(${active ? 120 : 0}px) rotateZ(${(rnd(i) - 0.5) * 8}deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2) * (active || f > 120 + SUSPECTS.length * STEP ? 1 : 0.55), transition: 'none' }}>
                <div style={{ background: '#FBFAF6', padding: 14, paddingBottom: 18, boxShadow: '0 24px 50px rgba(0,0,0,0.3)' }}>
                  <div style={{ height: 300 }}><Silhouette /></div>
                  <div style={{ marginTop: 12, fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: COL.ink, textAlign: 'center' }}>{s.name}</div>
                  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, letterSpacing: 2, color: COL.muted, textAlign: 'center' }}>{s.when}</div>
                </div>
                {f >= at + 120 ? (
                  <div style={{ position: 'absolute', left: 150, top: 170, transform: `translate(-50%, -50%) rotate(-12deg) scale(${1 + 0.4 * Math.exp(-(f - at - 120) / 3)})`, border: `7px solid ${COL.red}`, color: COL.red, background: 'rgba(255,255,255,0.88)', padding: '4px 14px', fontFamily: HEAD, fontWeight: 900, fontSize: s.verdict.length > 10 ? 26 : 38, whiteSpace: 'nowrap' }}>{s.verdict}</div>
                ) : null}
              </div>
            );
          })}
        </Stage>
      ) : null}
      {f >= 120 && f < 120 + SUSPECTS.length * STEP ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center' }}>
          <div key={cur} style={{ maxWidth: 1300, padding: '22px 32px', background: '#FBFAF6', borderLeft: `10px solid ${COL.red}`, boxShadow: '0 22px 44px rgba(0,0,0,0.25)', fontFamily: HEAD, fontWeight: 900, fontSize: 46, color: COL.ink, opacity: ci(f - (120 + cur * STEP), 0, 8, 0, 1) }}>
            {SUSPECTS[cur].why}
          </div>
        </div>
      ) : null}
      {f >= 120 + SUSPECTS.length * STEP ? (
        <Beats x={110} w={1700} beats={[{ at: 120 + SUSPECTS.length * STEP, text: 'NINGUNO|LO *DEMOSTRÓ*', y: 800, size: 90 }]} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 11 · la prueba (4:28–4:44) */
const CMD = '> firmar mensaje con la clave del bloque 0';
export const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2;
  return (
    <AbsoluteFill>
      <Chapter n="09" t="LA PRUEBA" />
      <Stage dolly={interpolate(f, [0, 480], [40, 160])}>
        <div style={{ position: 'absolute', left: 1000, top: 300, width: 820, height: 420, background: '#111', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', borderRadius: 18, padding: '40px 44px', boxSizing: 'border-box', transform: `rotateZ(-1.5deg) scale(${0.6 + 0.4 * enter(f, 10, 200, 15)})` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: '#E9E6E0' }}>{typed(f, 30, CMD, 1)}{f < 30 + CMD.length ? caret(f) : ''}</div>
          {f >= 30 + CMD.length + 10 ? <div style={{ marginTop: 34, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: COL.red, opacity: blink ? 1 : 0.35 }}>ESPERANDO FIRMA…</div> : null}
        </div>
      </Stage>
      <Beats x={110} w={860} beats={[
        { at: 20, out: 260, text: 'BASTARÍA CON|*UNA FIRMA*', y: 330, size: 120 },
        { at: 260, text: 'NADIE LA HA|*HECHO*', y: 360, size: 140 },
      ]} />
      <Note at={60} out={250} x={170} y={720} w={760} text="O con mover una sola de sus monedas." size={42} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 12 · cierre (4:44–5:00) */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 480], [100, 260])}>
        <Card src="satoshi07/busto.jpg" x={1360} y={540} w={760} h={860} rz={2.5} ry={-5} pos="50% 30%" imgScale={1.1 + f * 0.0006} imgOrigin="50% 30%" filter="contrast(1.12) saturate(0.9)" />
        <Scribble cx={1360} cy={420} rx={250} ry={230} at={20} dur={10} />
      </Stage>
      <Beats x={110} w={900} beats={[
        { at: 10, out: 250, text: '¿QUIÉN CREES|QUE ES|*SATOSHI?*', y: 280, size: 130 },
        { at: 250, text: 'DÉJALO EN LOS|*COMENTARIOS*', y: 330, size: 110 },
      ]} />
      <Note at={290} x={170} y={760} w={760} kicker="NO PRESIONES" text="Casos reales de internet. Suscríbete para el próximo." size={40} />
      <div style={{ position: 'absolute', left: 110, bottom: 90, fontFamily: MONO, fontWeight: 500, fontSize: 18, color: COL.muted, opacity: ci(f, 300, 320, 0, 1) }}>
        Imágenes: Wikimedia Commons (Elekes Andor, Valentina Picozzi, Marko Ahtisaari · CC BY-SA 4.0 / CC BY 2.0) · documento y bloque génesis: dominio público
      </div>
    </AbsoluteFill>
  );
};

export const _W = W;
