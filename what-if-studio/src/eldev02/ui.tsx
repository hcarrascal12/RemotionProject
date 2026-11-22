import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { noise3D } from '@remotion/noise';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { COL, EASE, FPS, H, HEAD, MONO, SAFE, SAFE_BOTTOM_Y, SCENES, W, ci, rnd } from './theme';
import data from './data.json';

/* ------------------------------------------------------------------ */
/* Background: isometric grid + topographic contours bent by Perlin    */
/* ------------------------------------------------------------------ */
export const GridBg: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const topo: string[] = [];
  for (let k = 0; k < 34; k++) {
    const y0 = -80 + k * 62;
    let d = '';
    for (let x = -40; x <= W + 40; x += 36) {
      const y = y0 + noise3D('topo', x * 0.0024, y0 * 0.0024, t * 0.12) * 46;
      d += `${x === -40 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
    }
    topo.push(d);
  }
  const iso: React.ReactNode[] = [];
  const step = 120;
  const drift = (t * 14) % step;
  for (let c = -H; c < W + H; c += step) {
    // lines at +30° and -30°: the isometric lattice, drifting slowly
    iso.push(<line key={`a${c}`} x1={c + drift} y1={0} x2={c + drift + H * 1.732} y2={H} />);
    iso.push(<line key={`b${c}`} x1={c - drift} y1={0} x2={c - drift - H * 1.732} y2={H} />);
  }
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        <g stroke="#9FB3C8" strokeWidth={1}>{iso}</g>
        <g stroke="#9FB3C8" strokeWidth={1.4} fill="none">
          {topo.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Hash rain: real double-SHA-256 digests (data.json) falling as a log */
/* ------------------------------------------------------------------ */
const HASHES: string[] = data.hashes;

/** Fall speed in px/s on the global clock: explosive in the hook, calm in the body, accelerating into the loop. */
const rainSpeed = (f: number) => {
  if (f < 30) return interpolate(f, [0, 30], [1600, 140], { extrapolateRight: 'clamp' });
  if (f < SCENES.loop.from) return 140;
  return interpolate(f, [SCENES.loop.from, SCENES.loop.from + SCENES.loop.len], [140, 1600], { extrapolateRight: 'clamp', easing: (x) => x * x });
};
const rainOpacity = (f: number) => {
  if (f < SCENES.paper.from) return interpolate(f, [0, 84, 96], [0.34, 0.3, 0.07], { extrapolateRight: 'clamp' });
  if (f < SCENES.loop.from) return 0.07;
  return interpolate(f, [SCENES.loop.from, SCENES.loop.from + 60], [0.07, 0.34], { extrapolateRight: 'clamp' });
};

export const HashRain: React.FC = () => {
  const f = useCurrentFrame();
  let offset = 0;
  for (let i = 0; i < f; i++) offset += rainSpeed(i) / FPS;
  const rowH = 36;
  const N = Math.ceil(H / rowH) + 2;
  const span = N * rowH;
  return (
    <AbsoluteFill style={{ opacity: rainOpacity(f) }}>
      {Array.from({ length: N }, (_, i) => {
        const raw = i * rowH + offset;
        const y = (raw % span) - rowH;
        const idx = i + N * Math.floor(raw / span);
        const h = HASHES[idx % HASHES.length];
        const color = idx % 7 === 0 ? COL.amber : idx % 11 === 0 ? COL.cyan : '#4A5568';
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: 1.5, color, whiteSpace: 'nowrap' }}>
            {h}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Brand: status bar watermark with a pulsing indicator                */
/* ------------------------------------------------------------------ */
export const StatusBar: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 0.35 + 0.65 * Math.abs(Math.sin((f / FPS) * Math.PI * 1.2));
  const sec = (f / FPS).toFixed(1).padStart(4, '0');
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: SAFE.top + 4, height: 44, display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${COL.border}`, fontFamily: MONO, fontWeight: 500, fontSize: 22, color: '#C9D2DE', letterSpacing: 1 }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: COL.amber, opacity: pulse, boxShadow: `0 0 ${12 * pulse}px ${COL.amber}` }} />
      <span>SYS://NO_PRESIONES</span>
      <span style={{ color: COL.muted }}>•</span>
      <span style={{ color: COL.amber }}>SIN_RESOLVER_02</span>
      <span style={{ marginLeft: 'auto', color: COL.cyan, opacity: 0.8 }}>T+{sec}s</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Continuous progress: a rail on the left edge, 2008 → HOY            */
