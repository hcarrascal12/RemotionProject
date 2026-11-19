import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { rand } from '../components/motion';
import warpP1 from './warp-p1.json';
import capsP1 from './captions-p1.json';

// "Sin resolver #01", Cicada 3301: real images, cut as a classified case file. Identity of the series:
//  - a case-file HUD on every frame (CASO Nº 01, ESTADO: SIN RESOLVER, a REC counter, viewfinder corners);
//  - bone-white Anton titles with one blood-red word, revealed by a redaction bar that wipes away;
//  - Special Elite (typewriter) for labels and transcripts;
//  - cold monochrome photos, crimson for the tree and the negatives; dust, scratches, grain, flicker;
//  - cuts through black frames and static, and single subliminal frames.
// Images: canal/no-presiones/sin-resolver-01/IMAGENES-Y-LICENCIAS.md. Sound: tools/cicada01_audio.py (same clock).

export const CICADA01 = { fps: 30, width: 1080, height: 1920, duration: 35 };

const TITLE = 'SR Anton';
const TYPE = 'SR Elite';
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
loadFont({ family: TITLE, url: staticFile('fonts/anton.woff2') });
loadFont({ family: TYPE, url: staticFile('fonts/special-elite.woff2') });

const C = { bg: '#050505', bone: '#E8E2D4', red: '#D0101E', blood: '#8A0A12', dim: '#8C877C' };
const CL = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const lin = (t: number, a: number, b: number, x = 0, y = 1) => interpolate(t, [a, b], [x, y], CL);
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeInOut = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
const FPS = CICADA01.fps;
const pop = (f: number, at: number) => spring({ frame: f - Math.round(at * FPS), fps: FPS, config: { stiffness: 260, damping: 18, mass: 0.6 } });
const src = (n: string) => staticFile(`cicada01/${n}`);

// ---------------------------------------------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------------------------------------------

const Bg: React.FC<{ n: string; t: number; dim?: number }> = ({ n, t, dim = 0 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <Img src={src(`bgm-${n}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 + 0.02 * t})` }} />
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
  </AbsoluteFill>
);

const Pic: React.FC<{ file: string; w: number; cx?: number; cy?: number; scale?: number; dx?: number; dy?: number; rot?: number; opacity?: number; frame?: boolean }> = ({
  file, w, cx = 540, cy = 780, scale = 1, dx = 0, dy = 0, rot = 0, opacity = 1, frame = true,
}) => (
  <div style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`, opacity }}>
    <Img src={src(file)} style={{ width: w, display: 'block', boxShadow: frame ? '0 40px 120px rgba(0,0,0,0.95)' : undefined, outline: frame ? `2px solid rgba(232,226,212,0.25)` : undefined }} />
  </div>
);

/** Slice glitch in red and bone. */
const Slices: React.FC<{ file: string; w: number; cx?: number; cy?: number; k: number; seed: number; scale?: number }> = ({ file, w, cx = 540, cy = 780, k, seed, scale = 1 }) => {
  if (k <= 0.01) return null;
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * 100;
        const off = (rand(seed * 31 + i * 7) - 0.5) * 160 * k;
        return (
          <div key={i} style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) translate(${off}px, 0) scale(${scale})`, clipPath: `inset(${a}% 0 ${100 - a - 12.5}% 0)` }}>
            <Img src={src(file)} style={{ width: w, display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: i % 2 ? 'rgba(208,16,30,0.45)' : 'transparent' }} />
          </div>
        );
      })}
    </>
  );
};

/** Film: grain, dust and scratches, scanlines, a heavy vignette and a slow light breathing. */
const Film: React.FC<{ f: number }> = ({ f }) => {
  const breath = 0.06 * Math.sin(f / 9) + (rand(Math.floor(f / 2)) > 0.93 ? 0.12 : 0);
  return (
    <>
      <Img src={src(`grain${(f % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09 }} />
      <Img src={src(`dust${(Math.floor(f / 2) % 6) + 1}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }} />
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 5px)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.92) 100%)' }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${Math.max(0, breath)})` }} />
    </>
  );
};

/** The case-file HUD: the series' identity on every frame. */
const Hud: React.FC<{ f: number; part?: string }> = ({ f, part }) => {
  const t = f / FPS;
  const rec = Math.floor(t * 2) % 2 === 0;
  const tc = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t) % 60).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path d={`M ${x} ${y + 70 * sy} L ${x} ${y} L ${x + 70 * sx} ${y}`} fill="none" stroke={C.bone} strokeOpacity={0.55} strokeWidth={4} />
  );
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {corner(44, 252, 1, 1)}
        {corner(1036, 252, -1, 1)}
        {corner(44, 1568, 1, -1)}
        {corner(1036, 1568, -1, -1)}
      </svg>
      <div style={{ position: 'absolute', left: 72, top: 270, fontFamily: TYPE, fontSize: 30, color: C.bone, opacity: 0.85, letterSpacing: 1 }}>CASO Nº 01 · CICADA 3301</div>
      <div style={{ position: 'absolute', right: 72, top: 270, fontFamily: TYPE, fontSize: 30, color: C.red, letterSpacing: 1 }}>SIN RESOLVER</div>
      {part ? <div style={{ position: 'absolute', right: 72, top: 310, fontFamily: TYPE, fontSize: 30, color: C.bone, letterSpacing: 1 }}>{part}</div> : null}
      <div style={{ position: 'absolute', left: 72, top: 1546, fontFamily: MONO, fontSize: 28, color: C.bone, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, background: rec ? C.red : 'transparent', display: 'inline-block' }} />
        REC {tc}
      </div>
      <div style={{ position: 'absolute', right: 72, top: 1546, fontFamily: MONO, fontSize: 28, color: C.bone, opacity: 0.6 }}>04.01.2012</div>
    </>
  );
};

