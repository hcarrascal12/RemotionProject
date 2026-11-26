/**
 * Caso Nº 04 · El Gato con Sombrero: las 8 escenas. Sin voz todavía: los titulares cuentan la historia.
 * Solo hechos verificados (BBC 23-ago-2026, Know Your Meme 31-ago-2026, ABC News, Economic Times):
 *  · 8-ago: el disfraz original de la película de 2003 sale a subasta (Propstore, 12.000–24.000 $); el post, 10 M de vistas.
 *  · 18-ago: "avistamientos" en Irlanda (Limerick, Wexford), empezando en Snapchat.
 *  · Un post ("Help, what do I do?") llega a 14,6 M de vistas en tres semanas.
 *  · La Garda de Wexford confirma que las imágenes son IA; la policía de South Yorkshire lo desmiente.
 *  · Sigue: una "cita" en un bosque de Galashiels (Escocia), amenazas en colegios y estudiantes arrestados en EE. UU.
 *  · Nadie sabe quién creó la primera imagen.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { COL, FPS, H, HEAD, MONO, SCENES, W, ci, punch, shake } from './theme';
import { Credit, Flash, Impact, Mono, Plate, Punch, RGBGlitch } from './ui';

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */
/** La foto viral, encuadrada en el gato. Es la misma en el gancho, la revelación y el cierre (loop). */
export const SightingShot: React.FC<{ zoom: number; file?: string }> = ({ zoom, file = 'gato06/hook.jpg' }) => (
  <Plate file={file} pos="50% 50%" origin="50% 30%" scale={zoom} bright={0.95} sat={0.95} tint="rgba(255,46,59,0.18)" />
);

