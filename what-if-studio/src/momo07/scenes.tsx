/**
 * Caso Nº 05 · Momo — escenas (estándar del Caso Nº 04: tablero de papel, fotos 3D, rotuladora, un acento rojo).
 * Fotos reales: BBC Mundo (25-jul-2018: la cara y el chat con número +57), BBC News (28-feb-2019: el móvil).
 * Hechos: BBC Mundo, BBC News, Wikipedia (Momo Challenge hoax), Japan Times (6-mar-2019). Nada de casos concretos ni
 * detalles de autolesiones: solo "retos peligrosos", y que nadie confirmó un solo caso.
 */
import React from 'react';
import { AbsoluteFill, Freeze, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COL, H, HEAD, MONO, SCENES, W, ci, punch, rnd, shake } from './theme';
import { Card, Headline, Phone, Stage, Tag, enter } from './kit';

const FACE = 'momo07/momo-cara.jpg'; // 2048x1263, la escultura en la galería
const CHAT = 'momo07/momo-whatsapp.jpg'; // 2048x1152: izquierda otra foto, derecha el chat real con +57
const PHONE = 'momo07/bbc-momo.jpg'; // 2048x1151, la cara en un móvil (BBC)
const EYES = '60% 36%';

/** Notificación de WhatsApp que cae desde arriba (recreación). */
const Notif: React.FC<{ t: number; at: number; out?: number }> = ({ t, at, out }) => {
  if (t < at) return null;
  const k = at <= 0 ? Math.min(1, 0.92 + enter(t + 8, 0, 420, 18) * 0.08) : enter(t, at, 420, 18); // en el frame 0 ya está a la vista
  const o = out === undefined ? 1 : ci(t, out - 6, out, 1, 0);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 140 + (1 - k) * -260, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 34, background: 'rgba(250,250,247,0.97)', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', opacity: o }}>
      <div style={{ width: 86, height: 86, borderRadius: 43, overflow: 'hidden', flexShrink: 0, background: '#222' }}>
        <Img src={staticFile(FACE)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '52% 30%', transform: 'scale(1.8)', transformOrigin: '52% 32%' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 24, color: '#25A244', letterSpacing: 1 }}><span>WHATSAPP</span><span style={{ color: COL.muted }}>ahora</span></div>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: COL.ink, marginTop: 2 }}>Momo</div>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 32, color: COL.muted }}>Te envió una imagen 👁️</div>
      </div>
    </div>
  );
};
/** Luces de patrulla barriendo los bordes. */
const PoliceLights: React.FC<{ t: number; from: number; to?: number }> = ({ t, from, to = 99999 }) => {
  if (t < from || t > to) return null;
  const on = ci(t, from, from + 4, 0, 1) * ci(t, to - 6, to, 1, 0);
  const red = Math.max(0, Math.sin((t - from) * 0.7));
  return <AbsoluteFill style={{ pointerEvents: 'none', opacity: on, background: `linear-gradient(90deg, rgba(227,38,47,${0.42 * red}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(47,107,255,${0.42 * (1 - red)}) 100%)` }} />;
};
/** Franjas de interferencia. */
const Glitch: React.FC<{ t: number; n?: number; amp?: number }> = ({ t, n = 5, amp = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${rnd(t * 5 + i) * 100}%`, height: (6 + rnd(t + i) * 34) * amp, background: i % 2 ? 'rgba(227,38,47,0.55)' : 'rgba(80,220,255,0.35)', mixBlendMode: 'screen', transform: `translateX(${(rnd(t * 3 + i) - 0.5) * 80}px)` }} />
    ))}
  </AbsoluteFill>
);

/* ================================================================== */
/* 1 · GANCHO (0–5 s): videollamada entrante de Momo (recreación, POV). */
/* HookView(t=0) es también el último frame: el loop vuelve a sonar.    */
/* ================================================================== */
const ANSWER = 26; // el botón verde sube solo: la llamada "se contesta"
const CUT = 34; // corte seco a la cámara: la cara de Momo llena la pantalla
const Q = 110; // ¿TE ACUERDAS DE ELLA?
const Avatar: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', background: '#222', boxShadow: '0 0 0 6px rgba(255,255,255,0.12)' }}>
    <Img src={staticFile(FACE)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 34%', transform: 'scale(1.55)', transformOrigin: '62% 34%' }} />
  </div>
);
const CallScreen: React.FC<{ t: number }> = ({ t }) => {
  const ring = (t % 24) / 24;
  const up = ci(t, ANSWER - 6, ANSWER, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill style={{ background: '#0B0F0E' }}>
      {/* fondo: la misma cara, desenfocada y oscura, como el fondo de una llamada */}
      <Img src={staticFile(FACE)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 40%', filter: 'blur(34px) brightness(0.35) saturate(1.2)', transform: 'scale(1.3)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 36, color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }}>🔒 Videollamada de WhatsApp</div>
      {/* anillos de llamada */}
      {[0, 1].map((i) => {
        const r = ((ring + i * 0.5) % 1);
        return <div key={i} style={{ position: 'absolute', left: W / 2 - 230 - r * 140, top: 560 - 230 - r * 140, width: 460 + r * 280, height: 460 + r * 280, borderRadius: '50%', border: `4px solid rgba(37,211,102,${0.6 * (1 - r)})` }} />;
      })}
      <div style={{ position: 'absolute', left: W / 2 - 230, top: 330, transform: `scale(${1 + 0.03 * Math.sin(t / 2)})` }}><Avatar size={460} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 96, color: '#fff', letterSpacing: '-0.02em' }}>Momo</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>+57 ••• ••• •••• · llamando{'.'.repeat(1 + (Math.floor(t / 6) % 3))}</div>
      {/* botones: colgar / contestar (el verde sube solo) */}
      <div style={{ position: 'absolute', left: 170, top: 1440, width: 170, height: 170, borderRadius: 85, background: '#E5484D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#fff', transform: 'rotate(135deg)' }}>✆</div>
      <div style={{ position: 'absolute', left: W - 340, top: 1440 - up * 420, width: 170, height: 170, borderRadius: 85, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#fff', transform: `scale(${1 + 0.08 * Math.sin(t / 2)})`, boxShadow: '0 0 40px rgba(37,211,102,0.6)' }}>✆</div>
      <div style={{ position: 'absolute', left: W - 400, top: 1640, width: 290, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 24, color: 'rgba(255,255,255,0.7)', opacity: 1 - up }}>DESLIZA PARA CONTESTAR</div>
    </AbsoluteFill>
  );
};
const CallView: React.FC<{ t: number }> = ({ t }) => {
  const k = t - CUT;
  const zoom = 1.15 + 0.45 * ci(k, 0, 90, 0, 1, (x) => 1 - Math.pow(1 - x, 2)) + 0.25 * Math.exp(-k / 3);
  const hand = { x: Math.sin(k / 6) * 8 + (rnd(k) - 0.5) * 4, y: Math.cos(k / 7) * 8 };
  const sec = Math.floor(k / 30);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Img src={staticFile(FACE)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '66% 38%', transform: `translate(${hand.x}px, ${hand.y}px) scale(${zoom})`, transformOrigin: '66% 36%', filter: `contrast(1.2) saturate(1.1) brightness(${0.92 + 0.08 * Math.sin(k / 2)})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.7) 100%)' }} />
      {/* interfaz de la llamada */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 44, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Momo</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 176, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 28, color: 'rgba(255,255,255,0.85)' }}>00:0{Math.min(9, sec)}</div>
      <div style={{ position: 'absolute', right: 60, top: 250, width: 180, height: 270, borderRadius: 24, background: '#111', border: '3px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14, boxSizing: 'border-box', fontFamily: MONO, fontWeight: 800, fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>TÚ</div>
      {(k < 6 || k % 11 < 2) ? <Glitch t={t} n={k < 6 ? 7 : 3} amp={k < 6 ? 1.4 : 0.6} /> : null}
    </AbsoluteFill>
  );
};
export const HookView: React.FC<{ t: number }> = ({ t }) => {
  // vibración del móvil mientras suena; sacudida fuerte en el corte
  const vib = t < CUT ? { x: (t % 2 ? 1 : -1) * 6, y: 0 } : { x: 0, y: 0 };
  const s = shake(t, CUT, 22, 10);
  const flash = t >= CUT && t < CUT + 5 ? ci(t, CUT, CUT + 5, 1, 0) : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x + vib.x}px, ${s.y + vib.y}px)` }}>
      {t < CUT ? <CallScreen t={t} /> : <CallView t={t} />}
      {flash > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: flash }} /> : null}
      <Headline text="NO|*CONTESTES*" at={2} y={1020} size={140} out={CUT} stagger={0} />
      <Headline text="ESTA CARA ASUSTÓ|A *MEDIO MUNDO*" at={CUT + 8} y={1160} size={110} out={Q} maxW={960} />
      <Headline text="¿TE ACUERDAS|DE *MOMO?*" at={Q} y={1160} size={140} />
      <Tag text="RECREACIÓN" at={CUT + 8} y={260} center size={20} />
    </AbsoluteFill>
  );
};
export const Hook: React.FC = () => <HookView t={useCurrentFrame()} />;

/* ================================================================== */
/* 2 · EL CHAT (5–10 s): WhatsApp desde Japón, México… y Colombia      */
/* ================================================================== */
const CODES = [
  { c: '+81', p: 'JAPÓN', at: 76, y: 430 },
  { c: '+52', p: 'MÉXICO', at: 101, y: 560 },
  { c: '+57', p: 'COLOMBIA', at: 118, y: 690, red: true },
];
export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 150], [0, 160]) + 60 * (punch(f, [118], 1) - 1)}>
        <Phone x={330} y={860} k={enter(f, 0, 170, 15)} ry={14 + Math.sin(f / 30) * 5} rz={4}>
          {/* el chat real (BBC Mundo / Twitter): número +57, "hola?" */}
          <Img src={staticFile(CHAT)} style={{ position: 'absolute', top: 130, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '88% 0%' }} />
        </Phone>
        {CODES.map((k) => {
          const e = enter(f, k.at, 300, 13);
          if (e <= 0) return null;
          return (
            <div key={k.c} style={{ position: 'absolute', left: 600, top: k.y, transform: `translateZ(${80 + (k.red ? 40 : 0)}px) translateX(${(1 - e) * 300}px) rotate(${(rnd(k.at) - 0.5) * 6}deg) scale(${k.red ? 1.12 : 1})`, opacity: Math.min(1, e * 2), display: 'flex', boxShadow: '0 16px 34px rgba(0,0,0,0.3)' }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: '#fff', background: k.red ? COL.red : COL.ink, padding: '10px 16px' }}>{k.c}</span>
              <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: COL.ink, background: '#FBFAF6', padding: '14px 16px' }}>{k.p}</span>
            </div>
          );
        })}
      </Stage>
      <Headline text="TE ESCRIBÍA|POR *WHATSAPP*" at={3} y={1290} size={120} />
      <Tag text="CHAT REAL DIFUNDIDO EN 2018 · BBC MUNDO" at={20} y={300} center size={22} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 · EL RUMOR (10–14 s): retos y "sabía cosas de ti"                 */
/* ================================================================== */
export const Rumor: React.FC = () => {
  const f = useCurrentFrame();
  const bubbles = [0.72, 0.55, 0.8, 0.48];
  return (
    <AbsoluteFill style={{ background: '#0D0D0D' }}>
      <AbsoluteFill style={{ opacity: 0.35 + 0.15 * Math.sin(f / 3) }}>
        <Img src={staticFile(FACE)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: EYES, transform: `scale(${1.6 + f * 0.006}) translateY(${-f * 0.6}px)`, filter: 'grayscale(0.3) contrast(1.3) brightness(0.6)' }} />
      </AbsoluteFill>
      {bubbles.map((w, i) => {
        const at = 8 + i * 11;
        const e = enter(f, at, 380, 16);
        if (e <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 90, top: 360 + i * 130, width: `${w * 100}%`, maxWidth: 880, padding: '24px 28px', borderRadius: '8px 30px 30px 30px', background: '#262626', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: '0 0', opacity: e }}>
            <div style={{ height: 26, width: '86%', background: '#5A5A5A', borderRadius: 6 }} />
            {i % 2 === 0 ? <div style={{ height: 26, width: '52%', background: '#5A5A5A', borderRadius: 6, marginTop: 12 }} /> : null}
          </div>
        );
      })}
      {f >= 56 ? <div style={{ position: 'absolute', left: 100, top: 880, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#25D366' }}>Momo está escribiendo{'.'.repeat(1 + (Math.floor(f / 6) % 3))}</div> : null}
      {f % 9 < 2 ? <Glitch t={f} n={4} /> : null}
      <Tag text="SEGÚN LOS RUMORES · RECREACIÓN" at={4} y={250} center size={22} />
      <Headline text="TE PONÍA|*RETOS*" at={14} y={1150} size={140} out={56} />
      <Headline text="Y QUE *SABÍA*|COSAS DE TI" at={58} y={1150} size={120} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · EL PÁNICO (14–21 s): 2019, alertas en todo el mundo             */
/* ================================================================== */
// 9 países con alertas documentadas (Wikipedia): Argentina, México, España, Alemania, Luxemburgo, Canadá, EE. UU., India, Irlanda del Norte.
/** Mapa mundial (equirectangular, Wikimedia Commons) con las 9 alertas documentadas apareciendo mientras la cámara lo recorre. */
const ALERTS_MAP: { n: string; lat: number; lon: number; at: number; big?: boolean; hide?: boolean }[] = [
  { n: 'CANADÁ', lat: 56, lon: -106, at: 6 },
  { n: 'EE. UU.', lat: 39, lon: -98, at: 11 },
  { n: 'MÉXICO', lat: 23, lon: -102, at: 16, big: true },
  { n: 'ARGENTINA', lat: -34, lon: -64, at: 22, big: true },
  { n: 'ESPAÑA', lat: 40, lon: -4, at: 34, big: true },
  { n: 'IRLANDA DEL N.', lat: 54.6, lon: -6.6, at: 40, hide: true },
  { n: 'LUXEMBURGO', lat: 49.8, lon: 6.1, at: 45, hide: true },
  { n: 'ALEMANIA', lat: 51, lon: 10.4, at: 50, hide: true },
  { n: 'INDIA', lat: 22, lon: 79, at: 58 },
];
const MW = 2400; // px por 360°
const MH = (135 / 360) * MW; // el mapa va de 75°N a 60°S
const WorldAlerts: React.FC<{ f: number; out: number }> = ({ f, out }) => {
  const pan = interpolate(f, [0, 30, 66], [-80, -260, -980], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x) });
  const zoom = 1 + 0.03 * Math.sin(f / 20) + 0.16 * ci(f, 66, 170, 0, 1);
  const n = ALERTS_MAP.filter((a) => f >= a.at).length;
  const o = ci(f, out, out + 6, 1, 0);
  return (
    <AbsoluteFill style={{ opacity: o, perspective: 1600 }}>
      <div style={{ position: 'absolute', left: pan, top: 440, width: MW, height: MH, transform: `rotateX(14deg) scale(${zoom})`, transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', inset: -30, background: '#FBFAF6', boxShadow: '0 40px 80px rgba(0,0,0,0.25)' }} />
        <Img src={staticFile('momo07/mapa.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {ALERTS_MAP.map((a) => {
          if (f < a.at) return null;
          const x = ((a.lon + 180) / 360) * MW;
          const y = ((75 - a.lat) / 360) * MW;
          const k = enter(f, a.at, 360, 12);
          const ring = ((f - a.at) % 24) / 24;
          return (
            <div key={a.n} style={{ position: 'absolute', left: x, top: y }}>
              <div style={{ position: 'absolute', left: -60 * (0.4 + ring), top: -60 * (0.4 + ring), width: 120 * (0.4 + ring), height: 120 * (0.4 + ring), borderRadius: '50%', border: `5px solid rgba(227,38,47,${0.8 * (1 - ring)})` }} />
              <div style={{ position: 'absolute', left: -16, top: -16, width: 32, height: 32, borderRadius: 16, background: COL.red, boxShadow: '0 0 0 6px rgba(255,255,255,0.9)', transform: `scale(${k})` }} />
              {a.hide ? null : <div style={{ position: 'absolute', left: 26, top: -24, whiteSpace: 'nowrap', opacity: a.lon < -30 ? ci(f, 44, 54, 1, 0) : 1, fontFamily: HEAD, fontWeight: 900, fontSize: a.big ? 46 : 32, color: '#fff', background: a.big ? COL.red : COL.ink, padding: '4px 12px', transform: `scale(${k})`, transformOrigin: '0 50%' }}>⚠ {a.n}</div>}
            </div>
          );
        })}
      </div>
      {/* Europa: tres alertas juntas, una sola etiqueta */}
      {f >= 50 ? (
        <div style={{ position: 'absolute', left: pan + ((10 + 180) / 360) * MW + 30, top: 440 + ((75 - 62) / 360) * MW - 30, transform: `rotateX(14deg) scale(${enter(f, 50, 360, 12)})`, transformOrigin: '0 50%', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 32, color: '#fff', background: COL.ink, padding: '4px 12px' }}>⚠ +3 EN EUROPA</div>
      ) : null}
      {/* contador de países */}
      <div style={{ position: 'absolute', right: 80, top: 300, display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 18px', background: COL.ink, boxShadow: '0 14px 30px rgba(0,0,0,0.3)', transform: `scale(${1 + 0.12 * (n > 0 ? Math.exp(-(f - ALERTS_MAP[n - 1].at) / 3) : 0)})` }}>
        <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 80, color: '#fff', lineHeight: 1 }}>{n}</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: 2 }}>{n === 1 ? 'PAÍS EN' : 'PAÍSES EN'}<br />ALERTA</span>
      </div>
    </AbsoluteFill>
  );
};
export const Panic: React.FC = () => {
  const f = useCurrentFrame();
  const KIM = 95; // «Hasta Kim Kardashian…»
  const Q = 166; // ¿REAL O FALSO? sola, en el silencio de la voz
  const dim = ci(f, Q - 4, Q + 6, 0, 0.6);
  return (
    <AbsoluteFill>
      <WorldAlerts f={f} out={Q + 20} />
      {dim > 0 ? <AbsoluteFill style={{ background: '#0D0D0D', opacity: dim }} /> : null}
      <Headline text="*2019*" at={2} y={270} size={130} out={Q} stagger={0} />
      <Headline text="HASTA *KIM KARDASHIAN*|PIDIÓ BORRARLA" at={KIM} y={1330} size={86} maxW={960} out={Q} />
      <Headline text="¿REAL|O *FALSO?*" at={Q} y={760} size={170} stagger={0} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL BULO (21–27 s): nadie confirmó un solo caso                  */
/* ================================================================== */
export const Hoax: React.FC = () => {
  const f = useCurrentFrame();
  const HIT = 8;
  const BULO = 108; // plano 1: el CERO · plano 2: ¿de dónde salió la cara? (sin sello: el único sello va en el 0:29)
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: COL.red, opacity: f < BULO ? 1 : ci(f, BULO, BULO + 8, 1, 0) }} />
      {f >= HIT && f < HIT + 6 ? <AbsoluteFill style={{ background: '#fff', opacity: ci(f, HIT, HIT + 6, 0.9, 0) }} /> : null}
      {/* plano 1: un CERO enorme, nada más */}
      {f < BULO + 8 ? (
        <AbsoluteFill style={{ opacity: ci(f, 0, 3, 0, 1) * ci(f, BULO, BULO + 8, 1, 0) }}>
          <Img src={staticFile(FACE)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 38%', filter: 'grayscale(1) contrast(1.3)', opacity: 0.22, mixBlendMode: 'multiply', transform: `scale(${1.1 + f * 0.003})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${f < HIT ? ci(f, 0, HIT, 2.4, 1.25) : 1 + 0.25 * Math.exp(-(f - HIT) / 4) + 0.12 * ci(f, HIT, BULO, 0, 1)}) rotate(${Math.sin(f / 9) * 1.2}deg)` }}>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 480, lineHeight: 0.9, color: COL.ink, background: '#FBFAF6', padding: '10px 80px 0', boxShadow: '0 30px 70px rgba(0,0,0,0.35)' }}>0</div>
            <div style={{ marginTop: 20, fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: 4, color: '#fff', background: COL.ink, padding: '12px 22px' }}>CASOS REALES</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* plano 1, apoyo: de dónde sale el cero */}
      {f >= HIT + 20 && f < BULO + 8 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: 'rgba(255,255,255,0.9)', opacity: ci(f, HIT + 20, HIT + 28, 0, 1) * ci(f, BULO, BULO + 8, 1, 0) }}>BBC · SAMARITANS · NSPCC · UK SAFER INTERNET CENTRE</div>
      ) : null}
      {/* plano 2: sin sello todavía — la pista: ¿de dónde salió la cara? (la respuesta llega en 2 s) */}
      {f >= BULO ? (
        <Stage dolly={interpolate(f, [BULO, 176], [0, 160])} ry={interpolate(f, [BULO, 176], [-6, 6])}>
          <Card src={FACE} x={W / 2} y={760} w={760} h={860} rz={-2} k={enter(f, BULO, 230, 15)} pos="57% 35%" filter="grayscale(1) contrast(1.15)">
            {/* lupa / escáner que recorre la cara */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${ci(f, BULO + 6, 176, 0, 100, (x) => x)}%`, height: 8, marginTop: -4, background: COL.red, boxShadow: `0 0 26px ${COL.red}` }} />
          </Card>
        </Stage>
      ) : null}
      <Headline text="¿DE DÓNDE|SALIÓ *ESA CARA?*" at={BULO + 10} y={1300} size={110} maxW={960} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · LA ESCULTURA (27–32,5 s)                                        */
