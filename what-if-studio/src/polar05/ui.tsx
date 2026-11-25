import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { noise3D } from '@remotion/noise';
import { COL, EASE, FPS, H, HEAD, MONO, SAFE, SCENES, W, ci, rnd } from './theme';

/* ------------------------------------------------------------------ */
/* Fondo: cielo nocturno con estrellas y bandas de aurora              */
/* ------------------------------------------------------------------ */
export const NightSky: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const bands: string[] = [];
  for (let k = 0; k < 3; k++) {
    let d = '';
    for (let x = -40; x <= W + 40; x += 30) {
      const y = 380 + k * 120 + noise3D('aurora', x * 0.002, k, t * 0.15) * 160;
      d += `${x === -40 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
    }
    bands.push(d);
  }
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #050A14 0%, #04070C 55%, #070C12 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="p5-glow">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>
        <g filter="url(#p5-glow)" fill="none" strokeLinecap="round">
          {bands.map((d, i) => (
            <path key={i} d={d} stroke={i === 1 ? '#5B3FA8' : '#1E8F8A'} strokeWidth={70 - i * 14} opacity={0.22} />
          ))}
        </g>
        {Array.from({ length: 90 }, (_, i) => {
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + rnd(i) * 1.5) + i));
          return <circle key={i} cx={rnd(i * 2.1) * W} cy={rnd(i * 4.3) * H * 0.7} r={0.6 + rnd(i * 9) * 1.6} fill="#DDEFFF" opacity={0.15 + 0.5 * tw * rnd(i * 5)} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Nieve a tres profundidades                                          */
/* ------------------------------------------------------------------ */
export const Snow: React.FC<{ amount?: number; count?: number; wind?: number }> = ({ amount = 1, count = 60, wind = 1 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // en los extremos del vídeo la nieve se apaga, para que el último frame enganche con el primero
  const loopFade = Math.min(ci(f, 0, 12, 0.35, 1), ci(f, SCENES.loop.from + SCENES.loop.len - 24, SCENES.loop.from + SCENES.loop.len - 2, 1, 0.35));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: amount * loopFade }}>
      {Array.from({ length: count }, (_, i) => {
        const z = rnd(i * 3.7);
        const size = 2 + 9 * z * z;
        const fall = 40 + 140 * z;
        const y = ((rnd(i * 5.3) * H + t * fall) % (H + 40)) - 20;
        const x = (((rnd(i * 1.9) * W + t * (20 + 50 * z) * wind + Math.sin(t * (0.8 + z) + i) * 26) % W) + W) % W;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: '#F2FBFF', opacity: (0.25 + 0.5 * (1 - z * 0.6)) * (0.6 + 0.4 * rnd(i)), filter: z > 0.75 ? 'blur(2px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Marca: barra de estado con el número de la serie                    */
/* ------------------------------------------------------------------ */
export const StatusBar: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 0.35 + 0.65 * Math.abs(Math.sin((f / FPS) * Math.PI * 1.2));
  const sec = (f / FPS).toFixed(1).padStart(4, '0');
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: SAFE.top - 10, height: 52, display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${COL.border}`, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#C9D6E2', letterSpacing: 2 }}>
      <span style={{ background: COL.ice, color: COL.bg, padding: '5px 12px', borderRadius: 6, fontSize: 26, letterSpacing: 3, boxShadow: `0 0 18px ${COL.ice}66` }}>FALLO #05</span>
      <span style={{ color: COL.white }}>SIN RESOLVER</span>
      <span style={{ color: COL.muted, fontWeight: 500, fontSize: 18 }}>· NO PRESIONES</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 11, height: 11, borderRadius: 6, background: COL.red, opacity: pulse, boxShadow: `0 0 ${12 * pulse}px ${COL.red}` }} />
        <span style={{ color: COL.ice, fontWeight: 500, opacity: 0.85 }}>T+{sec}s</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Línea de tiempo lateral: marzo 2023 → noviembre 2026                */