/* ------------------------------------------------------------------ */
const MARKS: [string, number][] = [
  ['2008', SCENES.paper.from],
  ['2009', SCENES.genesis.from],
  ['2011', SCENES.exit.from],
  ['2021', SCENES.wallet.from],
  ['2024', SCENES.fakes.from],
  ['HOY', SCENES.loop.from],
];
const RAIL_X = 54;
const RAIL_TOP = 330;
const RAIL_BOT = 1540;
export const TimelineRail: React.FC = () => {
  const f = useCurrentFrame();
  const ys = MARKS.map((_, i) => RAIL_TOP + (i * (RAIL_BOT - RAIL_TOP)) / (MARKS.length - 1));
  const head = interpolate(f, [0, ...MARKS.map((m) => m[1]), SCENES.loop.from + SCENES.loop.len], [RAIL_TOP - 30, ...ys, RAIL_BOT], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{ position: 'absolute', left: RAIL_X - 1, top: RAIL_TOP - 30, width: 2, height: RAIL_BOT - RAIL_TOP + 30, background: COL.border }} />
      <div style={{ position: 'absolute', left: RAIL_X - 1, top: RAIL_TOP - 30, width: 2, height: head - RAIL_TOP + 30, background: COL.amber, boxShadow: `0 0 10px ${COL.amber}` }} />
      <div style={{ position: 'absolute', left: RAIL_X - 6, top: head - 6, width: 12, height: 12, borderRadius: 6, background: COL.amber, boxShadow: `0 0 16px ${COL.amber}` }} />
      {MARKS.map(([label, at], i) => {
        const on = f >= at;
        return (
          <React.Fragment key={label}>
            <div style={{ position: 'absolute', left: RAIL_X - 5, top: ys[i] - 1, width: 10, height: 2, background: on ? COL.amber : COL.border }} />
            <div style={{ position: 'absolute', right: W - RAIL_X + 10, top: ys[i] - 10, fontFamily: MONO, fontWeight: on ? 800 : 500, fontSize: 15, color: on ? COL.amber : COL.muted, opacity: on ? 1 : 0.55 }}>{label}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Kinetic typography                                                  */
/* ------------------------------------------------------------------ */
/**
 * Headline that punches in: scale 0.85 → 1 and opacity in 5 frames, never static.
 * "|" breaks a line; *word* paints it Bitcoin amber with glow.
 */
export const Punch: React.FC<{ text: string; at?: number; y: number; size?: number; color?: string; maxW?: number; line?: number }> = ({ text, at = 0, y, size = 110, color = COL.white, maxW = 880, line = 1.02 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 5, 0, 1);
  const lines = text.split('|');
  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length));
  const fs = Math.min(size, Math.floor(maxW / (longest * 0.66)));
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: y, textAlign: 'center', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: '50% 0%' }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: line, letterSpacing: '-0.03em', textTransform: 'uppercase', color, whiteSpace: 'nowrap', textShadow: '0 6px 30px rgba(0,0,0,0.8)' }}>
          {l.split('*').map((s, k) => (k % 2 ? <span key={k} style={{ color: COL.amber, filter: 'drop-shadow(0 0 18px rgba(247,147,26,0.55))' }}>{s}</span> : <React.Fragment key={k}>{s}</React.Fragment>))}
        </div>
      ))}
    </div>
  );
};

/** Monospace data line (dates, hashes, sources). */
export const Mono: React.FC<{ text: string; y: number; at?: number; size?: number; color?: string; weight?: 500 | 800; align?: 'center' | 'left' }> = ({ text, y, at = 0, size = 26, color = COL.muted, weight = 500, align = 'center' }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 5, 0, 1);
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: y, textAlign: align, fontFamily: MONO, fontWeight: weight, fontSize: size, color, letterSpacing: 1.5, opacity: p, transform: `translateY(${8 * (1 - p)}px)` }}>{text}</div>
  );
};

