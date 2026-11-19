import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import '../components/fonts';
import { HEAVY, MONO, rand } from '../components/motion';

// "Sin resolver #01", Cicada 3301: the real-images cut (no voice yet). Six Wikimedia Commons images (licences in
// canal/no-presiones/sin-resolver-01/IMAGENES-Y-LICENCIAS.md) edited like a mystery short: slow pushes and pans,
// glitch cuts, typewriter text, film grain, vignette, a hard hit on 3301. On-screen text carries the story until the
// voice is recorded. The sound (public/cicada01/mix.wav) comes from tools/cicada01_audio.py on the same clock.

export const CICADA01 = { fps: 30, width: 1080, height: 1920, duration: 35 };

const C = { bg: '#05070A', red: '#FF2A2A', green: '#00FF66', key: '#FFE600', white: '#F8FAFC', cyan: '#3FD8FF', amber: '#FFB800' };
const CL = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const lin = (t: number, a: number, b: number, x = 0, y = 1) => interpolate(t, [a, b], [x, y], CL);
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeInOut = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
const pop = (f: number, at: number) => spring({ frame: f - Math.round(at * CICADA01.fps), fps: CICADA01.fps, config: { stiffness: 220, damping: 14, mass: 0.6 } });
const src = (n: string) => staticFile(`cicada01/${n}`);

// ---------------------------------------------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------------------------------------------

/** A blurred, darkened copy of the picture filling the vertical frame, so horizontal images never sit on flat black. */
const Bg: React.FC<{ n: string; t: number; dim?: number }> = ({ n, t, dim = 0 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <Img src={src(`bg-${n}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 + 0.02 * t})` }} />
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
  </AbsoluteFill>
);

/** The sharp picture, centred on (cx, cy), at width w, with a push (scale) and an offset. */
const Pic: React.FC<{ file: string; w: number; cx?: number; cy?: number; scale?: number; dx?: number; dy?: number; rot?: number; opacity?: number; shadow?: boolean }> = ({
  file, w, cx = 540, cy = 760, scale = 1, dx = 0, dy = 0, rot = 0, opacity = 1, shadow = true,
}) => (
  <div style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`, opacity }}>
    <Img src={src(file)} style={{ width: w, display: 'block', boxShadow: shadow ? '0 30px 90px rgba(0,0,0,0.85)' : undefined }} />
  </div>
);

/** Horizontal slice glitch: copies of the picture in strips, each pushed sideways (only on the frames it is asked for). */
const Slices: React.FC<{ file: string; w: number; cx?: number; cy?: number; k: number; seed: number; scale?: number }> = ({ file, w, cx = 540, cy = 760, k, seed, scale = 1 }) => {
  if (k <= 0.01) return null;
  const n = 7;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 100;
        const b = ((i + 1) / n) * 100;
        const off = (rand(seed * 31 + i * 7) - 0.5) * 120 * k;
        const tint = i % 3 === 0 ? 'rgba(255,42,42,0.35)' : i % 3 === 1 ? 'rgba(63,216,255,0.3)' : 'transparent';
        return (
          <div key={i} style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) translate(${off}px, 0) scale(${scale})`, clipPath: `inset(${a}% 0 ${100 - b}% 0)` }}>
            <Img src={src(file)} style={{ width: w, display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: tint }} />
          </div>
        );
      })}
    </>
  );
};

/** Grain, scanlines and vignette on top of everything: the "found footage" texture. */
const Texture: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Img src={src(`grain${(f % 8) + 1}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.075 }} />
    <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)' }} />
  </>
);

/** Heavy kinetic text: pops in (scale 1.35 -> 1) from `at`, white with a black outline; `color` for the key line. */
const Line: React.FC<{ f: number; at: number; y: number; size?: number; color?: string; children: string; still?: boolean; spacing?: number }> = ({ f, at, y, size: size0 = 96, color = C.white, children, still = false, spacing = 1 }) => {
  const k = still ? 1 : pop(f, at);
  if (k <= 0.001) return null;
  const size = Math.min(size0, Math.floor(960 / (children.length * 0.62)));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', whiteSpace: 'nowrap', transform: `scale(${1.35 - 0.35 * Math.min(1.05, k)})`, opacity: Math.min(1, k * 2.2) }}>
      <span style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: size, lineHeight: 1.05, color, letterSpacing: spacing, WebkitTextStroke: `${Math.round(size / 9)}px #000`, paintOrder: 'stroke fill', textShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
        {children}
      </span>
    </div>
  );
};

