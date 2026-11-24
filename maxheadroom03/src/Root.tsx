/**
 * No Presiones · Sin resolver · Caso Nº 03 · El hackeo de Max Headroom (Chicago, 22-nov-1987)
 * 1080x1920 · 30 fps · 1350 frames (45 s) · sin audio (la música va en postproducción).
 *
 * Capas, de abajo arriba: fondo topográfico → escena activa → transición de franjas → HUD persistente
 * (barra superior, timeline izquierdo, subtítulos, scanlines). El HUD nunca corta entre escenas.
 * El último frame deja la máscara sola en el mismo sitio que el frame 0, para que el loop enganche.
 */
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/900.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/800.css';
import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  registerRoot,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';

/* ================================================================== */
/* Tokens                                                              */
/* ================================================================== */
const FPS = 30;
const W = 1080;
const H = 1920;
const DURATION = 1350;

const C = {
  bg: '#0a0a0a',
  white: '#F0F0F0',
  orange: '#FF6B00',
  cyan: '#00FFE0',
  red: '#FF2A4B',
  grey: '#888888',
  dim: '#1B1F24',
};
const HEAD = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Escenas en frames globales. */
const SC = {
  s1: { from: 0, len: 120 },
  s2: { from: 120, len: 180 },
  s3: { from: 300, len: 240 },
  s4: { from: 540, len: 300 },
  s5: { from: 840, len: 240 },
  s6: { from: 1080, len: 270 },
} as const;
const CUTS = [SC.s2.from, SC.s3.from, SC.s4.from, SC.s5.from, SC.s6.from];

/** La máscara vive en el mismo punto en la escena 1 y al final de la 6: así el loop no salta. */
const MASK_Y = 640;

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ci = (f: number, a: number, b: number, x: number, y: number, easing: (t: number) => number = EASE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Desplazamiento que salta cada `every` frames (ruido determinista, no un deslizamiento). */
const gx = (f: number, amp = 18, every = 2) => Math.sin(Math.floor(f / every) * 7.3) * amp;
/** Aberración cromática con sombras desplazadas en cian y rojo. */
const chroma = (d: number) => `${d}px 0 ${C.red}cc, ${-d}px 0 ${C.cyan}cc`;
const glow = (c: string) => `0 0 26px ${c}55, 0 6px 26px rgba(0,0,0,0.9)`;

/* ================================================================== */
/* Piezas básicas                                                      */
/* ================================================================== */
const Mono: React.FC<{
  text: React.ReactNode;
  y: number;
  size?: number;
  color?: string;
  weight?: 500 | 800;
  spacing?: number;
  opacity?: number;
  x?: number;
  align?: 'center' | 'left';
}> = ({ text, y, size = 26, color = C.white, weight = 800, spacing = 4, opacity = 1, x, align = 'center' }) => (
  <div
    style={{
      position: 'absolute',
      left: x ?? 90,
      right: x === undefined ? 90 : undefined,
      top: y,
      textAlign: align,
      fontFamily: MONO,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: spacing,
      color,
      opacity,
      whiteSpace: 'nowrap',
      textShadow: '0 2px 12px rgba(0,0,0,0.95)',
    }}
  >
    {text}
  </div>
);

type Line = { t: string; c: string };
/** Titular condensado en mayúsculas, línea a línea, con entrada spring escalonada. */
const Headline: React.FC<{ lines: Line[]; y: number; size?: number; at?: number; dramatic?: boolean; shadow?: (c: string) => string }> = ({
  lines,
  y,
  size = 140,
  at = 0,
  dramatic = false,
  shadow = glow,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const longest = Math.max(...lines.map((l) => l.t.length));
  const fs = Math.min(size, Math.floor(880 / (longest * 0.47)));
  const whole = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 150 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: y,
        textAlign: 'center',
        transform: dramatic ? `scale(${interpolate(whole, [0, 1], [2.3, 1])})` : undefined,
        opacity: dramatic ? Math.min(1, whole * 1.6) : 1,
        transformOrigin: '50% 30%',
      }}
    >
      {lines.map((l, i) => {
        const s = spring({ frame: f - at - i * 3, fps, config: { damping: 13, stiffness: 190 } });
        return (
          <div
            key={i}
            style={{
              fontFamily: HEAD,
              fontWeight: 900,
              fontSize: fs,
              lineHeight: 0.98,
              letterSpacing: '0.005em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: l.c,
              opacity: dramatic ? 1 : Math.min(1, s * 1.5),
              transform: dramatic ? undefined : `translateY(${(1 - s) * 46}px)`,
              textShadow: shadow(l.c),
            }}
          >
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

/** Texto que se "decodifica": cada letra pasa por caracteres aleatorios antes de fijarse. */
const DecodeText: React.FC<{ text: string; at: number; y: number; size?: number; color?: string; perChar?: number }> = ({
  text,
  at,
  y,
  size = 34,
  color = C.orange,
  perChar = 2,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const GL = '#%&@$0123456789ABCDEF<>/\\';
  const out = text
    .split('')
    .map((ch, i) => {
      if (ch === ' ') return ' ';
      const lock = at + i * perChar + 4;
      return f >= lock ? ch : GL[Math.floor(rnd(i * 17 + f) * GL.length)];
    })
    .join('');
  return <Mono text={out} y={y} size={size} color={color} spacing={6} />;
};

/* ================================================================== */
/* Fondo global: topografía + viñeta                                   */
/* ================================================================== */
const TOPO = (() => {
  const loops: string[] = [];
  const centers = [
    { x: 260, y: 520, k: 9 },
    { x: 900, y: 1500, k: 8 },
  ];
  centers.forEach((c, ci2) => {
    for (let k = 1; k <= c.k; k++) {
      const pts: string[] = [];
      for (let a = 0; a <= 72; a++) {
        const t = (a / 72) * Math.PI * 2;
        const r = k * 85 + 26 * Math.sin(3 * t + k * 0.9 + ci2) + 14 * Math.sin(5 * t - k * 0.6) + 8 * Math.sin(9 * t + k);
        pts.push(`${(c.x + Math.cos(t) * r * 1.15).toFixed(1)},${(c.y + Math.sin(t) * r).toFixed(1)}`);
      }
      loops.push(`M${pts.join(' L')} Z`);
    }
  });
  return loops;
})();

const BaseBackground: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} style={{ position: 'absolute', transform: `translate(${Math.sin(f / 90) * 14}px, ${Math.cos(f / 110) * 18}px)` }}>
        {TOPO.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.dim} strokeWidth={1.6} opacity={0.9} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 48%, transparent 45%, rgba(0,0,0,0.82) 100%)' }} />
    </AbsoluteFill>
  );
};

const Scanlines: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 2px, transparent 2px, transparent 6px)',
          backgroundPosition: `0 ${(f * 1.5) % 6}px`,
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, height: 240, top: ((f * 15) % (H + 480)) - 240, background: 'linear-gradient(180deg, transparent, rgba(240,240,240,0.05), transparent)' }} />
    </AbsoluteFill>
  );
};