/** Title in Anton: revealed by a redaction bar that wipes off to the right; trembles a pixel; flickers now and then. */
const Title: React.FC<{ f: number; at: number; y: number; size?: number; color?: string; children: string; still?: boolean }> = ({ f, at, y, size: size0 = 120, color = C.bone, children, still = false }) => {
  const t = f / FPS;
  if (!still && t < at) return null;
  const size = Math.min(size0, Math.floor(960 / (children.length * 0.47)));
  const p = still ? 1 : easeOut((t - at) / 0.28);
  const jx = (rand(f * 13 + y) - 0.5) * 2.5;
  const flick = rand(Math.floor(f / 1) * 7 + y) > 0.975 ? 0.35 : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', whiteSpace: 'nowrap', transform: `translate(${jx}px, 0)`, opacity: flick }}>
      <span style={{ position: 'relative', display: 'inline-block', fontFamily: TITLE, fontSize: size, lineHeight: 1.08, color, letterSpacing: 2, textShadow: '0 0 30px rgba(0,0,0,0.95), 0 6px 0 #000', textTransform: 'uppercase' }}>
        {children}
        {p < 1 ? <span style={{ position: 'absolute', top: '8%', bottom: '4%', right: 0, width: `${(1 - p) * 104}%`, background: p < 0.02 ? C.red : '#000' }} /> : null}
      </span>
    </div>
  );
};

/** Typewriter label (Special Elite). */
const Typed: React.FC<{ f: number; at: number; y: number; text: string; size?: number; color?: string; cps?: number; x?: number; align?: 'left' | 'center' }> = ({ f, at, y, text, size = 40, color = C.bone, cps = 24, x = 72, align = 'center' }) => {
  const t = f / FPS;
  if (t < at) return null;
  const n = Math.floor((t - at) * cps);
  const s = text.slice(0, n);
  const cur = n < text.length + 8 && Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, fontFamily: TYPE, fontSize: size, color, textShadow: '0 3px 14px #000', whiteSpace: 'pre' }}>
      {s}
      <span style={{ color: C.red, opacity: cur ? 1 : 0 }}>▌</span>
    </div>
  );
};

/** A red rubber stamp. */
const Stamp: React.FC<{ f: number; at: number; x?: number; y: number; rot?: number; size?: number; children: string; color?: string }> = ({ f, at, x = 540, y, rot = -6, size = 74, children, color = C.red }) => {
  const k = pop(f, at);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1.8 - 0.8 * Math.min(1.03, k)})`, opacity: Math.min(0.92, k * 2) }}>
      <div style={{ border: `7px double ${color}`, padding: '4px 26px', fontFamily: TITLE, fontSize: size, color, letterSpacing: 6, whiteSpace: 'nowrap', textTransform: 'uppercase', mixBlendMode: 'normal' }}>{children}</div>
    </div>
  );
};

type CapWord = { text: string; s: number; e: number };
type Cap = { start: number; end: number; words: CapWord[] };

/** The full caption track: 1-3 words at a time, timed to the voice word by word; the word being said is red. */
const Captions: React.FC<{ caps: Cap[]; t: number }> = ({ caps, t }) => {
  const c = caps.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  const text = c.words.map((w) => w.text).join(' ');
  const size = Math.min(76, Math.floor(980 / (text.length * 0.47)));
  const k = Math.exp(-(t - c.start) / 0.09);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1428, textAlign: 'center', whiteSpace: 'nowrap', transform: `scale(${1 + 0.1 * k})` }}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.03 && t < w.e + 0.05;
        return (
          <span key={i} style={{ fontFamily: TITLE, fontSize: size, color: on ? C.red : C.bone, letterSpacing: 2, marginRight: i < c.words.length - 1 ? '0.28em' : 0, WebkitTextStroke: `${Math.round(size / 9)}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.95)' }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------------------------------------------

type Seg = { start: number; end: number; draw: (lt: number, f: number) => React.ReactNode };