/** A small monospace label (terminal style). */
const Mono: React.FC<{ x?: number; y: number; size?: number; color?: string; children: string; align?: 'left' | 'center'; opacity?: number }> = ({ x = 60, y, size = 34, color = C.green, children, align = 'left', opacity = 1 }) => (
  <div style={{ position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, fontFamily: MONO, fontSize: size, color, opacity, textShadow: '0 0 18px rgba(0,255,102,0.35), 0 4px 14px #000' }}>
    {children}
  </div>
);

/** A rubber stamp that slams in. */
const Stamp: React.FC<{ f: number; at: number; x?: number; y: number; rot?: number; color: string; size?: number; children: string }> = ({ f, at, x = 540, y, rot = -5, color, size = 70, children }) => {
  const k = pop(f, at);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1.6 - 0.6 * Math.min(1.05, k)})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ border: `8px solid ${color}`, borderRadius: 14, padding: '6px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: size, color, letterSpacing: 4, whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.45)', textShadow: '0 4px 18px #000' }}>
        {children}
      </div>
    </div>
  );
};

/** The series pill at the top of the hook and of the end card. */
const Pill: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(5,7,10,0.85)', border: `5px solid ${C.red}`, borderRadius: 50, padding: '10px 30px 10px 12px' }}>
      <div style={{ background: C.red, borderRadius: 12, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 26, color: C.white }}>NO</div>
      <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 38, color: C.white, letterSpacing: 3 }}>SIN RESOLVER #01</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------------------------
// Segments (seconds on the film clock). Each one draws its own shot; `lt` is the time inside the segment.
// ---------------------------------------------------------------------------------------------------------------

type Seg = { start: number; end: number; draw: (lt: number, f: number, d: number) => React.ReactNode };
const shakeAt = (t: number, at: number, len: number, amp: number) => (t >= at && t < at + len ? (1 - (t - at) / len) * amp : 0);