/** Nieve de TV: ruido SVG con semilla distinta cada frame. */
const Static: React.FC<{ opacity: number }> = ({ opacity }) => {
  const f = useCurrentFrame();
  if (opacity <= 0.001) return null;
  const id = `noise-${Math.round(f * 10)}`;
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none', mixBlendMode: 'screen' }}>
      <svg width={W} height={H}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f)} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Franjas de color que saltan: el desgarro de la señal. */
const TearBands: React.FC<{ intensity: number; seed?: number }> = ({ intensity, seed = 0 }) => {
  const f = useCurrentFrame();
  if (intensity <= 0) return null;
  const q = Math.floor(f / 2) + seed * 97;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      {Array.from({ length: 9 }, (_, i) => {
        if (rnd(q * 13 + i * 7) > 0.3 + intensity * 0.5) return null;
        const col = [C.cyan, C.orange, C.white, C.red][i % 4];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (rnd(q * 7 + i) - 0.5) * 320 * intensity,
              width: W * (0.35 + rnd(i + q) * 0.8),
              top: rnd(q * 3 + i) * H,
              height: 4 + rnd(q + i * 5) * 60 * intensity,
              background: col,
              opacity: 0.07 + 0.22 * intensity * rnd(i * 9 + q),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* HUD global                                                          */
/* ================================================================== */
const TimelineRuler: React.FC = () => {
  const f = useCurrentFrame();
  const top = H * 0.18;
  const bot = H * 0.85;
  const labels = ['1987', '1995', '2005', '2015', 'HOY'];
  const head = top + (bot - top) * (f / (DURATION - 1));
  const pulse = 0.6 + 0.4 * Math.sin(f / 4);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 35, top, width: 2, height: bot - top, background: `${C.orange}44` }} />
      <div style={{ position: 'absolute', left: 35, top, width: 2, height: head - top, background: C.orange, boxShadow: `0 0 10px ${C.orange}` }} />
      {labels.map((l, i) => {
        const y = top + ((bot - top) * i) / (labels.length - 1);
        const passed = head >= y - 1;
        return (
          <React.Fragment key={l}>
            <div style={{ position: 'absolute', left: 30, top: y - 1, width: 12, height: 2, background: passed ? C.orange : `${C.orange}66` }} />
            <div style={{ position: 'absolute', left: 48, top: y - 9, fontFamily: MONO, fontWeight: passed ? 800 : 500, fontSize: 15, letterSpacing: 2, color: passed ? C.orange : C.grey, opacity: passed ? 1 : 0.6 }}>{l}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 36 - 8, top: head - 8, width: 16, height: 16, borderRadius: 8, background: C.orange, boxShadow: `0 0 ${12 + 10 * pulse}px ${C.orange}, 0 0 4px #fff` }} />
    </AbsoluteFill>
  );
};

const HUDTopBar: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f / FPS).toFixed(1).padStart(4, '0');
  return (
    <div style={{ position: 'absolute', left: 48, right: 48, top: 48, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 2 }}>
      <div>
        <span style={{ color: C.grey }}>SYS://NO_PRESIONES · </span>
        <span style={{ color: C.orange }}>SIN_RESOLVER_03</span>
      </div>
      <div style={{ color: C.cyan }}>T+{t}s</div>
    </div>
  );
};

/** Subtítulos rítmicos: bloques de 2–4 palabras; *palabra* = clave en naranja. Frames globales. */
const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 4, to: 40, text: 'UN NOTICIERO' },
  { from: 40, to: 80, text: 'EN *DIRECTO*' },
  { from: 80, to: 116, text: 'Y DE *PRONTO*…' },
  { from: 126, to: 180, text: 'CHICAGO, *1987*' },
  { from: 180, to: 240, text: 'SECCIÓN DE *DEPORTES*' },
  { from: 240, to: 296, text: 'LA SEÑAL *SALTA*' },
  { from: 306, to: 360, text: 'FALLA EN *WGN*' },
  { from: 360, to: 420, text: '2 HORAS *DESPUÉS*' },
  { from: 420, to: 480, text: 'OTRO CANAL: *WTTW*' },
  { from: 480, to: 536, text: 'Y *VUELVE*' },
  { from: 546, to: 615, text: 'LA MÁSCARA *HABLA*' },
  { from: 615, to: 690, text: 'RÍE Y *DIVAGA*' },
  { from: 690, to: 765, text: 'SE BURLA DE *WGN*' },
  { from: 765, to: 836, text: 'Y *DESAPARECE*' },
  { from: 846, to: 900, text: 'EL *FBI* BUSCA' },
  { from: 900, to: 960, text: 'LA *FCC* TAMBIÉN' },
  { from: 960, to: 1020, text: 'CASI LO *TIENEN*…' },
  { from: 1020, to: 1076, text: 'CASO *ABIERTO*' },
  { from: 1140, to: 1300, text: '¿HACKER O *BROMA*?' },
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = CAPTIONS.find((k) => f >= k.from && f < k.to);
  if (!c) return null;
  const s = spring({ frame: f - c.from, fps, config: { damping: 12, stiffness: 260 } });
  const out = ci(f, c.to - 4, c.to, 1, 0, Easing.linear);
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, bottom: 190, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s * 1.5) * out, transform: `translateY(${(1 - s) * 14}px) scale(${0.9 + 0.1 * s})` }}>
      <div style={{ padding: '8px 24px', borderRadius: 14, background: 'rgba(10,10,10,0.7)', fontFamily: HEAD, fontWeight: 900, fontSize: 64, letterSpacing: '0.01em', color: C.white, whiteSpace: 'nowrap', textShadow: '0 4px 16px rgba(0,0,0,0.9)' }}>
        {c.text.split('*').map((p, i) => (i % 2 ? <span key={i} style={{ color: C.orange, textShadow: glow(C.orange) }}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}
      </div>
    </div>
  );
};