/* ================================================================== */
export const Sculpt: React.FC = () => {
  const f = useCurrentFrame();
  const BODY = 82; // plano 2: «una mujer pájaro con patas de ave»
  const ANSWER = 168; // «Todo era falso»: el único sello del vídeo, cierra el juego de ¿REAL O FALSO?
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 209], [60, 250]) + 70 * (punch(f, [8, BODY, ANSWER], 1) - 1)} ry={interpolate(f, [0, 209], [-8, 6])}>
        <Card src={FACE} x={W / 2} y={820} w={820} h={980} rz={2} ry={-4} k={enter(f, 0, 190, 15)} pos="57% 30%" imgScale={1.05 + f * 0.0015} imgOrigin="57% 30%" filter="contrast(1.08)" caption="“MOTHER BIRD” · 2016" tape />
        <Card src="momo07/momo-cuerpo.jpg" x={W / 2 + 20} y={790} w={760} h={860} z={220} rz={4} ry={-6} k={enter(f, BODY, 240, 13)} pos="50% 60%" imgScale={1 + Math.max(0, f - BODY) * 0.0012} imgOrigin="50% 90%" caption="LA ESCULTURA COMPLETA" tape />
      </Stage>
      {f < BODY ? <Tag text="SE LLAMA “MOTHER BIRD” · TOKIO · 2016" at={44} y={290} center red /> : null}
      <Headline text="ERA UNA|*ESCULTURA*" at={4} y={1330} size={140} out={BODY} />
      <Headline text="CON PATAS *DE AVE*" at={BODY + 30} y={1310} size={110} maxW={980} />
      {/* respuesta explícita al «¿REAL O FALSO?» del 0:17 */}
      {f >= ANSWER ? (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: -200, right: -200, top: 760, height: 260, background: COL.red, transform: `rotate(-14deg) translateX(${(1 - ci(f, ANSWER, ANSWER + 7, 0, 1, (x) => 1 - Math.pow(1 - x, 3))) * -1500}px)`, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: 'rgba(255,255,255,0.85)', letterSpacing: 4 }}>RESPUESTA:</span>
            <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 180, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>FALSO</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · A LA BASURA (32,5–35,5 s)                                       */
