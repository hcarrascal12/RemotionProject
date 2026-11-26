/**
 * Kit visual del Caso Nº 04 (rediseño): tablero de investigación sobre papel claro, en 3D.
 * Papel + tinta negra + un solo acento rojo. Fotos como tarjetas/polaroids con sombra real que flotan en el espacio,
 * titulares en bloques de tinta (legibles sobre cualquier fondo), marcador rojo, hilo rojo y sellos.
 */
import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame } from 'remotion';
import { COL, DURATION, EASE, FPS, H, HEAD, MONO, SAFE, W, ci, rnd } from './theme';

/* ------------------------------------------------------------------ */
/* Fondo de papel con cuadrícula fina y grano                          */
/* ------------------------------------------------------------------ */
export const PaperBG: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#EDE7DD', overflow: 'hidden' }}>
      {/* el rayado del sombrero, enorme, en diagonal y casi imperceptible: la firma visual del caso */}
      <div style={{ position: 'absolute', left: -800, top: -800, width: W + 1600, height: H + 1600, transform: `rotate(-24deg) translateX(${(f * 1.2) % 360}px)`, backgroundImage: 'repeating-linear-gradient(90deg, #EDE7DD 0px, #EDE7DD 180px, #E8D8CF 180px, #E8D8CF 360px)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 65% at 50% 44%, rgba(246,242,235,0.85) 0%, rgba(246,242,235,0.35) 55%, rgba(200,186,170,0.35) 100%)' }} />
      <Img src={staticFile(`cicada01/grain${(f % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.16, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

/** Viñeta suave y grano final (encima de todo). */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Img src={staticFile(`cicada01/grain${((f + 3) % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,30,20,0.32) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escenario 3D: cámara con deriva periódica (el loop cierra perfecto) */
/* ------------------------------------------------------------------ */
export const Stage: React.FC<{ children: React.ReactNode; dolly?: number; rx?: number; ry?: number }> = ({ children, dolly = 0, rx = 0, ry = 0 }) => {
  const f = useCurrentFrame();
  const p = (2 * Math.PI * f) / DURATION; // periodo = duración del vídeo: el último frame enlaza con el primero
  const crx = rx + 2.2 * Math.sin(p * 3) + 0.8 * Math.sin(p * 7);
  const cry = ry + 3 * Math.cos(p * 2) + 1 * Math.sin(p * 9);
  return (
    <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: '50% 46%' }}>
      <AbsoluteFill style={{ transformStyle: 'preserve-3d', transform: `translateZ(${dolly}px) rotateX(${crx}deg) rotateY(${cry}deg)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Tarjeta fotográfica en 3D                                           */
/* ------------------------------------------------------------------ */
export const Card: React.FC<{
  src: string; x: number; y: number; w: number; h: number; z?: number; rx?: number; ry?: number; rz?: number;
  pos?: string; k?: number; border?: number; caption?: string; tape?: boolean; imgScale?: number; imgOrigin?: string; filter?: string; children?: React.ReactNode; dim?: number;
}> = ({ src, x, y, w, h, z = 0, rx = 0, ry = 0, rz = 0, pos = '50% 50%', k = 1, border = 14, caption, tape = false, imgScale = 1, imgOrigin = '50% 50%', filter, children, dim = 0 }) => {
  if (k <= 0.001) return null;
  const cap = caption ? 70 : 0;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${0.55 + 0.45 * k})`, opacity: Math.min(1, k * 1.6) }}>
      {/* sombra real, desplazada y desenfocada */}
      <div style={{ position: 'absolute', inset: 10, background: 'rgba(30,20,10,0.42)', filter: 'blur(26px)', transform: 'translate(20px, 34px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: COL.card, padding: border, paddingBottom: border + cap, boxShadow: '0 1px 0 rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#222' }}>
          <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${imgScale})`, transformOrigin: imgOrigin, filter: filter ?? 'contrast(1.06) saturate(0.95)' }} />
          {dim > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
          {children}
        </div>
        {caption ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 26, color: COL.ink, letterSpacing: 2 }}>{caption}</div> : null}
      </div>
      {tape ? (
        <>
          <div style={{ position: 'absolute', left: -30, top: -18, width: 150, height: 44, background: 'repeating-linear-gradient(90deg, rgba(227,38,47,0.85) 0px, rgba(227,38,47,0.85) 18px, rgba(255,255,255,0.9) 18px, rgba(255,255,255,0.9) 36px)', transform: 'rotate(-28deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
          <div style={{ position: 'absolute', right: -30, top: -18, width: 150, height: 44, background: 'repeating-linear-gradient(90deg, rgba(227,38,47,0.85) 0px, rgba(227,38,47,0.85) 18px, rgba(255,255,255,0.9) 18px, rgba(255,255,255,0.9) 36px)', transform: 'rotate(26deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
        </>
      ) : null}
    </div>
  );
};

/** Muelle de entrada estándar para tarjetas y sellos. */
export const enter = (f: number, at: number, stiffness = 210, damping = 14) => (f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness } }));

/* ------------------------------------------------------------------ */
/* Titulares en CINTA ROTULADORA (tipo Dymo): "linea|linea", *palabra* = cinta roja.
 * Las letras se "imprimen" una a una con relieve; firma visual del caso (no las cajas de subtítulo de siempre). */
/* ------------------------------------------------------------------ */
/** Borde superior de la franja de subtítulos (ver captions.tsx). */
export const CAPTION_TOP = 1478;
/** Subtítulos karaoke (captions.tsx): apagados, los titulares ya cuentan la narración. */
export const SUBS = false;
export const Headline: React.FC<{ text: string; at: number; y: number; size?: number; out?: number; maxW?: number; still?: boolean; stagger?: number }> = ({ text, at, y, size = 100, out, maxW = 940, still = false, stagger = 3 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const o = out === undefined ? 1 : ci(f, out - 5, out, 1, 0);
  if (o <= 0) return null;
  const lines = text.split('|');
  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length));
  const fs = Math.min(size, Math.floor(maxW / (longest * 0.74)));
  const CPF = 2.2; // letras impresas por frame
  // con subtítulos (SUBS) los titulares nunca bajan de CAPTION_TOP; sin ellos, van donde se pusieron
  const hgt = lines.length * fs * 1.32 + (lines.length - 1) * Math.round(fs * 0.16);
  const top = SUBS ? Math.min(y, CAPTION_TOP - 24 - hgt) : y;
  return (
    <div style={{ position: 'absolute', left: SAFE.x - 40, right: SAFE.x - 40, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(fs * 0.16), opacity: o, transform: 'translateZ(60px)' }}>
      {lines.map((l, i) => {
        const t0 = at + i * stagger;
        const shown = still ? 999 : Math.max(0, (f - t0) * CPF);
        const tilt = (rnd(i * 7 + l.length) - 0.5) * 3.2;
        let used = 0;
        const segs = l.split('*');
        return (
          <div key={i} style={{ display: 'flex', whiteSpace: 'nowrap', transform: `rotate(${tilt}deg)`, opacity: f >= t0 || still ? 1 : 0 }}>
            {segs.map((seg, k) => {
              if (!seg) return null;
              const txt = seg.trim() === seg ? seg : seg.replace(/^\s+|\s+$/g, '');
              const local = Math.floor(shown - used);
              const sp = local <= 0 ? 0 : txt.indexOf(' ', local);
              const vis = local <= 0 ? 0 : sp === -1 ? txt.length : sp;
              used += txt.length;
              if (vis <= 0) return null;
              const red = k % 2 === 1;
              return (
                <span key={k} style={{ position: 'relative', display: 'inline-block', marginRight: k < segs.length - 1 ? fs * 0.14 : 0, padding: `${fs * 0.12}px ${fs * 0.22}px ${fs * 0.1}px`, borderRadius: fs * 0.06, background: red ? `linear-gradient(180deg, #F0434B 0%, ${COL.red} 45%, #B9151E 100%)` : 'linear-gradient(180deg, #2E2E2E 0%, #141414 50%, #050505 100%)', boxShadow: '0 12px 26px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.35)' }}>
                  <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F4F1EA', textShadow: '0 -2px 0 rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.28)' }}>{txt.slice(0, vis)}</span>
                  {/* hueco de las letras que faltan: la cinta "sale" de la máquina */}
                  <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'transparent' }}>{txt.slice(vis)}</span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Bolsa de pruebas (va encima de una Card)                            */
/* ------------------------------------------------------------------ */
export const EvidenceBag: React.FC<{ n: number }> = ({ n }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.18) 62%, rgba(255,255,255,0.02) 80%)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 40, background: COL.red, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontFamily: MONO, fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: 3 }}>
      <span>EVIDENCIA</span>
      <span>Nº {String(n).padStart(3, '0')}</span>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 40, height: 10, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)' }} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Transición "el sombrero": cae sobre la cámara, tapa y al subir revela */
