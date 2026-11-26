/**
 * Caso Nº 04 · El Gato con Sombrero — rediseño "tablero de investigación" (papel claro + 3D + un acento rojo).
 * Con voz (public/gato06/voz.wav): cada titular cae sobre su frase. Solo hechos verificados (BBC 23-ago-2026, Know Your Meme
 * 31-ago-2026, ABC News, Economic Times):
 *  · 8-ago: el disfraz original de la película de 2003 sale a subasta (Propstore, 12.000–24.000 $); 10 M de vistas.
 *  · 18-ago: capturas de Snapchat del "Gato" en Irlanda (Wexford, Limerick). 20-ago: la Garda confirma que es IA.
 *  · Un post ("Help, what do I do?") llega a 14,6 M de vistas en tres semanas.
 *  · Sigue: "cita" en un bosque de Escocia, amenazas en colegios y estudiantes arrestados en EE. UU.
 *  · Nadie sabe quién creó la primera imagen.
 */
import React from 'react';
import { AbsoluteFill, Freeze, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COL, FPS, HEAD, MONO, SCENES, W, ci, punch, rnd, shake } from './theme';
import { Card, EvidenceBag, Headline, Phone, RedString, Scribble, Stage, Stamp, Tag, enter } from './kit';

/* ------------------------------------------------------------------ */
/* Sombrero de rayas en 3D real                                        */
/* ------------------------------------------------------------------ */
export const Hat3D: React.FC<{ size?: number; rotY: number; rotX?: number; rotZ?: number }> = ({ size = 1, rotY, rotX = -14, rotZ = 0 }) => {
  const N = 24;
  const R = 105 * size;
  const HH = 330 * size;
  const fw = (2 * Math.PI * R) / N + 2;
  const stripe = HH / 6;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
      {Array.from({ length: N }, (_, i) => {
        const a = (i * 360) / N;
        const shade = 0.5 + 0.5 * Math.max(0, Math.cos(((a + rotY - 30) * Math.PI) / 180));
        return <div key={i} style={{ position: 'absolute', left: -fw / 2, top: -HH, width: fw, height: HH, transform: `rotateY(${a}deg) translateZ(${R}px)`, background: `repeating-linear-gradient(180deg, #D9222B 0px, #D9222B ${stripe}px, #FBF8F2 ${stripe}px, #FBF8F2 ${stripe * 2}px)`, filter: `brightness(${shade.toFixed(3)})`, backfaceVisibility: 'hidden' }} />;
      })}
      <div style={{ position: 'absolute', left: -R, top: -HH - R, width: 2 * R, height: 2 * R, borderRadius: '50%', background: '#B5121D', transform: 'rotateX(90deg)' }} />
      <div style={{ position: 'absolute', left: -R * 1.9, top: -R * 1.9, width: R * 3.8, height: R * 3.8, borderRadius: '50%', background: 'radial-gradient(circle, #FBF8F2 0%, #ECE5D8 62%, #CFC5B6 100%)', transform: 'rotateX(90deg)' }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* La foto principal (la misma en gancho, policía y cierre)            */
/* ------------------------------------------------------------------ */
const MAIN = { x: W / 2, y: 860, w: 860, h: 1060 };
const FACE = { x: W / 2, y: 600 }; // la cara del gato dentro de la tarjeta principal

/* ================================================================== */
/* 1 · GANCHO (0–3,5 s). HookView(t=0) es también el último frame.     */
/* ================================================================== */
const SNAP = 20; // la foto sola (0–0,7 s) cae en el tablero
const LABEL = 60; // cartel CASO Nº 04 · SIN RESOLVER
const Q1 = 6; // «CIERREN SUS PUERTAS» (lo dice la voz)
const P1 = 49; // ESO PEDÍAN EN IRLANDA
const P2 = 88; // EL GATO CON SOMBRERO
const CUT = 121; // ráfaga de pruebas · "empezó a salir"
const P3 = 140; // DE NOCHE, FRENTE A LAS CASAS
const B = 195; // LA POLICÍA EMITIÓ UN COMUNICADO
/** El sello FALSO: visible desde el frame 0 y re-estampado al terminar el zoom de choque. */
const HookStamp: React.FC<{ t: number }> = ({ t }) => {
  const hit = t >= SNAP ? 1 + 0.35 * Math.exp(-(t - SNAP) / 2.2) : 1;
  return (
    <div style={{ position: 'absolute', left: W / 2 + 170, top: 1060, transform: `translate(-50%, -50%) rotate(-12deg) scale(${hit})`, padding: '6px 30px 10px', border: `10px solid ${COL.red}`, borderRadius: 16, textAlign: 'center', color: COL.red, background: 'rgba(255,255,255,0.86)', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em' }}>FALSO</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 25, letterSpacing: 4 }}>GENERADO CON IA</div>
    </div>
  );
};
/** Etiqueta de expediente (neutra: no revela que es falso). */
const EvidenceTag: React.FC<{ t: number }> = ({ t }) => {
  const hit = t >= SNAP ? 1 + 0.25 * Math.exp(-(t - SNAP) / 2.2) : 1;
  return (
    <div style={{ position: 'absolute', left: 150, top: 330, transform: `rotate(-4deg) scale(${hit})`, transformOrigin: '0 50%', display: 'flex', boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: '#fff', background: COL.red, padding: '8px 14px' }}>«AVISTAMIENTO»</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: COL.ink, background: '#fff', padding: '8px 14px' }}>IRLANDA · AGO 2026</span>
    </div>
  );
};
/** Luces de patrulla barriendo los bordes. */
const PoliceLights: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  if (t < from) return null;
  const on = ci(t, from, from + 4, 0, 1);
  const red = Math.max(0, Math.sin((t - from) * 0.7));
  return <AbsoluteFill style={{ pointerEvents: 'none', opacity: on, background: `linear-gradient(90deg, rgba(227,38,47,${0.42 * red}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(47,107,255,${0.42 * (1 - red)}) 100%)` }} />;
};
const Memo: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = enter(t, at, 260, 15);
  const bars = [0.92, 0.78, 0.86, 0.6, 0.9, 0.55];
  const hl = ci(t, at + 14, at + 26, 0, 1);
  return (
    <div style={{ position: 'absolute', left: W / 2 - 350, top: 470, width: 700, height: 640, transform: `translateZ(${200 + (1 - k) * 600}px) rotateZ(${-3 + (1 - k) * 10}deg)`, opacity: Math.min(1, k * 2), background: '#FBFAF6', boxShadow: '0 40px 80px rgba(0,0,0,0.35)', padding: '44px 54px', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: COL.muted }}>AN GARDA SÍOCHÁNA · WEXFORD</div>
      <div style={{ marginTop: 14, fontFamily: HEAD, fontWeight: 900, fontSize: 92, letterSpacing: '-0.03em', color: COL.ink, lineHeight: 1 }}>COMUNICADO</div>
      <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: COL.red }}>20 AGO 2026</div>
      <div style={{ marginTop: 34, height: 4, background: COL.ink }} />
      {bars.map((w, i) => (
        <div key={i} style={{ position: 'relative', marginTop: 26, height: 30, width: `${w * 100}%` }}>
          {i === 3 ? <div style={{ position: 'absolute', left: -10, top: -6, bottom: -6, width: `${hl * 110}%`, background: 'rgba(255,214,0,0.85)' }} /> : null}
          <div style={{ position: 'absolute', inset: 0, background: '#121212' }} />
        </div>
      ))}
    </div>
  );
};
export const HookView: React.FC<{ t: number }> = ({ t }) => {
  // zoom de choque: arranca DENTRO de la cara (los ojos llenan la pantalla) y sale disparado hasta la foto entera
  // 0–SNAP: la foto sola, a pantalla completa y nítida, acercándose despacio; luego cae al tablero de golpe
  const snap = ci(t, SNAP, SNAP + 9, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const dolly = interpolate(snap, [0, 1], [400 + Math.min(t, SNAP) * 2, 150]) + interpolate(t, [SNAP, 262], [0, 140], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) + 70 * (punch(t, [CUT, B], 1) - 1);
  const face = interpolate(snap, [0, 1], [1.12, 1.1]);
  const s = shake(t, SNAP + 9, 18, 8);
  const s2 = shake(t, B, 12, 6);
  const scatter = ci(t, B, B + 10, 0, 1);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x + s2.x}px, ${s.y + s2.y}px)` }}>
      <Stage dolly={dolly}>
        <Card src="gato06/hook.jpg" x={MAIN.x} y={MAIN.y + 60 * (1 - snap)} w={MAIN.w} h={MAIN.h} border={14 * snap} rz={(-2.5 + Math.sin(t / 20) * 0.8) * snap} ry={4 * snap} imgScale={face + t * 0.0008} imgOrigin="50% 30%" pos="50% 40%" filter={t >= SNAP + 9 && t < SNAP + 11 ? 'invert(1) contrast(1.2)' : undefined} />
        {t < CUT || t >= B + 10 ? <Scribble cx={FACE.x} cy={FACE.y - 20} rx={175} ry={160} at={SNAP + 12} dur={9} /> : null}
        {/* ráfaga de pruebas: una cada 6 frames */}
        <Card src="gato06/snap-aviso.jpg" x={250 - scatter * 400} y={720} w={380} h={470} z={120} rz={-11} k={enter(t, CUT, 280, 13)} pos="50% 0%"><EvidenceBag n={1} /></Card>
        <Card src="gato06/snap-alerta.jpg" x={850 + scatter * 400} y={690} w={360} h={440} z={140} rz={10} k={enter(t, CUT + 6, 280, 13)} pos="50% 20%"><EvidenceBag n={2} /></Card>
        <Card src="gato06/coche-hd.jpg" x={840 + scatter * 400} y={1110} w={330} h={410} z={160} rz={7} k={enter(t, CUT + 12, 280, 13)} pos="50% 30%"><EvidenceBag n={3} /></Card>
        {/* el comunicado (20-ago): solo membrete y fecha reales; el contenido va tachado, no se inventa ni se revela */}
        {t >= B ? <Memo t={t} at={B} /> : null}
      </Stage>
      <PoliceLights t={t} from={B} />
      {/* el cartel del género: dice "caso real" desde el frame 0 para que el titular vaya directo al morbo */}
      <Headline text="CASO Nº 04 · *SIN RESOLVER*" at={LABEL} y={300} size={58} maxW={900} out={B} />
      <Headline text="«CIERREN SUS|*PUERTAS*»" at={Q1} y={1330} size={130} out={P1} />
      <Headline text="ESO PEDÍAN|EN *IRLANDA*" at={P1} y={1330} size={120} out={P2} />
      <Headline text="CUANDO EL GATO|CON *SOMBRERO*…" at={P2} y={1310} size={110} out={P3} maxW={920} />
      <Headline text="…SALÍA DE NOCHE|FRENTE A LAS *CASAS*" at={P3} y={1310} size={96} out={B} maxW={920} />
      <Headline text="LA POLICÍA|EMITIÓ UN|*COMUNICADO*" at={B} y={1130} size={112} />
    </AbsoluteFill>
  );
};
export const Hook: React.FC = () => <HookView t={useCurrentFrame()} />;

/* ================================================================== */
/* 2 · LA SUBASTA (3,5–8,5 s)                                          */
/* ================================================================== */
const money = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' USD';
export const Auction: React.FC = () => {
  const f = useCurrentFrame();
  const LOT = 37;
  const drop = enter(f, 0, 120, 12);
  const hatOut = ci(f, LOT - 6, LOT + 2, 1, 0);
  const price = interpolate(f, [LOT + 20, LOT + 56], [12000, 24000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 148], [0, 170]) + 60 * (punch(f, [LOT, 102], 1) - 1)}>
        {f < LOT + 4 ? (
          <div style={{ position: 'absolute', left: W / 2, top: 780 - (1 - drop) * 900, transformStyle: 'preserve-3d', opacity: hatOut }}>
            <div style={{ position: 'absolute', left: -230, top: 40, width: 460, height: 70, borderRadius: '50%', background: 'rgba(30,20,10,0.35)', filter: 'blur(18px)' }} />
            <Hat3D size={1.35} rotY={f * 10} rotX={-14} rotZ={Math.sin(f / 5) * 8 * (1 - drop)} />
          </div>
        ) : null}
        <Card src="gato06/disfraz-subasta.jpg" x={W / 2} y={700} w={780} h={620} rz={-2 + Math.sin(f / 25) * 1.2} ry={-6 + Math.sin(f / 30) * 5} k={enter(f, LOT, 170, 14)} pos="50% 22%" tape>
          <div style={{ position: 'absolute', left: 16, top: 16, padding: '6px 14px', background: COL.ink, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: 2 }}>LOTE · PROPSTORE</div>
        </Card>
        {/* etiqueta de precio colgando */}
        {f >= LOT + 16 ? (
          <div style={{ position: 'absolute', left: 410, top: 960, transform: `translateZ(90px) rotate(${-8 + Math.sin(f / 7) * 4}deg) scale(${enter(f, LOT + 16, 220, 11)})`, transformOrigin: '0 0', padding: '18px 28px 14px', background: '#fff', borderRadius: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: `3px solid ${COL.ink}` }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: COL.muted, letterSpacing: 3 }}>PRECIO ESTIMADO</div>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 78, color: COL.red, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>{money(price)}</div>
          </div>
        ) : null}
      </Stage>
      <Headline text="8 DE AGOSTO:|UN *DISFRAZ* REAL" at={4} y={1270} size={110} out={LOT} />
      <Headline text="EL DE LA PELÍCULA|*SALIÓ A SUBASTA*" at={LOT} y={1250} size={96} out={102} />
      <Headline text="EL ANUNCIO:|*10 M DE VISTAS*" at={102} y={1250} size={110} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 · IRLANDA (8,5–13 s): tablero con mapa, pines e hilo rojo         */
/* ================================================================== */
const MAPC = { x: 600, y: 820, w: 600, h: 750, b: 14 };
const pin = (px: number, py: number): [number, number] => [MAPC.x - MAPC.w / 2 + MAPC.b + px * (MAPC.w - 2 * MAPC.b), MAPC.y - MAPC.h / 2 + MAPC.b + py * (MAPC.h - 2 * MAPC.b)];
const LIMERICK = pin(390 / 960, 745 / 1197);
const WEXFORD = pin(760 / 960, 940 / 1197);
export const Ireland: React.FC = () => {
  const f = useCurrentFrame();
  const pinIn = ci(f, 0, 7, 0, 1, (x) => x * x); // cae acelerando y se clava de golpe
  const sh = shake(f, 7, 14, 8);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <Stage dolly={interpolate(f, [0, 84], [20, 280]) + 50 * (punch(f, [24, 42], 1) - 1)} rx={6} ry={interpolate(f, [0, 84], [-9, 9])}>
        <Card src="gato06/mapa-irlanda.png" x={MAPC.x} y={MAPC.y} w={MAPC.w} h={MAPC.h} border={MAPC.b} z={(1 - pinIn) * 900} rz={3 + (1 - pinIn) * -16} k={1} filter="grayscale(0.85) sepia(0.25) contrast(1.05) brightness(1.02)" tape />
        <Card src="gato06/snap-alerta.jpg" x={225} y={600} w={320} h={400} z={90} rz={-9} k={enter(f, 16, 240, 13)} pos="50% 20%" caption="SNAPCHAT" />
        <Card src="gato06/hook.jpg" x={870} y={560} w={290} h={370} z={110} rz={8} k={enter(f, 34, 240, 13)} pos="50% 35%" caption="¿WEXFORD?" />
        <RedString a={LIMERICK} b={[290, 720]} at={26} dur={8} />
        <RedString a={WEXFORD} b={[840, 690]} at={44} dur={8} />
        {[{ p: LIMERICK, n: 'LIMERICK', at: 24 }, { p: WEXFORD, n: 'WEXFORD', at: 42 }].map(({ p, n, at }) =>
          f >= at ? (
            <div key={n} style={{ position: 'absolute', left: p[0] - 120, top: p[1] + 18, width: 240, textAlign: 'center', transform: `translateZ(40px) scale(${enter(f, at, 260, 12)})` }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#fff', background: COL.red, padding: '4px 10px' }}>{n}</span>
            </div>
          ) : null,
        )}
      </Stage>
      <Headline text="18 AGO: LOS PRIMEROS|*AVISTAMIENTOS*" at={4} y={1320} size={100} maxW={880} />
      <Tag text="ORIGEN: SNAPCHAT → TIKTOK → FACEBOOK" at={50} y={1540} center size={24} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · VIRAL (13–17,5 s): el feed dentro de un teléfono 3D             */
/* ================================================================== */
const POSTS = [
  { user: '@bainne_maru', text: '«The cat in the hat»', views: '552 K' },
  { user: '@isecrets4', text: '«No voy a aguantar ver esto a las 11 pm»', views: '' },
  { user: '@liannemarie84', text: '«Nuestra cámara captó esto anoche»', views: '800 K' },
  { user: '@christopherkiely', text: '«Hay un asesino del Gato con Sombrero»', views: '3,8 M', red: true },
  { user: '@catinthehat0839', text: '«Voy por ti»', views: '' },
];
const fmtM = (n: number) => (n / 1e6).toFixed(1).replace('.', ',') + ' M';
export const Viral: React.FC = () => {
  const f = useCurrentFrame();
  const COUNT = 24;
  const views = interpolate(f, [COUNT, COUNT + 34], [0, 14.6e6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const big = f >= COUNT + 34 ? 1 + 0.12 * Math.exp(-(f - COUNT - 34) / 4) : 1;
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 117], [0, 150])}>
        <Phone x={W / 2} y={900} k={enter(f, 0, 150, 15)} ry={-14 + Math.sin(f / 30) * 6}>
          <AbsoluteFill style={{ zIndex: 5, background: 'rgba(0,0,0,0.6)', opacity: ci(f, COUNT - 4, COUNT + 4, 0, 1) }} />
          <Img src={staticFile('gato06/dark-hd.jpg')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(0.55)', transform: `scale(1.2) translateY(${-f * 0.8}px)` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 70 - f * 2.4, padding: 18 }}>
            {[...POSTS, ...POSTS].map((p, i) => (
              <div key={i} style={{ marginBottom: 16, padding: '18px 20px', borderRadius: 18, background: '#fff', opacity: f >= 4 + i * 8 ? 1 : 0, transform: `translateX(${(1 - enter(f, 4 + i * 8, 260, 15)) * 300}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 17, color: '#555' }}>
                  <span>TIKTOK · {p.user}</span>
                  
                </div>
                <div style={{ marginTop: 8, fontFamily: HEAD, fontWeight: 900, fontSize: 34, lineHeight: 1.1, color: COL.ink }}>{p.text}</div>
              </div>
            ))}
          </div>
        </Phone>
      </Stage>
      {f >= COUNT - 2 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${big})`, opacity: ci(f, COUNT - 2, COUNT + 2, 0, 1) }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 200, letterSpacing: '-0.05em', color: '#fff', background: COL.red, padding: '0 34px', lineHeight: 1.05, boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>{fmtM(views)}</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontWeight: 800, fontSize: 32, color: '#fff', background: COL.ink, padding: '6px 16px', letterSpacing: 3 }}>UN SOLO VIDEO · 3 SEMANAS</div>
        </div>
      ) : null}
      <Headline text="SE HIZO|*VIRAL*" at={4} y={300} size={140} out={COUNT} />
      <Headline text="Y MUCHOS|*SE LO CREYERON*" at={68} y={1250} size={110} maxW={900} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · LA POLICÍA (17,5–23 s): la misma foto, desenmascarada           */
/* ================================================================== */
export const Police: React.FC = () => {
  const f = useCurrentFrame();
  const SCAN = 12; // "la policía lo confirmó": el barrido destapa la versión de la Garda
  const BLACK = 42; // negro y silencio total (0,35 s)
  const HIT = 53; // "Era inteligencia artificial": corte seco a pantalla completa
  const DOC = 88; // la nota de la BBC + sello FALSO
  const scan = ci(f, SCAN, SCAN + 26, 0, 1, (x) => x);
  const full = f >= HIT ? ci(f, DOC - 4, DOC + 2, 1, 0) : 0;
  const zoom = 1.0 + 0.05 * ci(f, HIT, DOC, 0, 1) + 0.12 * Math.exp(-Math.max(0, f - HIT) / 3);
  const sh = shake(f, HIT, 22, 10);
  return (
    <AbsoluteFill>
      <Stage dolly={interpolate(f, [0, 120], [180, 320]) + 80 * (punch(f, [DOC + 18], 1) - 1)}>
        {f < BLACK ? (
          <Card src="gato06/hook.jpg" x={MAIN.x} y={MAIN.y} w={MAIN.w} h={MAIN.h} rz={-2.5} ry={4} imgScale={1.08 + f * 0.002} imgOrigin="50% 30%" pos="50% 40%">
            {/* barrido: debajo de la línea, la versión que publicó la Garda con el sello "AI GENERATED" */}
            <AbsoluteFill style={{ clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)` }}>
              <Img src={staticFile('gato06/garda-ia.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 55%' }} />
            </AbsoluteFill>
            {scan > 0 && scan < 1 ? (
              <>
                {/* banda de glitch: la imagen "se rompe" justo donde pasa el escáner */}
                <AbsoluteFill style={{ clipPath: `inset(${Math.max(0, scan * 100 - 7)}% 0 ${Math.max(0, 100 - scan * 100 - 3)}% 0)`, mixBlendMode: 'screen', opacity: 0.85 }}>
                  <Img src={staticFile('gato06/garda-ia.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 55%', transform: `translateX(${(rnd(f) - 0.5) * 60}px)`, filter: 'hue-rotate(170deg) saturate(3) contrast(1.4)' }} />
                </AbsoluteFill>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ position: 'absolute', left: `${rnd(f * 7 + i) * 80}%`, top: `calc(${scan * 100}% - ${20 + rnd(f * 3 + i) * 60}px)`, width: 30 + rnd(f + i * 5) * 120, height: 10 + rnd(f * 2 + i) * 22, background: i % 2 ? 'rgba(227,38,47,0.8)' : 'rgba(80,220,255,0.7)', mixBlendMode: 'screen' }} />
                ))}
                <div style={{ position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 10, marginTop: -5, background: COL.red, boxShadow: `0 0 30px ${COL.red}` }} />
              </>
            ) : null}
          </Card>
        ) : null}
        <Card src="gato06/bbc-og.png" x={W / 2} y={760} w={920} h={540} rz={2} ry={-6} k={enter(f, DOC - 4, 170, 14)} imgScale={1.3} imgOrigin="50% 0%" pos="50% 0%" tape />
      </Stage>
      {/* el clímax: la imagen de la Garda a pantalla completa, sin tablero */}
      {full > 0 ? (
        <AbsoluteFill style={{ opacity: full, background: '#000', transform: `translate(${sh.x}px, ${sh.y}px)` }}>
          {/* fondo: la misma imagen desenfocada; encima, la imagen entera para que el sello "AI GENERATED" se lea completo */}
          <Img src={staticFile('gato06/garda-ia.png')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.2)' }} />
          <Img src={staticFile('gato06/garda-ia.png')} style={{ position: 'absolute', left: 30, top: 270, width: 1020, height: 1020, objectFit: 'cover', transform: `scale(${zoom})`, filter: 'contrast(1.12)', boxShadow: '0 40px 90px rgba(0,0,0,0.6)' }} />
        </AbsoluteFill>
      ) : null}
      {f >= BLACK - 2 && f < HIT ? <AbsoluteFill style={{ background: '#000', opacity: ci(f, BLACK - 2, BLACK, 0, 1) }} /> : null}
      {f >= HIT && f < HIT + 8 ? <AbsoluteFill style={{ background: '#fff', opacity: ci(f, HIT, HIT + 8, 0.95, 0) }} /> : null}
      {f >= DOC + 18 ? <Stamp text="FALSO" at={DOC + 18} x={W / 2} y={760} size={140} rot={-9} sub="CONFIRMADO POR LA POLICÍA" /> : null}
      <Headline text="*ERA IA*" at={HIT} y={1330} size={190} out={DOC} stagger={0} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · NO SE DETUVO (23–28 s): recortes de prensa apilándose en 3D     */
