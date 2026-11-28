import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Floaters3D, Heart3D, Star3D } from './Three3D';
import { loadFont } from '@remotion/fonts';
import tl from './timeline.json';

// Versión completa: mismo orden y duración del video original (63,3 s sin el cierre de CapCut) + 2,7 s de cierre de marca.
// Efectos: corrección de color, zoom "jump cut" en la toma larga, golpe de zoom + destello en cada corte rápido,
// pulso de zoom al ritmo de la música, subtítulos palabra por palabra, corazones, confeti, viñeta y música con efectos de sonido.
loadFont({ family: 'CeiInter', url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
const FONT = "'CeiInter', 'Noto Color Emoji', sans-serif";
const FPS = tl.fps;
const W = 1080;
const H = 1920;
const SRC_W = 480;
const SRC_H = 864;
export const FULL = { fps: FPS, duration: tl.duration };

type Scene = { from: number; to: number; mode: string; cy?: number; ch?: number; src?: number; rate?: number };
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const GRADE = 'saturate(1.28) contrast(1.07) brightness(1.04)';

const Vid: React.FC<{ left: number; top: number; k: number; start: number; blurPx?: number; rate?: number }> = ({ left, top, k, start, blurPx, rate = 1 }) => (
  <OffthreadVideo
    playbackRate={rate}
    src={staticFile('cei/src.mp4')}
    trimBefore={Math.round(start * FPS)}
    muted
    style={{ position: 'absolute', left, top, width: SRC_W * k, height: SRC_H * k, maxWidth: 'none', filter: blurPx ? `blur(${blurPx}px) brightness(0.7) saturate(1.3)` : undefined }}
  />
);

// Pulso de zoom en cada tiempo de la música.
const beatPulse = (t: number) => {
  const beat = 60 / tl.bpm;
  const ph = (t % beat) / beat;
  return Math.exp(-ph * 7);
};

const Scene: React.FC<{ sc: Scene; punch: boolean; idx: number }> = ({ sc, punch, idx }) => {
  const frame = useCurrentFrame();
  const t = sc.from + frame / FPS;
  const st = sc.src ?? sc.from;
  const pulse = 1 + 0.022 * beatPulse(t);
  if (sc.mode === 'cover') {
    const cropY = 52; // sin la marca de CapCut
    const cropH = SRC_H - cropY;
    // Ventanas en que el video se convierte en una tarjeta 3D que flota sobre un fondo difuminado.
    let p = 0;
    for (const [a, b] of tl.cards as number[][]) {
      p = Math.max(p, Math.min(Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - a) / 0.45))), Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (b - t) / 0.45)))));
    }
    const cw = interpolate(p, [0, 1], [W, 900]);
    const ch = interpolate(p, [0, 1], [H, 1420]);
    const cl = (W - cw) / 2;
    const ct = interpolate(p, [0, 1], [0, 250]);
    const radius = 56 * p;
    const ry = p * Math.sin(t * 1.1) * 9;
    const rx = p * (-3 + Math.cos(t * 0.8) * 2);
    const k = Math.max(cw / SRC_W, ch / cropH);
    const kbg = Math.max(W / SRC_W, H / cropH);
    // Zoom estilo "jump cut": cambia de plano cada pocos segundos.
    const ev = tl.zoomEvents;
    let i = 0;
    for (let j = 0; j < ev.length; j++) if (t >= ev[j].t) i = j;
    const cur = ev[i];
    const prev = ev[Math.max(0, i - 1)];
    const since = (t - cur.t) * FPS;
    const e = Easing.out(Easing.cubic)(Math.min(1, since / 6));
    const next = ev[i + 1];
    const drift = next ? 0.04 * Math.min(1, (t - cur.t) / (next.t - cur.t)) : 0;
    const s = (prev.s + (cur.s - prev.s) * e + drift) * pulse;
    return (
      <AbsoluteFill style={{ overflow: 'hidden', filter: GRADE, background: '#142a66' }}>
        {p > 0.001 && (
          <AbsoluteFill style={{ opacity: p }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <Vid left={(W - SRC_W * kbg) / 2} top={-cropY * kbg + (H - cropH * kbg) / 2} k={kbg} start={st} rate={sc.rate ?? 1} blurPx={40} />
            </div>
            <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(20,40,110,0.55),rgba(255,180,60,0.18))' }} />
          </AbsoluteFill>
        )}
        <div style={{ position: 'absolute', inset: 0, perspective: 1700 }}>
          <div style={{ position: 'absolute', left: cl, top: ct, width: cw, height: ch, borderRadius: radius, overflow: 'hidden', transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${p > 0.001 ? 1 : 1})`, boxShadow: p > 0.01 ? `0 ${40 * p}px ${90 * p}px rgba(0,0,0,0.55)` : undefined, border: p > 0.01 ? `${Math.round(6 * p)}px solid rgba(255,255,255,0.9)` : undefined, boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: `${cur.ox}% ${cur.oy}%` }}>
              <Vid left={(cw - SRC_W * k) / 2} top={-cropY * k + (ch - cropH * k) / 2} k={k} start={st} rate={sc.rate ?? 1} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  const cy = sc.cy as number;
  const ch = sc.ch as number;
  const kb = H / ch;
  const kf = W / SRC_W;
  const fh = ch * kf;
  const pz = punch ? 1 + 0.2 * Math.pow(1 - Math.min(1, frame / 9), 2) : 1 + 0.05 * (frame / ((sc.to - sc.from) * FPS));
  const tilt = punch ? (idx % 2 ? 1 : -1) * 2.2 * Math.pow(1 - Math.min(1, frame / 9), 2) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#111', filter: GRADE }}>
      <Vid left={(W - SRC_W * kb) / 2} top={-cy * kb} k={kb} start={st} rate={sc.rate ?? 1} blurPx={36} />
      <div style={{ position: 'absolute', left: 0, top: (H - fh) / 2, width: W, height: fh, overflow: 'hidden', transform: `scale(${pz * pulse}) rotate(${tilt}deg)`, transformOrigin: '50% 45%', boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}>
        <Vid left={0} top={-cy * kf} k={kf} start={st} rate={sc.rate ?? 1} />
      </div>
    </AbsoluteFill>
  );
};

type Word = { t: string; hl?: boolean };
const Caption: React.FC<{ from: number; to: number; y: number; lines: Word[][]; size?: number }> = ({ from, to, y, lines, size = 86 }) => {
  const frame = useCurrentFrame();
  const f0 = Math.round(from * FPS);
  const f1 = Math.round(to * FPS);
  if (frame < f0 || frame >= f1) return null;
  const out = interpolate(frame, [f1 - 6, f1], [1, 0], { extrapolateLeft: 'clamp' });
  let wi = 0;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', opacity: out, transform: `translateY(${(1 - out) * -20}px)` }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ lineHeight: 1.12 }}>
          {ln.map((w, j) => {
            const d = f0 + wi * 4;
            wi++;
            const p = spring({ frame: frame - d, fps: FPS, config: { damping: 9, stiffness: 220 } });
            const emoji = /\p{Extended_Pictographic}/u.test(w.t);
            return (
              <span key={j} style={{ display: 'inline-block', marginRight: Math.round(size * 0.3), opacity: frame >= d ? 1 : 0, transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -8}deg)`, fontFamily: FONT, fontWeight: 900, fontSize: emoji ? size * 1.05 : size, color: w.hl ? '#FFD84A' : '#fff', WebkitTextStroke: emoji ? undefined : '11px rgba(20,20,40,0.92)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.55)' }}>
                {w.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 48, top: 170, opacity: o, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 14px', borderRadius: 999, background: 'rgba(20,30,70,0.72)', border: '2px solid rgba(255,255,255,0.35)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, background: '#FFD84A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎒</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#fff' }}>Fundación Transformando Mi Realidad</div>
    </div>
  );
};