/* ------------------------------------------------------------------ */
const MARKS: [string, number][] = [
  ['MAR 2023', SCENES.hook.from],
  ['SEP 2023', SCENES.lore.from],
  ['AGO 2026', SCENES.back.from],
  ['NOV 2026', SCENES.now.from],
];
const RAIL_X = 50;
const RAIL_TOP = 340;
const RAIL_BOT = 1520;
export const TimelineRail: React.FC = () => {
  const f = useCurrentFrame();
  const ys = MARKS.map((_, i) => RAIL_TOP + (i * (RAIL_BOT - RAIL_TOP)) / (MARKS.length - 1));
  const head = interpolate(f, [0, ...MARKS.slice(1).map((m) => m[1]), SCENES.loop.from + SCENES.loop.len], [RAIL_TOP, ...ys.slice(1), RAIL_BOT], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{ position: 'absolute', left: RAIL_X - 1, top: RAIL_TOP, width: 2, height: RAIL_BOT - RAIL_TOP, background: COL.border }} />
      <div style={{ position: 'absolute', left: RAIL_X - 1, top: RAIL_TOP, width: 2, height: head - RAIL_TOP, background: COL.ice, boxShadow: `0 0 10px ${COL.ice}` }} />
      <div style={{ position: 'absolute', left: RAIL_X - 6, top: head - 6, width: 12, height: 12, borderRadius: 6, background: COL.ice, boxShadow: `0 0 16px ${COL.ice}` }} />
      {MARKS.map(([label, at], i) => {
        const on = f >= at;
        const last = i === MARKS.length - 1;
        const c = last && on ? COL.red : on ? COL.ice : COL.muted;
        return (
          <React.Fragment key={label}>
            <div style={{ position: 'absolute', left: RAIL_X - 5, top: ys[i] - 1, width: 10, height: 2, background: on ? c : COL.border }} />
            <div style={{ position: 'absolute', left: RAIL_X + 12, top: ys[i] - 9, fontFamily: MONO, fontWeight: on ? 800 : 500, fontSize: 15, color: c, opacity: on ? 1 : 0.55, whiteSpace: 'nowrap' }}>{label}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Tipografía cinética                                                 */
/* ------------------------------------------------------------------ */
/** Titular que entra con golpe: escala 0,85 → 1 en 5 frames, línea a línea. "|" corta línea; *palabra* = hielo (o rojo con "!"). */
export const Punch: React.FC<{ text: string; at?: number; y: number; size?: number; color?: string; maxW?: number; accent?: string; out?: number }> = ({ text, at = 0, y, size: size0 = 120, color = COL.white, maxW = 980, accent = COL.ice, out }) => {
  const size = size0 * 1.2;
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 5, 0, 1);
  const o = out === undefined ? 1 : ci(f, out - 6, out, 1, 0);
  if (o <= 0) return null;
  const lines = text.split('|');
  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length));
  const fs = Math.min(size, Math.floor(maxW / (longest * 0.64)));
  return (
    <div style={{ position: 'absolute', left: SAFE.x - 20, right: SAFE.x - 20, top: y, textAlign: 'center', transform: `translateY(${Math.sin((f - at) / 16) * 6}px) scale(${(0.85 + 0.15 * p) * (1 + Math.min(0.07, (f - at) * 0.0011))})`, transformOrigin: '50% 30%', opacity: o }}>
      {lines.map((l, i) => {
        const lp = lines.length > 1 ? ci(f, at + i * 3, at + i * 3 + 5, 0, 1) : p;
        return (
          <div key={i} style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 1.02, letterSpacing: `${-0.03 + 0.01 * (1 - lp)}em`, textTransform: 'uppercase', color, whiteSpace: 'nowrap', opacity: lp, transform: `translateY(${(1 - lp) * 30}px) translateX(${Math.sin((f - at) / 11 + i * 1.7) * 3}px)`, WebkitTextStroke: `${Math.max(6, fs * 0.07)}px #000`, paintOrder: 'stroke fill', textShadow: '0 8px 30px rgba(0,0,0,0.9)' }}>
            {l.split('*').map((s, k) => (k % 2 ? <span key={k} style={{ color: accent, filter: `drop-shadow(0 0 18px ${accent}88)` }}>{s}</span> : <React.Fragment key={k}>{s}</React.Fragment>))}
          </div>
        );
      })}
    </div>
  );
};

