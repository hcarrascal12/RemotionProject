/**
 * Caso Nº 05 · Momo — escenas (estándar del Caso Nº 04: tablero de papel, fotos 3D, rotuladora, un acento rojo).
 * Fotos reales: BBC Mundo (25-jul-2018: la cara y el chat con número +57), BBC News (28-feb-2019: el móvil).
 * Hechos: BBC Mundo, BBC News, Wikipedia (Momo Challenge hoax), Japan Times (6-mar-2019). Nada de casos concretos ni
 * detalles de autolesiones: solo "retos peligrosos", y que nadie confirmó un solo caso.
 */
import React from 'react';
import { AbsoluteFill, Freeze, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COL, H, HEAD, MONO, SCENES, W, ci, punch, rnd, shake } from './theme';
import { Card, Headline, Phone, Scribble, Stage, Stamp, Tag, enter } from './kit';

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
const ANSWER = 39; // el botón verde sube solo: la llamada "se contesta"
const CUT = 45; // corte seco a la cámara: la cara de Momo llena la pantalla
const Q = 105; // ¿TE ACUERDAS DE ELLA?
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
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.75)', letterSpacing: 3 }}>🔒 VIDEOLLAMADA DE WHATSAPP</div>
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
      <Headline text="NO|*CONTESTES*" at={2} y={1100} size={150} out={CUT} stagger={0} />
      <Headline text="ESTA CARA ASUSTÓ|A *MEDIO MUNDO*" at={CUT + 8} y={1160} size={110} out={Q} maxW={960} />
      <Headline text="¿TE ACUERDAS|DE *ELLA?*" at={Q} y={1160} size={140} />
      <Tag text="RECREACIÓN" at={CUT + 8} y={260} center size={20} />
    </AbsoluteFill>
  );
};
export const Hook: React.FC = () => <HookView t={useCurrentFrame()} />;

/* ================================================================== */
/* 2 · EL CHAT (5–10 s): WhatsApp desde Japón, México… y Colombia      */
/* ================================================================== */
const CODES = [
  { c: '+81', p: 'JAPÓN', at: 30, y: 430 },
  { c: '+52', p: 'MÉXICO', at: 46, y: 560 },
  { c: '+57', p: 'COLOMBIA', at: 62, y: 690, red: true },
];
export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 150], [0, 160]) + 60 * (punch(f, [62], 1) - 1)}>
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
      <Headline text="TE ESCRIBÍA|POR *WHATSAPP*" at={3} y={1290} size={120} out={80} />
      <Headline text="DESDE JAPÓN, MÉXICO…|Y *COLOMBIA*" at={80} y={1290} size={100} />
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
        <Img src={staticFile(FACE)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: EYES, transform: `scale(${1.6 + f * 0.004})`, filter: 'grayscale(0.3) contrast(1.3) brightness(0.6)' }} />
      </AbsoluteFill>
      {bubbles.map((w, i) => {
        const at = 8 + i * 14;
        const e = enter(f, at, 380, 16);
        if (e <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 90, top: 360 + i * 130, width: `${w * 100}%`, maxWidth: 880, padding: '24px 28px', borderRadius: '8px 30px 30px 30px', background: '#262626', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', transform: `scale(${0.7 + 0.3 * e})`, transformOrigin: '0 0', opacity: e }}>
            <div style={{ height: 26, width: '86%', background: '#5A5A5A', borderRadius: 6 }} />
            {i % 2 === 0 ? <div style={{ height: 26, width: '52%', background: '#5A5A5A', borderRadius: 6, marginTop: 12 }} /> : null}
          </div>
        );
      })}
      {f >= 70 ? <div style={{ position: 'absolute', left: 100, top: 880, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#25D366' }}>Momo está escribiendo{'.'.repeat(1 + (Math.floor(f / 6) % 3))}</div> : null}
      {f % 9 < 2 ? <Glitch t={f} n={4} /> : null}
      <Tag text="SEGÚN LOS RUMORES · RECREACIÓN" at={4} y={250} center size={22} />
      <Headline text="TE PONÍA|*RETOS*" at={6} y={1180} size={140} out={58} />
      <Headline text="Y DECÍAN QUE|*SABÍA COSAS*|DE TI" at={58} y={1100} size={120} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · EL PÁNICO (14–21 s): 2019, alertas en todo el mundo             */
/* ================================================================== */
const ALERTS = ['ARGENTINA', 'MÉXICO', 'ESPAÑA', 'ALEMANIA', 'LUXEMBURGO', 'CANADÁ', 'EE. UU.', 'INDIA', 'IRLANDA DEL NORTE'];
export const Panic: React.FC = () => {
  const f = useCurrentFrame();
  const KIDS = 90;
  const KIM = 140;
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 210], [0, 180]) + 50 * (punch(f, [KIDS, KIM], 1) - 1)}>
        {f < KIDS + 6
          ? ALERTS.map((a, i) => {
              const at = 4 + i * 6; // ráfaga: una alerta cada 0,2 s
              const e = enter(f, at, 340, 14);
              if (e <= 0) return null;
              return (
                <div key={a} style={{ position: 'absolute', left: 110 + (i % 2) * 120 + rnd(i) * 80, top: 480 + i * 92, transform: `translateZ(${40 + i * 6}px) rotate(${(rnd(i * 3) - 0.5) * 7}deg) scale(${0.6 + 0.4 * e})`, opacity: Math.min(1, e * 2) * ci(f, KIDS, KIDS + 6, 1, 0), display: 'flex', boxShadow: '0 12px 26px rgba(0,0,0,0.25)' }}>
                  <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#fff', background: COL.red, padding: '10px 14px' }}>⚠ ALERTA</span>
                  <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: COL.ink, background: '#FBFAF6', padding: '10px 16px' }}>{a}</span>
                </div>
              );
            })
          : null}
        <Card src={PHONE} x={W / 2} y={760} w={900} h={620} rz={-2} ry={-6} k={enter(f, KIDS, 200, 14)} pos="45% 50%" tape />
      </Stage>
      <Headline text="*2019*" at={2} y={300} size={150} out={KIDS} stagger={0} />
      <Headline text="EL PÁNICO|SE VOLVIÓ *MUNDIAL*" at={22} y={1330} size={96} out={KIDS} />
      <Headline text="APARECÍA EN COPIAS PIRATA|DE *DIBUJOS ANIMADOS*" at={KIDS} y={1200} size={80} maxW={960} out={KIM} />
      <Headline text="HASTA *KIM KARDASHIAN*|PIDIÓ A YOUTUBE BORRARLA" at={KIM} y={1200} size={80} maxW={960} />
      <Tag text="FOTO: BBC NEWS" at={KIDS + 10} y={1100} center size={20} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL BULO (21–27 s): nadie confirmó un solo caso                  */