/* ================================================================== */
export const Trash: React.FC = () => {
  const f = useCurrentFrame();
  const DROP = 68; // cae después de «se había podrido»
  const rot = ci(f, 4, DROP, 0, 1);
  const fall = ci(f, DROP, DROP + 16, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 91], [120, 230])}>
        <Card src="momo07/momo-cuerpo.jpg" x={W / 2 + 20 + fall * 120} y={790 + fall * 1500} w={760} h={860} rz={4 + fall * 40} ry={-6} pos="50% 60%" filter={`contrast(1.08) grayscale(${0.8 * rot}) sepia(${0.65 * rot}) blur(${2.5 * ci(f, 30, DROP, 0, 1)}px)`} imgScale={1 + 0.12 * rot} imgOrigin="50% 100%" />
      </Stage>
      <Tag text="LA TIRÓ EN 2018" at={6} y={290} center red size={30} />
      <Headline text="LA TIRÓ A LA|*BASURA*" at={3} y={1300} size={120} out={50} />
      <Headline text="SE HABÍA|*PODRIDO*" at={52} y={1300} size={130} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8 · CIERRE (35,5–38 s): pregunta y vuelta exacta al frame 0         */
/* ================================================================== */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const END = SCENES.loop.len;
  const BACK = END - 14;
  const back = ci(f, BACK, END - 6, 0, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - back }}>
        <Stage dolly={interpolate(f, [0, BACK], [200, 320], { extrapolateRight: 'clamp' })}>
          <Card src={FACE} x={W / 2} y={860} w={860} h={1060} rz={-2.5} ry={4} imgScale={1.25} imgOrigin={EYES} pos="57% 40%" filter="contrast(1.12)" />
        </Stage>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 78%)', opacity: ci(f, 0, 8, 0, 1) * (1 - back) }} />
      {f >= 2 && f < BACK + 4 ? (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 1000, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 112, lineHeight: 1.02, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 18px 50px rgba(0,0,0,0.7)', opacity: ci(f, 2, 6, 0, 1) * ci(f, BACK - 2, BACK + 4, 1, 0), transform: `scale(${1 + 0.12 * Math.exp(-(f - 2) / 4)})` }}>¿Te lo creíste…<br />o te dio igual?</div>
      ) : null}
      {/* micro-CTA: a dónde responder */}
      {f >= 24 && f < BACK + 4 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center', opacity: ci(f, 24, 30, 0, 1) * ci(f, BACK - 2, BACK + 4, 1, 0), transform: `translateY(${(1 - ci(f, 24, 32, 0, 1)) * 30}px)` }}>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: '#fff', background: COL.ink, padding: '12px 22px', boxShadow: '0 14px 30px rgba(0,0,0,0.3)' }}>💬 RESPONDE EN COMENTARIOS</span>
        </div>
      ) : null}
      {f >= BACK ? (
        <AbsoluteFill style={{ opacity: back }}>
          <Freeze frame={0}>
            <HookView t={0} />
          </Freeze>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const _H = H;