/* ================================================================== */
const CLIPS = [
  { kicker: 'ESCOCIA', title: 'Una «cita» con el Gato en un bosque', at: 16, x: 500, y: 760, rz: -4 },
  { kicker: 'EE. UU.', title: 'Amenazas en colegios', at: 43, x: 580, y: 1030, rz: 3 },
  { kicker: 'KENTUCKY · COLORADO', title: 'Estudiantes arrestados', at: 85, x: 520, y: 1300, rz: -2 },
];
export const Spread: React.FC = () => {
  const f = useCurrentFrame();
  const sh = CLIPS.map((c) => shake(f, c.at + 5, 10, 6)).reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }));
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <Stage dolly={interpolate(f, [0, 143], [0, 170]) + 50 * (punch(f, CLIPS.map((c) => c.at), 1) - 1)} rx={8}>
        <Card src="gato06/dark-hd.jpg" x={W / 2} y={920} w={900} h={1200} z={-200} rz={2} filter="grayscale(1) contrast(1.1) brightness(1.1)" dim={0.15} />
        {CLIPS.map((c, i) => {
          const k = ci(f, c.at, c.at + 5, 0, 1, (x) => x * x); // caída seca, sin rebote
          if (k <= 0) return null;
          return (
            <div key={c.title} style={{ position: 'absolute', left: c.x - 420, top: c.y - 120, width: 840, padding: '26px 34px', background: '#FBFAF6', transform: `translateZ(${60 + i * 40}px) rotateZ(${c.rz}deg) scale(${1 + 0.9 * (1 - k)}) rotateZ(${(1 - k) * 6}deg)`, opacity: Math.min(1, k * 2.5), boxShadow: '0 30px 60px rgba(0,0,0,0.3)', borderTop: `10px solid ${COL.red}` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: COL.red, letterSpacing: 4 }}>⚠ {c.kicker}</div>
              <div style={{ marginTop: 6, fontFamily: HEAD, fontWeight: 900, fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.03em', color: COL.ink }}>{c.title}</div>
            </div>
          );
        })}
      </Stage>
      <Headline text="NI ASÍ|*PARÓ*" at={4} y={290} size={120} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · EL MIEDO (28–32 s)                                              */
/* ================================================================== */
export const Fear: React.FC = () => {
  const f = useCurrentFrame();
  const REAL = 55;
  const beat = f >= REAL ? 40 * Math.exp(-((f - REAL) % 22) / 4) : 0; // latido
  const s = shake(f, 2, 12, 10);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
      <Stage dolly={interpolate(f, [0, 103], [0, 160]) + beat}>
        <Card src="gato06/sheffield-hd.jpg" x={W / 2} y={830} w={820} h={860} rz={2} ry={-5} k={enter(f, REAL, 200, 14)} pos="50% 40%" imgScale={1 + Math.max(0, f - REAL) * 0.003} tape />
        {f >= REAL ? <Scribble cx={W / 2} cy={720} rx={230} ry={260} at={REAL + 12} dur={10} width={10} seed={3} /> : null}
      </Stage>
      {f < REAL ? <AbsoluteFill style={{ background: COL.red }} /> : null}
      <Headline text="TODO ERA|FALSO…" at={2} y={760} size={170} out={REAL} />
      <Headline text="EL MIEDO,|*NO.*" at={REAL} y={1340} size={140} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8 · CIERRE (32–38 s): la pregunta y vuelta exacta al frame 0        */
/* ================================================================== */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const END = SCENES.loop.len;
  const Q = 6;
  const NO = 54;
  const CTA = 90;
  const BACK = END - 14; // a partir de aquí se funde el frame 0 del gancho: el último frame es idéntico
  const back = ci(f, BACK, END - 6, 0, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - back }}>
      <Stage dolly={interpolate(f, [0, BACK], [260, 120], { extrapolateRight: 'clamp' }) + 70 * (punch(f, [Q, NO, CTA], 1) - 1)}>
        <Card src="gato06/hook.jpg" x={MAIN.x} y={MAIN.y} w={MAIN.w} h={MAIN.h} rz={-2.5} ry={4} imgScale={1.08 + 0.9 * ci(f, 0, BACK, 0, 1, (x) => x * x * (3 - 2 * x))} imgOrigin="50% 27%" pos="50% 40%" filter="contrast(1.15) saturate(0.8) brightness(0.92)">
          {/* viñeta y grano: no es la misma foto del arranque, es la misma mirada, más cerca */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)', opacity: ci(f, 0, 40, 0.3, 1) }} />
          <AbsoluteFill style={{ opacity: 0.22, mixBlendMode: 'overlay' }}>
            <svg width="100%" height="100%"><filter id={`gr${f % 4}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 4} /></filter><rect width="100%" height="100%" filter={`url(#gr${f % 4})`} /></svg>
          </AbsoluteFill>
        </Card>
      </Stage>
      </AbsoluteFill>
      {f >= NO && f < CTA ? <Stamp text="?" at={NO} x={W / 2 + 230} y={430} size={180} rot={12} /> : null}
      <Headline text="¿QUIÉN CREÓ LA|PRIMERA *FOTO?*" at={Q} y={1140} size={110} out={NO} />
      <Headline text="NADIE LO|*SABE*" at={NO} y={1120} size={150} out={CTA} />
      <Headline text="¿TÚ HABRÍAS|*CAÍDO?*" at={CTA} y={1100} size={130} out={BACK + 4} />
      {f >= CTA + 6 && f < BACK + 4 ? (
        <div style={{ position: 'absolute', left: W / 2 - 60, top: 1400 + 18 * Math.abs(Math.sin((f - CTA) / 4)), width: 120, height: 120, borderRadius: 60, background: COL.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 80, boxShadow: '0 16px 34px rgba(0,0,0,0.35)', opacity: ci(f, BACK - 2, BACK + 4, 1, 0), transform: `scale(${enter(f, CTA + 6, 300, 12)})` }}>↓</div>
      ) : null}
      {f >= BACK ? (
        <AbsoluteFill style={{ opacity: back }}>
          {/* congelado en el frame 0: titulares, marcador y sellos leen el reloj del gancho, no el del cierre */}
          <Freeze frame={0}>
            <HookView t={0} />
          </Freeze>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const _fps = FPS;
