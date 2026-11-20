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

/** The documentary finish: a little grain and a soft vignette, nothing else. */
const SoftFilm: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Img src={src(`grain${(f % 6) + 1}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)' }} />
  </>
);

/** The case-file HUD: the series' identity on every frame. */
const Hud: React.FC<{ f: number; part?: string; caseLabel?: string; date?: string }> = ({ f, part, caseLabel = 'CASO Nº 01 · CICADA 3301', date = '04.01.2012' }) => {
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
      <div style={{ position: 'absolute', left: 72, top: 270, fontFamily: TYPE, fontSize: 30, color: C.bone, opacity: 0.85, letterSpacing: 1 }}>{caseLabel}</div>
      <div style={{ position: 'absolute', right: 72, top: 270, fontFamily: TYPE, fontSize: 30, color: C.red, letterSpacing: 1 }}>SIN RESOLVER</div>
      {part ? <div style={{ position: 'absolute', right: 72, top: 310, fontFamily: TYPE, fontSize: 30, color: C.bone, letterSpacing: 1 }}>{part}</div> : null}
      <div style={{ position: 'absolute', left: 72, top: 1546, fontFamily: MONO, fontSize: 28, color: C.bone, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, background: rec ? C.red : 'transparent', display: 'inline-block' }} />
        REC {tc}
      </div>
      <div style={{ position: 'absolute', right: 72, top: 1546, fontFamily: MONO, fontSize: 28, color: C.bone, opacity: 0.6 }}>{date}</div>
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
const Typed: React.FC<{ f: number; at: number; y: number; text: string; size?: number; color?: string; cps?: number; x?: number; align?: 'left' | 'center'; shadow?: boolean }> = ({ f, at, y, text, size = 40, color = C.bone, cps = 24, x = 72, align = 'center', shadow = true }) => {
  const t = f / FPS;
  if (t < at) return null;
  const n = Math.floor((t - at) * cps);
  const s = text.slice(0, n);
  const cur = n < text.length + 8 && Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, fontFamily: TYPE, fontSize: size, color, textShadow: shadow ? '0 3px 14px #000' : 'none', whiteSpace: 'pre' }}>
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
const transcript = (start: number, end: number, lines: string[], es: string[], cps: number, header = 'TRANSCRIPCIÓN · 04/01/2012'): Seg => ({
  start, end, draw: (t, f) => {
    let budget = Math.max(0, t - 0.2) * cps;
    const cursor = Math.floor(t * 3) % 2 === 0;
    const { esAt } = transcriptTimes(start, lines, cps);
    return (
      <>
        <Bg n="msg" t={t} dim={0.7} />
        <div style={{ position: 'absolute', left: 70, right: 70, top: 420, height: 640, background: 'rgba(14,12,10,0.94)', border: '2px solid rgba(232,226,212,0.35)', boxShadow: '0 40px 120px #000' }} />
        <div style={{ position: 'absolute', left: 110, right: 110, top: 450, fontFamily: TYPE, fontSize: 28, color: C.dim, display: 'flex', justifyContent: 'space-between' }}>
          <span>{header}</span><span>FIRMA: ████</span>
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
            <div key={r} style={{ fontFamily: MONO, fontSize: 38, color: C.bone, opacity: 0.45, marginLeft: 26, lineHeight: '64px' }}>
              {Array.from({ length: 20 }, (_, c) => (rand(r * 29 + c * 5 + Math.floor(t * 4)) > 0.5 ? '1' : '0')).join('')}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 110, width: 860, top, height: Math.max(0, scan - top), background: 'rgba(0,0,0,0.6)' }} />
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
    const city = T < 48.4 ? 0 : T < 49.46 ? 1 : 2; // París (from "carteles"), Varsovia (as "París" ends), Miami (on its word)
    const since = T - [46.34, 48.4, 49.46][city];
    const punch = since > 0 ? Math.exp(-since / 0.08) : 0;
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <div style={{ position: 'absolute', left: 1, top: 285, width: 1078, height: 900, overflow: 'hidden', transform: `scale(${1 + 0.1 * punch + 0.02 * since})` }}>
          <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: -1078 * city, top: 0, height: 900, opacity: 1 }} />
          {T >= 46.34 ? (
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

type CutSpec = { segs: Seg[]; duration: number; black: number[]; stat: number[]; sub: { at: number; file: string }[]; audio: string; part?: string; voice?: string; captions?: Cap[]; caseLabel?: string; date?: string;
  /** hud false: no case header. film 'soft': light grain and vignette only. transition 'fade': 0.5 s dissolves, no punch. */
  hud?: boolean; film?: 'full' | 'soft'; transition?: 'cut' | 'fade' | 'whip';
  /** Flash inserts: a photo full frame for `dur` seconds (film clock), cropped on `pos`. */
  inserts?: { at: number; dur: number; file: string; pos?: string; zoom?: number }[];
  /** Heartbeat: [from, to, bpm] ranges; a red vignette beats with it (the sound has the same beats). */
  heart?: number[][];
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
  const ins = spec.inserts?.find((x) => tf >= x.at && tf < x.at + x.dur);
  const beat = (() => {
    let last = -9;
    for (const [a, b, bpm] of spec.heart ?? []) {
      if (tf < a) continue;
      const per = 60 / bpm;
      const n = Math.floor((Math.min(tf, b) - a) / per);
      const bt = a + n * per;
      if (bt <= tf && tf - bt < 0.5 && bt <= b) last = Math.max(last, bt);
    }
    const u = tf - last;
    return Math.exp(-u / 0.12) + 0.6 * (u > 0.22 ? Math.exp(-(u - 0.22) / 0.12) : 0);
  })();
  const fade = spec.transition === 'fade';
  const si = S.indexOf(seg);
  const prev = fade && si > 0 && lt < 0.5 ? S[si - 1] : null;
  const whip = spec.transition === 'whip' && si > 0 && lt < 0.28;
  const wp = whip ? easeInOut(lt / 0.28) : 1;
  const wdir = si % 2 ? 1 : -1;
  const push = fade || whip || seg === S[0] ? 0 : Math.exp(-lt / 0.14);
  const shx = (rand(f * 11) - 0.5) * 12 * push;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <Audio src={staticFile(spec.audio)} />
      {prev ? <AbsoluteFill>{prev.draw(t - prev.start, f)}</AbsoluteFill> : null}
      {whip ? (
        <AbsoluteFill style={{ transform: `translate(${-wdir * 1080 * wp}px, 0)`, filter: `blur(${(10 * Math.sin(Math.PI * wp)).toFixed(1)}px)` }}>{S[si - 1].draw(t - S[si - 1].start, f)}</AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ transform: `translate(${shx + (whip ? wdir * 1080 * (1 - wp) : 0)}px, 0) scale(${1 + 0.04 * push})`, opacity: prev ? easeInOut(lt / 0.5) : 1, filter: whip ? `blur(${(10 * Math.sin(Math.PI * wp)).toFixed(1)}px)` : undefined }}>{seg.draw(lt, f)}</AbsoluteFill>
      {w > 0 ? <AbsoluteFill style={{ opacity: w }}>{S[0].draw(0, 0)}</AbsoluteFill> : null}
      {sub ? (
        <AbsoluteFill style={{ background: '#000' }}>
          <Img src={src(sub.file)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
        </AbsoluteFill>
      ) : null}
      {ins ? (
        <AbsoluteFill style={{ background: '#000' }}>
          <Img src={src(ins.file)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: ins.pos ?? '50% 50%', transform: `scale(${(ins.zoom ?? 1.25) + 0.25 * ((tf - ins.at) / ins.dur)}) translate(${(rand(realF) - 0.5) * 18}px, 0)` }} />
          <AbsoluteFill style={{ background: 'rgba(208,16,30,0.22)' }} />
          {(realF % 3) === 0 ? <AbsoluteFill style={{ background: 'rgba(255,255,255,0.12)' }} /> : null}
        </AbsoluteFill>
      ) : null}
      {spec.heart ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(160,0,12,${(0.45 * beat).toFixed(3)}) 100%)` }} /> : null}
      {spec.film === 'soft' ? <SoftFilm f={realF} /> : <Film f={realF} />}
      {spec.hud === false ? null : <Hud f={realF} part={spec.part} caseLabel={spec.caseLabel} date={spec.date} />}
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

/** The cover (thumbnail) of Part 1: ONE message. A QR poster (recreation) on a Paris street, a red circle that leads the
 * eye to it, and the best line of the video, "¿QUIÉN LOS PEGÓ?". 3301 only as a small corner tag.
 * Render: npx remotion still src/index.ts Cicada01Cover out.png */
