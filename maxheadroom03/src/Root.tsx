/**
 * No Presiones · Sin resolver · Caso Nº 03 · El hackeo de Max Headroom (Chicago, 22-nov-1987)
 * 1080x1920 · 30 fps · 1159 frames (38,6 s) · audio: public/audio/mix.wav (voz + música + efectos, tools/audio.py).
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
  Audio,
  Composition,
  Easing,
  getInputProps,
  Img,
  interpolate,
  registerRoot,
  Sequence,
  spring,
  staticFile,
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
const DURATION = 1159;

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
  s1: { from: 0, len: 204 },
  s2: { from: 204, len: 200 },
  s3: { from: 404, len: 218 },
  s4: { from: 622, len: 250 },
  s5: { from: 872, len: 134 },
  s6: { from: 1006, len: 153 },
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
/** Golpe de cámara: salta en el frame del impacto y se asienta en ~0,4 s. */
const punch = (f: number, hits: number[], amp = 0.06) =>
  1 + hits.reduce((acc, h) => (f >= h && f < h + 14 ? acc + amp * Math.exp(-(f - h) / 3.5) : acc), 0);

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

/** Marcador de serie: igual en todos los Shorts numerados del canal. Cambiar aquí el número de cada caso. */
const SERIES = { tag: 'FALLO #04', name: 'SIN RESOLVER' };

const HUDTopBar: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f / FPS).toFixed(1).padStart(4, '0');
  return (
    <div style={{ position: 'absolute', left: 48, right: 48, top: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ background: C.orange, color: C.bg, padding: '6px 14px', borderRadius: 6, fontSize: 28, letterSpacing: 3, boxShadow: `0 0 18px ${C.orange}66` }}>{SERIES.tag}</span>
        <span style={{ color: C.white, fontSize: 24, letterSpacing: 4 }}>{SERIES.name}</span>
        <span style={{ color: C.grey, fontSize: 18 }}>· NO PRESIONES</span>
      </div>
      <div style={{ color: C.cyan }}>T+{t}s</div>
    </div>
  );
};

/**
 * Subtítulos karaoke sincronizados con la voz (public/audio/voz-words.json, Whisper): frases cortas en una franja fija
 * dentro de la zona segura, con la palabra que se está diciendo en naranja. Mismo sistema que en el caso de Satoshi.
 */
const WORDS: [string, number, number][] = [
  ["Un", 0, 6],
  ["hombre", 6, 13],
  ["con", 13, 18],
  ["una", 18, 23],
  ["máscara", 23, 36],
  ["secuestró", 36, 52],
  ["la", 52, 56],
  ["televisión", 56, 72],
  ["de", 72, 76],
  ["Chicago,", 76, 85],
  ["su", 98, 107],
  ["voz", 107, 115],
  ["quedó", 115, 123],
  ["grabada,", 123, 134],
  ["su", 148, 155],
  ["cara,", 155, 161],
  ["jamás.", 175, 191],
  ["22", 206, 217],
  ["de", 217, 225],
  ["noviembre", 225, 237],
  ["de", 237, 241],
  ["1987,", 241, 274],
  ["noticiero", 295, 313],
  ["de", 313, 318],
  ["WGN.", 318, 345],
  ["La", 359, 363],
  ["pantalla", 363, 372],
  ["se", 372, 379],
  ["va", 379, 383],
  ["a", 383, 386],
  ["negro", 386, 394],
  ["y", 394, 404],
  ["aparece", 404, 415],
  ["él,", 415, 424],
  ["nadie", 437, 443],
  ["sabe", 443, 454],
  ["quién", 454, 461],
  ["está", 461, 469],
  ["detrás.", 469, 484],
  ["Dos", 499, 506],
  ["horas", 506, 512],
  ["después", 512, 521],
  ["vuelve", 521, 536],
  ["en", 536, 541],
  ["otro", 541, 546],
  ["canal,", 546, 554],
  ["esta", 566, 572],
  ["vez", 572, 578],
  ["90", 578, 592],
  ["segundos,", 592, 608],
  ["se", 622, 628],
  ["burla", 628, 637],
  ["de", 637, 641],
  ["WGN", 641, 667],
  ["y", 667, 671],
  ["suelta:", 671, 683],
  ["«Acabo", 693, 709],
  ["de", 709, 712],
  ["hacer", 712, 720],
  ["una", 720, 726],
  ["obra", 726, 734],
  ["maestra", 734, 753],
  ["gigante»", 753, 782],
  ["Y", 817, 821],
  ["la", 821, 824],
  ["pantalla", 824, 832],
  ["vuelve,", 832, 847],
  ["como", 854, 860],
  ["si", 860, 865],
  ["nada.", 865, 872],
  ["El", 872, 890],
  ["FBI", 890, 899],
  ["y", 899, 911],
  ["la", 911, 914],
  ["FCC", 914, 924],
  ["lo", 924, 935],
  ["investigaron.", 935, 953],
  ["Nunca", 964, 978],
  ["lo", 978, 981],
  ["encontraron.", 981, 999],
  ["¿Por", 1011, 1014],
  ["qué", 1014, 1019],
  ["se", 1019, 1023],
  ["burló", 1023, 1033],
  ["justo", 1033, 1042],
  ["de", 1042, 1049],
  ["WGN?", 1049, 1073],
];

// Donde el título grande ya dice exactamente lo mismo, el subtítulo solo lo repetiría: la fecha, la cita (que entra
// palabra a palabra en pantalla), "NUNCA LO ENCONTRARON." y la pregunta final.
const MUTED: [number, number][] = [[200,  280],  [690,  812],  [955,  1004],  [1004,  99999]];
const isMuted = (fr: number) => MUTED.some(([a, b]) => fr >= a && fr < b);

// Frases hechas a mano: cada una es una unidad de sentido. Se emparejan en orden con las palabras no silenciadas,
// así que el tiempo sale directamente de la voz.
const PHRASES = ["Un hombre", "con una máscara", "secuestró la televisión", "de Chicago,", "su voz", "quedó grabada,", "su cara,", "jamás.", "noticiero de WGN.", "La pantalla", "se va a negro", "y aparece él,", "nadie sabe", "quién está detrás.", "Dos horas después", "vuelve en otro canal,", "esta vez", "90 segundos,", "se burla de WGN", "y suelta:", "Y la pantalla vuelve,", "como si nada.", "El FBI y la FCC", "lo investigaron."];