/* ------------------------------------------------------------------ */
export const HatWipe: React.FC<{ at: number; len?: number }> = ({ at, len = 16 }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > len) return null;
  const half = len / 2;
  // baja (0→half) tapando todo, sube (half→len) destapando
  const y = t <= half ? ci(t, 0, half, -1.25, 0, (x) => x * x) : ci(t, half, len, 0, -1.25, (x) => x * x);
  const stripe = 150;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -60, right: -60, top: y * H, height: H, background: `repeating-linear-gradient(180deg, #D9222B 0px, #D9222B ${stripe}px, #FBF8F2 ${stripe}px, #FBF8F2 ${stripe * 2}px)`, boxShadow: 'inset 120px 0 120px -40px rgba(0,0,0,0.35), inset -120px 0 120px -40px rgba(0,0,0,0.35)' }} />
      {/* el ala del sombrero, en el borde inferior */}
      <div style={{ position: 'absolute', left: -200, right: -200, top: y * H + H - 90, height: 180, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 40%, #FFFDF8 0%, #E9E2D6 70%, #CFC5B6 100%)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }} />
    </AbsoluteFill>
  );
};

/** Etiqueta pequeña monoespaciada (fechas, fuentes). */
export const Tag: React.FC<{ text: string; at?: number; x?: number; y: number; red?: boolean; size?: number; center?: boolean }> = ({ text, at = 0, x = SAFE.x, y, red = false, size = 26, center = false }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 6, 0, 1);
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', opacity: p, transform: `translateY(${(1 - p) * 12}px) translateZ(40px)` }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, letterSpacing: 3, color: red ? '#fff' : COL.ink, background: red ? COL.red : '#fff', padding: '6px 14px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>{text}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Marcador, hilo rojo y sellos                                        */
/* ------------------------------------------------------------------ */
/** Círculo de marcador rojo que se dibuja a mano alrededor de algo. */
export const Scribble: React.FC<{ cx: number; cy: number; rx: number; ry: number; at: number; dur?: number; width?: number; seed?: number }> = ({ cx, cy, rx, ry, at, dur = 12, width = 12, seed = 1 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const pts: string[] = [];
  const turns = 1.15;
  for (let i = 0; i <= 64; i++) {
    const a = -Math.PI / 2 + (i / 64) * Math.PI * 2 * turns;
    const wob = 1 + 0.06 * Math.sin(i * 0.7 + seed) + 0.04 * (i / 64);
    pts.push(`${(cx + Math.cos(a) * rx * wob).toFixed(1)},${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  const len = 2 * Math.PI * Math.max(rx, ry) * turns * 1.1;
  const p = ci(f, at, at + dur, 0, 1, (t) => t);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: 'translateZ(30px)' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={COL.red} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.92} />
    </svg>
  );
};

/** Hilo rojo entre dos chinchetas (tablero de detective), con caída. */
export const RedString: React.FC<{ a: [number, number]; b: [number, number]; at: number; dur?: number }> = ({ a, b, at, dur = 10 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + dur, 0, 1);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + 60;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.15;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: 'translateZ(20px)' }}>
      <path d={d} fill="none" stroke="#B81A22" strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      {[a, b].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={13} fill={COL.red} stroke="#7A0F15" strokeWidth={3} opacity={i === 0 || p > 0.95 ? 1 : 0} />
      ))}
    </svg>
  );
};

/** Sello de tinta roja que cae girando. */
export const Stamp: React.FC<{ text: string; at: number; x: number; y: number; rot?: number; size?: number; sub?: string }> = ({ text, at, x, y, rot = -10, size = 110, sub }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = spring({ frame: f - at, fps: FPS, config: { damping: 9, stiffness: 300 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateZ(80px) rotate(${rot}deg) scale(${2.6 - 1.6 * k})`, opacity: Math.min(1, k * 1.8), padding: '6px 30px 10px', border: `10px solid ${COL.red}`, borderRadius: 16, textAlign: 'center', color: COL.red, background: 'rgba(255,255,255,0.82)', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{text}</div>
      {sub ? <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size * 0.22, letterSpacing: 4 }}>{sub}</div> : null}
    </div>
  );
};