export const Cicada01Cover: React.FC<{ line2?: string }> = ({ line2 = 'PEGÓ ESTO?' }) => (
  <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
    {/* Paris, from the posters photo: tile 1 filling the frame, its label pushed off the bottom */}
    <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: -727, top: -40, height: 2115, filter: 'blur(3px)' }} />
    <AbsoluteFill style={{ background: 'rgba(0,0,0,0.55)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.85) 80%)' }} />
    {/* the poster */}
    <div style={{ position: 'absolute', left: 540, top: 760, transform: 'translate(-50%, -50%) rotate(-4deg)', boxShadow: '0 50px 120px rgba(0,0,0,0.95)' }}>
      <div style={{ background: '#E9E4D8', padding: 34, width: 520 }}>
        <QrArt size={452} />
      </div>
      <div style={{ position: 'absolute', left: 190, top: -22, width: 140, height: 44, background: 'rgba(232,226,212,0.55)', transform: 'rotate(3deg)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -62, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,0.85)', padding: '4px 16px', fontFamily: TYPE, fontSize: 36, color: C.bone }}>[ recreación ]</div>
      </div>
    </div>
    {/* the red circle: the eye goes here first */}
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <ellipse cx={540} cy={765} rx={385} ry={400} fill="none" stroke={C.red} strokeWidth={14} strokeDasharray="2200 140" transform="rotate(-8 540 765)" opacity={0.95} />
    </svg>
    {/* the corner tag */}
    <div style={{ position: 'absolute', left: 70, top: 300, background: C.red, padding: '2px 18px', fontFamily: TITLE, fontSize: 64, color: C.bone, letterSpacing: 4 }}>3301</div>
    {/* the one line */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1190, textAlign: 'center', fontFamily: TITLE, fontSize: 230, lineHeight: 1, color: C.bone, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textShadow: '0 14px 50px #000' }}>¿QUIÉN</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: TITLE, fontSize: 200, lineHeight: 1, color: C.red, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textShadow: '0 14px 50px #000' }}>{line2}</div>
    <Film f={0} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------
// Part 2 (about 36 s, no voice yet): where the QR codes led, the end of the collaboration, the Tor site, the
// invitation, "For now." and the return a year later. Facts: Uncovering Cicada Wiki "What Happened (2012)" and
// Wikipedia "Cicada 3301" (see canal/no-presiones/sin-resolver-01/PARTE-2.md).
// ---------------------------------------------------------------------------------------------------------------

const P2_HOOK: Seg = {
  start: 0, end: 3.0, draw: (t, f) => (
    <>
      <Img src={src('mono-cities.png')} style={{ position: 'absolute', left: -727, top: -40, height: 2115, filter: 'blur(3px)' }} />
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', left: 540, top: 700, transform: `translate(-50%, -50%) rotate(-4deg) scale(${1 + 0.04 * t})`, boxShadow: '0 50px 120px rgba(0,0,0,0.95)' }}>
        <div style={{ background: '#E9E4D8', padding: 30, width: 470 }}>
          <QrArt size={410} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx={540} cy={705} rx={350} ry={365} fill="none" stroke={C.red} strokeWidth={12} strokeDasharray="2000 130" transform="rotate(-8 540 705)" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,0.85)', padding: '4px 16px', fontFamily: TYPE, fontSize: 32, color: C.bone }}>[ recreación ]</div>
      </div>
      <Title f={f} at={0} y={1110} size={150} still>¿A DÓNDE</Title>
      <Title f={f} at={0} y={1265} size={130} color={C.red} still>LLEVABA ESTE QR?</Title>
    </>
  ),
};

const P2_EVERYWHERE: Seg = {
  start: 3.0, end: 6.6, draw: (t, f) => {
    const k = pop(f, 3.2);
    const flick = rand(Math.floor(f / 2)) > 0.9 ? 0.55 : 1;
    return (
      <>
        <AbsoluteFill style={{ background: '#000' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(232,226,212,0.16) 0%, rgba(0,0,0,0) 45%)' }} />
        <Typed f={f} at={3.05} y={430} text="EL QR LLEVABA A UNA IMAGEN:" size={40} color={C.dim} cps={40} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: Math.min(1, k * 1.5) * flick, transform: `scale(${0.9 + 0.1 * Math.min(1, k)})`, fontFamily: TYPE, fontSize: 124, color: '#fff', letterSpacing: 10, textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 90px rgba(255,255,255,0.4)' }}>
          everywhere
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: TYPE, fontSize: 28, color: C.dim }}>[ recreación ]</div>
        <Title f={f} at={4.6} y={1000} size={110}>«EN TODAS</Title>
        <Title f={f} at={4.8} y={1120} size={140} color={C.red}>PARTES»</Title>
      </>
    );
  },
};

const P2_FEW: Seg = {
  start: 11.6, end: 15.2, draw: (t, f) => {
    const T = 11.6 + t;
    const keep = [4, 7, 10];
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        {Array.from({ length: 15 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const order = [0, 14, 2, 12, 5, 8, 1, 13, 3, 11, 6, 9].indexOf(i);
          const off = !keep.includes(i) && order >= 0 && T > 11.9 + order * 0.13;
          return (
            <Img key={i} src={src('mono-msg.png')} style={{ position: 'absolute', left: 30 + col * 345, top: 290 + row * 172, width: 330, height: 160, objectFit: 'cover', opacity: off ? 0.03 : keep.includes(i) && T > 13.4 ? 1 : 0.4, outline: keep.includes(i) && T > 13.4 ? `4px solid ${C.red}` : '2px solid rgba(232,226,212,0.2)' }} />
          );
        })}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.88) 60%, rgba(0,0,0,0.88) 100%)' }} />
        <Typed f={f} at={11.7} y={1010} text="«THE FIRST FEW… WILL RECEIVE THE PRIZE»" size={34} color={C.dim} cps={45} />
        <Title f={f} at={12.0} y={1080} size={130}>SOLO LOS PRIMEROS</Title>
        <Title f={f} at={12.6} y={1225} size={140} color={C.red}>TENDRÍAN PREMIO</Title>
      </>
    );
  },
};

const P2_ONION: Seg = {
  start: 15.2, end: 19.4, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 420, height: 470, background: 'rgba(8,8,8,0.96)', border: '2px solid rgba(232,226,212,0.35)', boxShadow: '0 40px 120px #000' }} />
      <Typed f={f} at={15.35} y={470} x={110} align="left" text="> conectando a tor…" size={40} color={C.dim} cps={40} />
      <Typed f={f} at={15.9} y={560} x={110} align="left" text="> sq6wmgv2zcsrix6t.onion" size={48} color={C.bone} cps={40} />
      <Typed f={f} at={16.6} y={660} x={110} align="left" text="> mensaje único · cifrado RSA" size={40} color={C.bone} cps={40} />
      <Typed f={f} at={17.2} y={760} x={110} align="left" text="> «you are not to collaborate»" size={40} color={C.red} cps={40} />
      <Title f={f} at={16.9} y={1040} size={100}>UN SITIO OCULTO EN TOR</Title>
      <Title f={f} at={17.9} y={1160} size={150} color={C.red}>«NO COLABOREN»</Title>
    </>
  ),
};

const P2_INVITE: Seg = {
  start: 19.4, end: 24.0, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 200, width: 1200, opacity: 0.45, transform: `scale(${1.05 + 0.05 * t})` }} />
      <Title f={f} at={19.6} y={600} size={120}>LOS QUE LLEGARON</Title>
      <Title f={f} at={19.9} y={740} size={140}>AL FINAL</Title>
      <Title f={f} at={20.8} y={920} size={96} color={C.red}>RECIBIERON UNA INVITACIÓN</Title>
      <Typed f={f} at={22.0} y={1130} text="LO QUE PASÓ DESPUÉS NUNCA SE CONFIRMÓ" size={40} cps={32} />
    </>
  ),
};

const P2_FORNOW: Seg = {
  start: 28.6, end: 31.0, draw: (t, f) => {
    const k = pop(f, 29.3);
    const T = 28.6 + t;
    const sh = T > 29.3 && T < 29.8 ? (1 - (T - 29.3) / 0.5) * 36 : 0;
    const sx = (rand(f * 3) - 0.5) * sh;
    const s2 = 2.2 - 1.2 * Math.min(1.03, k);
    const word = (dx: number, color: string, op: number) => (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `translate(${dx + sx}px, 0) scale(${s2})`, opacity: k > 0.01 ? op : 0 }}>
        <span style={{ fontFamily: TITLE, fontSize: 250, color, letterSpacing: 4 }}>FOR NOW.</span>
      </div>
    );
    return (
      <>
        <AbsoluteFill style={{ background: '#000' }} />
        <Typed f={f} at={28.65} y={520} text="Y AL FINAL, DOS PALABRAS:" size={40} color={C.dim} cps={40} />
        {word(-12, C.red, 0.9)}
        {word(12, '#2B6F7A', 0.6)}
        {word(0, C.bone, 1)}
        <Title f={f} at={29.9} y={1080} size={160} color={C.red}>«POR AHORA»</Title>
      </>
    );
  },
};

const P2_CLIFF: Seg = {
  start: 31.0, end: 36.0, draw: (t, f) => (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <Img src={src('tree-dark.png')} style={{ position: 'absolute', left: -60, top: 160, width: 1200, opacity: 0.32, transform: `scale(${1.05 + 0.03 * t})` }} />
      <Title f={f} at={31.15} y={600} size={130}>UN AÑO DESPUÉS…</Title>
      <Title f={f} at={31.9} y={770} size={210} color={C.red}>VOLVIERON.</Title>
      <Typed f={f} at={32.8} y={1060} text="CONTINUARÁ…" size={46} cps={20} />
      <Stamp f={f} at={33.4} y={1230} rot={-5} size={110}>PARTE 3</Stamp>
      <Typed f={f} at={33.9} y={1360} text="SÍGUEME PARA NO PERDÉRTELA" size={34} color={C.dim} cps={34} />
    </>
  ),
};

