/**
 * No Presiones · Sin resolver · Caso Nº 03 · El hackeo de Max Headroom (Chicago, 22-nov-1987)
 * 1080x1920 · 30 fps · 45 s · sin audio (la música se añade después).
 * Seis escenas con cortes secos; la última termina en negro para que el loop enganche con el negro de la primera.
 */
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/800.css';
import '@fontsource/inter/900.css';
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

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */
const FPS = 30;
const W = 1080;
const H = 1920;
const C = {
  bg: '#0a0a0a',
  orange: '#FF6B00',
  cyan: '#00FFE0',
  white: '#F0F0F0',
  green: '#39FF14',
  red: '#FF1E3C',
  muted: '#7A8490',
};
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const HEAD = "'Inter', 'Arial Black', sans-serif";

// Escenas en frames globales: [inicio, duración]
const S = {
  hook: [0, 120], // 0–4 s
  context: [120, 180], // 4–10 s
  hack: [300, 240], // 10–18 s
  talk: [540, 300], // 18–28 s
  facts: [840, 240], // 28–36 s
  cta: [1080, 270], // 36–45 s
} as const;
const DURATION = 1350;

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ci = (f: number, a: number, b: number, x: number, y: number, easing: (t: number) => number = EASE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Desplazamiento horizontal que cambia cada `every` frames: salta, no se desliza. */
const glitchX = (f: number, amp = 15, every = 3) => Math.sin(Math.floor(f / every) * 7.3) * amp;
/** Aberración cromática barata: dos sombras desplazadas en rojo y cian. */
const rgbSplit = (d: number) => `${d}px 0 rgba(255,30,60,0.85), ${-d}px 0 rgba(0,255,224,0.85)`;

/* ------------------------------------------------------------------ */
/* Capas comunes                                                       */
/* ------------------------------------------------------------------ */
const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 2px, transparent 2px, transparent 6px)',
          backgroundPosition: `0 ${(f * 1.5) % 6}px`,
        }}
      />
      {/* barra de refresco del CRT bajando por la pantalla */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 260,
          top: ((f * 16) % (H + 520)) - 260,
          background: 'linear-gradient(180deg, transparent, rgba(240,240,240,0.06), transparent)',
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)' }} />
    </AbsoluteFill>
  );
};

/** Nieve de TV: ruido SVG con una semilla nueva en cada frame. */
const Static: React.FC<{ opacity: number }> = ({ opacity }) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  const id = `tv-static-${Math.round(f * 10)}`;
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <svg width={W} height={H}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f)} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>
        <rect width={W} height={H} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Franjas horizontales que saltan de sitio: el "desgarro" de la señal. */