type Chunk = { words: [string, number, number][]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const live = WORDS.filter((w) => !isMuted(w[1]));
  let i = 0;
  const out: Chunk[] = PHRASES.map((ph) => {
    const words = live.slice(i, (i += ph.split(' ').length));
    return { words, from: words[0][1], to: words[words.length - 1][2] };
  });
  // cada frase se queda hasta que entra la siguiente (o ~0,3 s tras su última palabra): sin parpadeos
  out.forEach((c, k) => {
    const next = out[k + 1];
    c.to = next ? Math.min(next.from, c.to + 9) : c.to + 9;
  });
  return out;
})();

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const c = CHUNKS.find((k) => f >= k.from - 1 && f < k.to);
  if (!c) return null;
  const p = ci(f, c.from - 1, c.from + 3, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1415, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${10 * (1 - p)}px) scale(${0.92 + 0.08 * p})` }}>
      <div style={{ padding: '6px 22px', borderRadius: 16, background: 'rgba(5,5,5,0.9)', border: '2px solid rgba(240,240,240,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 58, lineHeight: 1.1, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
        {c.words.map(([t, s], i) => {
          const end = c.words[i + 1]?.[1] ?? c.to;
          const on = f >= s && f < end;
          const said = f >= s;
          const pop = ci(f, s, s + 4, 1.12, 1);
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < c.words.length - 1 ? 14 : 0, color: on ? C.orange : C.white, opacity: said ? 1 : 0.5, transform: `scale(${on ? pop : 1})`, textShadow: on ? `0 0 22px ${C.orange}99, 0 3px 0 #000` : '0 3px 0 #000' }}>
              {t}
            </span>
          );
        })}
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
/* Fotos de archivo (Wikimedia Commons, licencias libres)              */
/* ================================================================== */
const PHOTOS = {
  chicagoNight: { src: 'img/chicago-night.jpg', credit: 'FOTO: TONY WEBSTER · CC BY-SA 3.0' },
  chicagoAerial: { src: 'img/chicago-night2.jpg', credit: 'FOTO: RHYS A. · CC BY 2.0' },
  chicago70: { src: 'img/chicago-1970s.jpg', credit: 'FOTO: JOHN H. WHITE · NARA · DOMINIO PÚBLICO' },
  expressway: { src: 'img/expressway-1970s.jpg', credit: 'FOTO: JOHN H. WHITE · NARA · DOMINIO PÚBLICO' },
  antennas: { src: 'img/antennas.jpg', credit: 'FOTO: GOLBEZ · CC BY-SA 3.0' },
  noSignal: { src: 'img/no-signal.jpg', credit: 'FOTO: LIZ SULLIVAN · CC BY-SA 4.0' },
  tribune: { src: 'img/tribune-tower.jpg', credit: 'FOTO: CHICAGO ARCHITECTURE TODAY · CC BY 2.0' },
  wgnPostcard: { src: 'img/wgn-postcard.jpg', credit: 'POSTAL: CURT TEICH & CO. · DOMINIO PÚBLICO' },
  wgnRadio: { src: 'img/wgn-studio.jpg', credit: 'FOTO: TONYTHETIGER · CC BY-SA 3.0' },
  fbi: { src: 'img/fbi-hq.jpg', credit: 'FOTO: TONY WEBSTER · CC BY 2.0' },
  fcc: { src: 'img/fcc-hq.jpg', credit: 'FOTO: SER AMANTIO DI NICOLAO · CC BY 3.0' },
  vhs: { src: 'img/vhs.jpg', credit: 'FOTO: LOMIT · CC BY-SA 4.0' },
} as const;
type PhotoKey = keyof typeof PHOTOS;

/** Foto a sangre con zoom lento (Ken Burns), etalonada a la paleta del canal y con su crédito.
 *  `enter` añade una entrada con glitch: 4 frames de salto lateral, sobreexposición y negativo. */
const Photo: React.FC<{ k: PhotoKey; opacity?: number; kb?: [number, number]; dur?: number; panX?: number; showCredit?: boolean; jitter?: number; enter?: boolean }> = ({
  k,
  opacity = 1,
  kb = [1.08, 1.22],
  dur = 240,
  panX = 0,
  showCredit = true,
  jitter = 0,
  enter = false,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0.001) return null;
  const g = enter && f < 4 ? (4 - f) / 4 : 0;
  const sc = interpolate(f, [0, dur], kb, { extrapolateRight: 'clamp' }) * (1 + g * 0.12);
  const tx = interpolate(f, [0, dur], [0, panX], { extrapolateRight: 'clamp' }) + jitter + (g ? gx(f + 3, 70 * g, 1) : 0);
  return (
    <AbsoluteFill style={{ opacity, overflow: 'hidden' }}>
      <Img
        src={staticFile(PHOTOS[k].src)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translateX(${tx}px) scale(${sc})`,
          filter: `grayscale(0.55) contrast(1.25) brightness(${0.62 + g * 0.9})${enter && f === 1 ? ' invert(1)' : ''}`,
        }}
      />
      {/* duotono naranja/cian para que la foto hable el idioma del canal */}
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.orange}55 0%, transparent 45%, ${C.cyan}44 100%)`, mixBlendMode: 'color' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, transparent 30%, transparent 55%, rgba(10,10,10,0.9) 100%)' }} />
      {showCredit ? <Mono text={PHOTOS[k].credit} y={112} x={680} align="left" size={13} weight={500} spacing={1} color="#9a9a9a" /> : null}
    </AbsoluteFill>
  );
};

/** B-roll: una lista de planos que se suceden con corte seco + entrada con glitch. Frames locales de la escena. */
type Shot = { k: PhotoKey; from: number; to: number; kb?: [number, number]; panX?: number; op?: number; shake?: number; fadeIn?: number; enter?: boolean };
const BRoll: React.FC<{ shots: Shot[]; opacity?: number }> = ({ shots, opacity = 0.45 }) => {
  const f = useCurrentFrame();
  const s = shots.find((x) => f >= x.from && f < x.to);
  if (!s) return null;
  const op = s.op ?? opacity;
  return (
    <Sequence key={`${s.k}-${s.from}`} from={s.from} durationInFrames={s.to - s.from} layout="none">
      <Photo
        k={s.k}
        opacity={s.fadeIn ? ci(f, s.from, s.from + s.fadeIn, 0, op) : op}
        kb={s.kb ?? [1.2, 1.05]}
        dur={s.to - s.from}
        panX={s.panX ?? 0}
        jitter={s.shake ? gx(f, s.shake, 2) : 0}
        enter={s.enter ?? true}
      />
    </Sequence>
  );
};