export const P2_LINES = {
  hidden: ["YOU'VE SHARED TOO", 'MUCH TO THIS POINT.', 'WE WANT THE BEST,', 'NOT THE FOLLOWERS.'],
  last: ['WE HAVE NOW FOUND THE', 'INDIVIDUALS WE SOUGHT.', 'THUS OUR MONTH-LONG', 'JOURNEY ENDS.'],
};

const PART2: CutSpec = {
  segs: [
    P2_HOOK,
    P2_EVERYWHERE,
    transcript(6.6, 11.6, P2_LINES.hidden, ['«HAN COMPARTIDO DEMASIADO.', 'QUEREMOS A LOS MEJORES»'], 30, 'MENSAJE OCULTO · ENERO 2012'),
    P2_FEW,
    P2_ONION,
    P2_INVITE,
    transcript(24.0, 28.6, P2_LINES.last, ['«YA ENCONTRAMOS', 'A QUIENES BUSCÁBAMOS»'], 32, 'REDDIT · «VALĒTE!» · 2012'),
    P2_FORNOW,
    P2_CLIFF,
  ],
  duration: 36,
  black: [3.0, 11.6, 19.4, 28.6, 31.0],
  stat: [6.6, 15.2, 24.0],
  sub: [{ at: 10.9, file: 'neg-msg.png' }, { at: 23.5, file: 'tree-dark.png' }],
  audio: 'cicada01/mix-p2.wav',
  part: 'PARTE 2 / 3',
};
export const CICADA01_P2 = { fps: FPS, width: 1080, height: 1920, duration: PART2.duration };
export const Cicada01P2: React.FC = () => <Cut spec={PART2} />;

// ---------------------------------------------------------------------------------------------------------------
// Caso Nº 02 · Satoshi Nakamoto (one piece, about 40 s, no voice yet). Facts: Wikipedia "Satoshi Nakamoto"; images and
// licences: canal/no-presiones/sin-resolver-02/CASO-02-SATOSHI.md. Assets in public/cicada01 with the s2- prefix.
// ---------------------------------------------------------------------------------------------------------------

// ---- 3D (CSS 3D transforms: real perspective and depth, stable in the headless render) ------------------------------

/** A cube of side `size`: faces are [front, back, right, left, top, bottom]. Put it inside a parent with perspective. */
const Cube3D: React.FC<{ size: number; rx: number; ry: number; faces: React.ReactNode[]; face?: React.CSSProperties }> = ({ size, rx, ry, faces, face }) => {
  const h = size / 2;
  const tf = [`rotateY(0deg) translateZ(${h}px)`, `rotateY(180deg) translateZ(${h}px)`, `rotateY(90deg) translateZ(${h}px)`, `rotateY(-90deg) translateZ(${h}px)`, `rotateX(90deg) translateZ(${h}px)`, `rotateX(-90deg) translateZ(${h}px)`];
  return (
    <div style={{ width: size, height: size, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {tf.map((t, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, transform: t, backfaceVisibility: 'hidden', background: 'rgba(10,10,10,0.92)', border: `3px solid ${C.bone}`, boxSizing: 'border-box', overflow: 'hidden', ...face }}>{faces[i] ?? null}</div>
      ))}
    </div>
  );
};

/** A coin with thickness: front and back faces plus a stack of discs for the edge. */
const Coin3D: React.FC<{ d: number; rx: number; ry: number; thick?: number }> = ({ d, rx, ry, thick = 34 }) => {
  const n = 17;
  return (
    <div style={{ width: d, height: d, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: 'absolute', inset: d * 0.02, borderRadius: '50%', background: i % 2 ? '#6B5418' : '#5A4612', transform: `translateZ(${-thick / 2 + (i * thick) / (n - 1)}px)` }} />
      ))}
      <Img src={src('s2-coin.png')} style={{ position: 'absolute', inset: 0, width: d, height: d, transform: `translateZ(${thick / 2 + 1}px)` }} />
      <Img src={src('s2-coin.png')} style={{ position: 'absolute', inset: 0, width: d, height: d, transform: `rotateY(180deg) translateZ(${thick / 2 + 1}px)` }} />
    </div>
  );
};

/** A perspective grid floor sliding towards the camera. */
const Grid3D: React.FC<{ t: number; top?: number; opacity?: number }> = ({ t, top = 1040, opacity = 0.35 }) => (
  <div style={{ position: 'absolute', left: -700, right: -700, top, height: 1600, perspective: 900, perspectiveOrigin: '50% 0%', opacity }}>
    <div style={{ position: 'absolute', inset: 0, transform: 'rotateX(72deg)', transformOrigin: '50% 0%', backgroundImage: `linear-gradient(rgba(208,16,30,0.9) 2px, transparent 2px), linear-gradient(90deg, rgba(232,226,212,0.55) 2px, transparent 2px)`, backgroundSize: '120px 120px', backgroundPosition: `0 ${(t * 160) % 120}px` }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,1) 0%, rgba(5,5,5,0) 35%)' }} />
  </div>
);

/** A photo tilting slowly in 3D. */
const Tilt3D: React.FC<{ ry: number; rx?: number; children: React.ReactNode }> = ({ ry, rx = 0, children }) => (
  <AbsoluteFill style={{ perspective: 1800 }}>
    <AbsoluteFill style={{ transform: `rotateY(${ry}deg) rotateX(${rx}deg)`, transformStyle: 'preserve-3d' }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

/** Faint hex strings drifting up: the ambient layer of the Satoshi case. */
const DigitDrift: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 0.14 }) => (
  <>
    {Array.from({ length: 22 }, (_, i) => {
      const x = rand(i * 13) * 1000;
      const y = (((rand(i * 7) * 2200 - t * (30 + 40 * rand(i))) % 2200) + 2200) % 2200 - 140;
      const txt = Array.from({ length: 6 }, (_, k) => '0123456789abcdef'[Math.floor(rand(i * 31 + k + Math.floor(t * 2)) * 16)]).join('');
      return <div key={i} style={{ position: 'absolute', left: x, top: y, fontFamily: MONO, fontSize: 26 + 14 * rand(i * 3), color: C.bone, opacity: opacity * (0.4 + 0.6 * rand(i * 5)) }}>0x{txt}</div>;
    })}
  </>
);

/** Shake offset for a list of hit times (seconds on the film clock). */
const shakeOf = (T: number, f: number, hits: number[], amp = 26, len = 0.35) => {
  const k = hits.reduce((m, h) => Math.max(m, T >= h && T < h + len ? 1 - (T - h) / len : 0), 0);
  return { x: (rand(f * 3) - 0.5) * amp * k, y: (rand(f * 5 + 1) - 0.5) * amp * k };
};