/** Visor de cámara: esquinas, REC y lugar. Da la sensación de "grabación" desde el frame 0. */
const Viewfinder: React.FC<{ label?: string; opacity?: number }> = ({ label = 'IRLANDA · AGO 2026', opacity = 1 }) => {
  const f = useCurrentFrame();
  const c = (s: React.CSSProperties) => <div style={{ position: 'absolute', width: 70, height: 70, borderColor: 'rgba(255,255,255,0.85)', borderStyle: 'solid', borderWidth: 0, ...s }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {c({ left: 110, top: 380, borderLeftWidth: 5, borderTopWidth: 5 })}
      {c({ right: 90, top: 380, borderRightWidth: 5, borderTopWidth: 5 })}
      {c({ left: 110, bottom: 380, borderLeftWidth: 5, borderBottomWidth: 5 })}
      {c({ right: 90, bottom: 380, borderRightWidth: 5, borderBottomWidth: 5 })}
      <div style={{ position: 'absolute', left: 140, top: 404, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 8px #000' }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: COL.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.25, boxShadow: `0 0 16px ${COL.red}` }} />
        REC
      </div>
      <div style={{ position: 'absolute', right: 120, top: 408, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: COL.ice, letterSpacing: 2, textShadow: '0 2px 8px #000' }}>{label}</div>
    </AbsoluteFill>
  );
};

/** Sombrero de rayas en 3D real: cilindro de caras con sombreado según el ángulo, ala y copa. */
export const Hat3D: React.FC<{ size?: number; rotY: number; rotX?: number; rotZ?: number }> = ({ size = 1, rotY, rotX = -14, rotZ = 0 }) => {
  const N = 22;
  const R = 105 * size;
  const HH = 330 * size;
  const fw = (2 * Math.PI * R) / N + 2;
  const stripe = HH / 6;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
      {Array.from({ length: N }, (_, i) => {
        const a = (i * 360) / N;
        const shade = 0.45 + 0.55 * Math.max(0, Math.cos(((a + rotY) * Math.PI) / 180));
        return (
          <div key={i} style={{ position: 'absolute', left: -fw / 2, top: -HH, width: fw, height: HH, transform: `rotateY(${a}deg) translateZ(${R}px)`, background: `repeating-linear-gradient(180deg, #E31D2B 0px, #E31D2B ${stripe}px, #F6F3EE ${stripe}px, #F6F3EE ${stripe * 2}px)`, filter: `brightness(${shade.toFixed(3)})`, backfaceVisibility: 'hidden' }} />
        );
      })}
      <div style={{ position: 'absolute', left: -R, top: -HH - R, width: 2 * R, height: 2 * R, borderRadius: '50%', background: '#B5121D', transform: 'rotateX(90deg)' }} />
      <div style={{ position: 'absolute', left: -R * 1.9, top: -R * 1.9, width: R * 3.8, height: R * 3.8, borderRadius: '50%', background: 'radial-gradient(circle, #F6F3EE 0%, #E9E2D6 60%, #CFC5B6 100%)', transform: 'rotateX(90deg)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }} />
    </div>
  );
};

/** Sello de goma. */
const Stamp: React.FC<{ text: string; at: number; x: number; y: number; rot?: number; size?: number; color?: string }> = ({ text, at, x, y, rot = -12, size = 92, color = COL.red }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = spring({ frame: f - at, fps: FPS, config: { damping: 9, stiffness: 260 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${2.4 - 1.4 * k})`, opacity: Math.min(1, k * 1.6), padding: '8px 28px', border: `8px solid ${color}`, borderRadius: 14, fontFamily: HEAD, fontWeight: 900, fontSize: size, letterSpacing: '0.02em', color, background: 'rgba(6,6,8,0.55)', whiteSpace: 'nowrap', boxShadow: `0 0 40px ${color}55` }}>
      {text}
    </div>
  );
};

const KYM = 'IMAGEN VIRAL HECHA CON IA · VÍA KNOW YOUR MEME';

/* ================================================================== */
/* 1 · GANCHO (0–3,5 s): la foto ya en pantalla en el frame 0          */
/* ================================================================== */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const A = 22; // "MILLONES LO VIERON"
  const B = 62; // "LA POLICÍA TUVO QUE HABLAR"
  // empuja hacia el gato sin parar; golpes en cada titular
  const zoom = interpolate(f, [0, 105], [1.25, 1.62]) * punch(f, [A, B], 0.07);
  const glitch = (f >= A - 2 && f < A + 3) || (f >= 42 && f < 45) || (f >= B - 2 && f < B + 3) || f >= 101;
  const s = shake(f, B, 12, 8);
  // entre A y B, un segundo "avistamiento" (el del coche) entra a golpe de corte: no era solo una foto
  const second = f >= 42 && f < B;
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
      <RGBGlitch active={glitch} amp={18}>
        {second ? <Plate file="gato06/snap-alerta.jpg" pos="50% 25%" origin="50% 30%" scale={1.05 + (f - 42) * 0.003} bright={1} sat={0.9} tint="rgba(255,46,59,0.12)" /> : <SightingShot zoom={zoom} />}
      </RGBGlitch>
      <Viewfinder />
      <Impact at={[A, B]} y={1180} color={COL.red} />
      {/* frame 0 ya con la pregunta: nada de entradas lentas */}
      <Punch text="¿QUÉ HACE ESTO|*EN LA CALLE*?" at={-12} y={1040} size={130} out={A} />
      <Punch text="MILLONES|LO *VIERON*" at={A} y={1040} size={150} out={B} />
      <Punch text="LA POLICÍA TUVO|QUE *HABLAR*" at={B} y={1040} size={130} accent={COL.red} />
      <Credit text={KYM} />
      <Flash at={[A, 42, B]} color="#FFFFFF" amp={0.3} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2 · LA SUBASTA (3,5–8,5 s): el disfraz real y el sombrero en 3D     */
/* ================================================================== */
const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const Auction: React.FC = () => {
  const f = useCurrentFrame();
  const CARD = 40;
  const drop = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 120 } });
  const hatOut = ci(f, CARD - 6, CARD + 4, 1, 0);
  const card = spring({ frame: f - CARD, fps: FPS, config: { damping: 14, stiffness: 140 } });
  const price = interpolate(f, [CARD + 20, CARD + 60], [12000, 24000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [4, CARD, 108], 0.05)})` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(255,46,59,0.22) 0%, rgba(6,6,8,0) 60%)' }} />
      {/* el sombrero cae girando… */}
      {f < CARD + 6 ? (
        <AbsoluteFill style={{ perspective: 1300, opacity: hatOut }}>
          <div style={{ position: 'absolute', left: W / 2, top: 560 + (1 - drop) * -700 + 300, transformStyle: 'preserve-3d' }}>
            <Hat3D size={1.25} rotY={f * 9} rotX={-16} rotZ={Math.sin(f / 6) * 6 * (1 - drop)} />
          </div>
        </AbsoluteFill>
      ) : null}
      {/* …y se convierte en el disfraz real, en una ficha de subasta en 3D */}
      {f >= CARD ? (
        <AbsoluteFill style={{ perspective: 1400 }}>
          <div style={{ position: 'absolute', left: 150, right: 150, top: 330, height: 640, borderRadius: 26, overflow: 'hidden', background: '#fff', border: `4px solid ${COL.ice}`, boxShadow: `0 50px 120px rgba(0,0,0,0.8), 0 0 60px ${COL.ice}44`, transform: `rotateY(${(1 - card) * -70 + Math.sin(f / 22) * 7}deg) rotateX(${4 + Math.cos(f / 27) * 3}deg) scale(${0.7 + 0.3 * card})`, opacity: Math.min(1, card * 1.5) }}>
            <Img src={staticFile('gato06/disfraz-subasta.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', transform: `scale(${1.05 + (f - CARD) * 0.0015})` }} />
            <div style={{ position: 'absolute', left: 18, top: 16, padding: '6px 14px', borderRadius: 8, background: COL.red, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: 2 }}>LOTE · SUBASTA</div>
            <div style={{ position: 'absolute', right: 18, top: 16, padding: '6px 14px', borderRadius: 8, background: '#111', fontFamily: MONO, fontWeight: 800, fontSize: 22, color: COL.ice, letterSpacing: 2 }}>8 AGO 2026</div>
          </div>
          {/* precio contando */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: ci(f, CARD + 16, CARD + 22, 0, 1) }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: COL.muted, letterSpacing: 3 }}>PRECIO ESTIMADO</div>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 120, color: COL.ice, letterSpacing: '-0.03em', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: `0 0 40px ${COL.ice}66` }}>{money(price)}</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Punch text="TODO EMPEZÓ CON|UN *DISFRAZ*" at={4} y={1050} size={120} out={CARD} />
      <Punch text="EL ORIGINAL DE|LA *PELÍCULA*" at={CARD} y={1180} size={86} out={108} />
      <Punch text="10 M DE VISTAS:|«*PESADILLA*»" at={108} y={1180} size={96} accent={COL.red} />
      <Impact at={[CARD, 108]} y={1260} />
      {f >= CARD ? <Credit text="DISFRAZ ORIGINAL · PROPSTORE / VÍA BBC" /> : null}
      <Flash at={[CARD]} amp={0.35} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 · IRLANDA (8,5–13 s): mapa en 3D y los "avistamientos"            */
/* ================================================================== */
const MAP = { w: 740, h: 922, top: 300 }; // mapa-irlanda.png es 960x1197
const PINS: { name: string; x: number; y: number; at: number; photo: string; side: number; below?: boolean }[] = [
  { name: 'LIMERICK', x: 390 / 960, y: 745 / 1197, at: 34, photo: 'gato06/coche-hd.jpg', side: -1 },
  { name: 'WEXFORD', x: 760 / 960, y: 940 / 1197, at: 58, photo: 'gato06/hook.jpg', side: 1, below: true },
];
export const Ireland: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = ci(f, 0, 30, 50, 22);
  const z = interpolate(f, [0, 135], [0.92, 1.08]);
  return (
    <AbsoluteFill style={{ perspective: 1500, transform: `scale(${punch(f, [34, 58], 0.05)})` }}>
      <div style={{ position: 'absolute', left: (W - MAP.w) / 2, top: MAP.top, width: MAP.w, height: MAP.h, transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateZ(${-4 + Math.sin(f / 40) * 2}deg) scale(${z})`, transformOrigin: '50% 60%' }}>
        <Img src={staticFile('gato06/mapa-irlanda.png')} style={{ width: '100%', height: '100%', filter: 'grayscale(1) brightness(0.42) contrast(1.9)', borderRadius: 18, opacity: 0.95 }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(6,6,8,0) 55%, rgba(6,6,8,0.85) 100%)', borderRadius: 18 }} />
        {PINS.map((p) => {
          if (f < p.at) return null;
          const k = spring({ frame: f - p.at, fps: FPS, config: { damping: 9, stiffness: 240 } });
          const ring = ((f - p.at) % 30) / 30;
          return (
            <div key={p.name} style={{ position: 'absolute', left: p.x * MAP.w, top: p.y * MAP.h }}>
              <div style={{ position: 'absolute', left: -60 * ring, top: -60 * ring, width: 120 * ring, height: 120 * ring, borderRadius: '50%', border: `4px solid ${COL.red}`, opacity: 1 - ring }} />
              <div style={{ position: 'absolute', left: -16, top: -16, width: 32, height: 32, borderRadius: 16, background: COL.red, boxShadow: `0 0 30px ${COL.red}`, transform: `scale(${k})` }} />
              <div style={{ position: 'absolute', left: p.below ? -250 : p.side < 0 ? -320 : 40, top: p.below ? -70 : -30, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: '#fff', textShadow: '0 3px 10px #000', opacity: k, whiteSpace: 'nowrap' }}>{p.name}</div>
              {/* la "foto" del avistamiento sale del pin como una polaroid */}
              <div style={{ position: 'absolute', left: p.below ? -330 : p.side < 0 ? -330 : 60, top: p.below ? -440 : p.side < 0 ? -420 : 40, width: 260, height: 300, padding: 10, background: '#f2efe8', boxShadow: '0 20px 40px rgba(0,0,0,0.7)', transform: `rotate(${p.side * 7}deg) scale(${k})`, transformOrigin: '100% 100%' }}>
                <Img src={staticFile(p.photo)} style={{ width: '100%', height: 230, objectFit: 'cover', objectPosition: '50% 30%' }} />
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: '#222', marginTop: 8, textAlign: 'center' }}>¿AVISTAMIENTO?</div>
              </div>
            </div>
          );
        })}
      </div>
      <Punch text="18 AGO: LOS PRIMEROS|*AVISTAMIENTOS*" at={4} y={1250} size={110} maxW={800} />
      <Mono text="SNAPCHAT → TIKTOK → FACEBOOK" at={80} y={1480} size={30} color={COL.ice} weight={800} pill />
      <Credit text="MAPA · WIKIMEDIA COMMONS" />
      <Flash at={[34, 58]} color={COL.red} amp={0.18} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · VIRAL (13–17,5 s): las publicaciones reales y 14,6 M            */
/* ================================================================== */
/* Publicaciones reales recogidas por Know Your Meme y la BBC (texto traducido). */
const POSTS = [
  { user: '@bainne_maru', text: '«The cat in the hat»', tag: 'TIKTOK · IRLANDA' },
  { user: '@isecrets4', text: '«No voy a aguantar ver esto a las 11 pm»', tag: 'TIKTOK' },
  { user: '@nataliireynoldss', text: '«Esto es aterrador»', tag: 'TIKTOK' },
  { user: '@catinthehat0839', text: '«Voy por ti»', tag: 'TIKTOK · CUENTA NUEVA', red: true },
];
const fmtM = (n: number) => (n / 1e6).toFixed(1).replace('.', ',') + ' M';
export const Viral: React.FC = () => {
  const f = useCurrentFrame();
  const COUNT = 52;
  const views = interpolate(f, [COUNT, COUNT + 34], [0, 14.6e6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  const feedDim = ci(f, COUNT - 6, COUNT + 4, 1, 0.25);
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [COUNT + 34, 100], 0.06)})` }}>
      <AbsoluteFill style={{ opacity: feedDim, perspective: 1400 }}>
        {POSTS.map((p, i) => {
          const at = 3 + i * 9;
          if (f < at) return null;
          const k = spring({ frame: f - at, fps: FPS, config: { damping: 13, stiffness: 190 } });
          const y = 860 + i * 190 - f * 4 + (1 - k) * 220;
          return (
            <div key={p.user} style={{ position: 'absolute', left: 110, right: 110, top: y, transform: `rotateX(8deg) rotateZ(${(i % 2 ? 1 : -1) * 1.5}deg) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.4), padding: '20px 26px', borderRadius: 20, background: 'rgba(14,12,14,0.94)', border: `2px solid ${p.red ? COL.red : COL.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 800, fontSize: 20, color: '#D6CFC8' }}>
                <span style={{ padding: '3px 10px', borderRadius: 6, background: '#111', border: '1px solid #444', color: '#fff', fontSize: 16 }}>{p.tag}</span>
                <span style={{ color: COL.white }}>{p.user}</span>
              </div>
              <div style={{ marginTop: 10, fontFamily: HEAD, fontWeight: 900, fontSize: 40, lineHeight: 1.1, color: COL.white }}>{p.text}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      {f >= COUNT - 4 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: ci(f, COUNT - 4, COUNT, 0, 1) }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 210, letterSpacing: '-0.05em', color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: `0 0 60px ${COL.red}88`, transform: `scale(${1 + 0.08 * Math.exp(-Math.max(0, f - COUNT - 34) / 4) * (f >= COUNT + 34 ? 1 : 0)})` }}>{fmtM(views)}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: COL.ice, letterSpacing: 3, marginTop: 6 }}>VISTAS EN 3 SEMANAS</div>
        </div>
      ) : null}
      <Punch text="SE HIZO|*VIRAL*" at={4} y={420} size={150} out={COUNT - 4} />
      {f >= 100 ? (
        <div style={{ position: 'absolute', left: 120, right: 120, top: 1050, padding: '22px 30px', borderRadius: 20, background: '#fff', transform: `rotate(-2deg) scale(${spring({ frame: f - 100, fps: FPS, config: { damping: 10, stiffness: 220 } })})`, boxShadow: '0 30px 60px rgba(0,0,0,0.7)' }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: '#777' }}>EL POST MÁS VISTO DECÍA:</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: '#111', lineHeight: 1.05 }}>«Ayuda, ¿qué hago?»</div>
        </div>
      ) : null}
      <Credit text="PUBLICACIONES REALES · VÍA KNOW YOUR MEME / BBC" />
      <Flash at={[COUNT + 34]} amp={0.2} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · LA POLICÍA (17,5–23 s): la misma foto, desenmascarada           */