/** Pill badge that springs in with a little overshoot. */
export const Badge: React.FC<{ text: string; x: number; y: number; k: number; color?: string }> = ({ text, x, y, k, color = COL.cyan }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${k})`, opacity: Math.min(1, k * 1.5), padding: '14px 30px', borderRadius: 999, background: 'rgba(7,8,10,0.92)', border: `2px solid ${color}`, boxShadow: `0 0 30px ${color}55`, fontFamily: MONO, fontWeight: 800, fontSize: 40, color, whiteSpace: 'nowrap' }}>{text}</div>
);

/* ------------------------------------------------------------------ */
/* The metallic face (Budapest bust, CC BY-SA 4.0 Elekes Andor)        */
/* Shared by the hook (frame 0) and the loop (last frame).             */
/* ------------------------------------------------------------------ */
export const FACE = { top: 200, h: 820, eyeY: 216 }; // eye line inside the face box
export const Face: React.FC<{ scale: number; barX: number; opacity?: number }> = ({ scale, barX, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: FACE.top, width: W, height: FACE.h, opacity, transform: `scale(${scale})`, transformOrigin: `50% ${FACE.eyeY}px`, WebkitMaskImage: 'radial-gradient(ellipse 52% 58% at 50% 40%, #000 55%, transparent 100%)', maskImage: 'radial-gradient(ellipse 52% 58% at 50% 40%, #000 55%, transparent 100%)' }}>
    <Img src={staticFile('cicada01/s2-face2.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', filter: 'contrast(1.2) brightness(0.92)' }} />
    {/* amber metal: a soft-light wash so the bronze reads as Bitcoin amber */}
    <AbsoluteFill style={{ background: 'linear-gradient(160deg, rgba(247,147,26,0.55) 0%, rgba(247,147,26,0.15) 60%, rgba(0,240,255,0.12) 100%)', mixBlendMode: 'soft-light' }} />
    {/* censor bar over the eyes */}
    <div style={{ position: 'absolute', left: 375 + barX, top: FACE.eyeY - 46, width: 330, height: 92, background: '#000', boxShadow: '0 0 0 2px #000, 0 10px 30px rgba(0,0,0,0.6)' }} />
  </div>
);

/* ------------------------------------------------------------------ */
/* Window chrome (modern dark terminal / mail client)                  */
/* ------------------------------------------------------------------ */
export const Window: React.FC<{ title: string; x: number; y: number; w: number; h: number; border?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, x, y, w, h, border = COL.border, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: '#0D1016', border: `1px solid ${border}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', ...style }}>
    <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: `1px solid ${COL.border}`, background: '#11151C' }}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      <div style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontWeight: 500, fontSize: 20, color: COL.muted, marginRight: 60 }}>{title}</div>
    </div>
    <div style={{ position: 'relative', padding: '26px 32px' }}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Transition: zoom + motion blur between cuts                         */
/* ------------------------------------------------------------------ */
const ZoomBlur: React.FC<TransitionPresentationComponentProps<Record<string, unknown>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const entering = presentationDirection === 'entering';
  const scale = entering ? 1.18 - 0.18 * p : 1 - 0.08 * p;
  const blur = entering ? 16 * (1 - p) : 16 * p;
  return <AbsoluteFill style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity: entering ? p : 1 - p }}>{children}</AbsoluteFill>;
};
export const zoomBlur = (): TransitionPresentation<Record<string, unknown>> => ({ component: ZoomBlur, props: {} });

/* ================================================================== */
/* CINEMATIC LAYER: no flat screens. Everything lives in lit 3D space. */
/* ================================================================== */

/** Virtual camera: the whole stage sits in perspective and drifts continuously (handheld-steady, never still). */
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

/**
 * Full-bleed photograph treated like a film plate: black-and-white, aggressive ken burns, amber rim light from the left,
 * cyan from the right, optional depth-of-field blur. Children ride the same transform (e.g. a censor bar on the eyes).
 */