/** Face-recognition brackets on a target box: corners close in, a scan line runs, then the verdict. */
const FaceScan: React.FC<{ T: number; t0: number; x: number; y: number; w: number; h: number; still?: boolean }> = ({ T, t0, x, y, w, h, still = false }) => {
  const p = still ? 1 : easeOut((T - t0) / 0.6);
  const g = 60 * (1 - p);
  const scanY = y + ((T - t0) * 420) % h;
  const done = still || T > t0 + 1.4;
  const col = done ? C.red : C.bone;
  const L = 46;
  const c = (cx: number, cy: number, sx: number, sy: number) => <path d={`M ${cx} ${cy + L * sy} L ${cx} ${cy} L ${cx + L * sx} ${cy}`} fill="none" stroke={col} strokeWidth={6} />;
  const blink = Math.floor(T * 4) % 2 === 0;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {c(x - g, y - g, 1, 1)}
        {c(x + w + g, y - g, -1, 1)}
        {c(x - g, y + h + g, 1, -1)}
        {c(x + w + g, y + h + g, -1, -1)}
        {!done ? <line x1={x} x2={x + w} y1={scanY} y2={scanY} stroke={C.bone} strokeWidth={3} opacity={0.8} /> : null}
      </svg>
      <div style={{ position: 'absolute', left: x - 240, top: y + h + 30, width: w + 480, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <span style={{ background: 'rgba(0,0,0,0.85)', padding: '4px 14px', fontFamily: TYPE, fontSize: 40, color: col, opacity: done && !still ? (blink ? 1 : 0.6) : 1 }}>
          {done ? 'IDENTIDAD: DESCONOCIDA' : 'ANALIZANDO ROSTRO…'}
        </span>
      </div>
    </>
  );
};

/** Text with a red/cyan glitch split while k > 0. */
const GlitchText: React.FC<{ text: string; y: number; size: number; color: string; k: number; f: number }> = ({ text, y, size, color, k, f }) => {
  const layer = (dx: number, c: string, op: number) => (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', whiteSpace: 'nowrap', transform: `translate(${dx}px, 0)`, opacity: op }}>
      <span style={{ fontFamily: TITLE, fontSize: size, color: c, letterSpacing: 2, textShadow: c === color ? '0 6px 0 #000, 0 0 30px rgba(0,0,0,0.9)' : undefined }}>{text}</span>
    </div>
  );
  const j = k > 0 ? (rand(f * 7) - 0.5) * 40 * k : 0;
  return (
    <>
      {k > 0 ? layer(-14 * k + j, C.red, 0.85) : null}
      {k > 0 ? layer(14 * k - j, '#2B9FB0', 0.7) : null}
      {layer(j * 0.3, color, 1)}
    </>
  );
};

const S2_HOOK: Seg = {
  start: 0, end: 3.4, draw: (t, f) => (
    <>
      <Img src={src('bgm-s2-statue.jpg')} style={{ position: 'absolute', inset: -60, width: 1200, height: 2040, objectFit: 'cover', opacity: 0.6, transform: `translate(${-12 * t}px, 0)` }} />
      <DigitDrift t={t} />
      <Tilt3D ry={-9 + 5 * t} rx={3}>
        <Pic file="s2-statue.png" w={820} cy={720} scale={1.02 + 0.05 * t} dx={8 * t} />
      </Tilt3D>
      <FaceScan T={t} t0={0.15} x={330} y={330} w={300} h={300} still={t < 0.15} />
      <Title f={f} at={0} y={1170} size={130} still>CREÓ UNA FORTUNA</Title>
      <Title f={f} at={0} y={1295} size={110} color={C.red} still>Y NUNCA LA TOCÓ</Title>
    </>
  ),
};

const S2_PAPER: Seg = {
  start: 3.4, end: 7.6, draw: (t, f) => {
    const T = 3.4 + t;
    const k = pop(f, 3.45);
    const sh = shakeOf(T, f, [5.6]);
    const mark = easeOut((T - 5.15) / 0.3);
    const mail = easeOut((T - 5.45) / 0.3);
    const scan = Math.max(0, Math.min(1, (T - 3.75) / 1.2));
    return (
      <>
        <Img src={src('bgm-s2-statue.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
        <AbsoluteFill style={{ background: 'rgba(0,0,0,0.5)' }} />
        <DigitDrift t={T} />
        <div style={{ position: 'absolute', left: 540 + sh.x, top: 690 + sh.y + 700 * (1 - Math.min(1, k)), transform: `translate(-50%, -50%) rotate(${-3 - 18 * (1 - Math.min(1, k))}deg) scale(${1 + 0.03 * t})`, width: 800, height: 560, background: '#fff', boxShadow: '0 50px 120px #000', overflow: 'hidden' }}>
          {/* the real first page, revealed by a scanner line */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', clipPath: `inset(0 0 ${100 * (1 - scan)}% 0)` }}>
            <Img src={src('s2-paper-real.jpg')} style={{ position: 'absolute', left: -50, top: 0, width: 900 }} />
          </div>
          {scan > 0 && scan < 1 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 560 * scan - 3, height: 6, background: '#fff', boxShadow: '0 0 30px 8px rgba(255,255,255,0.8)' }} /> : null}
          {/* the name and the e-mail circled in red */}
          <div style={{ position: 'absolute', left: 325, top: 104, height: 30, width: 172 * mark, border: `4px solid ${C.red}`, borderRight: mark < 1 ? 'none' : undefined }} />
          <div style={{ position: 'absolute', left: 318, top: 131, height: 30, width: 186 * mail, background: 'rgba(208,16,30,0.3)' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.85)', padding: '4px 16px', fontFamily: TYPE, fontSize: 30, color: C.bone }}>DOCUMENTO ORIGINAL · 2008</div>
        </div>
        <Stamp f={f} at={5.6} x={720 + sh.x} y={930 + sh.y} rot={-6} size={70}>31 · OCT · 2008</Stamp>
        <Title f={f} at={5.9} y={1110} size={100}>UN TAL SATOSHI NAKAMOTO</Title>
        <Title f={f} at={6.4} y={1230} size={130} color={C.red}>PUBLICÓ BITCOIN</Title>
      </>
    );
  },
};

const S2_GENESIS: Seg = {
  start: 7.6, end: 12.8, draw: (t, f) => {
    const T = 7.6 + t;
    const w = 1040;
    const h = (w * 885) / 1280;
    const fx = 0.8734;
    const fy = 0.6678;
    const p = easeInOut((t - 1.7) / 1.0);
    const Z = 1 + 1.6 * p;
    const dx = -(fx - 0.5) * w * Z * p;
    const dy = -(fy - 0.5) * h * Z * p;
    const cube = T < 9.2;
    const cz = cube ? -60 + 420 * easeInOut((T - 7.6) / 1.6) : 0;
    const flash = T >= 9.2 && T < 9.38 ? 1 - (T - 9.2) / 0.18 : 0;
    const hexFace = (lines: string[], size = 26) => (
      <div style={{ padding: 22, fontFamily: MONO, fontSize: size, lineHeight: 1.5, color: C.bone }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
    );
    const box = easeOut((T - 9.6) / 0.45);
    const per = 2 * (570 + 370);
    const sh = shakeOf(T, f, [10.0], 18);
    return (
      <>
        <AbsoluteFill style={{ background: '#000' }} />
        <DigitDrift t={T} opacity={0.08} />
        {cube ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 380, height: 690, perspective: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ transform: `translateZ(${cz}px)`, transformStyle: 'preserve-3d' }}>
              <Cube3D size={460} rx={-18 + 8 * Math.sin(T * 1.3)} ry={35 + 95 * (T - 7.6)} faces={[
                <div key="f" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: TITLE, color: C.bone }}><div style={{ fontSize: 64 }}>BLOQUE</div><div style={{ fontSize: 130, color: C.red, lineHeight: 1 }}>#0</div></div>,
                hexFace(['01 00 00 00 00', '3B A3 ED FD 7A', '4B 1E 5E 4A 29', '01 01 00 00 00']),
                hexFace(['The Times', '03/Jan/2009', 'Chancellor on', 'brink of second', 'bailout for', 'banks'], 30),
                hexFace(['FF FF 4D 04 FF', '45 54 68 65 20', '54 69 6D 65 73', '20 30 33 2F 4A']),
                hexFace(['03.01.2009']),
                hexFace(['50 BTC']),
              ]} />
            </div>
          </div>
        ) : null}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, height: 690, overflow: 'hidden', transform: `translate(${sh.x}px, ${sh.y}px)`, opacity: cube ? 0 : 1 }}>
          <Pic file="s2-genesis.png" w={w} cy={340} scale={Z} dx={dx} dy={dy} frame={false} />
          {/* the five headline lines light up one by one */}
          {p > 0.97 ? [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 540 - 270, top: 340 - 160 + i * 64, height: 56, width: 540 * easeOut((T - 10.0 - i * 0.16) / 0.25), background: 'rgba(232,226,212,0.22)' }} />
          )) : null}
        </div>
        {flash > 0 ? <AbsoluteFill style={{ background: `rgba(255,255,255,${0.85 * flash})` }} /> : null}
        {box > 0 ? (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <rect x={540 - 285} y={720 - 185} width={570} height={370} fill="none" stroke={C.red} strokeWidth={6} strokeDasharray={per} strokeDashoffset={per * (1 - box)} />
          </svg>
        ) : null}
        <Typed f={f} at={7.7} y={330} text="BLOQUE 0 · 03/01/2009" size={40} color={C.bone} cps={36} />
        <Title f={f} at={10.0} y={1110} size={84}>«EL MINISTRO, AL BORDE DE UN</Title>
        <Title f={f} at={10.3} y={1205} size={84} color={C.red}>SEGUNDO RESCATE A LOS BANCOS»</Title>
        <Typed f={f} at={10.8} y={1315} text="THE TIMES · 3 DE ENERO DE 2009" size={34} color={C.dim} cps={40} />
      </>
    );
  },
};