const HUDGlobal: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <Scanlines />
    <TimelineRuler />
    <HUDTopBar />
    <Captions />
  </AbsoluteFill>
);

/* ================================================================== */
/* Transición: franjas horizontales que barren en X + micro-glitch     */
/* ================================================================== */
const HALF = 7;
const SliceTransition: React.FC = () => {
  const f = useCurrentFrame();
  const cut = CUTS.find((b) => Math.abs(f - b) <= HALF);
  if (cut === undefined) return null;
  const p = (f - (cut - HALF)) / (HALF * 2); // 0 → 1, y 0.5 justo en el corte
  const N = 14;
  const bandH = H / N;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: N }, (_, i) => {
        const off = (rnd(i * 7 + cut) - 0.5) * 240;
        const x = interpolate(p, [0, 0.5, 1], [-W - 400, 0, W + 400], { easing: Easing.inOut(Easing.cubic) }) + off * (1 - Math.abs(p - 0.5) * 2);
        const edge = i % 2 ? C.orange : C.cyan;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * bandH - 1,
              height: bandH + 2,
              left: x - 240,
              width: W + 480,
              background: C.bg,
              borderRight: `4px solid ${edge}`,
              borderLeft: `4px solid ${edge}`,
              boxShadow: `0 0 18px ${edge}55`,
            }}
          />
        );
      })}
      <Static opacity={0.35 * (1 - Math.abs(p - 0.5) * 2)} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Máscara 3D (solo CSS)                                               */