/** Destello de corte: golpe de luz que se apaga en ~6 frames. */
const Flash: React.FC<{ at: number[]; color?: string; amp?: number }> = ({ at, color = C.white, amp = 0.5 }) => {
  const f = useCurrentFrame();
  const o = at.reduce((m, h) => (f >= h && f < h + 7 ? Math.max(m, amp * Math.exp(-(f - h) / 1.8)) : m), 0);
  if (o <= 0.01) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

/** Cámara en mano: deriva suave y continua para que ningún plano quede quieto. */
const Handheld: React.FC<{ children: React.ReactNode; amp?: number }> = ({ children, amp = 1 }) => {
  const f = useCurrentFrame();
  const x = (Math.sin(f / 23) * 7 + Math.sin(f / 9.7) * 2) * amp;
  const y = (Math.cos(f / 31) * 9 + Math.sin(f / 13) * 2) * amp;
  const r = Math.sin(f / 47) * 0.7 * amp;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg)` }}>{children}</AbsoluteFill>;
};

/** Televisor de tubo dibujado en código. `off` 0→1 reproduce el apagado: la imagen se aplasta en una línea y luego en un punto. */
const CRT: React.FC<{ cy: number; w: number; h: number; scale?: number; off?: number; osd?: string; children: React.ReactNode }> = ({ cy, w, h, scale = 1, off = 0, osd, children }) => {
  const f = useCurrentFrame();
  const sw = w - 90;
  const sh = h - 170;
  const p1 = Math.min(1, off / 0.55);
  const p2 = off <= 0.55 ? 0 : (off - 0.55) / 0.45;
  return (
    <div style={{ position: 'absolute', left: (W - w) / 2, top: cy - h / 2, width: w, height: h, transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 46,
          background: 'linear-gradient(170deg, #2b2f34 0%, #17191c 55%, #0b0c0d 100%)',
          border: '3px solid #3d434b',
          boxShadow: `0 60px 120px rgba(0,0,0,0.92), 0 0 90px ${C.cyan}18, inset 0 2px 0 rgba(255,255,255,0.1)`,
        }}
      />
      <div style={{ position: 'absolute', left: 45, top: 45, width: sw, height: sh, borderRadius: '7% / 9%', overflow: 'hidden', background: '#030303' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${Math.max(0, 1 - p2)}, ${off > 0 ? Math.max(0.005, 1 - p1) : 1})`, filter: off > 0 ? `brightness(${1 + p1 * 3})` : undefined }}>
          {children}
        </div>
        {off > 0.45 ? (
          <div
            style={{
              position: 'absolute',
              left: sw / 2 - (sw * (1 - p2) + 10) / 2,
              width: sw * (1 - p2) + 10,
              top: sh / 2 - 3,
              height: 6,
              borderRadius: 6,
              background: '#fff',
              opacity: off >= 1 ? 0 : 1 - p2 * 0.4,
              boxShadow: `0 0 30px #fff, 0 0 60px ${C.cyan}`,
            }}
          />
        ) : null}
        <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 5px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, height: 90, top: ((f * 9) % (sh + 180)) - 90, background: 'linear-gradient(180deg, transparent, rgba(240,240,240,0.07), transparent)' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 28%)' }} />
        {osd && off === 0 ? <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.cyan, textShadow: `0 0 10px ${C.cyan}` }}>{osd}</div> : null}
      </div>
      {/* panel inferior: rejilla de altavoz, perillas y piloto */}
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 30, height: 70, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ flex: 1, height: 44, backgroundImage: 'repeating-linear-gradient(90deg, #0a0b0c 0 5px, #24282d 5px 10px)', borderRadius: 8 }} />
        {[0, 1].map((i) => (
          <div key={i} style={{ width: 54, height: 54, borderRadius: 27, background: 'radial-gradient(circle at 35% 30%, #5a616a, #1a1c1f 70%)', border: '2px solid #444b54', transform: `rotate(${i ? -30 : 50 + Math.floor(f / 30) * 30}deg)` }}>
            <div style={{ width: 4, height: 20, margin: '5px auto', background: '#cfd4da', borderRadius: 2 }} />
          </div>
        ))}
        <div style={{ width: 16, height: 16, borderRadius: 8, background: off >= 1 ? '#3a1015' : C.red, boxShadow: off >= 1 ? 'none' : `0 0 14px ${C.red}` }} />
      </div>
    </div>
  );
};

/** Máscara centrada dentro de una caja de w×h (por ejemplo, la pantalla del CRT). */
const MaskIn: React.FC<{ w: number; h: number; ry: number; scale?: number; edge?: string; dx?: number }> = ({ w, h, ry, scale = 1, edge, dx = 0 }) => (
  <div style={{ position: 'absolute', left: w / 2 - 220 + dx, top: h / 2 - 290, width: 440, height: 580, transform: `scale(${scale})` }}>
    <Mask3D ry={ry} edge={edge} />
  </div>
);

/** Reloj de fichas que corre de 21:14 a 23:15: las "2 horas después". Frames locales. */
const FlipClock: React.FC<{ y: number }> = ({ y }) => {
  const f = useCurrentFrame();
  const LAND = 50;
  const v = Math.round(interpolate(f, [4, LAND], [21 * 60 + 14, 23 * 60 + 15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }));
  const txt = `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
  const landed = f >= LAND;
  const pop = spring({ frame: f - LAND, fps: FPS, config: { damping: 9, stiffness: 240 } });
  const enter = spring({ frame: f, fps: FPS, config: { damping: 13, stiffness: 160 } });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 12, opacity: Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * 80}px) scale(${landed ? 1 + 0.1 * (1 - pop) : 1})` }}>
      {txt.split('').map((ch, i) =>
        ch === ':' ? (
          <div key={i} style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 170, lineHeight: '210px', color: C.orange, opacity: Math.floor(f / 8) % 2 ? 1 : 0.35 }}>:</div>
        ) : (
          <div
            key={i}
            style={{
              position: 'relative',
              width: 140,
              height: 210,
              borderRadius: 14,
              background: 'linear-gradient(180deg, #1d2125 0 50%, #121417 50% 100%)',
              border: '2px solid #2f353c',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
              fontFamily: HEAD,
              fontWeight: 900,
              fontSize: 190,
              lineHeight: '210px',
              textAlign: 'center',
              color: landed ? C.orange : C.white,
              textShadow: landed ? glow(C.orange) : 'none',
              transform: !landed && f > 4 ? `translateY(${gx(f + i * 3, 7, 1)}px)` : undefined,
            }}
          >
            {ch}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 104, height: 3, background: '#050505' }} />
          </div>
        ),
      )}
    </div>
  );
};

/** Barras de voz: la máscara "habla". */
const VoiceBars: React.FC<{ active: boolean }> = ({ active }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 44, marginTop: 10 }}>
      {Array.from({ length: 44 }, (_, i) => {
        const h = active ? 6 + 36 * Math.abs(Math.sin(f * 0.8 + i * 0.55)) * (0.35 + 0.65 * rnd(Math.floor(f / 2) * 31 + i)) : 4;
        return <div key={i} style={{ width: 9, height: h, borderRadius: 3, background: i % 7 === 3 ? C.orange : C.cyan, opacity: active ? 0.9 : 0.35 }} />;
      })}
    </div>
  );
};

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