const S2_GONE: Seg = {
  start: 12.8, end: 17.6, draw: (t, f) => {
    const T = 12.8 + t;
    const msg = "I've moved on to other things.";
    const typedN = Math.floor(Math.max(0, T - 13.6) * 26);
    const erased = Math.floor(Math.max(0, T - 15.3) * 40);
    const shown = msg.slice(0, Math.max(0, Math.min(msg.length, typedN) - erased));
    // the window switches off like an old TV
    const sy = T < 15.9 ? 1 : T < 16.08 ? 1 - 0.98 * easeInOut((T - 15.9) / 0.18) : 0.02;
    const sx = T < 16.08 ? 1 : 1 - easeInOut((T - 16.08) / 0.16);
    const gone = T > 16.24;
    const gk = T >= 16.4 && T < 16.95 ? 1 - (T - 16.4) / 0.55 : 0;
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        {/* the Lugano sculpture that vanishes when you look at it head-on */}
        {T > 16.1 ? <Img src={src('s2-vanish.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', opacity: 0.55 * easeOut((T - 16.1) / 0.5), transform: `scale(${1.15 - 0.08 * (T - 16.1)})` }} /> : null}
        {T > 16.1 ? <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 60%)' }} /> : null}
        <Grid3D t={T} top={1050} opacity={0.3} />
        <DigitDrift t={T} opacity={0.08} />
        {!gone ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1920, transform: `scale(${sx}, ${sy})`, transformOrigin: '540px 630px' }}>
            <div style={{ position: 'absolute', left: 70, right: 70, top: 420, height: 420, background: 'rgba(14,12,10,0.95)', border: '2px solid rgba(232,226,212,0.35)', boxShadow: sy < 1 ? '0 0 60px rgba(255,255,255,0.6)' : undefined }} />
            <Typed f={f} at={12.9} y={455} x={110} align="left" text="CORREO · 2011" size={30} color={C.dim} cps={40} />
            <Typed f={f} at={13.0} y={520} x={110} align="left" text="De: Satoshi Nakamoto" size={40} color={C.bone} cps={40} />
            <Typed f={f} at={13.3} y={580} x={110} align="left" text="Para: Mike Hearn" size={40} color={C.bone} cps={40} />
            <div style={{ position: 'absolute', left: 110, top: 680, fontFamily: TYPE, fontSize: 52, color: C.bone }}>
              {shown}
              <span style={{ color: C.red, opacity: Math.floor(T * 3) % 2 ? 1 : 0 }}>▌</span>
            </div>
          </div>
        ) : null}
        {T >= 16.08 && T < 16.4 ? <div style={{ position: 'absolute', left: 540 - 6, top: 626, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 0 40px 12px rgba(255,255,255,0.8)', opacity: 1 - (T - 16.08) / 0.32 }} /> : null}
        <Title f={f} at={14.4} y={950} size={84} color={C.bone}>«ME DEDICO A OTRAS COSAS»</Title>
        {T >= 16.4 ? <GlitchText text="Y DESAPARECIÓ." y={1110} size={146} color={C.red} k={gk} f={f} /> : null}
        <Typed f={f} at={16.95} y={1290} text="MÁS DE 15 AÑOS SIN RASTRO" size={44} color={C.bone} cps={30} />
      </>
    );
  },
};

const S2_COINS: Seg = {
  start: 17.6, end: 22.4, draw: (t, f) => {
    const T = 17.6 + t;
    const n = Math.floor(750000 * easeOut((T - 17.8) / 1.8));
    const spin = 900 * (1 - easeOut((T - 17.65) / 1.1));
    const lock = easeOut((T - 20.45) / 0.25);
    const sh = shakeOf(T, f, [20.6], 22);
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <Img src={src('s2-farm.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, transform: `scale(${1.25 + 0.04 * t})` }} />
        <AbsoluteFill style={{ background: 'rgba(0,0,0,0.35)' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 34%, rgba(255,184,0,0.14) 0%, rgba(0,0,0,0) 50%)' }} />
        {/* a rain of small coins */}
        {Array.from({ length: 16 }, (_, i) => {
          const st = 17.75 + i * 0.12;
          const u = T - st;
          if (u < 0 || T > 21.0) return null;
          const y = -120 + 300 * u + 900 * u * u;
          return <Img key={i} src={src('s2-coin.png')} style={{ position: 'absolute', left: 40 + rand(i * 9) * 900, top: y, width: 70 + 50 * rand(i * 4), opacity: 0.55, transform: `rotate(${(i % 2 ? 1 : -1) * 300 * u}deg)` }} />;
        })}
        <div style={{ position: 'absolute', left: 540 - 230 + sh.x, top: 600 - 230 + sh.y, perspective: 1200 }}>
          <Coin3D d={460} rx={-14 + 6 * Math.sin(T * 1.7)} ry={spin + 18 * Math.sin(T * 1.2)} />
        </div>
        {/* the padlock closes on the coins */}
        {T > 20.3 ? (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: Math.min(1, (T - 20.3) / 0.15) }}>
            <path d={`M 490 ${640 - 70 * (1 - lock)} L 490 590 A 50 50 0 0 1 590 590 L 590 ${640 - 70 * (1 - lock) + (lock < 1 ? 0 : 0)}`} fill="none" stroke={C.red} strokeWidth={22} />
            <rect x={455} y={630} width={170} height={140} rx={18} fill={C.red} stroke="#000" strokeWidth={6} />
            <circle cx={540} cy={690} r={16} fill="#000" />
            <rect x={533} y={690} width={14} height={40} fill="#000" />
          </svg>
        ) : null}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: TITLE, fontSize: 150, color: C.bone, textShadow: '0 8px 30px #000' }}>
          {n > 0 ? `${n.toLocaleString('es-ES')}${T > 19.6 ? '+' : ''}` : ''}
        </div>
        <Typed f={f} at={19.7} y={1060} text="BITCOINS ESTIMADOS (2021)" size={40} color={C.dim} cps={40} />
        <Title f={f} at={20.6} y={1150} size={120} color={C.red}>NUNCA SE HAN MOVIDO</Title>
      </>
    );
  },
};

const S2_CLAIMS: Seg = {
  start: 22.4, end: 28.0, draw: (t, f) => {
    const T = 22.4 + t;
    const card = (i: number, at: number, label: string, stampAt: number, stamp: string, big: boolean) => {
      const k = pop(f, at);
      const y = 360 + i * 150;
      return (
        <div key={i} style={{ position: 'absolute', left: 50 + 1100 * (1 - Math.min(1, k)), top: y, width: 500, height: 120, background: 'rgba(10,10,10,0.92)', border: '2px solid rgba(232,226,212,0.4)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: TYPE, fontSize: 30, color: C.dim }}>{label}</div>
          <div style={{ flex: 1, height: 44, background: '#000', border: '1px solid rgba(232,226,212,0.3)' }} />
          {T > stampAt ? (
            <div style={{ position: 'absolute', right: big ? -60 : 8, top: big ? -34 : 30, transform: `rotate(-8deg) scale(${1.6 - 0.6 * Math.min(1, pop(f, stampAt))})`, border: `${big ? 7 : 5}px double ${C.red}`, padding: '2px 14px', fontFamily: TITLE, fontSize: big ? 52 : 28, color: C.red, background: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap', letterSpacing: 3 }}>{stamp}</div>
          ) : null}
        </div>
      );
    };
    return (
      <>
        <Img src={src('bgm-s2-bust.jpg')} style={{ position: 'absolute', inset: -60, width: 1200, height: 2040, objectFit: 'cover', opacity: 0.5, transform: `translate(${10 * t}px, 0)` }} />
        <Tilt3D ry={10 - 3 * t}>
          <Pic file="s2-hood.jpg" w={560} cy={720} dx={250 - 6 * t} scale={1.05 + 0.07 * t} />
        </Tilt3D>
        {card(0, 22.8, 'CANDIDATO 1', 24.2, 'NO VERIFICADO', false)}
        {card(1, 23.2, 'CANDIDATO 2', 25.0, 'NO ES SATOSHI', true)}
        {card(2, 23.6, 'CANDIDATO 3', 24.5, 'NO VERIFICADO', false)}
        <Title f={f} at={22.6} y={1080} size={120}>VARIOS DIJERON SER ÉL</Title>
        <Typed f={f} at={25.4} y={1220} text="TRIBUNAL SUPERIOR · LONDRES · 2024" size={40} color={C.bone} cps={36} />
        <Title f={f} at={26.2} y={1290} size={84} color={C.red}>UNO DE ELLOS NO LO ERA</Title>
      </>
    );
  },
};

const S2_PROOF: Seg = {
  start: 28.0, end: 33.6, draw: (t, f) => {
    const T = 28.0 + t;
    const prog = T < 29.8 ? 0 : Math.min(0.03, (T - 29.8) * 0.05);
    const fail = T > 31.6;
    const blink = Math.floor(T * 4) % 2 === 0;
    const sh = shakeOf(T, f, [31.6], 34, 0.5);
    return (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <Grid3D t={T} top={1050} opacity={0.3} />
        <DigitDrift t={T} opacity={0.1} />
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
          <div style={{ position: 'absolute', left: 70, right: 70, top: 420, height: 420, background: 'rgba(8,8,8,0.96)', border: `2px solid ${fail ? C.red : 'rgba(232,226,212,0.35)'}` }} />
          <Typed f={f} at={28.2} y={470} x={110} align="left" text="> mover 1 BTC" size={44} color={C.bone} cps={30} />
          <Typed f={f} at={28.8} y={540} x={110} align="left" text="  desde la dirección de Satoshi" size={36} color={C.dim} cps={40} />
          <Typed f={f} at={29.5} y={610} x={110} align="left" text="> firmando con su clave…" size={40} color={C.bone} cps={34} />
          {T > 29.8 ? (
            <>
              <div style={{ position: 'absolute', left: 110, right: 110, top: 700, height: 40, border: `2px solid ${fail ? C.red : C.bone}` }}>
                <div style={{ height: '100%', width: `${prog * 100}%`, background: fail ? C.red : C.bone }} />
              </div>
              <div style={{ position: 'absolute', left: 110, top: 760, fontFamily: TYPE, fontSize: 36, color: fail ? C.red : C.dim, opacity: fail ? (blink ? 1 : 0.4) : 1 }}>{fail ? '> sin respuesta · 0 firmas' : `${Math.round(prog * 100)}%  esperando…`}</div>
            </>
          ) : null}
        </div>
        {fail && T < 31.75 ? <AbsoluteFill style={{ background: 'rgba(208,16,30,0.25)' }} /> : null}
        <Title f={f} at={28.4} y={900} size={110}>PARA DEMOSTRARLO</Title>
        <Title f={f} at={29.0} y={1025} size={96}>BASTARÍA MOVER UNA MONEDA</Title>
        {fail ? <GlitchText text="NADIE LO HA HECHO." y={1165} size={138} color={C.red} k={T < 32.0 ? 1 - (T - 31.6) / 0.4 : 0} f={f} /> : null}
      </>
    );
  },
};

const S2_END: Seg = {
  start: 33.6, end: 40.0, draw: (t, f) => {
    const T = 33.6 + t;
    const shots = ['s2-lake.jpg', 's2-whois.jpg', 's2-vanish.jpg', 's2-hood.jpg', 's2-face2.jpg', 's2-areyou.jpg', 's2-face.jpg'];
    const pos = ['50% 50%', '38% 62%', '50% 40%', '50% 35%', '50% 35%', '48% 52%', '50% 35%'];
    const zoom = [1.35, 1.35, 1.35, 1.35, 1.35, 3.2, 1.35];
    if (T < 35.0) {
      const k = Math.min(6, Math.floor((T - 33.6) / 0.2));
      const u = T - 33.6 - k * 0.2;
      return (
        <>
          <AbsoluteFill style={{ background: '#000' }} />
          <Img src={src(shots[k])} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos[k], transform: `scale(${zoom[k] - 0.6 * u})`, transformOrigin: pos[k] }} />
          {u < 0.05 ? <AbsoluteFill style={{ background: 'rgba(255,255,255,0.5)' }} /> : null}
          <AbsoluteFill style={{ background: 'rgba(208,16,30,0.12)' }} />
        </>
      );
    }
    return (
      <>
        <Img src={src('bgm-s2-statue.jpg')} style={{ position: 'absolute', inset: -60, width: 1200, height: 2040, objectFit: 'cover', opacity: 0.45, transform: `translate(${-10 * t}px, 0)` }} />
        <Pic file="s2-statue.png" w={760} cy={620} scale={1.0 + 0.04 * t} dx={6 * t} opacity={0.85} />
        {/* a 3D chain of blocks coming towards the camera */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, height: 900, perspective: 1100, perspectiveOrigin: '50% 30%' }}>
          {Array.from({ length: 8 }, (_, i) => {
            const z = -2600 + ((i * 420 + t * 260) % 3360);
            const x = (i % 2 ? 1 : -1) * (360 + 40 * Math.sin(i * 1.7));
            return (
              <div key={i} style={{ position: 'absolute', left: 540 - 70 + x, top: 380, transformStyle: 'preserve-3d', transform: `translateZ(${z}px)`, opacity: Math.min(1, (z + 2600) / 600) * 0.85 }}>
                <Cube3D size={140} rx={-20} ry={25 + 40 * t + i * 30} faces={Array.from({ length: 6 }, (_, k) => (
                  <div key={k} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 28, color: k === 0 ? C.red : C.bone }}>#{i}</div>
                ))} face={{ background: 'rgba(10,10,10,0.75)', border: '2px solid rgba(232,226,212,0.6)' }} />
              </div>
            );
          })}
        </div>
        <FaceScan T={T} t0={35.05} x={300} y={240} w={290} h={290} />
        <Title f={f} at={35.0} y={1010} size={150}>¿QUIÉN ES</Title>
        <Title f={f} at={35.5} y={1160} size={190} color={C.red}>SATOSHI?</Title>
        <Typed f={f} at={36.1} y={1365} text="DIME TU TEORÍA ↓" size={40} cps={30} />
        <Stamp f={f} at={36.6} x={760} y={900} rot={-6} size={54}>SIN RESOLVER · Nº 02</Stamp>
      </>
    );
  },
};