/* ================================================================== */
export const Hoax: React.FC = () => {
  const f = useCurrentFrame();
  const HIT = 12;
  const BULO = 82; // "NADIE CONFIRMÓ UN SOLO CASO" se queda 2,3 s
  return (
    <AbsoluteFill>
      {/* golpe: tarjeta roja a pantalla completa */}
      <AbsoluteFill style={{ background: COL.red, opacity: f < BULO ? 1 : ci(f, BULO, BULO + 8, 1, 0) }} />
      {f < HIT ? <AbsoluteFill style={{ background: '#000', opacity: 0.85 }}><Glitch t={f} n={6} /></AbsoluteFill> : null}
      {f >= HIT && f < HIT + 6 ? <AbsoluteFill style={{ background: '#fff', opacity: ci(f, HIT, HIT + 6, 0.9, 0) }} /> : null}
      {f >= BULO ? (
        <Stage dolly={interpolate(f, [BULO, 180], [0, 160]) + 70 * (punch(f, [BULO + 14, 120], 1) - 1)} ry={interpolate(f, [BULO, 180], [-8, 8])}>
          {/* recorte con el titular real de la BBC */}
          <div style={{ position: 'absolute', left: 100, top: 400, width: 880, padding: '40px 46px', background: '#FBFAF6', borderTop: `12px solid ${COL.ink}`, boxShadow: '0 40px 80px rgba(0,0,0,0.3)', transform: `rotateZ(-2deg) scale(${0.6 + 0.4 * enter(f, BULO, 220, 15)})` }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: COL.red }}>BBC NEWS · 28 FEB 2019</div>
            <div style={{ marginTop: 14, fontFamily: HEAD, fontWeight: 900, fontSize: 80, lineHeight: 1.02, color: COL.ink, letterSpacing: '-0.02em' }}>Momo challenge: The anatomy of a hoax</div>
            <div style={{ marginTop: 16, fontFamily: HEAD, fontWeight: 900, fontSize: 34, color: COL.muted }}>«Anatomía de un bulo»</div>
          </div>
        </Stage>
      ) : null}
      {f >= BULO + 14 ? <Stamp text="BULO" at={BULO + 14} x={W / 2 + 160} y={830} size={170} rot={-10} sub="FALSO · HOAX" /> : null}
      <Headline text="NADIE CONFIRMÓ|*UN SOLO CASO*" at={HIT} y={760} size={130} out={BULO} />
      <Headline text="LO INVESTIGARON…" at={HIT} y={480} size={90} out={BULO} />
      <Headline text="ERA UN|*BULO*" at={BULO + 30} y={1230} size={140} out={134} />
      {/* quién lo desmintió: entran uno a uno */}
      <Headline text="LO DECLARARON *FALSO:*" at={134} y={1150} size={80} maxW={960} />
      {['SAMARITANS', 'NSPCC', 'UK SAFER INTERNET CENTRE'].map((n, i) => {
        const at = 140 + i * 14; // con aire para leer cada nombre
        const e = enter(f, at, 320, 14);
        if (e <= 0) return null;
        return (
          <div key={n} style={{ position: 'absolute', left: 0, right: 0, top: 1250 + i * 78, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - e) * (i % 2 ? 400 : -400)}px)`, opacity: Math.min(1, e * 2) }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 2, color: '#fff', background: COL.ink, padding: '10px 18px', boxShadow: '0 12px 26px rgba(0,0,0,0.3)' }}>✓ {n}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · LA ESCULTURA (27–32,5 s)                                        */
/* ================================================================== */
export const Sculpt: React.FC = () => {
  const f = useCurrentFrame();
  const REV = 46;
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 165], [60, 230]) + 70 * (punch(f, [REV], 1) - 1)} ry={interpolate(f, [0, 165], [-8, 6])}>
        <Card src={FACE} x={W / 2} y={820} w={820} h={980} rz={2} ry={-4} k={enter(f, 0, 190, 15)} pos="57% 30%" imgScale={1.05 + f * 0.0015} imgOrigin="57% 30%" filter="contrast(1.08)" caption="LINK FACTORY · TOKIO · 2016" tape />
        {/* otra foto real de la escultura, en la galería */}
        <Card src="momo07/momo-cuerpo.jpg" x={W / 2 + 40} y={800} w={760} h={900} z={220} rz={5} ry={-6} k={enter(f, 100, 240, 13)} pos="50% 60%" imgScale={1 + Math.max(0, f - 100) * 0.0012} imgOrigin="50% 90%" caption="LA ESCULTURA COMPLETA · VANILLA GALLERY" tape />
        {f >= REV ? <Scribble cx={W / 2} cy={760} rx={330} ry={420} at={REV + 4} dur={12} width={10} seed={4} /> : null}
      </Stage>
      <Headline text="¿Y LA|*CARA?*" at={4} y={1330} size={150} out={REV} />
      <Headline text="ERA UNA|*ESCULTURA*" at={REV} y={1330} size={140} out={100} />
      <Headline text="UNA MUJER-PÁJARO|CON *PATAS DE AVE*" at={100} y={1330} size={96} maxW={960} />
      <Tag text="EXPUESTA EN GINZA, TOKIO · 2016" at={REV + 20} y={290} center red />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · A LA BASURA (32,5–35,5 s)                                       */
/* ================================================================== */
export const Trash: React.FC = () => {
  const f = useCurrentFrame();
  const DROP = 30;
  const fall = ci(f, DROP, DROP + 18, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 90], [100, 200])}>
        <Card src={FACE} x={W / 2 + fall * 120} y={760 + fall * 1500} w={700} h={840} rz={-3 + fall * 40} ry={-4} pos="57% 30%" filter={`contrast(1.08) grayscale(${ci(f, 6, DROP, 0, 0.8)}) sepia(${ci(f, 6, DROP, 0, 0.6)}) blur(${ci(f, 14, DROP, 0, 3)}px)`} imgScale={1 + ci(f, 6, DROP, 0, 0.12)} imgOrigin="50% 100%" />
      </Stage>
      {f >= 44 ? <Stamp text="DESTRUIDA" at={44} x={W / 2} y={620} size={120} rot={-8} sub="2018" /> : null}
      <Headline text="SU CREADOR|LA *TIRÓ*" at={3} y={1260} size={140} out={50} />
      <Headline text="SE HABÍA|*PODRIDO*" at={50} y={900} size={130} />
      {f >= 56 ? (
        <div style={{ position: 'absolute', left: 120, right: 120, top: 1330, padding: '18px 24px', background: '#FBFAF6', borderLeft: `10px solid ${COL.red}`, boxShadow: '0 16px 34px rgba(0,0,0,0.25)', fontFamily: HEAD, fontWeight: 900, fontSize: 40, lineHeight: 1.15, color: COL.ink, opacity: ci(f, 56, 62, 0, 1), transform: `translateY(${(1 - ci(f, 56, 64, 0, 1)) * 40}px)` }}>Era de caucho natural y aceites vegetales: se descompuso.</div>
      ) : null}
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
      <Headline text="¿TÚ LA|*RECIBISTE?*" at={2} y={1060} size={140} out={BACK + 4} />
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