/* ================================================================== */
/* Efectos de impacto y profundidad                                    */
/* ================================================================== */
/** Onda expansiva + destello anamórfico horizontal en cada golpe. */
const Impact: React.FC<{ at: number[]; y: number; x?: number; color?: string; size?: number }> = ({ at, y, x = W / 2, color = C.orange, size = 1 }) => {
  const f = useCurrentFrame();
  const LEN = 18;
  const hits = at.filter((h) => f >= h && f < h + LEN);
  if (!hits.length) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {hits.map((h) => {
        const p = (f - h) / LEN;
        const e = Easing.out(Easing.cubic)(p);
        return (
          <React.Fragment key={h}>
            <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
              <circle cx={x} cy={y} r={(30 + e * 620) * size} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 1} opacity={0.5 * (1 - p)} style={{ filter: `drop-shadow(0 0 14px ${color})` }} />
              <circle cx={x} cy={y} r={(20 + e * 380) * size} fill="none" stroke="#fff" strokeWidth={5 * (1 - p)} opacity={0.35 * (1 - p)} />
            </svg>
            <div
              style={{
                position: 'absolute',
                left: x - (W * 0.8 * (0.3 + e)) / 2,
                width: W * 0.8 * (0.3 + e),
                top: y - 3,
                height: 6,
                borderRadius: 6,
                background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`,
                opacity: (1 - p) * 0.7,
                boxShadow: `0 0 24px ${color}, 0 0 60px ${color}`,
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Suelo de rejilla en perspectiva (estética de 1987) que avanza hacia la cámara. */
const RetroGrid: React.FC<{ horizon: number; color?: string; opacity?: number; speed?: number }> = ({ horizon, color = C.orange, opacity = 0.4, speed = 0.035 }) => {
  const f = useCurrentFrame();
  const phase = (f * speed) % 1;
  const depth = H - horizon;
  const rows = Array.from({ length: 14 }, (_, i) => {
    const t = (i + phase) / 14;
    return horizon + depth * Math.pow(t, 2.3);
  });
  const cols = Array.from({ length: 23 }, (_, i) => -2600 + i * 284);
  const id = `grid-fade-${horizon}`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id={id} x1="0" y1={horizon} x2="0" y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={0} />
          <stop offset="0.35" stopColor={color} stopOpacity={0.9} />
          <stop offset="1" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      {rows.map((y, i) => (
        <line key={`r${i}`} x1={0} x2={W} y1={y} y2={y} stroke={`url(#${id})`} strokeWidth={1 + ((y - horizon) / depth) * 3} />
      ))}
      {cols.map((x, i) => (
        <line key={`c${i}`} x1={W / 2} y1={horizon} x2={x + 540} y2={H} stroke={`url(#${id})`} strokeWidth={2} />
      ))}
      <rect x={0} y={horizon - 2} width={W} height={4} fill={color} style={{ filter: `drop-shadow(0 0 18px ${color})` }} />
    </svg>
  );
};

/** Polvo en suspensión a tres profundidades: da volumen al encuadre. */
const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const fade = Math.min(ci(f, 0, 14, 0, 1), ci(f, DURATION - 24, DURATION - 1, 1, 0));
  if (fade <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: fade }}>
      {Array.from({ length: 36 }, (_, i) => {
        const z = rnd(i * 4.7);
        const size = 2 + z * 9;
        const x = (rnd(i * 2.3) * W + Math.sin(f / (40 + i) + i) * 30 * z + f * (0.2 + z * 0.6)) % W;
        const y = ((rnd(i * 6.1) * H - f * (0.4 + z * 1.4)) % H + H) % H;
        const col = i % 5 === 0 ? C.orange : i % 7 === 0 ? C.cyan : '#ffffff';
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: col, opacity: 0.12 + z * 0.3, boxShadow: `0 0 ${size * 2}px ${col}` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Sello de goma que cae y se clava en pantalla. Frames locales de la escena. */
const Stamp: React.FC<{ at: number; text: string; y: number; color?: string }> = ({ at, text, y, color = C.red }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ci(f, at, at + 6, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          transform: `scale(${interpolate(p, [0, 1], [3.2, 1])}) rotate(-9deg)`,
          opacity: Math.min(1, p * 2) * 0.92,
          padding: '14px 40px',
          border: `10px solid ${color}`,
          borderRadius: 18,
          fontFamily: HEAD,
          fontWeight: 900,
          fontSize: 130,
          letterSpacing: '0.04em',
          color,
          background: 'rgba(10,10,10,0.88)',
          boxShadow: `0 0 40px ${color}66, inset 0 0 30px ${color}44`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* Escena 1 · 0,0–6,8 s · voz: "Un hombre con una máscara secuestró la televisión de Chicago. Su voz quedó grabada. Su cara, jamás." */
const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const ry = 16 * Math.sin(f / 26);
  const VOZ = 97; // "su voz"
  const CARA = 148; // "su cara"
  const alert = f >= CARA;
  const flash = alert && f < CARA + 24 ? 0.5 + 0.5 * Math.sin((f - CARA) * 1.9) : 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [4, VOZ, CARA])})` }}>
      {/* entra desde negro: el frame 0 tiene que ser igual al último del vídeo */}
      <BRoll
        shots={[
          { k: 'chicagoAerial', from: 2, to: VOZ, kb: [1.12, 1.35], panX: -40, op: 0.42, fadeIn: 12, enter: false },
          { k: 'chicago70', from: VOZ, to: CARA, kb: [1.35, 1.12], panX: 60, op: 0.5 },
          { k: 'expressway', from: CARA, to: 204, kb: [1.1, 1.4], panX: -50, op: 0.45 },
        ]}
      />
      <RetroGrid horizon={930} opacity={0.38 * ci(f, 2, 16, 0, 1)} color={alert ? C.red : C.orange} />
      <Handheld amp={ci(f, 0, 12, 0, 1)}>
        <MaskAt ry={ry} edge={alert ? C.red : C.cyan} />
      </Handheld>
      <Impact at={[6, VOZ + 2]} y={1150} />
      <Impact at={[CARA + 2]} y={1150} color={C.red} />
      <Sequence durationInFrames={VOZ} layout="none">
        <Headline at={4} y={1000} size={150} lines={[{ t: 'TV SECUESTRADA', c: C.white }, { t: 'EN CHICAGO.', c: C.orange }]} />
      </Sequence>
      <Sequence from={VOZ} durationInFrames={CARA - VOZ} layout="none">
        <Headline at={0} y={1000} size={170} lines={[{ t: 'SU VOZ:', c: C.white }, { t: 'GRABADA.', c: C.orange }]} />
      </Sequence>
      <Sequence from={CARA} layout="none">
        <Headline at={0} y={1000} size={170} lines={[{ t: 'SU CARA:', c: C.white }, { t: 'JAMÁS.', c: C.red }]} />
      </Sequence>
      <Flash at={[VOZ, CARA]} amp={0.45} />
      <AbsoluteFill style={{ background: C.red, opacity: flash * 0.3, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 2 — Contexto de transmisión (4–10 s)                         */
/* ================================================================== */
/* Escena 2 · 6,8–13,5 s · voz: "22 de noviembre de 1987, noticiero de WGN. La pantalla se va a negro…" */
const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CARD = 86; // "noticiero de WGN"
  const HIT = 178; // "se va a negro"
  const cardIn = spring({ frame: f - CARD, fps, config: { damping: 14, stiffness: 120 } });
  const mark = ci(f, CARD + 6, CARD + 24, 0, 1);
  const hit = f >= HIT;
  const ry = -8 + Math.sin(f / 26) * 7;
  const rx = 12 + Math.cos(f / 33) * 4;
  const floatY = Math.sin(f / 19) * 10;
  const tear = hit && f < HIT + 12 ? gx(f, 36, 1) : hit ? gx(f, 6, 3) : 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [2, CARD, HIT])})` }}>
      <BRoll
        shots={[
          { k: 'chicagoNight', from: 0, to: CARD, kb: [1.3, 1.08], panX: 70, op: 0.55 },
          { k: 'wgnPostcard', from: CARD, to: HIT, kb: [1.1, 1.32], panX: -60, op: 0.5 },
          { k: 'antennas', from: HIT, to: 200, kb: [1.15, 1.5], op: 0.4, shake: 16 },
        ]}
      />
      <Impact at={[4]} y={1150} />
      <Sequence durationInFrames={CARD} layout="none">
        <Headline at={2} y={1000} size={150} lines={[{ t: '22 DE NOVIEMBRE,', c: C.white }, { t: '1987.', c: C.orange }]} />
      </Sequence>
      {f >= CARD ? (
        <Handheld amp={1.4}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, height: 640, perspective: 1400, opacity: Math.min(1, cardIn * 1.4) }}>
            <div
              style={{
                position: 'absolute',
                left: 130,
                width: 820,
                top: 160,
                height: 240,
                transform: `translate(${tear}px, ${(1 - cardIn) * 260 + floatY}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${(1 - cardIn) * -8}deg)`,
                borderRadius: 22,
                overflow: 'hidden',
                background: 'linear-gradient(160deg, #20252b 0%, #121518 100%)',
                border: `2px solid ${hit ? C.red : '#3a414a'}`,
                boxShadow: `0 50px 100px rgba(0,0,0,0.85), 0 0 60px ${hit ? C.red : C.cyan}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ position: 'relative', padding: '14px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 64, letterSpacing: 4, color: hit ? C.red : C.white, whiteSpace: 'nowrap', textShadow: hit ? chroma(4) : 'none', opacity: hit ? (Math.floor(f / 6) % 2 ? 1 : 0.45) : 1 }}>
                {!hit ? <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${mark * 100}%`, background: `${C.orange}cc`, borderRadius: 6, mixBlendMode: 'screen' }} /> : null}
                <span style={{ position: 'relative' }}>{hit ? 'SEÑAL PERDIDA' : 'WGN-TV · 9 PM'}</span>
              </div>
              <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 5px)' }} />
              <Static opacity={hit ? 0.32 : 0.07} />
            </div>
          </div>
        </Handheld>
      ) : null}
      {hit ? <TearBands intensity={ci(f, HIT, HIT + 18, 1, 0.3)} seed={2} /> : null}
      {/* "se va a negro": la pantalla se apaga de verdad antes de que aparezca él */}
      <AbsoluteFill style={{ background: '#000', opacity: ci(f, HIT + 6, 198, 0, 0.9) }} />
      <Flash at={[CARD, HIT]} amp={0.5} />
      <Impact at={[HIT]} y={640} color={C.red} size={1.2} />
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