const Hearts: React.FC<{ from: number; to: number; density?: number }> = ({ from, to, density = 0.9 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < from || t > to + 3) return null;
  const items = [];
  const total = Math.round((to - from) * density * 2.2);
  for (let i = 0; i < total; i++) {
    const born = from + (i / total) * (to - from);
    const age = t - born;
    if (age < 0 || age > 3) continue;
    const x = 80 + rnd(i + from) * 920 + Math.sin(age * 3 + i) * 40;
    const y = 1500 - age * 420;
    const o = Math.min(1, age * 4) * Math.min(1, (3 - age) * 1.5);
    const sz = 50 + rnd(i * 3 + 1) * 50;
    items.push(<div key={i} style={{ position: 'absolute', left: x, top: y, fontSize: sz, opacity: o * 0.9, transform: `rotate(${Math.sin(age * 2 + i) * 20}deg)` }}>{['❤️', '💛', '🧡', '💙', '✨'][i % 5]}</div>);
  }
  return <>{items}</>;
};

const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const age = frame / FPS - at;
  if (age < 0 || age > 2.6) return null;
  const cols = ['#FFD84A', '#FF6B6B', '#4aa3f0', '#7BE495', '#FF9F43', '#fff'];
  const n = 70;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const ang = rnd(i) * Math.PI * 2;
        const sp = 500 + rnd(i + 9) * 900;
        const x = W / 2 + Math.cos(ang) * sp * age * 0.9;
        const y = 760 + Math.sin(ang) * sp * age * 0.7 + 900 * age * age;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 16 + rnd(i + 3) * 14, height: 26 + rnd(i + 5) * 16, background: cols[i % cols.length], opacity: Math.max(0, 1 - age / 2.6), transform: `rotate(${age * (300 + rnd(i) * 500)}deg)` }} />;
      })}
    </>
  );
};