const SATOSHI: CutSpec = {
  segs: [S2_HOOK, S2_PAPER, S2_GENESIS, S2_GONE, S2_COINS, S2_CLAIMS, S2_PROOF, S2_END],
  duration: 40,
  black: [],
  stat: [7.6],
  sub: [{ at: 11.8, file: 's2-neg-statue.png' }],
  inserts: [
    { at: 3.1, dur: 0.3, file: 's2-areyou.jpg', pos: '48% 52%', zoom: 3.2 },
    { at: 12.5, dur: 0.3, file: 's2-whois.jpg', pos: '38% 62%' },
    { at: 17.3, dur: 0.3, file: 's2-face.jpg', pos: '50% 35%' },
    { at: 22.1, dur: 0.3, file: 's2-lake.jpg', pos: '35% 50%' },
    { at: 27.7, dur: 0.3, file: 's2-hood.jpg', pos: '50% 35%' },
    { at: 15.0, dur: 0.25, file: 's2-vanish2.jpg', pos: '50% 45%' },
    { at: 19.4, dur: 0.25, file: 's2-face2.jpg', pos: '50% 35%' },
    { at: 25.8, dur: 0.25, file: 's2-lugano4.jpg', pos: '55% 35%' },
    { at: 30.4, dur: 0.25, file: 's2-night.jpg', pos: '50% 45%' },
  ],
  heart: [[0.4, 12.8, 58], [13.0, 17.6, 66], [17.8, 28.0, 80], [28.0, 31.5, 125], [35.0, 40, 52]],
  audio: 'cicada01/mix-s2.wav',
  caseLabel: 'CASO Nº 02 · SATOSHI NAKAMOTO',
  date: '31.10.2008',
  transition: 'whip',
};
export const SATOSHI02 = { fps: FPS, width: 1080, height: 1920, duration: SATOSHI.duration };
export const Satoshi02: React.FC = () => <Cut spec={SATOSHI} />;

// ---------------------------------------------------------------------------------------------------------------
// Caso Nº 02 · Satoshi, two other edits of the same story and music:
//   Satoshi02Doc   documentary: real photos full frame, slow moves, dissolves, big clean titles.
//   Satoshi02Board detective board: the clues pinned on cork, red string to a "¿?" in the middle, one camera.
// ---------------------------------------------------------------------------------------------------------------

/** A clean documentary title: fades and rises in, no redaction, no jitter. */
const DocTitle: React.FC<{ f: number; at: number; y: number; size?: number; color?: string; children: string; still?: boolean }> = ({ f, at, y, size: size0 = 120, color = C.bone, children, still = false }) => {
  const t = f / FPS;
  if (!still && t < at) return null;
  const size = Math.min(size0, Math.floor(980 / (children.length * 0.47)));
  const p = still ? 1 : easeOut((t - at) / 0.6);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y + 26 * (1 - p), textAlign: 'center', whiteSpace: 'nowrap', opacity: p }}>
      <span style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1.08, color, letterSpacing: 2, textShadow: '0 4px 30px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9)' }}>{children}</span>
    </div>
  );
};

const DocNote: React.FC<{ f: number; at: number; y: number; children: string; size?: number; color?: string }> = ({ f, at, y, children, size = 36, color = C.bone }) => {
  const t = f / FPS;
  if (t < at) return null;
  const p = easeOut((t - at) / 0.5);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', opacity: p * 0.92, fontFamily: TYPE, fontSize: size, color, textShadow: '0 3px 16px #000, 0 1px 4px #000' }}>{children}</div>
  );
};

/** Ken Burns: a photo filling the frame, moving from [scale, x%, y%] to [scale, x%, y%] over the shot. */
const Kb: React.FC<{ file: string; t: number; dur: number; from: number[]; to: number[]; fit?: 'cover' | 'contain' }> = ({ file, t, dur, from, to, fit = 'cover' }) => {
  const p = easeInOut(Math.min(1, t / dur));
  const v = (i: number) => from[i] + (to[i] - from[i]) * p;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={src(file)} style={{ width: '100%', height: '100%', objectFit: fit, transform: `scale(${v(0)}) translate(${v(1)}%, ${v(2)}%)` }} />
    </AbsoluteFill>
  );
};

const BottomShade: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.6) 100%)' }} />
);