/* Escena 3 · 13,5–20,7 s · voz: "…y aparece él, nadie sabe quién está detrás. Dos horas después vuelve en otro canal, esta vez 90 segundos," */
const Escena3: React.FC = () => {
  const f = useCurrentFrame();
  const shake = gx(f, 14, f % 5 < 3 ? 2 : 3);
  const spin = interpolate(f, [6, 30], [-360, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const ry = -30 + 60 * ((Math.sin(f / 40) + 1) / 2) + spin;
  const B0 = 92; // "dos horas después"
  const B1 = 158; // "esta vez 90 segundos"
  const secs = Math.round(ci(f, B1 + 2, B1 + 16, 0, 90, Easing.out(Easing.quad)));
  const ab = 4 + 8 * rnd(Math.floor(f / 2));
  const strobe = [[0, 6], [B0 - 4, B0], [B1 - 4, B1], [200, 204]].some(([a, b]) => f >= a && f < b);
  const tvScale = interpolate(f, [0, 218], [0.86, 1.06]) * punch(f, [10, B0, B1], 0.07);
  const between = f >= B0 && f < B1; // las dos horas entre una intrusión y otra: la tele solo da nieve
  const osd = f < B0 ? 'CH 09 · WGN' : f < B1 ? 'CH 11' : 'CH 11 · WTTW';
  const SW = 860 - 90;
  const SH = 720 - 170;
  return (
    <AbsoluteFill>
      <BRoll
        opacity={0.32}
        shots={[
          { k: 'antennas', from: 0, to: B0, kb: [1.1, 1.45], shake: 10 },
          { k: 'chicagoAerial', from: B0, to: B1, kb: [1.4, 1.15], panX: 80 },
          { k: 'chicagoNight', from: B1, to: 218, kb: [1.2, 1.45], shake: 12 },
        ]}
      />
      <AbsoluteFill style={{ background: C.red, opacity: between ? 0 : 0.1 + 0.06 * Math.sin(f / 3), mixBlendMode: 'screen' }} />
      <RetroGrid horizon={1000} color={C.red} opacity={0.3} speed={0.08} />
      {/* datos técnicos de fondo atenuados: los subtítulos tienen que ganar sin esfuerzo */}
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <FloatingTags />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${shake}px) rotate(${gx(f, 0.8, 4)}deg)` }}>
        <CRT cy={575} w={860} h={720} scale={tvScale} osd={osd}>
          {between ? (
            <Static opacity={0.95} />
          ) : (
            <>
              <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${C.red}44, transparent 65%)` }} />
              <MaskIn w={SW} h={SH} ry={ry} scale={0.82} edge={C.red} dx={gx(f, 12, 3)} />
              <TearBands intensity={0.7} seed={3} />
            </>
          )}
        </CRT>
      </AbsoluteFill>
      <Impact at={[34, B1 + 2]} y={1230} color={C.red} />
      <Impact at={[B0 + 50]} y={1165} color={C.orange} size={0.8} />
      <Sequence durationInFrames={B0} layout="none">
        <DecodeText text="SEÑAL SECUESTRADA EN VIVO" at={4} y={1010} size={34} />
        <Headline at={32} y={1080} size={150} shadow={() => chroma(ab)} lines={[{ t: '¿QUIÉN ESTÁ', c: C.white }, { t: 'DETRÁS?', c: C.orange }]} />
      </Sequence>
      <Sequence from={B0} durationInFrames={B1 - B0} layout="none">
        <Mono text="+2 HORAS" y={1000} size={34} color={C.cyan} spacing={10} />
        <FlipClock y={1060} />
        <Sequence from={46} layout="none">
          <Mono text="OTRO CANAL · WTTW · CH 11" y={1310} size={34} color={C.orange} spacing={5} opacity={ci(f, B0 + 46, B0 + 52, 0, 1)} />
        </Sequence>
      </Sequence>
      <Sequence from={B1} layout="none">
        <DecodeText text="SEGUNDA INTRUSIÓN · WTTW" at={0} y={1010} size={34} />
        <Headline at={2} y={1080} size={150} shadow={() => chroma(ab)} lines={[{ t: `${secs} SEGUNDOS`, c: C.orange }, { t: 'AL AIRE.', c: C.white }]} />
      </Sequence>
      {strobe ? <Photo k="noSignal" kb={[1.3, 1.3]} jitter={gx(f, 40, 1)} /> : null}
      <TearBands intensity={0.5 + 0.4 * Math.abs(Math.sin(f / 6))} />
      <Static opacity={strobe ? 0.3 : 0.08 + 0.06 * rnd(f)} />
      <Flash at={[B0, B1]} color={C.cyan} amp={0.4} />
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
const QUOTE_ES: { t: string; c?: string }[] = [
  { t: '«Acabo' },
  { t: 'de' },
  { t: 'hacer' },
  { t: 'una' },
  { t: 'obra', c: C.orange },
  { t: 'maestra', c: C.orange },
  { t: 'gigante»' },
];