const Flashes: React.FC = () => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const t of tl.flashes) {
    const f = frame - Math.round(t * FPS);
    if (f >= 0 && f < 5) o = Math.max(o, (1 - f / 5) * 0.55);
  }
  return o > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: o }} /> : null;
};

const Glow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = beatPulse(t);
  return <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,200,90,0.28), rgba(255,200,90,0) 60%)', mixBlendMode: 'screen', opacity: 0.35 + 0.5 * b }} />;
};

const CAPS: { from: number; to: number; y: number; size?: number; lines: Word[][] }[] = [
  { from: 0.05, to: 2.65, y: 290, size: 70, lines: [[{ t: 'Así' }, { t: 'fue' }, { t: 'nuestro' }], [{ t: 'ÚLTIMO', hl: true }, { t: 'DÍA', hl: true }, { t: 'de' }, { t: 'clases' }], [{ t: '2026' }, { t: '🥹' }]] },
  { from: 2.85, to: 9.9, y: 1100, lines: [[{ t: 'Growing' }, { t: 'with' }], [{ t: 'Purpose', hl: true }, { t: '🎒' }]] },
  { from: 10.0, to: 15.1, y: 1100, lines: [[{ t: 'Sin' }, { t: 'imaginar' }], [{ t: 'la' }, { t: 'sorpresa', hl: true }, { t: '🎁' }]] },
  { from: 15.3, to: 18.8, y: 1100, lines: [[{ t: '¡Su' }, { t: 'desayuno' }], [{ t: 'FAVORITO!', hl: true }, { t: '😋' }]] },
  { from: 18.9, to: 22.1, y: 1100, lines: [[{ t: 'Hecho' }, { t: 'con' }, { t: 'amor', hl: true }], [{ t: 'en' }, { t: 'cada' }, { t: 'lonchera' }, { t: '💛' }]] },
  { from: 22.2, to: 26.5, y: 1100, lines: [[{ t: '¡Qué' }, { t: 'emoción' }], [{ t: 'abrir' }, { t: 'la' }, { t: 'lonchera!', hl: true }, { t: '🥹' }]] },
  { from: 26.6, to: 29.3, y: 1100, lines: [[{ t: 'Cada' }, { t: 'bocado,' }], [{ t: 'un' }, { t: 'abrazo', hl: true }, { t: 'de' }, { t: 'mamá', hl: true }, { t: '🤗' }]] },
  { from: 29.4, to: 32.6, y: 1100, lines: [[{ t: 'Entre' }, { t: 'risas' }], [{ t: 'y' }, { t: 'amigos', hl: true }, { t: '🧡' }]] },
  { from: 32.7, to: 38.9, y: 1100, lines: [[{ t: 'Compartir,' }, { t: 'agradecer' }], [{ t: 'y' }, { t: 'ser' }, { t: 'felices', hl: true }, { t: '💙' }]] },
  { from: 39.1, to: 43.3, y: 1100, lines: [[{ t: 'Sin' }, { t: 'decir' }], [{ t: 'una' }, { t: 'palabra…', hl: true }, { t: '🥹' }]] },
  { from: 43.5, to: 46.9, y: 1100, lines: [[{ t: 'Educación' }], [{ t: 'con' }, { t: 'propósito', hl: true }, { t: '🌟' }]] },
  { from: 47.1, to: 51.2, y: 1100, lines: [[{ t: 'Un' }, { t: 'cierre' }, { t: 'de' }, { t: 'año' }], [{ t: 'inolvidable', hl: true }, { t: '✨' }]] },
  { from: 51.6, to: 57.0, y: 1100, size: 96, lines: [[{ t: '¡MIREN' }, { t: 'ESAS' }], [{ t: 'SONRISAS!', hl: true }, { t: '😍' }]] },
  { from: 57.3, to: 59.6, y: 1100, size: 90, lines: [[{ t: 'Su' }, { t: 'reacción' }], [{ t: 'lo' }, { t: 'dice' }, { t: 'todo', hl: true }, { t: '🥹' }]] },
  { from: 59.8, to: 63.2, y: 1010, size: 74, lines: [[{ t: 'PARTE', hl: true }, { t: '2', hl: true }, { t: '👉' }], [{ t: 'Reaccionaron' }, { t: 'a' }, { t: 'los' }], [{ t: 'videos' }, { t: 'de' }, { t: 'sus' }, { t: 'papás' }]] },
];