const SEGS: Seg[] = [
  // 1. Hook (frame 0 = thumbnail and loop target).
  {
    start: 0, end: 3.2, draw: (t, f) => {
      const g = (t > 0.04 && t < 0.2) || (t > 1.6 && t < 1.74) ? 1 : 0;
      return (
        <>
          <Bg n="msg" t={t} dim={0.35} />
          <Pic file="mono-msg.png" w={860} cy={760} scale={1.03 + 0.05 * t} />
          <Slices file="mono-msg.png" w={860} cy={760} k={g} seed={f} scale={1.03 + 0.05 * t} />
          <Title f={f} at={0} y={1140} size={130} still>EL ACERTIJO</Title>
          <Title f={f} at={0} y={1275} size={130} color={C.red} still>QUE NADIE RESOLVIÓ</Title>
        </>
      );
    },
  },
  // 2. The human stake.
  {
    start: 3.2, end: 5.6, draw: (t, f) => (
      <>
        <Bg n="msg" t={t} dim={0.6} />
        <Pic file="mono-msg.png" w={860} cy={780} scale={1.7 + 0.15 * t} opacity={0.4} frame={false} />
        <Title f={f} at={3.3} y={720} size={150}>MILES DE PERSONAS</Title>
        <Title f={f} at={3.95} y={890} size={110}>PASARON AÑOS</Title>
        <Title f={f} at={4.55} y={1020} size={110} color={C.red}>INTENTANDO RESOLVERLO</Title>
      </>
    ),
  },
  // 3. The date.
  {
    start: 5.6, end: 7.6, draw: (t, f) => {
      const g = t < 0.3 ? 1 - t / 0.3 : 0;
      const flick = t > 0.3 && rand(Math.floor(t * 15)) > 0.88 ? 0.35 : 1;
      return (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Pic file="mono-logo.png" w={820} cy={700} scale={1 + 0.04 * t} opacity={flick} frame={false} />
          <Slices file="mono-logo.png" w={820} cy={700} k={g} seed={f + 99} />
          <Typed f={f} at={5.75} y={930} text="UN FORO ANÓNIMO" size={44} />
          <Stamp f={f} at={6.2} y={1180} size={96}>4 · ENE · 2012</Stamp>
        </>
      );
    },
  },
  // 4. The forum (today's front page, labelled).
  {
    start: 7.6, end: 10.4, draw: (t, f) => (
      <>
        <Bg n="chan" t={t} dim={0.55} />
        <Pic file="mono-chan.png" w={1000} cy={760} scale={1.02 + 0.1 * easeInOut(t / 2.8)} dy={-40 * easeInOut(t / 2.8)} opacity={0.45} />
        <div style={{ position: 'absolute', left: 70, top: 345, background: 'rgba(0,0,0,0.82)', padding: '6px 16px', fontFamily: TYPE, fontSize: 32, color: C.bone }}>[ 4chan · captura actual ]</div>
        <Title f={f} at={7.9} y={1164} size={112}>UNA IMAGEN ANÓNIMA</Title>
        <Title f={f} at={8.6} y={1294} size={112} color={C.red}>APARECIÓ EN UN FORO</Title>
      </>
    ),
  },
  // 5. The transcript.
  {
    start: 10.4, end: 14.0, draw: (t, f) => {
      const lines = ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.'];
      let budget = Math.max(0, t - 0.2) * 22;
      const cursor = Math.floor(t * 3) % 2 === 0;
      return (
        <>
          <Bg n="msg" t={t} dim={0.7} />
          <div style={{ position: 'absolute', left: 70, right: 70, top: 440, height: 600, background: 'rgba(14,12,10,0.94)', border: `2px solid rgba(232,226,212,0.35)`, boxShadow: '0 40px 120px #000' }} />
          <div style={{ position: 'absolute', left: 110, right: 110, top: 470, fontFamily: TYPE, fontSize: 28, color: C.dim, display: 'flex', justifyContent: 'space-between' }}>
            <span>TRANSCRIPCIÓN</span><span>FIRMA: ████</span>
          </div>
          <div style={{ position: 'absolute', left: 110, right: 110, top: 515, height: 2, background: 'rgba(232,226,212,0.25)' }} />
          {lines.map((l, i) => {
            const s = l.slice(0, Math.max(0, Math.floor(budget)));
            budget -= l.length + 2;
            const typing = s.length > 0 && s.length < l.length;
            return (
              <div key={i} style={{ position: 'absolute', left: 110, top: 560 + i * 105, fontFamily: TYPE, fontSize: 70, color: C.bone }}>
                {s}
                <span style={{ color: C.red, opacity: typing && cursor ? 1 : 0 }}>▌</span>
              </div>
            );
          })}
          <Title f={f} at={13.0} y={1110} size={74}>«BUSCAMOS PERSONAS</Title>
          <Title f={f} at={13.15} y={1200} size={74} color={C.red}>MUY INTELIGENTES»</Title>
        </>
      );
    },
  },
  // 6. The signature.
  {
    start: 14.0, end: 16.0, draw: (t, f) => {
      const k = pop(f, 14.0);
      const sh = t < 0.5 ? (1 - t / 0.5) * 44 : 2;
      const sx = (rand(f * 3) - 0.5) * sh;
      const sy = (rand(f * 5 + 1) - 0.5) * sh;
      const s = 2.4 - 1.4 * Math.min(1.03, k);
      const num = (dx: number, color: string, op: number) => (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', transform: `translate(${dx + sx}px, ${sy}px) scale(${s})`, opacity: op }}>
          <span style={{ fontFamily: TITLE, fontSize: 420, color, letterSpacing: 4 }}>3301</span>
        </div>
      );
      return (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Pic file="neg-msg.png" w={860} cy={800} scale={2.8 + 0.2 * t} opacity={0.22} frame={false} />
          <Typed f={f} at={14.05} y={500} text="FIRMA:" size={46} color={C.dim} />
          {num(-14, C.red, 0.9)}
          {num(14, '#2B6F7A', 0.6)}
          {num(0, C.bone, 1)}
          <Title f={f} at={14.6} y={1170} size={84}>UN NÚMERO.</Title>
          <Title f={f} at={15.05} y={1275} size={84} color={C.red}>NADA MÁS.</Title>
        </>
      );
    },
  },
  // 7. The hidden message.
  {
    start: 16.0, end: 18.6, draw: (t, f) => {
      const top = 340;
      const h = 860 * (503 / 509);
      const scan = top + h * easeOut(t / 1.7);
      return (
        <>
          <Bg n="msg" t={t} dim={0.55} />
          <Pic file="mono-msg.png" w={860} cy={top + h / 2} />
          <div style={{ position: 'absolute', left: 110, width: 860, top, height: Math.max(0, scan - top), background: 'rgba(10,0,2,0.8)', overflow: 'hidden' }}>
            {Array.from({ length: 13 }, (_, r) => (
              <div key={r} style={{ fontFamily: MONO, fontSize: 38, color: r % 4 === 2 ? C.red : C.bone, opacity: 0.9, marginLeft: 26, lineHeight: '64px' }}>
                {Array.from({ length: 20 }, (_, c) => (rand(r * 29 + c * 5 + Math.floor(t * 4)) > 0.5 ? '1' : '0')).join('')}
              </div>
            ))}
          </div>
          {scan < top + h - 2 ? <div style={{ position: 'absolute', left: 110, width: 860, top: scan - 4, height: 8, background: C.red, boxShadow: '0 0 50px #D0101E' }} /> : null}
          <Title f={f} at={16.15} y={1165} size={104}>DENTRO HABÍA UN</Title>
          <Title f={f} at={16.7} y={1285} size={120} color={C.red}>MENSAJE OCULTO</Title>
        </>
      );
    },
  },
  // 8. Lead 1: a book.
  {
    start: 18.6, end: 20.2, draw: (t, f) => (
      <>
        <Bg n="liber" t={t} dim={0.7} />
        <Pic file="mono-liber.png" w={540} cy={700} rot={-5 + 2 * t} scale={1.0 + 0.06 * t} dy={30 * (1 - easeOut(t / 0.4))} />
        <Typed f={f} at={18.7} y={1150} text="PISTA 1" size={44} color={C.dim} cps={30} />
        <Stamp f={f} at={18.9} y={1290} rot={-7} size={100}>UN LIBRO</Stamp>
      </>
    ),
  },
  // 9. Lead 2: coordinates.
  {
    start: 20.2, end: 21.6, draw: (t, f) => {
      const tile = 1078;
      const r = 260 - 140 * easeOut(t / 0.6);
      const lock = t > 0.6;
      const col = lock ? C.red : C.bone;
      return (
        <>
          <Bg n="cities" t={t} dim={0.55} />
          <div style={{ position: 'absolute', left: 1, top: 330, width: tile, height: 880, overflow: 'hidden', opacity: 0.85 }}>
            <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: 0, top: 0, height: 900, transform: `scale(${1 + 0.05 * t})`, transformOrigin: '20% 50%' }} />
          </div>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <circle cx={540} cy={720} r={r} fill="none" stroke={col} strokeWidth={5} />
            <line x1={540} y1={720 - r - 60} x2={540} y2={720 + r + 60} stroke={col} strokeWidth={3} />
            <line x1={540 - r - 60} y1={720} x2={540 + r + 60} y2={720} stroke={col} strokeWidth={3} />
          </svg>
          <Typed f={f} at={20.25} y={1228} text={lock ? 'LAT ??.????  ·  LON ??.????' : 'TRIANGULANDO…'} size={40} color={col} cps={60} />
          <Typed f={f} at={20.3} y={1290} text="PISTA 2" size={44} color={C.dim} cps={30} />
          <Stamp f={f} at={20.5} y={1405} rot={5} size={86}>COORDENADAS</Stamp>
        </>
      );
    },
  },
  // 10. Lead 3: posters in several cities (snap pans).
  {
    start: 21.6, end: 25.0, draw: (t, f) => {
      const tile = 1078;
      const step = Math.min(3, Math.floor(t / 0.85));
      const within = t - step * 0.85;
      const x = -tile * (step + easeInOut(Math.min(1, within / 0.25)));
      const blur = within < 0.22 ? 7 : 0;
      return (
        <>
          <Bg n="cities" t={t} dim={0.6} />
          <div style={{ position: 'absolute', left: 1, top: 330, width: tile, height: 900, overflow: 'hidden' }}>
            <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: x, top: 0, height: 900, filter: blur ? `blur(${blur}px)` : undefined }} />
          </div>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            {within > 0.3 ? <circle cx={540} cy={660} r={18 + 9 * Math.abs(Math.sin(t * 7))} fill={C.red} stroke="#000" strokeWidth={4} /> : null}
          </svg>
          <Typed f={f} at={21.65} y={1160} text="PISTA 3" size={44} color={C.dim} cps={30} />
          <Title f={f} at={21.8} y={1196} size={96}>CARTELES CON CÓDIGOS QR</Title>
          <Title f={f} at={22.45} y={1311} size={96} color={C.red}>EN VARIAS CIUDADES</Title>
        </>
      );
    },
  },
  // 11. Three rounds, then nothing.
  {
    start: 25.0, end: 29.0, draw: (t, f) => {
      const yr = (at: number, x: number, label: string) => {
        const k = pop(f, at);
        return k <= 0.001 ? null : (
          <div style={{ position: 'absolute', left: x, top: 770, transform: `translate(-50%, 0) scale(${1.5 - 0.5 * Math.min(1, k)})`, opacity: Math.min(1, k * 2), textAlign: 'center' }}>
            <div style={{ fontFamily: TITLE, fontSize: 120, color: C.bone, textShadow: '0 6px 0 #000' }}>{label}</div>
            <div style={{ fontFamily: TYPE, fontSize: 26, color: C.dim }}>RONDA</div>
          </div>
        );
      };
      const q = pop(f, 27.0);
      return (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 140, width: 1200, opacity: 0.75, transform: `scale(${1.05 + 0.05 * t})` }} />
          {yr(25.3, 250, '2012')}
          {yr(25.9, 540, '2013')}
          {yr(26.5, 830, '2014')}
          {q > 0.001 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${1.6 - 0.6 * Math.min(1, q)})`, opacity: Math.min(1, q * 2) }}>
              <span style={{ fontFamily: TITLE, fontSize: 400, lineHeight: 1, color: C.red, textShadow: '0 0 60px rgba(208,16,30,0.6)' }}>?</span>
            </div>
          ) : null}
          <Title f={f} at={27.1} y={1187} size={100}>NADIE HA CONFIRMADO</Title>
          <Title f={f} at={27.6} y={1307} size={100} color={C.red}>QUIÉN ESTABA DETRÁS</Title>
        </>
      );
    },
  },
  // 12. The theories (two fast cuts).
  {
    start: 29.0, end: 32.0, draw: (t, f) => {
      const first = t < 1.5;
      const lt = first ? t : t - 1.5;
      const g = lt < 0.18 ? 1 : 0;
      const strobe = !first && rand(Math.floor(f / 2) * 3) > 0.8 ? 0.25 : 0.6;
      return first ? (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Pic file="neg-msg.png" w={860} cy={780} scale={1.9 + 0.1 * lt} opacity={0.55} frame={false} />
          <Slices file="neg-msg.png" w={860} cy={780} k={g} seed={f + 7} scale={1.9} />
          <Title f={f} at={29.05} y={790} size={124}>¿UNA AGENCIA</Title>
          <Title f={f} at={29.2} y={930} size={124} color={C.red}>DE ESPIONAJE?</Title>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -220, top: 0, width: 1520, opacity: strobe, transform: `scale(${1.25 + 0.05 * lt})` }} />
          <Title f={f} at={30.55} y={850} size={140}>¿UN EXPERIMENTO?</Title>
        </>
      );
    },
  },
  // 13. The open question and the series card.
  {
    start: 32.0, end: 35.0, draw: (t, f) => (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 140, width: 1200, opacity: 0.3 }} />
        <Title f={f} at={32.1} y={600} size={150}>¿TÚ QUÉ</Title>
        <Title f={f} at={32.35} y={770} size={190} color={C.red}>CREES?</Title>
        <Typed f={f} at={32.9} y={1010} text="EL CASO SIGUE ABIERTO" size={42} cps={30} />
        <Stamp f={f} at={33.3} y={1230} rot={-4} size={96}>SIN RESOLVER · Nº 01</Stamp>
      </>
    ),
  },
];

// Part 1 ends on a cliffhanger after the hidden message: where did it lead?
const CLIFF: Seg = {
  start: 18.6, end: 22.2, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.32, transform: `scale(${1.05 + 0.04 * t})` }} />
      <Title f={f} at={18.75} y={600} size={170}>¿A DÓNDE</Title>
      <Title f={f} at={19.05} y={790} size={220} color={C.red}>LLEVABA?</Title>
      <Typed f={f} at={19.8} y={1060} text="CONTINUARÁ…" size={46} cps={20} />
      <Stamp f={f} at={20.4} y={1240} rot={-5} size={110}>PARTE 2</Stamp>
      <Typed f={f} at={20.9} y={1380} text="SÍGUEME PARA NO PERDÉRTELA" size={34} color={C.dim} cps={34} />
    </>
  ),
};

// ---------------------------------------------------------------------------------------------------------------
// Part 1 (about 50 s): the full cut's first shots re-timed, the whole original message, the search, a teaser of
// Part 2 and the cliffhanger. `shift` moves a shot to a new start (its marks move with it).
// ---------------------------------------------------------------------------------------------------------------

const shift = (sg: Seg, start: number, end: number, extra?: (t: number, f: number) => React.ReactNode): Seg => ({
  start, end, draw: (t, f) => (
    <>
      {sg.draw(t, f - Math.round((start - sg.start) * FPS))}
      {extra ? extra(t, f) : null}
    </>
  ),
});

/** A transcript card of the original message (typed), then its Spanish meaning as titles. */
export const transcriptTimes = (start: number, lines: string[], cps: number) => {
  const total = lines.reduce((a, l) => a + l.length + 2, 0);
  return { typeAt: start + 0.2, esAt: start + 0.2 + total / cps + 0.25 };
};
const transcript = (start: number, end: number, lines: string[], es: string[], cps: number): Seg => ({
  start, end, draw: (t, f) => {
    let budget = Math.max(0, t - 0.2) * cps;
    const cursor = Math.floor(t * 3) % 2 === 0;
    const { esAt } = transcriptTimes(start, lines, cps);
    return (
      <>
        <Bg n="msg" t={t} dim={0.7} />
        <div style={{ position: 'absolute', left: 70, right: 70, top: 420, height: 640, background: 'rgba(14,12,10,0.94)', border: '2px solid rgba(232,226,212,0.35)', boxShadow: '0 40px 120px #000' }} />
        <div style={{ position: 'absolute', left: 110, right: 110, top: 450, fontFamily: TYPE, fontSize: 28, color: C.dim, display: 'flex', justifyContent: 'space-between' }}>
          <span>TRANSCRIPCIÓN · 04/01/2012</span><span>FIRMA: ████</span>
        </div>
        <div style={{ position: 'absolute', left: 110, right: 110, top: 495, height: 2, background: 'rgba(232,226,212,0.25)' }} />
        {lines.map((l, i) => {
          const sx = l.slice(0, Math.max(0, Math.floor(budget)));
          budget -= l.length + 2;
          const typing = sx.length > 0 && sx.length < l.length;
          return (
            <div key={i} style={{ position: 'absolute', left: 110, top: 535 + i * 100, fontFamily: TYPE, fontSize: 62, color: C.bone }}>
              {sx}
              <span style={{ color: C.red, opacity: typing && cursor ? 1 : 0 }}>▌</span>
            </div>
          );
        })}
        {es.map((x, i) => (
          <Title key={i} f={f} at={esAt + i * 0.2} y={1110 + i * 92} size={74} color={i === es.length - 1 ? C.red : C.bone}>{x}</Title>
        ))}
      </>
    );
  },
});

export const P1_LINES = {
  a: ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.'],
  b: ['TO FIND THEM, WE HAVE', 'DEVISED A TEST.', 'THERE IS A MESSAGE', 'HIDDEN IN THIS IMAGE.'],
  c: ['WE LOOK FORWARD TO', 'MEETING THE FEW THAT', 'WILL MAKE IT ALL', 'THE WAY THROUGH.'],
};

const NADIE: Seg = {
  start: 6.2, end: 9.0, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <Pic file="neg-msg.png" w={860} cy={780} scale={1.4 + 0.1 * t} opacity={0.1} frame={false} />
      <Typed f={f} at={6.3} y={560} text="AUTOR: DESCONOCIDO" size={40} color={C.dim} cps={30} />
      <Title f={f} at={6.6} y={690} size={120}>NADIE HA CONFIRMADO</Title>
      <Title f={f} at={7.0} y={830} size={140}>QUIÉN LO CREÓ</Title>
      <Title f={f} at={7.7} y={990} size={150} color={C.red}>NI PARA QUÉ</Title>
    </>
  ),
};

const SCAN2: Seg = {
  start: 30.6, end: 33.8, draw: (t, f) => {
    const top = 340;
    const h = 860 * (503 / 509);
    const scan = top + h * easeOut(t / 1.8);
    return (
      <>
        <Bg n="msg" t={t} dim={0.55} />
        <Pic file="mono-msg.png" w={860} cy={top + h / 2} />
        <div style={{ position: 'absolute', left: 110, width: 860, top, height: Math.max(0, scan - top), background: 'rgba(10,0,2,0.8)', overflow: 'hidden' }}>
          {Array.from({ length: 13 }, (_, r) => (
            <div key={r} style={{ fontFamily: MONO, fontSize: 38, color: r % 4 === 2 ? C.red : C.bone, opacity: 0.45, marginLeft: 26, lineHeight: '64px' }}>
              {Array.from({ length: 20 }, (_, c) => (rand(r * 29 + c * 5 + Math.floor(t * 4)) > 0.5 ? '1' : '0')).join('')}
            </div>
          ))}
        </div>
        {scan < top + h - 2 ? <div style={{ position: 'absolute', left: 110, width: 860, top: scan - 4, height: 8, background: C.red, boxShadow: '0 0 50px #D0101E' }} /> : null}
        <Title f={f} at={30.8} y={1176} size={110}>Y ERA VERDAD:</Title>
        <Title f={f} at={31.4} y={1296} size={110} color={C.red}>HABÍA ALGO ESCONDIDO</Title>
      </>
    );
  },
};

const SEARCH: Seg = {
  start: 33.8, end: 37.6, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * t + (t > 0.7 ? 0.12 * Math.exp(-(t - 0.7) / 0.15) : 0)})` }}>
      {Array.from({ length: 15 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const on = rand(i * 17 + Math.floor(f / 4)) > 0.18;
        return (
          <Img key={i} src={src('mono-msg.png')} style={{ position: 'absolute', left: 30 + col * 345, top: 300 + row * 250 - 30 * t, width: 330, height: 236, objectFit: 'cover', opacity: on ? 0.32 : 0.08, outline: '2px solid rgba(232,226,212,0.2)' }} />
        );
      })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.75) 20%, rgba(0,0,0,0.2) 80%)' }} />
      <Title f={f} at={34.0} y={720} size={140}>MILES EMPEZARON</Title>
      <Title f={f} at={34.5} y={880} size={170} color={C.red}>A BUSCAR</Title>
      <Typed f={f} at={35.2} y={1110} text="DÍA Y NOCHE" size={48} cps={20} />
    </>
  ),
};