/* Escena 4 · 20,7–29,1 s · voz: "se burla de WGN y suelta: «Acabo de hacer una obra maestra gigante». Y la pantalla vuelve, como si nada." */
const T1 = 66; // fin del recorte a la Tribune Tower
const Q0 = 72; // empieza la cita
/** Frame (local de la escena) en que la voz dice cada palabra de la cita. */
const QUOTE_AT = [71, 87, 90, 98, 104, 112, 131];
const CAMS = [
  { at: 0, s: 0.95, x: 0, y: 0, rot: 0 },
  { at: Q0 + 30, s: 1.45, x: 0, y: 110, rot: 2.5 },
  { at: Q0 + 56, s: 0.85, x: 130, y: -10, rot: -4 },
];

/** Pista para los comentarios: la burla también apuntó al comentarista deportivo de WGN. Silueta, sin foto. */
const SwirskyHint: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - at, fps: FPS, config: { damping: 13, stiffness: 170 } });
  return (
    <div style={{ position: 'absolute', left: 150, right: 150, top: 920, display: 'flex', alignItems: 'center', gap: 22, padding: '14px 22px', borderRadius: 12, background: 'rgba(10,10,10,0.88)', border: `2px solid ${C.cyan}66`, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 60}px)` }}>
      <svg width={70} height={70} viewBox="0 0 70 70">
        <circle cx={35} cy={24} r={13} fill="#2a2f36" stroke={C.cyan} strokeWidth={2} />
        <path d="M10 66 C10 46 22 40 35 40 C48 40 60 46 60 66 Z" fill="#2a2f36" stroke={C.cyan} strokeWidth={2} />
        <rect x={44} y={30} width={6} height={16} rx={3} fill={C.orange} />
        <text x={31} y={30} fill={C.cyan} fontFamily={MONO} fontWeight={800} fontSize={14}>?</text>
      </svg>
      <div style={{ fontFamily: MONO, fontWeight: 800, letterSpacing: 2 }}>
        <div style={{ fontSize: 18, color: C.grey }}>TAMBIÉN NOMBRÓ A</div>
        <div style={{ fontSize: 30, color: C.white, whiteSpace: 'nowrap' }}>CHUCK SWIRSKY</div>
        <div style={{ fontSize: 16, color: C.cyan, whiteSpace: 'nowrap' }}>COMENTARISTA DEPORTIVO · WGN</div>
      </div>
    </div>
  );
};

const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const ry = 14 * Math.sin(f / 45);
  const TVIN = 182; // vuelve la tele, aún con él
  const OFF0 = 184;
  const OFF1 = 200; // la intrusión se corta
  const BACK = 204; // "y la pantalla vuelve, como si nada"
  const typed = Math.floor(ci(f, Q0, Q0 + QUOTE_LEN * 2.6, 0, QUOTE_LEN, Easing.linear));
  let left = typed;
  const card = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 170 } });
  const cam = [...CAMS].reverse().find((c) => f >= c.at)!;
  const drift = 1 + (f - cam.at) * 0.003;
  const off = f < BACK ? ci(f, OFF0, OFF1, 0, 1, Easing.in(Easing.quad)) : 0;
  const tvIn = spring({ frame: f - TVIN, fps: FPS, config: { damping: 13, stiffness: 150 } });
  const talking = f >= Q0 && f < TVIN;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [2, T1, Q0 + 30, Q0 + 56, TVIN, BACK], 0.05)})` }}>
      <Blinds />
      <BRoll
        opacity={0.24}
        shots={[
          { k: 'tribune', from: 0, to: T1, kb: [1.3, 1.15], op: 0.28 },
          { k: 'chicago70', from: T1, to: Q0 + 30, kb: [1.15, 1.3] },
          { k: 'wgnRadio', from: Q0 + 30, to: Q0 + 56, kb: [1.3, 1.15], panX: 50 },
          { k: 'chicagoNight', from: Q0 + 56, to: TVIN, kb: [1.3, 1.1] },
          { k: 'chicagoAerial', from: TVIN, to: 250, kb: [1.1, 1.3], op: 0.2 },
        ]}
      />
      {/* "se burla de WGN": la Tribune Tower y el lema que da nombre al canal */}
      {f < T1 ? (
        <div
          style={{
            position: 'absolute',
            left: 210,
            width: 660,
            top: 260,
            height: 600,
            transform: `translateX(${f < 4 ? gx(f, 30, 1) : 0}px) rotate(${-2 + Math.sin(f / 14) * 1.5}deg) scale(${(1.25 - 0.25 * card) * interpolate(f, [0, T1], [1, 1.08])})`,
            opacity: Math.min(1, card * 1.6),
            border: `3px solid ${C.orange}`,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 40px ${C.orange}44`,
          }}
        >
          <Img src={staticFile(PHOTOS.tribune.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4) contrast(1.15) brightness(0.8)', transform: `scale(${interpolate(f, [0, T1], [1.15, 1.0])})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 20px', background: 'rgba(10,10,10,0.88)', fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: C.white }}>
            <span style={{ color: C.orange }}>W·G·N</span> = «WORLD&apos;S GREATEST NEWSPAPER»
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: '#9a9a9a', letterSpacing: 1 }}>TRIBUNE TOWER · {PHOTOS.tribune.credit}</div>
          </div>
        </div>
      ) : null}
      {f >= 22 && f < T1 ? <SwirskyHint at={22} /> : null}
      {f >= T1 && f < TVIN ? (
        <Handheld amp={1.2}>
          <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) rotate(${cam.rot}deg)` }}>
            <MaskAt y={540} ry={ry} scale={cam.s * drift} edge={C.orange} />
          </AbsoluteFill>
        </Handheld>
      ) : null}
      {f >= TVIN ? (
        <CRT cy={540} w={760} h={660} scale={interpolate(tvIn, [0, 1], [1.4, 1])} off={off} osd="CH 11">
          {f < BACK ? (
            <>
              <MaskIn w={760 - 90} h={660 - 170} ry={ry} scale={0.72} edge={C.orange} dx={f > OFF0 - 8 ? gx(f, 14, 2) : 0} />
              {f > OFF0 - 10 ? <Static opacity={ci(f, OFF0 - 10, OFF0, 0, 0.6)} /> : null}
            </>
          ) : (
            <>
              {/* la programación normal regresa como si nada */}
              <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1c2730 0%, #0c1115 100%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.cyan, textShadow: `0 0 12px ${C.cyan}` }}>PROGRAMACIÓN NORMAL</div>
            </>
          )}
        </CRT>
      ) : null}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.9) 50%, rgba(10,10,10,0.95) 100%)', opacity: talking ? 1 : 0.6 }} />
      {/* la cita: el audio original chico, el español grande y palabra a palabra con la voz */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 890, padding: '20px 28px', borderRadius: 14, background: 'rgba(15,15,15,0.85)', border: '1px solid #2a2f36', opacity: ci(f, Q0 - 4, Q0 + 2, 0, 1) * ci(f, TVIN - 2, TVIN + 4, 1, 0) }}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: '#8a8f96', whiteSpace: 'nowrap', opacity: 0.85 }}>
          <span style={{ color: C.grey }}>AUDIO ORIGINAL &gt; </span>
          {QUOTE.map((p, i) => {
            const n = Math.max(0, Math.min(p.t.length, left));
            left -= p.t.length;
            return (
              <span key={i} style={p.c ? { color: p.c } : undefined}>
                {p.t.slice(0, n)}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontFamily: HEAD, fontWeight: 900, fontSize: 80, lineHeight: 1.0, color: C.white, textTransform: 'uppercase' }}>
          {QUOTE_ES.map((w, i) => {
            const k = spring({ frame: f - QUOTE_AT[i], fps: FPS, config: { damping: 12, stiffness: 200 } });
            return (
              <span key={i} style={{ display: 'inline-block', marginRight: 18, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 30}px)`, color: w.c ?? C.white, textShadow: w.c ? glow(w.c) : '0 4px 14px rgba(0,0,0,0.9)' }}>
                {w.t}
              </span>
            );
          })}
        </div>
        <VoiceBars active={f >= QUOTE_AT[0] && f < 180} />
      </div>
      <Flash at={[T1, Q0 + 30, Q0 + 56, TVIN, BACK]} amp={0.35} />
      <Impact at={[2]} y={560} size={0.9} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Escena 5 — Datos y rastreo fallido (28–36 s)                        */