// ---------- Cierre: obra social de la Fundación (voz en off) ----------
const FlipText: React.FC<{ text: string; at: number; size: number; color?: string; y: number; hlWords?: number[]; stroke?: boolean }> = ({ text, at, size, color = '#fff', y, hlWords = [], stroke }) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', perspective: 900, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1 }}>
      {words.map((w, i) => {
        const d = Math.round(at * FPS) + i * 4;
        const p = spring({ frame: frame - d, fps: FPS, config: { damping: 11, stiffness: 150 } });
        return (
          <span key={i} style={{ display: 'inline-block', marginRight: size * 0.28, opacity: frame >= d ? 1 : 0, transform: `rotateX(${(1 - p) * -85}deg) translateY(${(1 - p) * 30}px)`, transformOrigin: '50% 100%', color: hlWords.includes(i) ? '#FFD84A' : color, textShadow: '0 6px 20px rgba(0,0,0,0.35)', WebkitTextStroke: stroke ? '8px rgba(20,30,80,0.8)' : undefined, paintOrder: 'stroke fill' }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Card3D: React.FC<{ start: number; left: number; top: number; w: number; ry: number; z: number; at: number; out: number }> = ({ start, left, top, w, ry, z, at, out }) => {
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const kf = w / SRC_W;
  const h = Math.round(644 * kf);
  const pin = spring({ frame: frame - Math.round(at * FPS), fps: FPS, config: { damping: 12, stiffness: 110 } });
  const pout = Easing.in(Easing.cubic)(Math.min(1, Math.max(0, (u - out) / 0.6)));
  const float = Math.sin(u * 2 + left) * 12;
  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h, borderRadius: 34, overflow: 'hidden', border: '6px solid #fff', boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', opacity: 1 - pout, transform: `translateZ(${z}px) translateY(${(1 - pin) * 700 + float + pout * 900}px) rotateY(${ry + Math.sin(u * 1.3) * 4}deg) rotateX(${(1 - pin) * 40}deg) rotateZ(${pout * (ry > 0 ? 25 : -25)}deg)` }}>
      <OffthreadVideo src={staticFile('cei/src.mp4')} playbackRate={0.45} trimBefore={Math.round(start * FPS)} muted style={{ position: 'absolute', left: 0, top: -110 * kf, width: SRC_W * kf, height: SRC_H * kf, maxWidth: 'none' }} />
    </div>
  );
};

const ClosingGL: React.FC = () => {
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const ease = Easing.inOut(Easing.cubic);
  const kf = (arr: [number, number][]) => interpolate(u, arr.map((a) => a[0]), arr.map((a) => a[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const hs = kf([[5.9, 0], [6.5, 1.55], [6.9, 1.35], [10.2, 1.4]]);
  const hy = -0.25;
  const beat = 1 + 0.07 * Math.pow(Math.max(0, Math.sin(u * Math.PI * 1.8)), 4);
  const orbit = Math.min(1, hs / 1.2);
  // Estrellas 3D que giran alrededor del corazón.
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 6]} intensity={2.4} />
      <pointLight position={[-3, -2, 4]} intensity={18} color="#ffd9a0" />
      {hs > 0.01 && <Heart3D scale={hs * beat} position={[0, hy, 0]} rot={[Math.sin(u * 1.1) * 0.12, Math.sin(u * 1.2) * 0.85, 0]} />}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = u * 0.9 + (i / 8) * Math.PI * 2;
        const r = 1.6 + 0.25 * Math.sin(u + i);
        return <Star3D key={i} scale={0.3 * orbit} position={[Math.cos(a) * r, hy + Math.sin(a) * 0.45 * r, Math.sin(a) * r * 0.6]} rot={[u * 2 + i, u * 3, 0]} />;
      })}
    </ThreeCanvas>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const phase = (a: number, b: number) => interpolate(u, [a, a + 0.4, b - 0.4, b], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = 1 + 0.035 * Math.sin(u * 7);
  const btnIn = spring({ frame: frame - Math.round(8.0 * FPS), fps: FPS, config: { damping: 11, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg,#1d3a8a 0%,#2f6fd6 55%,#4aa3f0 100%)', fontFamily: FONT, color: '#fff', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -600, top: 100, width: 2280, height: 2280, opacity: 0.12, background: 'repeating-conic-gradient(from 0deg at 50% 50%, #fff 0deg 8deg, transparent 8deg 24deg)', transform: `rotate(${u * 6}deg)` }} />
      <div style={{ position: 'absolute', top: -220 + Math.sin(u) * 30, right: -220, width: 700, height: 700, borderRadius: 350, background: 'rgba(255,216,74,0.2)' }} />
      <div style={{ position: 'absolute', bottom: 120 + Math.cos(u) * 30, left: -260, width: 640, height: 640, borderRadius: 320, background: 'rgba(255,255,255,0.1)' }} />

      <ClosingGL />

      {/* P1: quiénes son (voz: "Esto es Transformando Mi Realidad...") */}
      <div style={{ position: 'absolute', inset: 0, opacity: phase(-1, 6.6) }}>
        <FlipText text="Esto es" at={0.2} size={56} y={210} />
        <FlipText text="Transformando Mi Realidad" at={0.6} size={64} y={300} hlWords={[0]} />
        <div style={{ position: 'absolute', left: 0, top: 650, width: 1080, height: 700, perspective: 1500 }}>
          <Card3D start={57.9} left={690} top={110} w={340} ry={-26} z={-120} at={1.0} out={5.8} />
          <Card3D start={56.95} left={50} top={110} w={340} ry={26} z={-120} at={1.2} out={5.8} />
          <Card3D start={54.3} left={310} top={30} w={460} ry={0} z={80} at={0.8} out={5.8} />
        </div>
        <FlipText text="Programa Growing with Purpose" at={2.4} size={46} y={1400} color="#FFD84A" />
        <FlipText text="Creciendo con Propósito · C.E.I." at={3.0} size={38} y={1470} />
      </div>

      {/* P2: parte 2 y seguir la página (voz: "Síguenos y no te pierdas la parte dos") */}
      <div style={{ position: 'absolute', inset: 0, opacity: interpolate(u, [6.3, 6.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <FlipText text="PARTE 2 👉" at={6.6} size={120} y={300} hlWords={[0, 1]} />
        <FlipText text="Reaccionan a los videos de sus papás" at={7.3} size={46} y={470} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', perspective: 800 }}>
          <div style={{ display: 'inline-block', background: '#fff', color: '#1d3a8a', borderRadius: 999, fontSize: 56, padding: '22px 64px', transform: `scale(${pulse * btnIn}) rotateX(${(1 - btnIn) * -50}deg)`, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
            Síguenos 💛
          </div>
        </div>
        <FlipText text="Comparte y ayúdanos a sembrar más sonrisas" at={8.6} size={38} y={1480} color="#FFD84A" />
        <FlipText text="Fundación Transformando Mi Realidad" at={9.0} size={34} y={1570} />
      </div>
    </AbsoluteFill>
  );
};

export const Full: React.FC = () => {
  const endF = Math.round(tl.contentEnd * FPS);
  const totalF = Math.round(tl.duration * FPS);
  const win = (a: number, b: number) => ({ from: Math.round(a * FPS), durationInFrames: Math.round((b - a) * FPS) });
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('cei/mix_v2.wav')} volume={1} />
      {(tl.scenes as Scene[]).map((sc, i) => {
        const from = Math.round(sc.from * FPS);
        const dur = Math.round(sc.to * FPS) - from;
        const punch = tl.punches.some((p) => Math.abs(p - sc.from) < 0.01);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Scene sc={sc} punch={punch} idx={i} />
          </Sequence>
        );
      })}
      {(tl.inserts as Scene[]).map((sc, i) => (
        <Sequence key={`ins${i}`} from={Math.round(sc.from * FPS)} durationInFrames={Math.round(sc.to * FPS) - Math.round(sc.from * FPS)}>
          <Scene sc={sc} punch idx={i + 40} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={endF}>
        <Glow />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.38) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 62%,rgba(0,0,0,0.38) 100%)' }} />
        <Sequence {...win(20.4, 35.8)}>
          <Floaters3D from={0} to={11} fps={FPS} />
        </Sequence>
        <Sequence {...win(51.4, 63.3)}>
          <Floaters3D from={0} to={9} fps={FPS} density={1.5} />
        </Sequence>
        <Confetti at={51.43} />
        <Chip />
        {CAPS.map((c, i) => (
          <Caption key={i} {...c} />
        ))}
        <Flashes />
      </Sequence>
      <Sequence from={endF} durationInFrames={totalF - endF}>
        <Closing />
        <Confetti at={6.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