const FOUND: Seg = {
  start: 37.6, end: 40.8, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      {t < 1.35 ? (
        <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.45, transform: `scale(${1.05 + 0.06 * t})` }} />
      ) : (
        <>
          <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.7, transform: `scale(${1.7 + 0.35 * (t - 1.35)})`, transformOrigin: '50% 35%' }} />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(208,16,30,${0.12 + 0.08 * Math.abs(Math.sin(t * 6))}) 0%, rgba(0,0,0,0) 60%)` }} />
        </>
      )}
      <Title f={f} at={37.8} y={740} size={130}>LO QUE ENCONTRARON</Title>
      <Title f={f} at={39.0} y={890} size={130} color={C.red}>LOS LLEVÓ MÁS LEJOS</Title>
    </>
  ),
};

const TEASER: Seg = {
  start: 40.8, end: 44.4, draw: (t, f) => {
    const k = Math.min(3, Math.floor(t / 0.9));
    const lt = t - k * 0.9;
    const punch = Math.exp(-lt / 0.1); // every element lands with a zoom punch
    const g = lt < 0.12 ? 1 : 0;
    const tile = 1078;
    const city = Math.min(4, Math.floor(lt / 0.18)); // "carteles por todo el mundo": a city every 0.18 s (plan clock)
    const cityLt = lt - city * 0.18;
    const labels = ['UN LIBRO…', 'COORDENADAS…', 'CARTELES EN EL MUNDO…', 'Y ALGO MÁS.'];
    const r = 240 - 110 * easeOut(lt / 0.35);
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{ transform: `scale(${1 + 0.16 * punch + 0.05 * lt})` }}>
          {k === 0 ? (
            <>
              <Pic file="mono-liber.png" w={520} cy={760} rot={-5 + 3 * lt} />
              <Slices file="mono-liber.png" w={520} cy={760} k={g} seed={f} />
            </>
          ) : null}
          {k === 1 ? (
            <>
              <div style={{ position: 'absolute', left: 1, top: 330, width: tile, height: 880, overflow: 'hidden', opacity: 0.85 }}>
                <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: 0, top: 0, height: 900 }} />
              </div>
              <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
                <circle cx={540} cy={720} r={r} fill="none" stroke={C.red} strokeWidth={5} />
                <line x1={540} y1={720 - r - 60} x2={540} y2={720 + r + 60} stroke={C.red} strokeWidth={3} />
                <line x1={540 - r - 60} y1={720} x2={540 + r + 60} y2={720} stroke={C.red} strokeWidth={3} />
              </svg>
            </>
          ) : null}
          {k === 2 ? (
            <div style={{ position: 'absolute', left: 1, top: 330, width: tile, height: 900, overflow: 'hidden', transform: `scale(${1 + 0.1 * Math.exp(-cityLt / 0.06)})` }}>
              <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: -tile * city, top: 0, height: 900 }} />
            </div>
          ) : null}
          {k === 3 ? (
            <>
              <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -200, top: 60, width: 1480, opacity: 0.6, transform: `scale(${1.1 + 0.05 * lt})` }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: TITLE, fontSize: 380, color: C.red, opacity: 0.9 }}>?</div>
            </>
          ) : null}
        </AbsoluteFill>
        {(g && k > 0) || (k === 2 && cityLt < 0.04) ? <AbsoluteFill style={{ background: 'rgba(208,16,30,0.28)' }} /> : null}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 372, display: 'flex', justifyContent: 'center' }}><div style={{ background: 'rgba(0,0,0,0.85)', padding: '6px 22px', fontFamily: TYPE, fontSize: 40, color: C.red }}>EN LA PARTE 2</div></div>
        <Typed key={k} f={f} at={40.9 + k * 0.9} y={1250} text={labels[k]} size={56} cps={40} />
      </>
    );
  },
};

// The verified ending (voice v2): 2012's real book code, the coordinates, the posters on poles in Paris, Warsaw and
// Miami, each with a QR code and a cicada; then "who put them up?". Plan clock = film clock - 5.82 s from 40.8 on.
const BOOK_CODE = '1:20  2:3  3:5  4:20  5:5  6:53  7:1  8:8  9:2  10:4  11:8  12:4  13:13';

const LIST: Seg = {
  start: 40.8, end: 43.36, draw: (t, f) => {
    const k = t < 1.16 ? 0 : 1;
    const lt = k === 0 ? t : t - 1.16;
    const punch = Math.exp(-lt / 0.1);
    const r = 240 - 110 * easeOut(lt / 0.35);
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{ transform: `scale(${1 + 0.14 * punch + 0.04 * lt})` }}>
          {k === 0 ? (
            <>
              <Pic file="mono-msg.png" w={860} cy={760} opacity={0.22} frame={false} />
              <div style={{ position: 'absolute', left: 90, right: 90, top: 520, fontFamily: TYPE, fontSize: 58, lineHeight: 1.5, color: C.bone, textAlign: 'center', textShadow: '0 4px 18px #000' }}>
                {BOOK_CODE.slice(0, Math.floor(lt * 60))}
              </div>
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', left: 1, top: 330, width: 1078, height: 880, overflow: 'hidden', opacity: 0.85 }}>
                <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: 0, top: 0, height: 900 }} />
              </div>
              <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
                <circle cx={540} cy={720} r={r} fill="none" stroke={C.red} strokeWidth={5} />
                <line x1={540} y1={720 - r - 60} x2={540} y2={720 + r + 60} stroke={C.red} strokeWidth={3} />
                <line x1={540 - r - 60} y1={720} x2={540 + r + 60} y2={720} stroke={C.red} strokeWidth={3} />
              </svg>
            </>
          )}
        </AbsoluteFill>
        {lt < 0.05 && k === 1 ? <AbsoluteFill style={{ background: 'rgba(208,16,30,0.28)' }} /> : null}
        <Typed key={k} f={f} at={k === 0 ? 40.85 : 42.0} y={1250} text={k === 0 ? 'UN CÓDIGO DE LIBRO…' : 'COORDENADAS…'} size={56} cps={40} />
      </>
    );
  },
};

const REAL: Seg = {
  start: 43.36, end: 46.34, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <div style={{ position: 'absolute', left: 1, top: 300, width: 1078, height: 880, overflow: 'hidden', opacity: 0.8 }}>
        <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: 0, top: 0, height: 900, transform: `scale(${1 + 0.35 * easeInOut(t / 2.8)})`, transformOrigin: '50% 45%' }} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={540} cy={720} r={130 - 30 * easeOut(t / 1.5)} fill="none" stroke={C.red} strokeWidth={5} />
      </svg>
      <Title f={f} at={43.5} y={1228} size={84}>LLEVABAN A ALGO</Title>
      <Title f={f} at={45.14} y={1300} size={104} color={C.red}>REAL</Title>
    </>
  ),
};

const POSTERS: Seg = {
  start: 46.34, end: 50.36, draw: (t, f) => {
    const T = 46.34 + t;
    const city = T < 48.52 ? 0 : T < 49.46 ? 1 : 2; // París, Varsovia, Miami: each on its word
    const since = T - [47.86, 48.52, 49.46][city];
    const punch = since > 0 ? Math.exp(-since / 0.08) : 0;
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <div style={{ position: 'absolute', left: 1, top: 285, width: 1078, height: 900, overflow: 'hidden', transform: `scale(${1 + 0.1 * punch + 0.02 * since})` }}>
          <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: -1078 * city, top: 0, height: 900, opacity: T < 47.86 ? 0.55 : 1 }} />
          {T >= 47.86 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 806, height: 94, background: '#D9D4C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TITLE, fontSize: 70, color: '#111', letterSpacing: 6 }}>
              {['PARÍS', 'VARSOVIA', 'MIAMI'][city]}
            </div>
          ) : null}
        </div>
        {punch > 0.6 ? <AbsoluteFill style={{ background: 'rgba(208,16,30,0.25)' }} /> : null}
        <Title f={f} at={46.4} y={1205} size={96}>CARTELES PEGADOS</Title>
        <Title f={f} at={46.95} y={1310} size={96} color={C.red}>EN POSTES</Title>
      </>
    );
  },
};

const QrArt: React.FC<{ size: number }> = ({ size }) => {
  const n = 25;
  const m = size / n;
  const cells: React.ReactNode[] = [];
  const finder = (r: number, c: number) => {
    for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      const rr = r - r0;
      const cc = c - c0;
      if (rr >= 0 && rr < 7 && cc >= 0 && cc < 7) return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0;
    }
    return -1;
  };
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const fv = finder(r, c);
      const on = fv === -1 ? rand(r * 37 + c * 11 + 5) > 0.5 : fv === 1;
      if (on) cells.push(<rect key={`${r}-${c}`} x={c * m} y={r * m} width={m + 0.5} height={m + 0.5} fill="#111" />);
    }
  return (
    <svg width={size + 40} height={size + 40} viewBox={`-20 -20 ${size + 40} ${size + 40}`}>
      <rect x={-20} y={-20} width={size + 40} height={size + 40} fill={C.bone} />
      {cells}
    </svg>
  );
};

const QR: Seg = {
  start: 50.36, end: 54.5, draw: (t, f) => {
    const k = pop(f, 50.36);
    const cic = t > 53.0 - 50.36;
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        {cic ? <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.55, transform: `scale(${1.1 + 0.05 * t})` }} /> : null}
        <div style={{ position: 'absolute', left: 540, top: 700, transform: `translate(-50%, -50%) rotate(-3deg) scale(${(0.7 + 0.3 * Math.min(1.05, k)) * (cic ? 0.75 : 1)})`, opacity: cic ? 0.5 : Math.min(1, k * 2), boxShadow: '0 40px 100px #000' }}>
          <QrArt size={460} />
        </div>
        <Typed f={f} at={50.5} y={400} text="[ recreación ]" size={32} color={C.dim} cps={40} />
        <Title f={f} at={51.5} y={1110} size={110}>UN CÓDIGO QR</Title>
        <Title f={f} at={53.0} y={1240} size={130} color={C.red}>Y UNA CIGARRA</Title>
      </>
    );
  },
};

const WHO: Seg = {
  start: 54.5, end: 60.5, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.32, transform: `scale(${1.05 + 0.03 * t})` }} />
      <Title f={f} at={54.55} y={600} size={190}>¿QUIÉN</Title>
      <Title f={f} at={54.86} y={800} size={190} color={C.red}>LOS PEGÓ?</Title>
      <Typed f={f} at={56.12} y={1060} text="CONTINUARÁ…" size={46} cps={20} />
      <Stamp f={f} at={57.22} y={1240} rot={-5} size={110}>PARTE 2</Stamp>
      <Typed f={f} at={57.9} y={1380} text="SÍGUEME PARA NO PERDÉRTELA" size={34} color={C.dim} cps={34} />
    </>
  ),
};

const P1_SEGS: Seg[] = [
  SEGS[0],
  shift(SEGS[1], 3.2, 6.2),
  NADIE,
  shift(SEGS[2], 9.0, 11.4),
  shift(SEGS[3], 11.4, 14.8),
  transcript(14.8, 18.8, P1_LINES.a, ['«BUSCAMOS PERSONAS', 'MUY INTELIGENTES»'], 22),
  transcript(18.8, 23.4, P1_LINES.b, ['«HAY UN MENSAJE', 'OCULTO EN ESTA IMAGEN»'], 32),
  transcript(23.4, 28.0, P1_LINES.c, ['«ESPERAMOS A LOS POCOS', 'QUE LLEGUEN AL FINAL»'], 32),
  shift(SEGS[5], 28.0, 30.6, (t, f) => <Typed f={f} at={28.05} y={415} text="GOOD LUCK. · «BUENA SUERTE»" size={36} color={C.dim} cps={40} />),
  SCAN2,
  SEARCH,
  FOUND,
  LIST,
  REAL,
  POSTERS,
  QR,
  WHO,
];

type CutSpec = { segs: Seg[]; duration: number; black: number[]; stat: number[]; sub: { at: number; file: string }[]; audio: string; part?: string; voice?: string; captions?: Cap[];
  /** Optional time map to a recorded voice: [plan time, film time] anchors; the film then lasts outDuration. */
  warp?: number[][]; outDuration?: number };

/** Piecewise-linear map through the anchors (index 0 -> 1 forward, 1 -> 0 inverse). */
const warpBy = (anchors: number[][], x: number, from: 0 | 1) => {
  const to = from === 0 ? 1 : 0;
  if (x <= anchors[0][from]) return anchors[0][to] + (x - anchors[0][from]);
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (x <= b[from]) return a[to] + ((x - a[from]) / (b[from] - a[from])) * (b[to] - a[to]);
  }
  const l = anchors[anchors.length - 1];
  return l[to] + (x - l[from]);
};

// Cuts through two black frames, cuts through static, and single subliminal frames.
const FULL: CutSpec = {
  segs: SEGS,
  duration: 35,
  black: [3.2, 7.6, 10.4, 16.0, 18.6, 20.2, 21.6, 32.0],
  stat: [5.6, 14.0, 25.0, 29.0, 30.5],
  sub: [{ at: 9.9, file: 'neg-msg.png' }, { at: 24.9, file: 'tree-dark.png' }, { at: 31.9, file: 'neg-msg.png' }],
  audio: 'cicada01/mix.wav',
};
const PART1: CutSpec = {
  segs: P1_SEGS,
  duration: 50,
  black: [3.2, 6.2, 11.4, 14.8, 30.6, 33.8, 40.8, 50.36, 54.5],
  stat: [9.0, 28.0, 37.6, 43.36],
  sub: [{ at: 13.9, file: 'neg-msg.png' }, { at: 33.5, file: 'tree-dark.png' }, { at: 40.5, file: 'neg-msg.png' }],
  audio: 'cicada01/mix-p1.wav',
  part: 'PARTE 1 / 3',
  warp: warpP1.anchors,
  outDuration: warpP1.duration,
  captions: capsP1.captions as Cap[],
};
export const CICADA01_P1 = { fps: FPS, width: 1080, height: 1920, duration: PART1.outDuration ?? PART1.duration };

const Cut: React.FC<{ spec: CutSpec }> = ({ spec }) => {
  const realF = useCurrentFrame();
  const W = spec.warp;
  // with a voice, the film clock (realF) runs through the time map; the shots are drawn on the plan clock (t, f)
  const fwd = (x: number) => (W ? warpBy(W, x, 0) : x);
  const t = W ? Math.max(0, warpBy(W, realF / FPS, 1)) : realF / FPS;
  const f = W ? Math.round(t * FPS) : realF;
  const S = spec.segs;
  const seg = S.find((s) => t >= s.start && t < s.end) ?? S[S.length - 1];
  const lt = t - seg.start;
  const D = spec.outDuration ?? spec.duration;
  const tf = realF / FPS;
  const w = lin(tf, D - 0.35, D - 1 / FPS);
  const fr = (a: number) => Math.round(fwd(a) * FPS);
  const black = spec.black.some((a) => realF >= fr(a) && realF < fr(a) + 2);
  const stat = spec.stat.some((a) => realF >= fr(a) && realF < fr(a) + 3);
  const sub = spec.sub.find((s) => realF === fr(s.at));
  const push = seg === S[0] ? 0 : Math.exp(-lt / 0.14);
  const shx = (rand(f * 11) - 0.5) * 12 * push;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <Audio src={staticFile(spec.audio)} />
      <AbsoluteFill style={{ transform: `translate(${shx}px, 0) scale(${1 + 0.04 * push})` }}>{seg.draw(lt, f)}</AbsoluteFill>
      {w > 0 ? <AbsoluteFill style={{ opacity: w }}>{S[0].draw(0, 0)}</AbsoluteFill> : null}
      {sub ? (
        <AbsoluteFill style={{ background: '#000' }}>
          <Img src={src(sub.file)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
        </AbsoluteFill>
      ) : null}
      <Film f={realF} />
      <Hud f={realF} part={spec.part} />
      {spec.captions && w < 0.5 ? <Captions caps={spec.captions} t={tf} /> : null}
      {stat ? (
        <AbsoluteFill>
          <Img src={src(`grain${(realF % 6) + 1}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} />
          <AbsoluteFill style={{ background: 'rgba(208,16,30,0.18)' }} />
        </AbsoluteFill>
      ) : null}
      {black ? <AbsoluteFill style={{ background: '#000' }} /> : null}
    </AbsoluteFill>
  );
};

export const Cicada01: React.FC = () => <Cut spec={FULL} />;
export const Cicada01P1: React.FC = () => <Cut spec={PART1} />;