export const Plate: React.FC<{ file: string; pos?: string; scale: number; x?: number; y?: number; rot?: number; blur?: number; bright?: number; origin?: string; opacity?: number; children?: React.ReactNode }> = ({ file, pos = '50% 50%', scale, x = 0, y = 0, rot = 0, blur = 0, bright = 0.85, origin = '50% 50%', opacity = 1, children }) => (
  <AbsoluteFill style={{ overflow: 'hidden', opacity }}>
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`, transformOrigin: origin, filter: blur ? `blur(${blur}px)` : undefined }}>
      <Img src={staticFile(file)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: `grayscale(1) contrast(1.28) brightness(${bright})` }} />
      {/* rim light: amber key from the left, cyan kicker from the right */}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(247,147,26,0.55) 0%, rgba(247,147,26,0) 38%, rgba(0,240,255,0) 66%, rgba(0,240,255,0.4) 100%)', mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(160deg, rgba(247,147,26,0.35) 0%, rgba(7,8,10,0) 45%)', mixBlendMode: 'soft-light' }} />
      {children}
    </AbsoluteFill>
    {/* floor of darkness under the type */}
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(7,8,10,0.55) 0%, rgba(7,8,10,0) 18%, rgba(7,8,10,0) 46%, rgba(7,8,10,0.9) 68%, rgba(7,8,10,0.97) 100%)' }} />
  </AbsoluteFill>
);

/** Light dust in suspension at three depths: far ones small and soft, near ones big and out of focus. */
export const Dust: React.FC<{ amount?: number; count?: number }> = ({ amount = 1, count = 30 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: amount }}>
      {Array.from({ length: count }, (_, i) => {
        const z = rnd(i * 3.3); // 0 far … 1 near
        const size = 2 + 10 * z * z;
        const x = (rnd(i * 1.7) * W + Math.sin(t * (0.2 + z) + i) * 30 * (1 + z)) % W;
        const y = ((rnd(i * 5.1) * H - t * (12 + 50 * z)) % H + H) % H;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i) * 1.4) + i));
        const c = i % 4 === 0 ? COL.cyan : COL.amber;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: c, opacity: (0.18 + 0.4 * (1 - z)) * tw * (1 - 0.4 * z), boxShadow: `0 0 ${6 + 14 * z}px ${3 * z}px ${c}` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Animated film grain + cinematic vignette over everything. */
export const FilmFinish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Img src={staticFile(`cicada01/grain${(f % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)' }} />
    </AbsoluteFill>
  );
};

/** A holographic object floating in depth: perspective tilt, slow float, multi-layer volumetric shadow. */
export const Float3D: React.FC<{ x: number; y: number; rx?: number; ry?: number; rz?: number; z?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, rx = 0, ry = 0, rz = 0, z = 0, blur = 0, children, style }) => {
  const f = useCurrentFrame();
  const fl = Math.sin(f / 22) * 10;
  return (
    <div style={{ position: 'absolute', left: x, top: y, perspective: 1200, ...style }}>
      <div style={{ transformStyle: 'preserve-3d', transform: `translate(-50%, -50%) translateY(${fl}px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, filter: blur ? `blur(${blur}px)` : undefined }}>{children}</div>
    </div>
  );
};

/* ================================================================== */
/* Word-synced captions (house style: palabra a palabra).              */
/* ================================================================== */
type CapWord = { text: string; s: number; e: number };
type CapGroup = { start: number; end: number; words: CapWord[] };

export const Captions: React.FC<{ caps: CapGroup[] }> = ({ caps }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = caps.find((g) => t >= g.start && t < g.end);
  if (!c) return null;
  const text = c.words.map((w) => w.text).join(' ');
  const size = Math.min(58, Math.floor(920 / (text.length * 0.56)));
  const pop = Math.exp(-(t - c.start) / 0.09);
  return (
    <div style={{ position: 'absolute', left: SAFE.x, right: SAFE.x, top: SAFE_BOTTOM_Y - 70, textAlign: 'center', transform: `scale(${1 + 0.08 * pop})` }}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.03 && t < w.e + 0.06;
        return (
          <span key={i} style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color: on ? COL.amber : COL.white, letterSpacing: 1, marginRight: i < c.words.length - 1 ? '0.3em' : 0, textShadow: on ? '0 0 16px rgba(247,147,26,0.7), 0 4px 14px rgba(0,0,0,0.95)' : '0 4px 14px rgba(0,0,0,0.95)' }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