/** Línea monoespaciada (fechas, fuentes). */
export const Mono: React.FC<{ text: string; y: number; at?: number; size?: number; color?: string; weight?: 500 | 800; pill?: boolean; out?: number }> = ({ text, y, at = 0, size = 26, color = COL.muted, weight = 500, pill = false, out }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 5, 0, 1) * (out === undefined ? 1 : ci(f, out - 6, out, 1, 0));
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: y, textAlign: 'center', opacity: p, transform: `translateY(${8 * (1 - p)}px)` }}>
      <span style={{ fontFamily: MONO, fontWeight: weight, fontSize: size, color, letterSpacing: 2, textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', ...(pill ? { padding: '8px 18px', borderRadius: 999, background: 'rgba(4,7,12,0.75)', border: `1px solid ${COL.border}` } : {}) }}>{text}</span>
    </div>
  );
};

/** Crédito pequeño de imagen, arriba a la derecha bajo la barra de estado. */
export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', right: SAFE.x, top: SAFE.top + 56, fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: 1, color: '#9AA8B6', textShadow: '0 2px 8px #000', whiteSpace: 'nowrap' }}>{text}</div>
);

/* ------------------------------------------------------------------ */
/* Capa cinematográfica                                                */
/* ------------------------------------------------------------------ */
/** Cámara virtual: todo el escenario en perspectiva, con una deriva continua. */
export const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const rx = 1.6 * Math.sin(t * 0.7) + 0.6 * Math.sin(t * 1.9);
  const ry = 2.4 * Math.cos(t * 0.5) + 0.8 * Math.sin(t * 1.3);
  return (
    <AbsoluteFill style={{ perspective: 1200, perspectiveOrigin: '50% 45%' }}>
      <AbsoluteFill style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Foto a sangre tratada como plancha de cine: etalonado frío, luz de borde cian y suelo oscuro para el texto. */
export const Plate: React.FC<{ file: string; pos?: string; scale: number; x?: number; y?: number; rot?: number; bright?: number; sat?: number; origin?: string; opacity?: number; tint?: string; children?: React.ReactNode }> = ({ file, pos = '50% 50%', scale, x = 0, y = 0, rot = 0, bright = 0.85, sat = 0.55, origin = '50% 50%', opacity = 1, tint = 'rgba(80,170,255,0.35)', children }) => (
  <AbsoluteFill style={{ overflow: 'hidden', opacity }}>
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`, transformOrigin: origin }}>
      <Img src={staticFile(file)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: `saturate(${sat}) contrast(1.18) brightness(${bright})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${tint} 0%, rgba(4,7,12,0) 50%, rgba(143,233,255,0.18) 100%)`, mixBlendMode: 'soft-light' }} />
      {children}
    </AbsoluteFill>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,7,12,0.55) 0%, rgba(4,7,12,0) 18%, rgba(4,7,12,0) 48%, rgba(4,7,12,0.88) 68%, rgba(4,7,12,0.97) 100%)' }} />
  </AbsoluteFill>
);

/** Grano de película animado + viñeta. */
export const FilmFinish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Img src={staticFile(`cicada01/grain${(f % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)' }} />
    </AbsoluteFill>
  );
};