const D_SEGS: Seg[] = [
  {
    start: 0, end: 4.2, draw: (t, f) => (
      <>
        <Kb file="s2d-statue.jpg" t={t} dur={4.7} from={[1.08, 0, 2]} to={[1.2, 0, -1]} />
        <BottomShade />
        <DocTitle f={f} at={0} y={1170} size={130} still>CREÓ UNA FORTUNA</DocTitle>
        <DocTitle f={f} at={0} y={1300} size={116} color={C.red} still>Y NUNCA LA TOCÓ</DocTitle>
      </>
    ),
  },
  {
    start: 4.2, end: 8.4, draw: (t, f) => (
      <>
        <Kb file="s2d-statue.jpg" t={t} dur={4.7} from={[2.0, 6, -4]} to={[2.2, 2, -7]} />
        <BottomShade />
        <DocNote f={f} at={4.6} y={1100}>31 DE OCTUBRE DE 2008</DocNote>
        <DocTitle f={f} at={5.0} y={1165} size={100}>UN TAL SATOSHI NAKAMOTO</DocTitle>
        <DocTitle f={f} at={5.6} y={1285} size={120} color={C.red}>PUBLICÓ BITCOIN</DocTitle>
      </>
    ),
  },
  {
    start: 8.4, end: 13.4, draw: (t, f) => (
      <>
        <AbsoluteFill style={{ background: '#000' }} />
        <Kb file="s2-genesis.png" t={Math.max(0, t - 0.8)} dur={2.6} from={[1.0, 0, 0]} to={[2.3, -37.3, -6.5]} fit="contain" />
        <BottomShade />
        <DocNote f={f} at={8.6} y={380}>BLOQUE 0 · 3 DE ENERO DE 2009</DocNote>
        <DocTitle f={f} at={10.6} y={1150} size={84}>«EL MINISTRO, AL BORDE DE UN</DocTitle>
        <DocTitle f={f} at={10.9} y={1245} size={84} color={C.red}>SEGUNDO RESCATE A LOS BANCOS»</DocTitle>
        <DocNote f={f} at={11.4} y={1350} size={30}>Titular de The Times escondido en el primer bloque</DocNote>
      </>
    ),
  },
  {
    start: 13.4, end: 18.0, draw: (t, f) => (
      <>
        <Kb file="s2d-are-you.jpg" t={t} dur={5.0} from={[1.0, 0, 0]} to={[2.1, 0.8, -1.9]} />
        <BottomShade />
        <DocNote f={f} at={13.6} y={1110}>2011 · SU ÚLTIMO CORREO CONOCIDO</DocNote>
        <DocTitle f={f} at={14.0} y={1175} size={90}>«ME DEDICO A OTRAS COSAS»</DocTitle>
        <DocTitle f={f} at={15.8} y={1280} size={124} color={C.red}>Y DESAPARECIÓ.</DocTitle>
      </>
    ),
  },
  {
    start: 18.0, end: 22.6, draw: (t, f) => (
      <>
        <AbsoluteFill style={{ background: '#08070A' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(255,184,0,0.14) 0%, rgba(0,0,0,0) 50%)' }} />
        <div style={{ position: 'absolute', left: 540, top: 640, transform: `translate(-50%, -50%) scale(${0.9 + 0.08 * easeInOut(t / 4.6)})` }}>
          <Img src={src('s2-coin.png')} style={{ width: 560, display: 'block' }} />
        </div>
        <DocTitle f={f} at={18.4} y={1130} size={110}>MÁS DE 750.000 BITCOINS</DocTitle>
        <DocNote f={f} at={19.2} y={1250} size={30}>estimación de 2021</DocNote>
        <DocTitle f={f} at={20.4} y={1300} size={100} color={C.red}>NUNCA SE HAN MOVIDO</DocTitle>
      </>
    ),
  },
  {
    start: 22.6, end: 28.2, draw: (t, f) => (
      <>
        <Kb file="s2d-bust.jpg" t={t} dur={6.0} from={[1.05, 0, 0]} to={[1.45, 0, 7]} />
        <BottomShade />
        <DocTitle f={f} at={23.0} y={1120} size={110}>VARIOS DIJERON SER ÉL</DocTitle>
        <DocNote f={f} at={24.8} y={1240}>TRIBUNAL SUPERIOR · LONDRES · 2024</DocNote>
        <DocTitle f={f} at={25.2} y={1300} size={100} color={C.red}>UNO DE ELLOS NO LO ERA</DocTitle>
      </>
    ),
  },
  {
    start: 28.2, end: 33.6, draw: (t, f) => (
      <>
        <Kb file="s2d-who-is.jpg" t={t} dur={5.8} from={[1.0, 22, 0]} to={[1.05, -22, 0]} />
        <BottomShade />
        <DocNote f={f} at={28.5} y={380} size={32}>Grafiti en Tel Aviv: «¿Quién es Satoshi Nakamoto?»</DocNote>
        <DocTitle f={f} at={29.0} y={1080} size={90}>PARA DEMOSTRARLO BASTARÍA</DocTitle>
        <DocTitle f={f} at={29.4} y={1185} size={110}>MOVER UNA MONEDA</DocTitle>
        <DocTitle f={f} at={31.4} y={1312} size={96} color={C.red}>NADIE LO HA HECHO.</DocTitle>
      </>
    ),
  },
  {
    start: 33.6, end: 40.0, draw: (t, f) => (
      <>
        <Kb file="s2d-statue.jpg" t={t} dur={6.4} from={[1.25, 0, -2]} to={[1.05, 0, 1]} />
        <BottomShade />
        <DocNote f={f} at={35.8} y={380} size={30}>SIN RESOLVER · CASO Nº 02</DocNote>
        <DocTitle f={f} at={33.9} y={1080} size={150}>¿QUIÉN ES</DocTitle>
        <DocTitle f={f} at={34.4} y={1235} size={160} color={C.red}>SATOSHI?</DocTitle>
        <DocNote f={f} at={35.4} y={1425}>Dime tu teoría ↓</DocNote>
      </>
    ),
  },
];

const SATOSHI_DOC: CutSpec = { segs: D_SEGS, duration: 40, black: [], stat: [], sub: [], audio: 'cicada01/mix-s2doc.wav', hud: false, film: 'soft', transition: 'fade' };
export const Satoshi02Doc: React.FC = () => <Cut spec={SATOSHI_DOC} />;

// ---- the detective board ------------------------------------------------------------------------------------------

const Pin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: 'radial-gradient(circle at 35% 35%, #FF7A7A 0%, #C1121F 45%, #5A0008 100%)', boxShadow: '0 6px 10px rgba(0,0,0,0.6)' }} />
);

type Clue = { id: string; x: number; y: number; rot: number; w: number; h: number; render: () => React.ReactNode };

const Polaroid: React.FC<{ file: string; w: number; h: number; caption: string }> = ({ file, w, h, caption }) => (
  <div style={{ width: w, height: h, background: '#EFEBE3', padding: '22px 22px 0', boxSizing: 'border-box', boxShadow: '0 18px 40px rgba(0,0,0,0.55)' }}>
    <Img src={src(file)} style={{ width: '100%', height: h - 120, objectFit: 'cover', display: 'block' }} />
    <div style={{ fontFamily: TYPE, fontSize: 34, color: '#222', textAlign: 'center', marginTop: 22 }}>{caption}</div>
  </div>
);

const Card: React.FC<{ w: number; h: number; bg?: string; children: React.ReactNode }> = ({ w, h, bg = '#F2EEE6', children }) => (
  <div style={{ width: w, height: h, background: bg, padding: 34, boxSizing: 'border-box', boxShadow: '0 18px 40px rgba(0,0,0,0.55)', fontFamily: TYPE, color: '#1C1C1C' }}>{children}</div>
);