/* ================================================================== */
const FactCard: React.FC<{ at: number; until?: number; y: number; label: string; verdict: string; edge: string }> = ({ at, until, y, label, verdict, edge }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at || (until !== undefined && f >= until)) return null;
  // sale hacia arriba en los últimos 5 frames, justo antes de que entre la siguiente
  const exit = until === undefined ? 0 : ci(f, until - 5, until, 0, 1, Easing.in(Easing.cubic));
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 170 } }) - exit;
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

/* Escena 5 · 27,9–32,4 s · voz: "El FBI y la FCC lo investigaron. Nunca lo encontraron." */
const Escena5: React.FC = () => {
  const f = useCurrentFrame();
  const FBI = 16;
  const FCC = 40;
  const B = 64; // rastreo
  const COLLAPSE = 92; // "nunca"
  const STAMP = 108;
  const phaseA = ci(f, B - 6, B, 1, 0, Easing.linear);
  // primero los sospechosos (sin cifra: nunca hubo una oficial), luego el veredicto: 0 arrestos
  const flipped = f >= 12;
  const flipPop = spring({ frame: f - 12, fps: FPS, config: { damping: 9, stiffness: 240 } });
  const fill = ci(f, B + 4, COLLAPSE - 4, 0, 99, Easing.out(Easing.quad));
  const collapsed = f >= COLLAPSE;
  const value = collapsed ? ci(f, COLLAPSE, COLLAPSE + 5, 99, 0, Easing.linear) : fill;
  const gColor = collapsed ? C.red : C.orange;
  const shake = collapsed && f < COLLAPSE + 8 ? gx(f, 22, 1) : 0;
  const scanBlink = Math.floor(f / 5) % 2 ? 1 : 0.45;
  const sweep = (f - B) * 13;
  const stampShake = f >= STAMP + 6 && f < STAMP + 16;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [0, FBI, FCC, COLLAPSE, STAMP + 6], 0.045)}) translate(${stampShake ? gx(f, 18, 1) : 0}px, ${stampShake ? gx(f + 5, 12, 1) : 0}px)` }}>
      <BRoll
        opacity={0.34}
        shots={[
          { k: 'chicagoAerial', from: 0, to: FBI, kb: [1.3, 1.1], op: 0.25 },
          { k: 'fbi', from: FBI, to: FCC, kb: [1.15, 1.35], panX: -60 },
          { k: 'fcc', from: FCC, to: B, kb: [1.35, 1.15], panX: 50 },
          { k: 'antennas', from: B, to: COLLAPSE, kb: [1.1, 1.4], op: 0.18 },
          { k: 'chicagoNight', from: COLLAPSE, to: 134, kb: [1.4, 1.15], op: 0.22, shake: 8 },
        ]}
      />
      {phaseA > 0 ? (
        <Handheld>
          <AbsoluteFill style={{ opacity: phaseA }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, whiteSpace: 'nowrap', transform: `scale(${interpolate(f, [12, 20], [1, 0.62], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE })})`, transformOrigin: '50% 0%' }}>
              <span style={{ fontSize: 240, color: C.orange, textShadow: flipped ? glow(C.orange) : chroma(6), display: 'inline-block', minWidth: 150, transform: `scale(${flipped ? 1 + 0.2 * (1 - flipPop) : 1})` }}>{flipped ? '0' : '?'}</span>
              <span style={{ fontSize: 120, color: C.white, marginLeft: 24, textShadow: flipped ? glow(C.white) : chroma(4) }}>{flipped ? 'ARRESTOS' : 'SOSPECHOSOS'}</span>
            </div>
            <FactCard at={FBI} until={FCC} y={640} edge={C.cyan} label="EL FBI INVESTIGÓ" verdict="NINGÚN DETENIDO" />
            <FactCard at={FCC} y={640} edge={C.orange} label="LA FCC TAMBIÉN" verdict="NADIE FUE ACUSADO" />
          </AbsoluteFill>
        </Handheld>
      ) : null}
      {f >= B ? (
        <AbsoluteFill style={{ transform: `translateX(${shake}px)`, opacity: ci(f, B, B + 4, 0, 1) }}>
          {!collapsed ? (
            <div style={{ position: 'absolute', left: 540 - 330, top: 760 - 330, width: 660, height: 660, borderRadius: 330, background: `conic-gradient(from ${sweep}deg, ${C.orange}66 0deg, ${C.orange}00 70deg, transparent 360deg)`, opacity: 0.6 }} />
          ) : null}
          {Array.from({ length: 6 }, (_, i) => {
            const a = rnd(i * 13) * Math.PI * 2;
            const r = 120 + rnd(i * 7) * 180;
            const lit = !collapsed && ((sweep % 360) + 360) % 360 > ((a * 180) / Math.PI + 80) % 360;
            return <div key={i} style={{ position: 'absolute', left: 540 + Math.cos(a) * r - 7, top: 760 + Math.sin(a) * r - 7, width: 14, height: 14, borderRadius: 7, background: C.cyan, opacity: lit ? 0.9 : 0.15, boxShadow: `0 0 12px ${C.cyan}` }} />;
          })}
          <CircularGauge value={value} color={gColor} cx={540} cy={760} r={250} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: f >= STAMP + 2 ? 0 : 1, fontFamily: HEAD, fontWeight: 900, fontSize: 150, color: gColor, textShadow: collapsed ? chroma(6) : glow(gColor) }}>
            {Math.round(value)}%
          </div>
          {collapsed ? (
            <>
              <Mono text="SIN IDENTIFICAR · CASO SIN RESOLVER" y={1080} size={28} color={C.red} spacing={3} />
              <Headline at={COLLAPSE + 2} y={1160} size={150} lines={[{ t: 'NUNCA LO', c: C.red }, { t: 'ENCONTRARON.', c: C.red }]} />
              <TearBands intensity={ci(f, COLLAPSE, COLLAPSE + 20, 1, 0.2)} seed={9} />
            </>
          ) : (
            <Mono text="RASTREANDO SEÑAL..." y={1080} size={30} color={C.orange} spacing={6} opacity={scanBlink} />
          )}
          <AbsoluteFill style={{ background: C.red, opacity: collapsed ? ci(f, COLLAPSE, COLLAPSE + 10, 0.4, 0, Easing.linear) : 0, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      ) : null}
      <Flash at={[FBI, FCC]} amp={0.4} />
      <Impact at={[COLLAPSE]} y={760} color={C.red} size={1.3} />
      <Impact at={[STAMP + 6]} y={740} color={C.red} size={0.9} />
      <Stamp at={STAMP} text="CASO ABIERTO" y={640} />
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
  const GL = 18; // glitch corto: la pregunta entra con la voz
  const glitching = f < GL;
  const settle = ci(f, GL - 10, GL, 1, 0, Easing.linear);
  const TITLE = 8;
  const END = 153;
  const textOut = ci(f, END - 16, END - 4, 1, 0, Easing.linear);
  // al final la máscara vuelve a como está en el frame 0: sola, nítida, sin glitch
  const maskOpacity = glitching
    ? rnd(f * 3) > 0.35
      ? 1
      : 0.2
    : interpolate(f, [GL, GL + 10, END - 16, END - 4], [1, 0.9, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arrow = spring({ frame: f - TITLE - 14, fps, config: { damping: 12, stiffness: 160 } });
  const bob = Math.abs(Math.sin((f - TITLE) / 6)) * 18;
  // repaso relámpago de todo el caso durante el glitch: una foto cada 2 frames
  const MONTAGE: PhotoKey[] = ['chicagoNight', 'wgnPostcard', 'noSignal', 'tribune', 'chicagoAerial', 'wgnRadio', 'noSignal', 'chicagoNight', 'wgnPostcard'];
  const shot = glitching ? MONTAGE[Math.min(MONTAGE.length - 1, Math.floor(f / 2))] : null;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, glitching ? [0, 6, 12] : [TITLE], 0.05)})` }}>
      {shot ? <Photo k={shot} opacity={0.85 * settle + 0.15} kb={[1.25, 1.05]} dur={GL} jitter={gx(f, 30, 2)} /> : null}
      <CodeColumns opacity={0.45 * ci(f, GL, GL + 20, 0, 1) * textOut} />
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
        <Headline at={TITLE} y={1080} size={130} dramatic lines={[{ t: '¿POR QUÉ SE BURLÓ', c: C.white }, { t: 'DE WGN?', c: C.orange }]} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1312 + bob, textAlign: 'center', opacity: arrow, transform: `scale(${arrow})` }}>
          <svg width={70} height={84} viewBox="0 0 70 84">
            <path d="M35 4 V70 M10 46 L35 74 L60 46" fill="none" stroke={C.orange} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${C.orange})` }} />
          </svg>
        </div>
        <Mono text="TU TEORÍA EN COMENTARIOS" y={1430} size={30} color="#bdbdbd" spacing={8} opacity={ci(f, TITLE + 20, TITLE + 28, 0, 1)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Composición principal                                               */
/* ================================================================== */
/** Modo borrador (--props='{"draft":true}'): sin motion blur y con un sello de tiempo para pedir cambios. */
const DRAFT = Boolean((getInputProps() as { draft?: boolean }).draft);
const SCENE_NAMES = ['1 GANCHO', '2 CONTEXTO', '3 HACKEO', '4 LA MÁSCARA', '5 INVESTIGACIÓN', '6 CIERRE'];
const DraftStamp: React.FC = () => {
  const f = useCurrentFrame();
  const idx = [SC.s1, SC.s2, SC.s3, SC.s4, SC.s5, SC.s6].findIndex((s) => f >= s.from && f < s.from + s.len);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,42,75,0.9)', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: '#fff', letterSpacing: 2 }}>
        BORRADOR · {(f / FPS).toFixed(1)} s · FR {String(f).padStart(4, '0')} · ESC {SCENE_NAMES[idx] ?? '-'}
      </div>
    </div>
  );
};

const MaxHeadroom1987: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <BaseBackground />
    <Audio src={staticFile('audio/mix.wav')} />
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
    <Dust />
    {/* las franjas son baratas de dibujar, así que aquí el motion blur sale casi gratis */}
    {DRAFT ? (
      <SliceTransition />
    ) : (
      <CameraMotionBlur shutterAngle={200} samples={4}>
        <SliceTransition />
      </CameraMotionBlur>
    )}
    <HUDGlobal />
    {DRAFT ? <DraftStamp /> : null}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="MaxHeadroom1987" component={MaxHeadroom1987} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);

registerRoot(RemotionRoot);