/** Entrada de escena: zoom con desenfoque en 8 frames (la transición de la casa). */
export const SceneIn: React.FC<{ children: React.ReactNode; len: number; skipIn?: boolean; skipOut?: boolean }> = ({ children, len, skipIn = false, skipOut = false }) => {
  const f = useCurrentFrame();
  const k = skipIn ? 1 : ci(f, 0, 8, 0, 1);
  const outK = skipOut ? 0 : ci(f, len - 5, len, 0, 1);
  // nunca un frame quieto: la escena entera se acerca durante toda su vida (salvo la última, que debe acabar
  // exactamente en el encuadre del frame 0 para que el loop enganche)
  const drift = skipOut ? 1 : 1 + 0.05 * (f / len);
  const scale = (1.16 - 0.16 * k) * (1 + 0.05 * outK) * drift;
  const blur = 10 * (1 - k) + 6 * outK;
  const rot = skipOut ? 0 : Math.sin(f / 37) * 0.5;
  return <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${rot}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: Math.min(1, k * 1.4) }}>{children}</AbsoluteFill>;
};

/** Destello que tapa el corte. */
export const Flash: React.FC<{ at: number[]; color?: string; amp?: number }> = ({ at, color = '#E8FAFF', amp = 0.45 }) => {
  const f = useCurrentFrame();
  const o = at.reduce((m, h) => (f >= h && f < h + 7 ? Math.max(m, amp * Math.exp(-(f - h) / 1.8)) : m), 0);
  if (o <= 0.01) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

/** Onda expansiva + destello horizontal en cada golpe (por detrás del texto). */
export const Impact: React.FC<{ at: number[]; y: number; color?: string; size?: number }> = ({ at, y, color = COL.ice, size = 1 }) => {
  const f = useCurrentFrame();
  const LEN = 18;
  const hits = at.filter((h) => f >= h && f < h + LEN);
  if (!hits.length) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {hits.map((h) => {
        const p = (f - h) / LEN;
        const e = 1 - Math.pow(1 - p, 3);
        return (
          <React.Fragment key={h}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              <circle cx={W / 2} cy={y} r={(30 + e * 620) * size} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 1} opacity={0.5 * (1 - p)} />
            </svg>
            <div style={{ position: 'absolute', left: W / 2 - (W * 0.8 * (0.3 + e)) / 2, width: W * 0.8 * (0.3 + e), top: y - 3, height: 6, borderRadius: 6, background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`, opacity: (1 - p) * 0.7, boxShadow: `0 0 24px ${color}` }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Glitch RGB: dos copias desplazadas del contenido en rojo y cian. Barato: solo se dibuja en los frames activos. */
export const RGBGlitch: React.FC<{ active: boolean; amp?: number; children: React.ReactNode }> = ({ active, amp = 14, children }) => {
  const f = useCurrentFrame();
  if (!active) return <>{children}</>;
  const d = amp * (0.5 + rnd(f));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-d}px)`, opacity: 0.55, mixBlendMode: 'screen', filter: 'sepia(1) saturate(6) hue-rotate(-50deg)' }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${d}px)`, opacity: 0.55, mixBlendMode: 'screen', filter: 'sepia(1) saturate(6) hue-rotate(150deg)' }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: 'normal', opacity: 0.85 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Barrido de luz diagonal cada ~3 s: un reflejo helado que cruza el encuadre. */
export const LightSweep: React.FC = () => {
  const f = useCurrentFrame();
  const P = 96;
  const p = (f % P) / 28;
  if (p > 1 || f < 10 || f > SCENES.loop.from + SCENES.loop.len - 30) return null;
  const x = -600 + p * (W + 1200);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      <div style={{ position: 'absolute', left: x, top: -200, width: 260, height: H + 400, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(190,240,255,0.10), rgba(255,255,255,0.16), rgba(190,240,255,0.10), transparent)' }} />
    </AbsoluteFill>
  );
};

/** Barra de progreso fina bajo la barra de estado: el espectador sabe cuánto falta. */
export const ProgressBar: React.FC = () => {
  const f = useCurrentFrame();
  const total = SCENES.loop.from + SCENES.loop.len;
  const p = f / (total - 1);
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: SAFE.top + 48, height: 6, borderRadius: 3, background: 'rgba(143,233,255,0.15)', overflow: 'hidden' }}>
      <div style={{ width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${COL.ice}, ${p > 0.68 ? COL.red : COL.ice})`, boxShadow: `0 0 12px ${COL.ice}` }} />
    </div>
  );
};