/* ================================================================== */
const FACE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '46% 46% 42% 42% / 36% 36% 60% 60%',
  transformStyle: 'preserve-3d',
};

const Mask3D: React.FC<{ ry: number; rx?: number; edge?: string; censor?: boolean }> = ({ ry, rx = 5, edge = C.cyan, censor = true }) => {
  const spec = 42 + ry * 0.7;
  return (
    <div style={{ perspective: 1150, width: 440, height: 580, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ ...FACE, transform: `translateZ(${-6 - i * 6}px)`, background: `rgb(${38 - i * 3}, ${41 - i * 3}, ${46 - i * 3})` }} />
        ))}
        <div
          style={{
            ...FACE,
            background: `linear-gradient(${110 + ry}deg, #1c1f24 0%, #4b525b ${spec - 24}%, #d9dee5 ${spec}%, #5d646e ${spec + 16}%, #2a2e34 78%, #121417 100%)`,
            border: '4px solid #7b838e',
            boxShadow: `0 0 70px ${edge}33, inset 0 0 50px rgba(255,255,255,0.18), inset 0 -50px 80px rgba(0,0,0,0.55)`,
          }}
        >
          {/* pelo engominado */}
          <div style={{ position: 'absolute', left: '7%', right: '7%', top: '-1%', height: '23%', borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%', background: 'repeating-linear-gradient(100deg, #15181c 0 14px, #2b3037 14px 22px)', transform: 'translateZ(10px)' }} />
          {/* nariz y boca para que la luz tenga volumen */}
          <div style={{ position: 'absolute', left: '44%', width: '12%', top: '50%', height: '17%', borderRadius: '40% 40% 50% 50%', background: 'linear-gradient(90deg, rgba(0,0,0,0.5), rgba(255,255,255,0.35))', transform: 'translateZ(24px)' }} />
          <div style={{ position: 'absolute', left: '26%', right: '26%', top: '70%', height: 58, borderBottom: '9px solid #0c0d0f', borderRadius: '0 0 50% 50%', transform: 'translateZ(14px)' }} />
          {/* gafas */}
          <div style={{ position: 'absolute', left: '10%', right: '10%', top: '35%', height: 78, borderRadius: '12px 12px 36px 36px', background: 'linear-gradient(180deg, #050607, #1a1e24 60%, #050607)', transform: 'translateZ(30px)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 50, left: `${30 + ry * 0.8}%`, background: `linear-gradient(90deg, transparent, ${C.cyan}66, transparent)`, transform: 'skewX(-20deg)' }} />
          </div>
          {/* barra de censura, más ancha que la cara */}
          {censor ? <div style={{ position: 'absolute', left: '-16%', right: '-16%', top: '33%', height: 104, background: '#000', transform: 'translateZ(46px) rotate(-3deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }} /> : null}
        </div>
      </div>
    </div>
  );
};

/** Máscara posicionada en el eje vertical de la composición. */
const MaskAt: React.FC<{ y?: number; scale?: number; ry: number; edge?: string; censor?: boolean; opacity?: number }> = ({ y = MASK_Y, scale = 1, ry, edge, censor, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: (W - 440) / 2, top: y - 290, width: 440, height: 580, transform: `scale(${scale})`, transformOrigin: '50% 50%', opacity }}>
    <Mask3D ry={ry} edge={edge} censor={censor} />
  </div>
);

/* ================================================================== */
/* Medidor circular segmentado                                         */
/* ================================================================== */
const CircularGauge: React.FC<{ value: number; color: string; cx: number; cy: number; r?: number; segments?: number }> = ({ value, color, cx, cy, r = 240, segments = 60 }) => {
  const lit = Math.round((value / 100) * segments);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {Array.from({ length: segments }, (_, i) => {
        const a0 = -Math.PI / 2 + (i / segments) * Math.PI * 2 + 0.012;
        const a1 = -Math.PI / 2 + ((i + 1) / segments) * Math.PI * 2 - 0.035;
        const r0 = r - 34;
        const p = (rr: number, a: number) => `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
        const on = i < lit;
        return (
          <path
            key={i}
            d={`M${p(r0, a0)} L${p(r, a0)} A${r},${r} 0 0 1 ${p(r, a1)} L${p(r0, a1)} A${r0},${r0} 0 0 0 ${p(r0, a0)} Z`}
            fill={on ? color : '#1d2126'}
            style={on ? { filter: `drop-shadow(0 0 8px ${color})` } : undefined}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r - 56} fill="none" stroke={`${color}44`} strokeWidth={2} strokeDasharray="4 10" />
      <circle cx={cx} cy={cy} r={r + 22} fill="none" stroke={`${color}33`} strokeWidth={2} />
    </svg>
  );
};

/* ================================================================== */
/* Escena 1 — Gancho visual (0–4 s)                                    */
/* ================================================================== */
const BadgeRing: React.FC<{ cx: number; cy: number; alert: boolean }> = ({ cx, cy, alert }) => {
  const f = useCurrentFrame();
  const col = alert ? C.red : C.cyan;
  const R = 92;
  return (
    <svg width={260} height={260} style={{ position: 'absolute', left: cx - 130, top: cy - 130, overflow: 'visible' }}>
      <defs>
        <path id="badge-ring" d={`M130,130 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`} />
      </defs>
      <circle cx={130} cy={130} r={R + 26} fill="rgba(10,10,10,0.75)" stroke={col} strokeWidth={3} style={{ filter: `drop-shadow(0 0 12px ${col})` }} />
      <g transform={`rotate(${f * 2.2} 130 130)`}>
        <text fill={col} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, letterSpacing: 4 }}>
          <textPath href="#badge-ring">WGN-TV · EN VIVO · WGN-TV · EN VIVO ·</textPath>
        </text>
      </g>
      <circle cx={130} cy={130} r={22} fill={C.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 5))} style={{ filter: `drop-shadow(0 0 14px ${C.red})` }} />
    </svg>
  );
};

const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const ry = 16 * Math.sin(f / 26);
  const callout = ci(f, 14, 26, 0, 1);
  const alert = f >= 110;
  const flash = alert ? 0.5 + 0.5 * Math.sin((f - 110) * 1.9) : 0;
  return (
    <AbsoluteFill>
      <MaskAt ry={ry} />
      {/* conector HUD hacia un costado */}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={736} cy={560} r={7} fill="none" stroke={C.cyan} strokeWidth={2.5} opacity={callout} />
        <polyline points="736,560 836,440 990,440" fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray={320} strokeDashoffset={320 * (1 - callout)} />
      </svg>
      <Mono text="SUJETO: ¿?" x={780} y={398} size={26} color={C.cyan} align="left" opacity={ci(f, 22, 28, 0, 1)} />
      <Headline at={4} y={1000} size={150} lines={[{ t: '22 DE NOVIEMBRE,', c: C.white }, { t: '1987.', c: C.orange }]} />
      <BadgeRing cx={540} cy={1420} alert={alert} />
      <AbsoluteFill style={{ background: C.red, opacity: flash * 0.35, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 2 — Contexto de transmisión (4–10 s)                         */
/* ================================================================== */
const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 14, stiffness: 110 } });
  const mark = ci(f, 22, 44, 0, 1);
  const pill = spring({ frame: f - 52, fps, config: { damping: 10, stiffness: 220 } });
  const hit = f >= 112;
  const rows = ['21:00 · TITULARES', '21:06 · LOCAL', '21:10 · TIEMPO'];
  return (
    <AbsoluteFill>
      <Mono text="22 · NOV · 1987 · CHICAGO" y={210} size={30} color={C.cyan} spacing={8} opacity={ci(f, 0, 8, 0, 1)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, height: 640, perspective: 1400, opacity: enter }}>
        <div
          style={{
            position: 'absolute',
            left: 130,
            width: 820,
            top: 20,
            height: 600,
            transform: `translateY(${(1 - enter) * 200}px) rotateX(12deg) rotateY(-8deg)`,
            borderRadius: 22,
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #20252b 0%, #121518 100%)',
            border: '2px solid #3a414a',
            boxShadow: `0 50px 100px rgba(0,0,0,0.85), 0 0 60px ${C.cyan}18`,
            padding: '40px 46px',
          }}
        >
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: C.grey }}>ESCALETA · WGN-TV · CANAL 9</div>
          {/* bloque destacado con barrido del marcador naranja */}
          <div style={{ position: 'relative', marginTop: 28, padding: '12px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.white, letterSpacing: 1 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${mark * 100}%`, background: `${C.orange}cc`, borderRadius: 4, mixBlendMode: 'screen' }} />
            <span style={{ position: 'relative' }}>NOTICIERO DE LAS 9 PM · WGN-TV</span>
          </div>
          {rows.map((r, i) => (
            <div key={r} style={{ marginTop: 22, fontFamily: MONO, fontWeight: 500, fontSize: 26, color: '#9aa3ae', letterSpacing: 2, opacity: ci(f, 30 + i * 6, 38 + i * 6, 0, 1) }}>
              {r}
            </div>
          ))}
          <div style={{ marginTop: 22, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: hit ? C.red : '#9aa3ae', opacity: ci(f, 50, 58, 0, 1) }}>
            21:14 · DEPORTES {hit ? <span style={{ opacity: Math.floor(f / 6) % 2 ? 1 : 0.3 }}>▸ SEÑAL PERDIDA</span> : null}
          </div>
          <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 5px)' }} />
          <Static opacity={hit ? 0.32 : 0.07} />
        </div>
      </div>
      {/* píldora cian */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pill * 1.4) }}>
        <div style={{ transform: `scale(${pill})`, padding: '14px 30px', borderRadius: 999, border: `2px solid ${C.cyan}`, background: 'rgba(10,10,10,0.85)', fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: C.cyan, boxShadow: `0 0 26px ${C.cyan}44` }}>
          ¿FALLO TÉCNICO O INTRUSIÓN?
        </div>
      </div>
      <Headline at={66} y={1180} size={140} lines={[{ t: '21:14 H', c: C.orange }, { t: 'EN PLENO NOTICIERO', c: C.white }]} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 3 — El secuestro de señal (10–18 s)                          */
/* ================================================================== */
const TAGS = ['90.4 MHz', '0x87F', 'SYNC_ERR', 'CH-09', '0xFF3A', 'CH-11', 'NO_CARRIER', '0x1987', 'VHF', 'SIG_LOST', '0x0B2', '57.2 MHz'];
const FloatingTags: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 22 }, (_, i) => {
        const z = rnd(i * 3.3);
        const x = 90 + rnd(i * 5.1) * 860;
        const y = ((((rnd(i * 2.7) * 1500 - f * (0.6 + z * 1.6)) % 1500) + 1500) % 1500) + 180;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, fontFamily: MONO, fontWeight: 800, fontSize: 16 + z * 18, letterSpacing: 2, color: C.cyan, opacity: 0.12 + z * 0.35, filter: `blur(${(1 - z) * 2}px)` }}>
            {TAGS[i % TAGS.length]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Escena3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = gx(f, 18, f % 5 < 3 ? 2 : 3);
  const enter = spring({ frame: f, fps, config: { damping: 12, stiffness: 100 } });
  const ry = -30 + 60 * ((Math.sin(f / 40) + 1) / 2);
  const ab = 4 + 8 * rnd(Math.floor(f / 2));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <FloatingTags />
        {/* solo lo que se mueve rápido pasa por el motion blur; la nieve va aparte */}
        <CameraMotionBlur shutterAngle={180} samples={4}>
          <AbsoluteFill style={{ transform: `translateX(${gx(f, 10, 3)}px)` }}>
            <MaskAt ry={ry} scale={0.7 + 0.3 * enter} edge={C.red} />
          </AbsoluteFill>
        </CameraMotionBlur>
        <DecodeText text="SEÑAL SECUESTRADA EN VIVO" at={10} y={1010} size={34} />
        <Headline at={34} y={1080} size={150} shadow={() => chroma(ab)} lines={[{ t: '90 SEGUNDOS', c: C.orange }, { t: 'SIN EXPLICACIÓN.', c: C.white }]} />
      </AbsoluteFill>
      <TearBands intensity={0.6 + 0.4 * Math.abs(Math.sin(f / 6))} />
      <Static opacity={0.1 + 0.08 * rnd(f)} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 4 — La máscara habla (18–28 s)                               */
/* ================================================================== */
const Blinds: React.FC = () => {
  const f = useCurrentFrame();
  const N = 26;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: N }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -120 + Math.sin(f / 22 + i * 0.9) * 60 + (f % 53 < 2 ? gx(f + i, 40, 1) : 0),
            width: W + 240,
            top: (i * H) / N,
            height: H / N - 6,
            background: i % 2 ? 'linear-gradient(90deg, transparent, rgba(0,255,224,0.05), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,107,0,0.045), transparent)',
            borderTop: '1px solid rgba(240,240,240,0.03)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const QUOTE: { t: string; c?: string }[] = [
  { t: '"I just made a ' },
  { t: 'giant', c: C.cyan },
  { t: ' ' },
  { t: 'masterpiece', c: C.orange },
  { t: '..."' },
];
const QUOTE_LEN = QUOTE.reduce((n, p) => n + p.t.length, 0);

const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 300], [1, 1.35]);
  const ry = 14 * Math.sin(f / 45);
  const typed = Math.floor(ci(f, 20, 20 + QUOTE_LEN * 1.6, 0, QUOTE_LEN, Easing.linear));
  let left = typed;
  const cursor = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <Blinds />
      <MaskAt y={540} ry={ry} scale={zoom * 0.92} edge={C.orange} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.9) 50%, rgba(10,10,10,0.95) 100%)' }} />
      {/* cita en terminal */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 900, padding: '22px 28px', borderRadius: 14, background: 'rgba(15,15,15,0.85)', border: '1px solid #2a2f36', opacity: ci(f, 10, 18, 0, 1) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.white, whiteSpace: 'nowrap' }}>
          <span style={{ color: C.grey }}>&gt; </span>
          {QUOTE.map((p, i) => {
            const n = Math.max(0, Math.min(p.t.length, left));
            left -= p.t.length;
            return (
              <span key={i} style={p.c ? { color: p.c, textShadow: glow(p.c) } : undefined}>
                {p.t.slice(0, n)}
              </span>
            );
          })}
          <span style={{ color: C.orange, opacity: cursor ? 1 : 0 }}>█</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: 1, color: C.grey, opacity: ci(f, 82, 92, 0, 1) }}>«Acabo de hacer una obra maestra gigante…»</div>
      </div>
      <Headline at={100} y={1110} size={170} lines={[{ t: 'NADIE SUPO', c: C.white }, { t: 'QUIÉN ERA.', c: C.orange }]} />
      <Mono text="— CASI 4 DÉCADAS DESPUÉS —" y={1460} size={28} color={C.orange} spacing={5} opacity={ci(f, 140, 150, 0, 1)} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 5 — Datos y rastreo fallido (28–36 s)                        */