/* ================================================================== */
export const Police: React.FC = () => {
  const f = useCurrentFrame();
  const SCAN = 26; // barrido que revela la misma imagen con el sello "AI GENERATED"
  const DOC = 92; // la imagen que publicó la propia Garda de Wexford
  const scan = ci(f, SCAN, SCAN + 22, 0, 1, (t) => t);
  const lightRed = Math.max(0, Math.sin(f * 0.5));
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [SCAN + 22, DOC, DOC + 18], 0.06)})` }}>
      {f < DOC ? (
        <>
          <SightingShot zoom={1.3 + f * 0.002} />
          {/* barrido: por debajo de la línea ya se ve la versión con el sello de la BBC */}
          <AbsoluteFill style={{ clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)` }}>
            <Plate file="gato06/garda-ia.png" pos="50% 62%" origin="50% 60%" y={-230} scale={1.14 + f * 0.0012} bright={0.95} sat={0.95} tint="rgba(255,46,59,0.12)" />
          </AbsoluteFill>
          {scan > 0 && scan < 1 ? <div style={{ position: 'absolute', left: 0, right: 0, top: scan * H - 4, height: 8, background: COL.ice, boxShadow: `0 0 40px ${COL.ice}, 0 0 80px ${COL.ice}` }} /> : null}
        </>
      ) : (
        <AbsoluteFill style={{ perspective: 1400 }}>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(47,107,255,0.25) 0%, rgba(6,6,8,0) 60%)' }} />
          <div style={{ position: 'absolute', left: 40, right: 40, top: 470, height: 562, borderRadius: 20, overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 50px 120px rgba(0,0,0,0.85)', transform: `rotateY(${Math.sin(f / 20) * 8}deg) rotateX(6deg) scale(${spring({ frame: f - DOC, fps: FPS, config: { damping: 13, stiffness: 160 } })})` }}>
            <Img src={staticFile('gato06/bbc-og.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <Stamp text="FALSO" at={DOC + 18} x={W / 2} y={750} size={120} />
        </AbsoluteFill>
      )}
      {/* luces de patrulla en los bordes */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: `linear-gradient(90deg, rgba(255,46,59,${0.35 * lightRed}) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(47,107,255,${0.35 * (1 - lightRed)}) 100%)` }} />
      <Punch text="LA POLICÍA LO|CONFIRMÓ: *ERA IA*" at={SCAN + 22} y={300} size={110} accent={COL.red} out={DOC} />
      <Punch text="«NO CREAN TODO LO|QUE LEEN EN *REDES*»" at={DOC + 34} y={1110} size={84} />
      <Mono text="POLICÍA DE SOUTH YORKSHIRE · AGO 2026" at={DOC + 44} y={1330} size={24} color="#C9C2BB" weight={800} />
      <Credit text={f < DOC ? 'IMAGEN: AN GARDA SÍOCHÁNA WEXFORD / VÍA BBC' : 'IMAGEN: BBC NEWS'} />
      <Flash at={[SCAN + 22, DOC]} amp={0.25} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · NO SE DETUVO (23–28 s)                                          */
/* ================================================================== */
const ROWS = [
  { label: 'CITA EN UN BOSQUE', place: 'ESCOCIA', at: 36 },
  { label: 'AMENAZAS EN COLEGIOS', place: 'EE. UU.', at: 66 },
  { label: 'ESTUDIANTES ARRESTADOS', place: 'KENTUCKY · COLORADO', at: 96 },
];
export const Spread: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [4, ...ROWS.map((r) => r.at)], 0.05)})` }}>
      <Plate file="gato06/dark-hd.jpg" pos="40% 50%" scale={1.2 + f * 0.002} bright={0.45} sat={0} tint="rgba(255,46,59,0.3)" />
      <Punch text="PERO NO|SE *DETUVO*" at={4} y={330} size={120} accent={COL.red} />
      {ROWS.map((r, i) => {
        if (f < r.at) return null;
        const k = spring({ frame: f - r.at, fps: FPS, config: { damping: 12, stiffness: 200 } });
        const s = shake(f, r.at + 6, 8, 6);
        return (
          <div key={r.label} style={{ position: 'absolute', left: 100, right: 100, top: 720 + i * 200, height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 34px', borderRadius: 18, background: COL.card, border: `1px solid ${COL.border}`, borderLeft: `8px solid ${COL.red}`, transform: `translate(${(1 - k) * -800 + s.x}px, ${s.y}px) rotate(${Math.sin(f / 23 + i) * 0.8}deg)`, opacity: Math.min(1, k * 1.5), boxShadow: '0 30px 70px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 50, color: COL.white, letterSpacing: '-0.02em' }}>⚠ {r.label}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: COL.ice, letterSpacing: 3, marginTop: 6 }}>{r.place}</div>
          </div>
        );
      })}
      <Credit text="FUENTES: BBC · KNOW YOUR MEME · ABC NEWS" />
      <Flash at={ROWS.map((r) => r.at)} color={COL.red} amp={0.2} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · EL MIEDO (28–32 s)                                              */
/* ================================================================== */
export const Fear: React.FC = () => {
  const f = useCurrentFrame();
  const REAL = 52;
  const beat = (t: number) => (t >= 0 ? 0.05 * Math.exp(-(t % 22) / 4) : 0); // latido
  return (
    <AbsoluteFill>
      {f >= REAL ? (
        <AbsoluteFill style={{ transform: `scale(${1 + beat(f - REAL)})` }}>
          <RGBGlitch active={f >= REAL && f < REAL + 3}>
            <Plate file="gato06/snap-aviso.jpg" pos="50% 30%" origin="50% 35%" scale={1.05 + (f - REAL) * 0.002} bright={0.75} sat={0.5} tint="rgba(255,46,59,0.35)" />
          </RGBGlitch>
        </AbsoluteFill>
      ) : (
        <RGBGlitch active={f % 14 < 2}>
          <Punch text="TODO ERA|*FALSO*…" at={2} y={760} size={170} accent={COL.red} />
        </RGBGlitch>
      )}
      <Impact at={[REAL]} y={1000} color={COL.red} />
      <Punch text="…PERO EL MIEDO|FUE *REAL*" at={REAL} y={1050} size={130} accent={COL.red} />
      {f >= REAL ? <Credit text={KYM} /> : null}
      <Flash at={[REAL]} color={COL.red} amp={0.4} />
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
  const NO = 66;
  const CTA = 116;
  const BACK = END - 13; // el titular del gancho reaparece: en el último frame (END-1) lleva 12 frames, como en el frame 0 (at=-12)
  // la cámara vuelve al encuadre del frame 0 (zoom 1.25)
  const zoom = interpolate(f, [0, END - 1], [1.7, 1.25], { extrapolateRight: 'clamp' }) * (f < BACK ? punch(f, [Q, NO, CTA], 0.05) : 1);
  return (
    <AbsoluteFill>
      <SightingShot zoom={zoom} />
      <AbsoluteFill style={{ background: 'rgba(6,6,8,0.35)', opacity: ci(f, BACK - 10, BACK, 1, 0) }} />
      <Viewfinder />
      <Impact at={[Q, NO, CTA]} y={900} color={COL.red} />
      <Punch text="¿QUIÉN CREÓ|LA PRIMERA *FOTO*?" at={Q} y={620} size={130} out={NO} />
      <Punch text="NADIE LO|*SABE*" at={NO} y={620} size={170} accent={COL.red} out={CTA} />
      <Punch text="DIME QUÉ|CREES *TÚ* ↓" at={CTA} y={620} size={140} out={BACK} />
      <Punch text="¿QUÉ HACE ESTO|*EN LA CALLE*?" at={BACK} y={1040} size={130} />
      <Credit text={KYM} />
    </AbsoluteFill>
  );
};

export const SCENE_H = H;