const TearBands: React.FC<{ intensity: number; seed?: number }> = ({ intensity, seed = 0 }) => {
  const f = useCurrentFrame();
  if (intensity <= 0) return null;
  const q = Math.floor(f / 2) + seed * 100;
  const n = Math.round(3 + intensity * 7);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      {Array.from({ length: n }, (_, i) => {
        const r = rnd(q * 13 + i * 7);
        if (r > 0.35 + intensity * 0.5) return null;
        const y = rnd(q * 3 + i) * H;
        const h = 6 + rnd(q + i * 5) * 70 * intensity;
        const col = i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.orange : C.white;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (rnd(q * 7 + i) - 0.5) * 300 * intensity,
              width: W * (0.4 + rnd(i + q) * 0.8),
              top: y,
              height: h,
              background: col,
              opacity: 0.08 + 0.25 * intensity * rnd(i * 9 + q),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Mono: React.FC<{ text: string; y: number; size?: number; color?: string; weight?: 500 | 800; opacity?: number; spacing?: number }> = ({
  text,
  y,
  size = 28,
  color = C.white,
  weight = 800,
  opacity = 1,
  spacing = 2,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 80,
      right: 80,
      top: y,
      textAlign: 'center',
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

/* ------------------------------------------------------------------ */
/* La máscara 3D (solo CSS)                                            */
/* ------------------------------------------------------------------ */
const FACE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '46% 46% 42% 42% / 36% 36% 60% 60%',
  transformStyle: 'preserve-3d',
};

const Mask3D: React.FC<{ ry: number; rx?: number; glow?: string }> = ({ ry, rx = 4, glow = C.cyan }) => {
  // el brillo especular se mueve con el giro, para que el metal "reaccione" a la luz
  const spec = 40 + ry * 0.6;
  return (
    <div style={{ perspective: 1100, width: 500, height: 660, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {/* grosor: capas oscuras apiladas hacia atrás */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ ...FACE, transform: `translateZ(${-6 - i * 6}px)`, background: `rgb(${70 - i * 7}, ${76 - i * 7}, ${86 - i * 7})` }} />
        ))}
        <div
          style={{
            ...FACE,
            background: `linear-gradient(${105 + ry}deg, #6f7783 0%, #c9cfd7 ${spec - 22}%, #ffffff ${spec}%, #aab2bd ${spec + 18}%, #e2e6eb 82%, #5d6570 100%)`,
            border: '6px solid #C9CED6',
            boxShadow: `0 0 70px ${glow}44, inset 0 0 60px rgba(255,255,255,0.35), inset 0 -40px 80px rgba(0,0,0,0.35)`,
          }}
        >
          {/* pelo engominado */}
          <div
            style={{
              position: 'absolute',
              left: '6%',
              right: '6%',
              top: '-1%',
              height: '24%',
              borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%',
              background: 'repeating-linear-gradient(100deg, #3a4048 0 14px, #59616c 14px 22px)',
              transform: 'translateZ(10px)',
              boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.5)',
            }}
          />
          {/* gafas de sol */}
          <div
            style={{
              position: 'absolute',
              left: '9%',
              right: '9%',
              top: '36%',
              height: 92,
              borderRadius: '14px 14px 40px 40px',
              background: 'linear-gradient(180deg, #050607 0%, #1a1e24 60%, #050607 100%)',
              transform: 'translateZ(34px)',
              boxShadow: '0 14px 30px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 60,
                left: `${30 + ry * 0.8}%`,
                background: 'linear-gradient(90deg, transparent, rgba(0,255,224,0.45), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />
          </div>
          {/* nariz */}
          <div
            style={{
              position: 'absolute',
              left: '45%',
              width: '10%',
              top: '55%',
              height: '14%',
              borderRadius: '40% 40% 50% 50%',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.25), rgba(255,255,255,0.4))',
              transform: 'translateZ(22px)',
            }}
          />
          {/* sonrisa congelada */}
          <div
            style={{
              position: 'absolute',
              left: '24%',
              right: '24%',
              top: '68%',
              height: 70,
              borderBottom: '10px solid #2a2e35',
              borderRadius: '0 0 50% 50%',
              transform: 'translateZ(14px)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Fondo de franjas giratorias, guiño al decorado del personaje original. */
const StripeBackdrop: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const f = useCurrentFrame();
  const a = 35 + 20 * Math.sin(f / 45);
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `repeating-linear-gradient(${a}deg, rgba(0,255,224,0.10) 0 4px, transparent 4px 70px), repeating-linear-gradient(${-a}deg, rgba(255,107,0,0.07) 0 3px, transparent 3px 90px)`,
        backgroundPosition: `${f * 3}px ${f * 2}px`,
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Escena 1 — Gancho (0–4 s)                                           */
/* ------------------------------------------------------------------ */
const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const LINE = '22 de noviembre, 1987.';
  const shown = Math.max(0, Math.min(LINE.length, Math.floor((f - 8) / 2)));
  const typing = shown < LINE.length;
  const cursorOn = typing || Math.floor(f / 8) % 2 === 0;
  const FLASH = 98;
  const flash = f >= FLASH && f < FLASH + 6 ? 1 - (f - FLASH) / 6 : 0;
  const broken = f >= FLASH + 2;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: broken ? `translateX(${glitchX(f, 28, 2)}px)` : undefined }}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 66,
            color: C.white,
            whiteSpace: 'pre',
            textShadow: broken ? rgbSplit(8 + 6 * rnd(f)) : '0 0 18px rgba(240,240,240,0.35)',
          }}
        >
          {LINE.slice(0, shown)}
          <span style={{ color: C.orange, opacity: cursorOn ? 1 : 0 }}>█</span>
        </div>
      </AbsoluteFill>
      {/* destello rojo y corte */}
      <AbsoluteFill style={{ background: C.red, opacity: flash * 0.9, mixBlendMode: 'screen' }} />
      <Static opacity={broken ? ci(f, FLASH + 2, 120, 0.55, 0.9) : 0} />
      <TearBands intensity={broken ? 1 : 0} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escena 2 — Contexto (4–10 s)                                        */
/* ------------------------------------------------------------------ */
const Television: React.FC = () => {
  const f = useCurrentFrame();
  const ry = -14 + 4 * Math.sin(f / 30);
  return (
    <div style={{ perspective: 1300, width: 760, height: 600, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(7deg) rotateY(${ry}deg)` }}>
        {/* antena */}
        {[-28, 28].map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              left: 380 - 3,
              top: -150,
              width: 6,
              height: 170,
              background: 'linear-gradient(#9aa3ae, #4a5058)',
              transformOrigin: '50% 100%',
              transform: `rotate(${r}deg) translateZ(-20px)`,
              borderRadius: 3,
            }}
          />
        ))}
        {/* cuerpo con profundidad */}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: 40, transform: `translateZ(${-8 - i * 9}px)`, background: `rgb(${44 - i * 3}, ${48 - i * 3}, ${54 - i * 3})` }} />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 40,
            background: 'linear-gradient(160deg, #4a5058 0%, #2b2f35 60%, #1c1f23 100%)',
            border: '2px solid #5d646d',
            boxShadow: '0 40px 90px rgba(0,0,0,0.8), 0 0 80px rgba(0,255,224,0.12)',
            padding: 36,
          }}
        >
          {/* pantalla */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 30,
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at 50% 40%, #6b737c 0%, #3e444b 60%, #22262b 100%)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* presentador en silueta */}
            <div style={{ position: 'absolute', left: '50%', top: 90, width: 120, height: 120, marginLeft: -60, borderRadius: '50%', background: '#2a2f35' }} />
            <div style={{ position: 'absolute', left: '50%', top: 200, width: 300, height: 220, marginLeft: -150, borderRadius: '120px 120px 20px 20px', background: '#2a2f35' }} />
            {/* rótulo del noticiero */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, height: 66, background: 'rgba(10,10,10,0.85)', display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 26 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: C.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3, boxShadow: `0 0 14px ${C.red}` }} />
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 2 }}>NOTICIERO · EN VIVO</span>
            </div>
            <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 5px)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContextScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tv = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 120 } });
  const blink = Math.floor(f / 9) % 3 === 2 ? 0.35 : 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Mono text="CHICAGO · WGN-TV · NOTICIERO EN VIVO" y={300} size={30} color={C.cyan} opacity={ci(f, 0, 8, 0, 1)} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -120, transform: `translateY(${(1 - tv) * 300}px) scale(${0.85 + 0.15 * tv})`, opacity: tv }}>
        <Television />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 1230,
          textAlign: 'center',
          fontFamily: HEAD,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: C.orange,
          opacity: f < 30 ? ci(f, 24, 30, 0, 1) : blink,
          textShadow: `0 0 30px ${C.orange}88, 0 8px 30px rgba(0,0,0,0.9)`,
        }}
      >
        21:14 · EN PLENO
        <br />
        NOTICIERO
      </div>
      <Mono text="● REC  22-NOV-1987  21:14" y={1500} size={24} color={C.muted} weight={500} />
      <Scanlines />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escena 3 — El hackeo (10–18 s)                                      */
/* ------------------------------------------------------------------ */
const HackScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = glitchX(f, 15, 3);
  const enter = spring({ frame: f, fps, config: { damping: 12, stiffness: 90 } });
  const ry = -35 + 70 * ((Math.sin(f / 38) + 1) / 2);
  const blink = rnd(Math.floor(f / 3)) > 0.18 ? 1 : 0.15;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <StripeBackdrop />
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -180, transform: `scale(${0.6 + 0.4 * enter})`, opacity: enter }}>
          <Mask3D ry={ry} />
        </AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            top: 1210,
            textAlign: 'center',
            fontFamily: HEAD,
            fontWeight: 900,
            fontSize: 104,
            letterSpacing: '-0.02em',
            color: C.green,
            opacity: f < 12 ? ci(f, 6, 12, 0, 1) : blink,
            textShadow: `${rgbSplit(4 + 6 * rnd(f))}, 0 0 40px ${C.green}aa`,
          }}
        >
          SEÑAL
          <br />
          SECUESTRADA
        </div>
        <Mono text="2 canales · la misma noche · sin explicación" y={1480} size={28} color={C.white} weight={500} spacing={0} opacity={ci(f, 24, 32, 0, 1)} />
      </AbsoluteFill>
      <TearBands intensity={0.7 + 0.3 * Math.sin(f / 7)} />
      <Static opacity={0.12 + 0.1 * rnd(f)} />
      <Scanlines />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escena 4 — La máscara habla (18–28 s)                               */
/* ------------------------------------------------------------------ */
const HEX = '0123456789ABCDEF';
const HexRain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 12 }, (_, col) => {
        const speed = 3 + rnd(col * 3) * 5;
        const y = ((f * speed + rnd(col) * 2400) % 2400) - 500;
        const glyphs = Array.from({ length: 9 }, (_, k) => HEX[Math.floor(rnd(col * 31 + k + Math.floor(f / 6)) * 16)] + HEX[Math.floor(rnd(col * 17 + k * 3) * 16)]);
        return (
          <div
            key={col}
            style={{
              position: 'absolute',
              left: 40 + col * 88,
              top: y,
              fontFamily: MONO,
              fontWeight: 500,
              fontSize: 24,
              lineHeight: 1.5,
              color: col % 4 === 0 ? C.orange : C.cyan,
              opacity: 0.16 + 0.1 * rnd(col * 5),
              whiteSpace: 'pre',
            }}
          >
            {glyphs.join('\n')}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const TalkScene: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 300], [1, 1.35]);
  const ry = 18 * Math.sin(f / 50);
  const glitchHit = f % 47 < 2;
  const BLOCKS = 10;
  const filled = Math.min(5, Math.floor(ci(f, 140, 200, 0, 5.99, Easing.linear)));
  const stalled = f > 205;
  const bar = '█'.repeat(filled) + '░'.repeat(BLOCKS - filled);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <HexRain />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -360, transform: `scale(${zoom}) translateX(${glitchHit ? glitchX(f, 24, 1) : 0}px)` }}>
        <Mask3D ry={ry} rx={6} glow={C.orange} />
      </AbsoluteFill>
      {/* oscurece la base para que el bloque de texto mande */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 52%, rgba(10,10,10,0.92) 62%, rgba(10,10,10,0.97) 100%)' }} />
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 1090,
          textAlign: 'center',
          fontFamily: HEAD,
          fontWeight: 900,
          fontSize: 116,
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          color: C.white,
          opacity: ci(f, 12, 20, 0, 1),
          transform: `scale(${ci(f, 12, 22, 0.9, 1)})`,
          textShadow: glitchHit ? rgbSplit(10) : '0 8px 30px rgba(0,0,0,0.9)',
        }}
      >
        NADIE SUPO
        <br />
        QUIÉN ERA
      </div>
      <Mono text="— 39 años después —" y={1345} size={38} color={C.orange} opacity={ci(f, 60, 70, 0, 1)} />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 1450, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.cyan, opacity: ci(f, 130, 138, 0, 1), whiteSpace: 'nowrap' }}>
        IDENTIDAD: {bar}{' '}
        <span style={{ color: stalled && Math.floor(f / 10) % 2 ? C.red : C.orange }}>SIN RESOLVER</span>
      </div>
      <Static opacity={glitchHit ? 0.35 : 0.06} />
      <Scanlines />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escena 5 — Datos (28–36 s)                                          */
/* ------------------------------------------------------------------ */
const FactCard: React.FC<{ at: number; y: number; label: string; verdict: string }> = ({ at, y, label, verdict }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 150 } });
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: y,
        transform: `translateY(${(1 - s) * 520}px)`,
        opacity: Math.min(1, s * 1.4),
        padding: '30px 40px',
        background: 'rgba(12,16,18,0.8)',
        border: `2px solid ${C.cyan}`,
        borderRadius: 22,
        boxShadow: `0 0 34px ${C.cyan}33, 0 30px 60px rgba(0,0,0,0.6)`,
      }}
    >
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.cyan, letterSpacing: 1.5 }}>▸ {label}</div>
      <div
        style={{
          marginTop: 14,
          fontFamily: HEAD,
          fontWeight: 900,
          fontSize: 46,
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
          color: C.white,
          opacity: ci(f, at + 10, at + 16, 0, 1),
          transform: `translateX(${ci(f, at + 10, at + 18, -20, 0)}px)`,
        }}
      >
        <span style={{ color: C.orange }}>→ </span>
        {verdict}
      </div>
    </div>
  );
};

const FactsScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <StripeBackdrop opacity={0.4} />
      <Mono text="EXPEDIENTE · CASO_03" y={300} size={32} color={C.orange} opacity={ci(f, 0, 8, 0, 1)} />
      <FactCard at={8} y={470} label="EL FBI Y LA FCC LO BUSCARON" verdict="NUNCA HUBO ARRESTO" />
      <FactCard at={70} y={830} label="ERA UN DELITO FEDERAL" verdict="HOY YA PRESCRIBIÓ" />
      <FactCard at={132} y={1190} label="LA GRABACIÓN EXISTE" verdict="EL HACKER NUNCA APARECIÓ" />
      <Scanlines />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Escena 6 — CTA (36–45 s)                                            */
/* ------------------------------------------------------------------ */
const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const GLITCH_END = 60;
  const inGlitch = f < GLITCH_END;
  const TITLE = 66;
  const s = spring({ frame: f - TITLE, fps, config: { damping: 11, stiffness: 140 } });
  const out = ci(f, 248, 268, 1, 0, Easing.linear); // termina en negro: el loop engancha con el negro del frame 0
  const bob = Math.sin((f - TITLE) / 5) * 12;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {inGlitch ? (
        <AbsoluteFill style={{ transform: `translateX(${glitchX(f, 60, 2)}px)`, filter: rnd(Math.floor(f / 2)) > 0.7 ? 'invert(1)' : undefined }}>
          <StripeBackdrop />
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -160, opacity: rnd(f * 3) > 0.4 ? 1 : 0 }}>
            <Mask3D ry={glitchX(f, 40, 2)} glow={C.red} />
          </AbsoluteFill>
          <TearBands intensity={1} seed={3} />
          <Static opacity={0.5 + 0.4 * rnd(f)} />
        </AbsoluteFill>
      ) : null}
      {f >= TITLE ? (
        <AbsoluteFill style={{ opacity: out }}>
          <div
            style={{
              position: 'absolute',
              left: 40,
              right: 40,
              top: 640,
              textAlign: 'center',
              fontFamily: HEAD,
              fontWeight: 900,
              fontSize: 100,
              lineHeight: 1.04,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.03em',
              color: C.white,
              opacity: Math.min(1, s * 1.5),
              transform: `scale(${interpolate(s, [0, 1], [2.4, 1])})`,
              textShadow: f < TITLE + 6 ? rgbSplit(14) : '0 8px 40px rgba(0,0,0,0.9)',
            }}
          >
            ¿QUIÉN ERA
            <br />
            <span style={{ color: C.orange, textShadow: `0 0 40px ${C.orange}77` }}>MAX HEADROOM?</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1000 + bob, textAlign: 'center', opacity: ci(f, TITLE + 16, TITLE + 24, 0, 1) }}>
            <svg width={80} height={90} viewBox="0 0 80 90">
              <path d="M40 4 V74 M12 48 L40 78 L68 48" fill="none" stroke={C.cyan} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${C.cyan})` }} />
            </svg>
          </div>
          <Mono text="TU TEORÍA EN COMENTARIOS" y={1130} size={32} color={C.cyan} opacity={ci(f, TITLE + 20, TITLE + 28, 0, 1)} />
          <Mono text="SYS://NO_PRESIONES · CASO_03" y={1500} size={22} color={C.muted} weight={500} opacity={ci(f, TITLE + 30, TITLE + 40, 0, 0.9)} />
        </AbsoluteFill>
      ) : null}
      <Scanlines opacity={out} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Composición                                                         */
/* ------------------------------------------------------------------ */
const MaxHeadroom: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={S.hook[0]} durationInFrames={S.hook[1]}>
      <HookScene />
    </Sequence>
    <Sequence from={S.context[0]} durationInFrames={S.context[1]}>
      <ContextScene />
    </Sequence>
    <Sequence from={S.hack[0]} durationInFrames={S.hack[1]}>
      {/* el glitch lateral de esta escena es el único movimiento rápido del vídeo: solo aquí compensa el coste del motion blur */}
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <HackScene />
      </CameraMotionBlur>
    </Sequence>
    <Sequence from={S.talk[0]} durationInFrames={S.talk[1]}>
      <TalkScene />
    </Sequence>
    <Sequence from={S.facts[0]} durationInFrames={S.facts[1]}>
      <FactsScene />
    </Sequence>
    <Sequence from={S.cta[0]} durationInFrames={S.cta[1]}>
      <CtaScene />
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="MaxHeadroom" component={MaxHeadroom} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);

registerRoot(RemotionRoot);