const SEGS: Seg[] = [
  // 1. Hook: the original picture and the promise. Frame 0 is the thumbnail and the loop target, so it shows everything.
  {
    start: 0, end: 3.2, draw: (t, f) => {
      const g = (t > 0.04 && t < 0.22) || (t > 1.55 && t < 1.72) ? 1 : 0;
      return (
        <>
          <Bg n="msg" t={t} dim={0.25} />
          <Pic file="msg.jpg" w={880} cy={790} scale={1.04 + 0.05 * t} />
          <Slices file="msg.jpg" w={880} cy={790} k={g} seed={f} scale={1.04 + 0.05 * t} />
          <Pill />
          <Line f={f} at={0} y={1250} size={104} still>EL ACERTIJO</Line>
          <Line f={f} at={0} y={1362} size={104} still>QUE NADIE</Line>
          <Line f={f} at={0} y={1474} size={112} color={C.key} still>PUDO CERRAR</Line>
        </>
      );
    },
  },
  // 2. The human stake.
  {
    start: 3.2, end: 5.6, draw: (t, f) => (
      <>
        <Bg n="msg" t={t} dim={0.5} />
        <Pic file="msg.jpg" w={900} cy={760} scale={1.55 + 0.12 * t} opacity={0.55} shadow={false} />
        <Line f={f} at={3.25} y={760} size={110}>MILES DE PERSONAS</Line>
        <Line f={f} at={3.95} y={900} size={92}>PASARON AÑOS</Line>
        <Line f={f} at={4.55} y={1015} size={92} color={C.key}>INTENTANDO RESOLVERLO</Line>
      </>
    ),
  },
  // 3. The date, on the forum's logo.
  {
    start: 5.6, end: 7.6, draw: (t, f) => {
      const g = t < 0.3 ? 1 - t / 0.3 : 0;
      const flick = t > 0.3 && rand(Math.floor(t * 15)) > 0.9 ? 0.6 : 1;
      return (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Pic file="logo.png" w={860} cy={700} scale={1 + 0.04 * t} opacity={flick} shadow={false} />
          <Slices file="logo.png" w={860} cy={700} k={g} seed={f + 99} />
          <Mono y={940} align="center" size={36} color={C.cyan}>UN FORO ANÓNIMO</Mono>
          <Stamp f={f} at={6.1} y={1180} color={C.amber} size={84}>4 · ENE · 2012</Stamp>
        </>
      );
    },
  },
  // 4. The forum (today's front page, labelled as such).
  {
    start: 7.6, end: 10.4, draw: (t, f) => (
      <>
        <Bg n="chan" t={t} dim={0.62} />
        <Pic file="chan.png" w={1040} cy={760} scale={1.02 + 0.09 * easeInOut(t / 2.8)} dy={-40 * easeInOut(t / 2.8)} />
        <Mono x={40} y={335} size={30} color={C.white} opacity={0.9}>▮ 4chan (hoy)</Mono>
        <Line f={f} at={7.9} y={1260} size={92}>UNA IMAGEN ANÓNIMA</Line>
        <Line f={f} at={8.6} y={1370} size={92} color={C.key}>APARECIÓ EN UN FORO</Line>
      </>
    ),
  },
  // 5. The message, typed.
  {
    start: 10.4, end: 14.0, draw: (t, f) => {
      const lines = ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.'];
      let budget = Math.max(0, t - 0.2) * 22;
      const cursor = Math.floor(t * 3) % 2 === 0;
      return (
        <>
          <Bg n="msg" t={t} dim={0.6} />
          <Pic file="msg.jpg" w={900} cy={760} scale={1.25 + 0.05 * t} opacity={0.35} shadow={false} />
          <div style={{ position: 'absolute', left: 60, right: 60, top: 470, height: 560, background: 'rgba(2,10,5,0.88)', border: `4px solid ${C.green}`, borderRadius: 16, boxShadow: '0 0 60px rgba(0,255,102,0.18)' }} />
          <Mono x={100} y={500} size={30} color={C.cyan}>{'> mensaje.txt  ·  firmado: ????'}</Mono>
          {lines.map((l, i) => {
            const s = l.slice(0, Math.max(0, Math.floor(budget)));
            budget -= l.length + 2;
            const typing = s.length > 0 && s.length < l.length;
            return (
              <Mono key={i} x={100} y={590 + i * 100} size={62}>
                {s + (typing && cursor ? '█' : '')}
              </Mono>
            );
          })}
          <Line f={f} at={13.0} y={1130} size={64} color={C.white}>«BUSCAMOS PERSONAS</Line>
          <Line f={f} at={13.0} y={1210} size={64} color={C.key}>MUY INTELIGENTES»</Line>
        </>
      );
    },
  },
  // 6. The signature: 3301, hard hit.
  {
    start: 14.0, end: 16.0, draw: (t, f) => {
      const k = pop(f, 14.0);
      const sx = (rand(f * 3) - 0.5) * shakeAt(t, 0, 0.45, 40);
      const sy = (rand(f * 5 + 1) - 0.5) * shakeAt(t, 0, 0.45, 40);
      const s = 2.2 - 1.2 * Math.min(1.04, k);
      const num = (dx: number, color: string, op: number) => (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `translate(${dx + sx}px, ${sy}px) scale(${s})`, opacity: op }}>
          <span style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 330, color, WebkitTextStroke: color === C.white ? '12px #000' : undefined, paintOrder: 'stroke fill' }}>3301</span>
        </div>
      );
      return (
        <>
          <Bg n="msg" t={t} dim={0.65} />
          <Pic file="msg.jpg" w={900} cy={800} scale={2.6 + 0.2 * t} opacity={0.28} shadow={false} />
          <Mono y={520} align="center" size={44} color={C.cyan}>FIRMADO:</Mono>
          {num(-12, C.red, 0.85)}
          {num(12, C.cyan, 0.6)}
          {num(0, C.white, 1)}
          <Line f={f} at={14.6} y={1180} size={70} color={C.white}>UN NÚMERO.</Line>
          <Line f={f} at={15.05} y={1270} size={70} color={C.red}>NADA MÁS.</Line>
        </>
      );
    },
  },
  // 7. The hidden message: a scan reveals bits inside the picture.
  {
    start: 16.0, end: 18.6, draw: (t, f) => {
      const top = 320;
      const h = 888; // msg.jpg at width 900
      const scan = top + h * easeOut(t / 1.7);
      return (
        <>
          <Bg n="msg" t={t} dim={0.45} />
          <Pic file="msg.jpg" w={900} cy={top + h / 2} />
          <div style={{ position: 'absolute', left: 90, width: 900, top, height: Math.max(0, scan - top), background: 'rgba(0,12,5,0.72)', overflow: 'hidden' }}>
            {Array.from({ length: 13 }, (_, r) => (
              <div key={r} style={{ fontFamily: MONO, fontSize: 40, color: C.green, opacity: 0.95, marginLeft: 26, lineHeight: '68px' }}>
                {Array.from({ length: 20 }, (_, c) => (rand(r * 29 + c * 5 + Math.floor(t * 4)) > 0.5 ? '1' : '0')).join('')}
              </div>
            ))}
          </div>
          {scan < top + h - 2 ? <div style={{ position: 'absolute', left: 90, width: 900, top: scan - 5, height: 10, background: C.green, boxShadow: '0 0 40px #00FF66' }} /> : null}
          <Line f={f} at={16.15} y={1260} size={92}>DENTRO HABÍA UN</Line>
          <Line f={f} at={16.7} y={1370} size={104} color={C.key}>MENSAJE OCULTO</Line>
        </>
      );
    },
  },
  // 8. The book.
  {
    start: 18.6, end: 20.2, draw: (t, f) => (
      <>
        <Bg n="liber" t={t} dim={0.55} />
        <Pic file="liber.png" w={640} cy={760} rot={-4 + 2 * t} scale={1.0 + 0.06 * t} dy={30 * (1 - easeOut(t / 0.4))} />
        <Stamp f={f} at={18.85} y={1290} rot={-6} color={C.red} size={86}>UN LIBRO</Stamp>
      </>
    ),
  },
  // 9. Coordinates: lock-on over the first city.
  {
    start: 20.2, end: 21.6, draw: (t, f) => {
      const tile = 1078; // one photo of the strip at scale 2.695
      const r = 260 - 140 * easeOut(t / 0.6);
      const lock = t > 0.6;
      return (
        <>
          <Bg n="cities" t={t} dim={0.4} />
          <div style={{ position: 'absolute', left: 1, top: 310, width: tile, height: 900, overflow: 'hidden' }}>
            <Img src={src('cities.png')} style={{ position: 'absolute', left: 0, top: 0, height: 900, transform: `scale(${1 + 0.05 * t})`, transformOrigin: '20% 50%' }} />
          </div>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <circle cx={540} cy={700} r={r} fill="none" stroke={lock ? C.red : C.green} strokeWidth={6} />
            <line x1={540} y1={700 - r - 60} x2={540} y2={700 + r + 60} stroke={lock ? C.red : C.green} strokeWidth={4} />
            <line x1={540 - r - 60} y1={700} x2={540 + r + 60} y2={700} stroke={lock ? C.red : C.green} strokeWidth={4} />
          </svg>
          <Mono y={1080} align="center" size={40} color={lock ? C.red : C.green}>{lock ? 'LAT ??.????  ·  LON ??.????' : 'BUSCANDO…'}</Mono>
          <Stamp f={f} at={20.5} y={1300} rot={4} color={C.green} size={78}>COORDENADAS</Stamp>
        </>
      );
    },
  },
  // 10. Posters in several cities: snap pans across the strip.
  {
    start: 21.6, end: 25.0, draw: (t, f) => {
      const tile = 1078;
      // hold a beat on each city, then snap to the next (Warszawa, Miami, Erskineville, Fayetteville)
      const step = Math.min(3, Math.floor(t / 0.85));
      const within = t - step * 0.85;
      const from = step === 0 ? 0 : step;
      const x = -tile * (from + easeInOut(Math.min(1, within / 0.25)));
      const blur = within < 0.22 ? 6 : 0;
      return (
        <>
          <Bg n="cities" t={t} dim={0.45} />
          <div style={{ position: 'absolute', left: 1, top: 310, width: tile, height: 900, overflow: 'hidden' }}>
            <Img src={src('cities.png')} style={{ position: 'absolute', left: x, top: 0, height: 900, filter: blur ? `blur(${blur}px)` : undefined }} />
          </div>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            {within > 0.3 ? <circle cx={540} cy={640} r={22 + 10 * Math.abs(Math.sin(t * 7))} fill={C.red} stroke="#000" strokeWidth={5} /> : null}
          </svg>
          <Line f={f} at={21.75} y={1260} size={84}>CARTELES CON CÓDIGOS QR</Line>
          <Line f={f} at={22.4} y={1365} size={84} color={C.key}>EN VARIAS CIUDADES</Line>
        </>
      );
    },
  },
  // 11. Three rounds, then nothing confirmed.
  {
    start: 25.0, end: 29.0, draw: (t, f) => {
      const yr = (at: number, x: number, label: string, color: string) => {
        const k = pop(f, at);
        return k <= 0.001 ? null : (
          <div style={{ position: 'absolute', left: x, top: 760, transform: `translate(-50%, 0) scale(${1.4 - 0.4 * Math.min(1, k)})`, opacity: Math.min(1, k * 2), textAlign: 'center' }}>
            <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: C.white, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill' }}>{label}</div>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: color, border: '5px solid #000', margin: '10px auto 0' }} />
          </div>
        );
      };
      const q = pop(f, 27.0);
      return (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Img src={src('tree.png')} style={{ position: 'absolute', left: -60, top: 120, width: 1200, opacity: 0.7, transform: `scale(${1.05 + 0.04 * t})` }} />
          <div style={{ position: 'absolute', left: 120, right: 120, top: 905, height: 6, background: 'rgba(248,250,252,0.35)' }} />
          {yr(25.3, 250, '2012', C.green)}
          {yr(25.9, 540, '2013', C.cyan)}
          {yr(26.5, 830, '2014', C.amber)}
          {q > 0.001 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', transform: `scale(${1.5 - 0.5 * Math.min(1, q)})`, opacity: Math.min(1, q * 2) }}>
              <span style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 380, color: C.red, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill' }}>?</span>
            </div>
          ) : null}
          <Line f={f} at={27.1} y={1230} size={84}>NADIE HA CONFIRMADO</Line>
          <Line f={f} at={27.6} y={1335} size={84} color={C.red}>QUIÉN ESTABA DETRÁS</Line>
        </>
      );
    },
  },
  // 12. The theories, in two fast cuts.
  {
    start: 29.0, end: 32.0, draw: (t, f) => {
      const first = t < 1.5;
      const lt = first ? t : t - 1.5;
      const g = lt < 0.18 ? 1 : 0;
      return first ? (
        <>
          <Bg n="msg" t={t} dim={0.55} />
          <Pic file="msg.jpg" w={900} cy={760} scale={1.9 + 0.1 * lt} opacity={0.5} shadow={false} />
          <AbsoluteFill style={{ background: 'rgba(255,42,42,0.16)' }} />
          <Slices file="msg.jpg" w={900} cy={760} k={g} seed={f + 7} scale={1.9} />
          <Line f={f} at={29.05} y={820} size={100}>¿UNA AGENCIA</Line>
          <Line f={f} at={29.05} y={935} size={100} color={C.key}>DE ESPIONAJE?</Line>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: C.bg }} />
          <Img src={src('tree.png')} style={{ position: 'absolute', left: -200, top: 0, width: 1480, opacity: 0.55, transform: `scale(${1.2 + 0.05 * lt})` }} />
          <AbsoluteFill style={{ background: 'rgba(63,216,255,0.08)' }} />
          <Line f={f} at={30.55} y={860} size={110} color={C.cyan}>¿UN EXPERIMENTO?</Line>
        </>
      );
    },
  },
  // 13. The open question and the series card; the last frames dissolve into frame 0 (the loop).
  {
    start: 32.0, end: 35.0, draw: (t, f) => (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <Img src={src('tree.png')} style={{ position: 'absolute', left: -60, top: 120, width: 1200, opacity: 0.35 }} />
        <Line f={f} at={32.1} y={640} size={130}>¿TÚ QUÉ</Line>
        <Line f={f} at={32.35} y={780} size={150} color={C.key}>CREES?</Line>
        <Mono y={990} align="center" size={38} color={C.white} opacity={lin(t, 0.8, 1.1)}>DÉJALO EN LOS COMENTARIOS ↓</Mono>
        <Stamp f={f} at={33.2} y={1240} rot={-3} color={C.red} size={80}>SIN RESOLVER #01</Stamp>
      </>
    ),
  },
];