/* ================================================================== */
const FactCard: React.FC<{ at: number; y: number; label: string; verdict: string; edge: string }> = ({ at, y, label, verdict, edge }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 170 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        right: 110,
        top: y,
        transform: `translateY(${(1 - s) * 260}px)`,
        opacity: Math.min(1, s * 1.5),
        padding: '20px 28px',
        background: 'rgba(15,15,15,0.85)',
        borderLeft: `3px solid ${edge}`,
        borderRadius: 6,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: edge }}>&gt; {label}</div>
      <div style={{ marginTop: 8, fontFamily: HEAD, fontWeight: 900, fontSize: 54, letterSpacing: '0.01em', color: C.white, whiteSpace: 'nowrap', opacity: ci(f, at + 8, at + 13, 0, 1) }}>
        <span style={{ color: C.orange }}>→ </span>
        {verdict}
      </div>
    </div>
  );
};

const Escena5: React.FC = () => {
  const f = useCurrentFrame();
  const B = 120; // fase B
  const COLLAPSE = 180; // frame global 1020
  const phaseA = ci(f, B - 8, B, 1, 0, Easing.linear);
  const counter = f < 30 ? Math.round(interpolate(f, [0, 30], [99, 0], { easing: Easing.in(Easing.quad) }) + (f < 26 ? rnd(f) * 6 : 0)) : 0;
  const fill = ci(f, B + 6, COLLAPSE - 6, 0, 99, Easing.out(Easing.quad));
  const collapsed = f >= COLLAPSE;
  const value = collapsed ? ci(f, COLLAPSE, COLLAPSE + 5, 99, 0, Easing.linear) : fill;
  const gColor = collapsed ? C.red : C.orange;
  const shake = collapsed && f < COLLAPSE + 8 ? gx(f, 22, 1) : 0;
  const scanBlink = Math.floor(f / 6) % 2 ? 1 : 0.45;
  return (
    <AbsoluteFill>
      {phaseA > 0 ? (
        <AbsoluteFill style={{ opacity: phaseA }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 240, color: C.orange, textShadow: glow(C.orange), display: 'inline-block', minWidth: 150 }}>{counter}</span>
            <span style={{ fontSize: 120, color: C.white, marginLeft: 24, textShadow: glow(C.white) }}>ARRESTOS</span>
          </div>
          <FactCard at={26} y={600} edge={C.cyan} label="FBI INVESTIGÓ" verdict="NINGÚN DETENIDO" />
          <FactCard at={44} y={810} edge={C.orange} label="LA FCC ABRIÓ EXPEDIENTE" verdict="NADIE FUE ACUSADO" />
          <FactCard at={62} y={1020} edge={C.cyan} label="GRABACIÓN INTACTA" verdict="AUTOR DESCONOCIDO" />
        </AbsoluteFill>
      ) : null}
      {f >= B ? (
        <AbsoluteFill style={{ transform: `translateX(${shake}px)`, opacity: ci(f, B, B + 6, 0, 1) }}>
          <CircularGauge value={value} color={gColor} cx={540} cy={760} r={250} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 150, color: gColor, textShadow: collapsed ? chroma(6) : glow(gColor) }}>
            {Math.round(value)}%
          </div>
          {collapsed ? (
            <>
              <Mono text="SIN IDENTIFICAR · CASO SIN RESOLVER" y={1080} size={28} color={C.red} spacing={3} />
              <Headline at={COLLAPSE + 6} y={1160} size={150} lines={[{ t: 'NUNCA LO', c: C.red }, { t: 'ATRAPARON.', c: C.red }]} />
            </>
          ) : (
            <Mono text="RASTREANDO SEÑAL..." y={1080} size={30} color={C.orange} spacing={6} opacity={scanBlink} />
          )}
          <AbsoluteFill style={{ background: C.red, opacity: collapsed ? ci(f, COLLAPSE, COLLAPSE + 10, 0.4, 0, Easing.linear) : 0, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 6 — CTA final en bucle (36–45 s)                             */
/* ================================================================== */
const CodeColumns: React.FC<{ opacity: number }> = ({ opacity }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {Array.from({ length: 11 }, (_, col) => {
        const speed = 1.2 + rnd(col * 3) * 2;
        const y = ((f * speed + rnd(col) * 2200) % 2200) - 400;
        const glyphs = Array.from({ length: 12 }, (_, k) =>
          col % 3 === 0
            ? (rnd(col * 11 + k) > 0.5 ? '1' : '0') + (rnd(col + k * 7) > 0.5 ? '1' : '0')
            : Math.floor(rnd(col * 31 + k) * 255).toString(16).toUpperCase().padStart(2, '0'),
        );
        return (
          <div key={col} style={{ position: 'absolute', left: 110 + col * 82, top: y, fontFamily: MONO, fontWeight: 500, fontSize: 22, lineHeight: 1.6, color: col % 4 === 1 ? C.orange : C.cyan, opacity: 0.18 + 0.12 * rnd(col), whiteSpace: 'pre' }}>
            {glyphs.join('\n')}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Escena6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const GL = 45; // 1,5 s de glitch
  const glitching = f < GL;
  const settle = ci(f, GL - 10, GL, 1, 0, Easing.linear);
  const TITLE = 52;
  const END = 270;
  const textOut = ci(f, END - 16, END - 4, 1, 0, Easing.linear);
  // al final la máscara vuelve a como está en el frame 0: sola, nítida, sin glitch
  const maskOpacity = glitching
    ? rnd(f * 3) > 0.35
      ? 1
      : 0.2
    : interpolate(f, [GL, GL + 10, END - 16, END - 4], [1, 0.32, 0.32, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arrow = spring({ frame: f - TITLE - 14, fps, config: { damping: 12, stiffness: 160 } });
  const bob = Math.abs(Math.sin((f - TITLE) / 6)) * 18;
  return (
    <AbsoluteFill>
      <CodeColumns opacity={ci(f, GL, GL + 20, 0, 1) * textOut} />
      <AbsoluteFill style={{ transform: glitching ? `translateX(${gx(f, 50 * settle, 2)}px)` : undefined, filter: glitching && rnd(Math.floor(f / 2)) > 0.78 ? 'invert(1)' : undefined }}>
        <MaskAt ry={glitching ? gx(f, 40 * settle, 2) : 12 * Math.sin((f - GL) / 40) * textOut} opacity={maskOpacity} edge={glitching ? C.red : C.cyan} />
      </AbsoluteFill>
      {glitching ? (
        <>
          <TearBands intensity={settle} seed={5} />
          <Static opacity={0.55 * settle} />
        </>
      ) : null}
      <AbsoluteFill style={{ opacity: textOut }}>
        <Headline at={TITLE} y={980} size={130} dramatic lines={[{ t: '¿QUIÉN CREES', c: C.white }, { t: 'QUE ERA MAX HEADROOM?', c: C.orange }]} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1240 + bob, textAlign: 'center', opacity: arrow, transform: `scale(${arrow})` }}>
          <svg width={70} height={84} viewBox="0 0 70 84">
            <path d="M35 4 V70 M10 46 L35 74 L60 46" fill="none" stroke={C.orange} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${C.orange})` }} />
          </svg>
        </div>
        <Mono text="TU TEORÍA EN COMENTARIOS" y={1370} size={30} color={C.white} spacing={9} opacity={ci(f, TITLE + 20, TITLE + 28, 0, 1)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Composición principal                                               */
/* ================================================================== */
const MaxHeadroom1987: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <BaseBackground />
    <Sequence from={SC.s1.from} durationInFrames={SC.s1.len}>
      <Escena1 />
    </Sequence>
    <Sequence from={SC.s2.from} durationInFrames={SC.s2.len}>
      <Escena2 />
    </Sequence>
    <Sequence from={SC.s3.from} durationInFrames={SC.s3.len}>
      <Escena3 />
    </Sequence>
    <Sequence from={SC.s4.from} durationInFrames={SC.s4.len}>
      <Escena4 />
    </Sequence>
    <Sequence from={SC.s5.from} durationInFrames={SC.s5.len}>
      <Escena5 />
    </Sequence>
    <Sequence from={SC.s6.from} durationInFrames={SC.s6.len}>
      <Escena6 />
    </Sequence>
    {/* las franjas son baratas de dibujar, así que aquí el motion blur sale casi gratis */}
    <CameraMotionBlur shutterAngle={200} samples={4}>
      <SliceTransition />
    </CameraMotionBlur>
    <HUDGlobal />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="MaxHeadroom1987" component={MaxHeadroom1987} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);

registerRoot(RemotionRoot);