/** Teléfono en 3D con contenido dentro. */
export const Phone: React.FC<{ x: number; y: number; k: number; rx?: number; ry?: number; rz?: number; children: React.ReactNode }> = ({ x, y, k, rx = 8, ry = -14, rz = -3, children }) => {
  const w = 560, h = 1080;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 300}px)`, opacity: Math.min(1, k * 1.5) }}>
      <div style={{ position: 'absolute', inset: 20, background: 'rgba(20,10,0,0.45)', filter: 'blur(30px)', transform: 'translate(30px, 40px)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 70, background: '#141414', padding: 18, boxShadow: 'inset 0 0 0 3px #3A3A3A, 0 2px 0 #000' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 54, overflow: 'hidden', background: '#0D0D0D' }}>
          {children}
          <div style={{ position: 'absolute', left: '50%', top: 14, width: 150, height: 34, borderRadius: 20, background: '#000', transform: 'translateX(-50%)' }} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* HUD claro                                                           */
/* ------------------------------------------------------------------ */
export const StatusBarLight: React.FC<{ date?: string }> = ({ date }) => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2;
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: SAFE.top - 14, height: 54, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: COL.ink, letterSpacing: 2, background: 'rgba(233,230,224,0.96)', padding: '0 14px 0 0', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', transform: 'translateZ(300px)' }}>
      <span style={{ background: COL.ink, color: '#fff', padding: '6px 12px', fontSize: 25, letterSpacing: 3 }}>CASO Nº 04</span>
      <span>SIN RESOLVER</span>
      <span style={{ color: COL.muted, fontWeight: 800, fontSize: 20 }}>· NO PRESIONES</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: COL.red, opacity: blink ? 1 : 0.3 }} />
        {date ? <span style={{ color: COL.red }}>{date}</span> : null}
      </div>
    </div>
  );
};

export const ProgressLight: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 8, background: 'rgba(0,0,0,0.08)' }}>
      <div style={{ width: `${(f / (DURATION - 1)) * 100}%`, height: '100%', backgroundImage: `repeating-linear-gradient(-45deg, ${COL.red} 0px, ${COL.red} 10px, #fff 10px, #fff 20px)` }} />
    </div>
  );
};

/** Destello (blanco o tinta) para tapar cortes. */
export const Flash: React.FC<{ at: number[]; color?: string; amp?: number }> = ({ at, color = '#FFFFFF', amp = 0.6 }) => {
  const f = useCurrentFrame();
  const o = at.reduce((m, h) => (f >= h && f < h + 6 ? Math.max(m, amp * Math.exp(-(f - h) / 1.6)) : m), 0);
  if (o <= 0.01) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: 'none' }} />;
};

/** Barrido de velocidad (whip) entre escenas: franjas de movimiento. */
export const Whip: React.FC<{ at: number; dir?: number }> = ({ at, dir = 1 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 7) return null;
  const p = (f - at) / 7;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: (dir * (p * 2.2 - 1.1)) * W + (rnd(i) - 0.5) * 300, top: (i / 9) * H, width: W * 1.2, height: H / 9 + 2, background: i % 3 === 0 ? COL.ink : i % 3 === 1 ? COL.paper2 : '#fff', opacity: 0.85, transform: `skewX(${-20 * dir}deg)` }} />
      ))}
    </AbsoluteFill>
  );
};

export const easeOut = EASE;