// Hits: a white flash on these moments (seconds).
const FLASHES = [5.6, 14.0, 25.0, 29.0, 30.5];

export const Cicada01: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / CICADA01.fps;
  const seg = SEGS.find((s) => t >= s.start && t < s.end) ?? SEGS[SEGS.length - 1];
  const lt = t - seg.start;
  const D = CICADA01.duration;
  // the loop: the last 0.35 s fade frame 0 back in
  const w = lin(t, D - 0.35, D - 1 / CICADA01.fps);
  const flash = FLASHES.reduce((m, a) => Math.max(m, t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0), 0);
  // every cut opens with a short push and a tiny camera shake
  const push = seg === SEGS[0] ? 0 : Math.exp(-lt / 0.12);
  const shx = (rand(f * 11) - 0.5) * 14 * push;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <Audio src={staticFile('cicada01/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${shx}px, 0) scale(${1 + 0.035 * push})` }}>{seg.draw(lt, f, seg.end - seg.start)}</AbsoluteFill>
      {w > 0 ? <AbsoluteFill style={{ opacity: w }}>{SEGS[0].draw(0, 0, 3.2)}</AbsoluteFill> : null}
      <Texture f={f} />
      {flash > 0 ? <AbsoluteFill style={{ background: `rgba(255,255,255,${0.75 * flash})` }} /> : null}
    </AbsoluteFill>
  );
};