const CLUES: Clue[] = [
  { id: 'paper', x: 560, y: 820, rot: -6, w: 640, h: 520, render: () => (
    <Card w={640} h={520}>
      <div style={{ fontSize: 40, textAlign: 'center', lineHeight: 1.25 }}>Bitcoin: A Peer-to-Peer Electronic Cash System</div>
      <div style={{ fontSize: 32, textAlign: 'center', marginTop: 26, color: '#555' }}>Satoshi Nakamoto</div>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 10, background: 'rgba(0,0,0,0.15)', margin: '22px 20px 0', width: i === 4 ? '55%' : 'auto' }} />)}
      <div style={{ position: 'absolute', right: 30, bottom: 20, fontSize: 30, color: C.red, transform: 'rotate(-6deg)' }}>31/10/2008</div>
    </Card>
  ) },
  { id: 'genesis', x: 1600, y: 780, rot: 4, w: 760, h: 700, render: () => (
    <div style={{ width: 760, boxShadow: '0 18px 40px rgba(0,0,0,0.55)' }}>
      <Img src={src('s2-genesis.png')} style={{ width: 760, display: 'block' }} />
      <div style={{ background: '#DCD6C8', padding: '18px 24px', fontFamily: TYPE, fontSize: 34, color: '#111' }}>"Chancellor on brink of second bailout for banks"</div>
    </div>
  ) },
  { id: 'email', x: 500, y: 1560, rot: -3, w: 680, h: 360, render: () => (
    <Card w={680} h={360} bg="#F5F2EA">
      <div style={{ fontSize: 28, color: '#666' }}>De: Satoshi Nakamoto · 2011</div>
      <div style={{ fontSize: 28, color: '#666', marginTop: 6 }}>Para: Mike Hearn</div>
      <div style={{ fontSize: 44, marginTop: 40 }}>"I've moved on to other things."</div>
    </Card>
  ) },
  { id: 'coin', x: 1640, y: 1560, rot: 5, w: 560, h: 640, render: () => (
    <div>
      <Polaroid file="s2-coin.png" w={520} h={600} caption="¿Dónde están?" />
      <div style={{ position: 'absolute', left: 300, top: 470, width: 300, padding: 20, background: '#E9DB8E', fontFamily: TYPE, fontSize: 32, color: '#222', transform: 'rotate(-7deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>750.000+ BTC<br />sin moverse</div>
    </div>
  ) },
  { id: 'bust', x: 520, y: 2520, rot: 4, w: 560, h: 700, render: () => (
    <div>
      <Polaroid file="s2d-bust.jpg" w={560} h={700} caption="Varios dijeron ser él" />
      <div style={{ position: 'absolute', left: 300, top: 560, width: 330, padding: 18, background: '#F2EEE6', fontFamily: TYPE, fontSize: 28, color: '#222', transform: 'rotate(-5deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>Tribunal Superior, 2024: uno de ellos <span style={{ color: C.red }}>no lo era</span></div>
    </div>
  ) },
  { id: 'proof', x: 1640, y: 2560, rot: -5, w: 560, h: 420, render: () => (
    <div style={{ width: 560, padding: 36, boxSizing: 'border-box', background: '#E9DB8E', fontFamily: TYPE, fontSize: 40, color: '#222', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', lineHeight: 1.35 }}>
      PRUEBA:<br />mover 1 moneda<br />de Satoshi<br /><span style={{ color: C.red, fontSize: 48 }}>→ NADIE</span>
    </div>
  ) },
];
const CENTER = { x: 1080, y: 2040 };

// camera keys: time, world x, world y, zoom
const CAM: number[][] = [
  [0, 1080, 1920, 0.5], [2.6, 1080, 1920, 0.5], [3.6, 560, 820, 1.2], [8.0, 590, 840, 1.25],
  [9.0, 1600, 780, 1.15], [10.0, 1600, 780, 1.15], [10.8, 1640, 1050, 1.7], [12.9, 1650, 1060, 1.75],
  [13.9, 500, 1560, 1.3], [17.6, 520, 1570, 1.35], [18.5, 1640, 1560, 1.25], [22.2, 1660, 1580, 1.3],
  [23.1, 520, 2520, 1.2], [27.8, 540, 2560, 1.3], [28.7, 1640, 2560, 1.3], [33.2, 1650, 2560, 1.38],
  [34.6, 1080, 1920, 0.5], [40, 1080, 1920, 0.5],
];
const camAt = (t: number) => {
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i];
    const b = CAM[i + 1];
    if (t <= b[0]) {
      const p = easeInOut((t - a[0]) / Math.max(0.001, b[0] - a[0]));
      return [a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p, a[3] + (b[3] - a[3]) * p];
    }
  }
  const l = CAM[CAM.length - 1];
  return [l[1], l[2], l[3]];
};
const ACTIVE: [number, number, string][] = [[3.6, 8.4, 'paper'], [8.4, 13.4, 'genesis'], [13.4, 18.0, 'email'], [18.0, 22.6, 'coin'], [22.6, 28.2, 'bust'], [28.2, 33.6, 'proof']];

const BOARD: Seg = {
  start: 0, end: 40, draw: (t, f) => {
    const [cx, cy, z] = camAt(t);
    const focusY = 640 + (960 - 640) * Math.min(1, Math.max(0, (1.0 - z) / 0.5));
    const active = ACTIVE.find(([a, b]) => t >= a && t < b)?.[2];
    const end = t > 33.6;
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    return (
      <>
        <AbsoluteFill style={{ background: '#2A1C10' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 2160, height: 3840, transformOrigin: '0 0', transform: `translate(${540 - cx * z}px, ${focusY - cy * z}px) scale(${z})` }}>
          <Img src={src('s2-cork.jpg')} style={{ position: 'absolute', inset: 0, width: 2160, height: 3840 }} />
          {/* red strings from every clue to the middle */}
          <svg width={2160} height={3840} style={{ position: 'absolute', inset: 0 }}>
            {CLUES.map((c) => {
              const on = c.id === active || end;
              return <line key={c.id} x1={c.x} y1={c.y - c.h / 2 + 10} x2={CENTER.x} y2={CENTER.y - 300} stroke={on ? '#E0303C' : '#9E1620'} strokeWidth={on ? 9 : 6} opacity={on ? 1 : 0.8} />;
            })}
          </svg>
          {CLUES.map((c) => (
            <div key={c.id} style={{ position: 'absolute', left: c.x - c.w / 2, top: c.y - c.h / 2, width: c.w, transform: `rotate(${c.rot}deg)`, filter: active && c.id !== active && !end ? 'brightness(0.55)' : undefined }}>
              {c.render()}
              <Pin x={c.w / 2} y={10} />
            </div>
          ))}
          {/* the middle: the statue as the unknown */}
          <div style={{ position: 'absolute', left: CENTER.x - 330, top: CENTER.y - 330, width: 660, transform: 'rotate(-2deg)' }}>
            <Polaroid file="s2d-statue.jpg" w={660} h={800} caption="¿SATOSHI NAKAMOTO?" />
            <Pin x={330} y={-300 + 330 - 2} />
          </div>
          <div style={{ position: 'absolute', left: CENTER.x - 160, top: CENTER.y - 130, width: 320, textAlign: 'center', fontFamily: TITLE, fontSize: 300, color: C.red, opacity: end ? 0.55 + 0.4 * pulse : 0.0, textShadow: '0 10px 30px #000' }}>?</div>
        </div>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 66%, rgba(0,0,0,0.88) 82%, rgba(0,0,0,0.7) 100%)' }} />
        {t < 3.6 ? (
          <>
            <DocTitle f={f} at={0} y={1170} size={130} still>CREÓ UNA FORTUNA</DocTitle>
            <DocTitle f={f} at={0} y={1300} size={116} color={C.red} still>Y NUNCA LA TOCÓ</DocTitle>
          </>
        ) : null}
        {t >= 3.6 && t < 8.4 ? (
          <>
            <DocNote f={f} at={4.2} y={1100}>31 DE OCTUBRE DE 2008</DocNote>
            <DocTitle f={f} at={4.6} y={1165} size={100}>UN TAL SATOSHI NAKAMOTO</DocTitle>
            <DocTitle f={f} at={5.2} y={1285} size={120} color={C.red}>PUBLICÓ BITCOIN</DocTitle>
          </>
        ) : null}
        {t >= 8.4 && t < 13.4 ? (
          <>
            <DocNote f={f} at={8.8} y={1100}>BLOQUE 0 · 3 DE ENERO DE 2009</DocNote>
            <DocTitle f={f} at={10.9} y={1165} size={84}>«EL MINISTRO, AL BORDE DE UN</DocTitle>
            <DocTitle f={f} at={11.2} y={1260} size={84} color={C.red}>SEGUNDO RESCATE A LOS BANCOS»</DocTitle>
          </>
        ) : null}
        {t >= 13.4 && t < 18.0 ? (
          <>
            <DocNote f={f} at={13.9} y={1100}>2011 · SU ÚLTIMO CORREO CONOCIDO</DocNote>
            <DocTitle f={f} at={14.3} y={1165} size={90}>«ME DEDICO A OTRAS COSAS»</DocTitle>
            <DocTitle f={f} at={15.8} y={1280} size={124} color={C.red}>Y DESAPARECIÓ.</DocTitle>
          </>
        ) : null}
        {t >= 18.0 && t < 22.6 ? (
          <>
            <DocTitle f={f} at={18.6} y={1130} size={110}>MÁS DE 750.000 BITCOINS</DocTitle>
            <DocTitle f={f} at={20.4} y={1270} size={100} color={C.red}>NUNCA SE HAN MOVIDO</DocTitle>
          </>
        ) : null}
        {t >= 22.6 && t < 28.2 ? (
          <>
            <DocTitle f={f} at={23.2} y={1120} size={110}>VARIOS DIJERON SER ÉL</DocTitle>
            <DocNote f={f} at={24.8} y={1240}>TRIBUNAL SUPERIOR · LONDRES · 2024</DocNote>
            <DocTitle f={f} at={25.2} y={1300} size={100} color={C.red}>UNO DE ELLOS NO LO ERA</DocTitle>
          </>
        ) : null}
        {t >= 28.2 && t < 33.6 ? (
          <>
            <DocTitle f={f} at={28.8} y={1080} size={90}>PARA DEMOSTRARLO BASTARÍA</DocTitle>
            <DocTitle f={f} at={29.2} y={1185} size={110}>MOVER UNA MONEDA</DocTitle>
            <DocTitle f={f} at={31.4} y={1312} size={96} color={C.red}>NADIE LO HA HECHO.</DocTitle>
          </>
        ) : null}
        {end ? (
          <>
            <DocTitle f={f} at={34.4} y={1080} size={150}>¿QUIÉN ES</DocTitle>
            <DocTitle f={f} at={34.9} y={1235} size={160} color={C.red}>SATOSHI?</DocTitle>
            <DocNote f={f} at={35.8} y={1425}>Dime tu teoría ↓</DocNote>
          </>
        ) : null}
      </>
    );
  },
};

const SATOSHI_BOARD: CutSpec = { segs: [BOARD], duration: 40, black: [], stat: [], sub: [], audio: 'cicada01/mix-s2board.wav', hud: false, film: 'soft', transition: 'cut' };
export const Satoshi02Board: React.FC = () => <Cut spec={SATOSHI_BOARD} />;
