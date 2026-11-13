import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLOR, rand, springAt, SNAP } from './motion';

// Frame-wide effects: the camera (a slow, eased push on every shot), the scrolling grid, the progress bar and the
// interrupts. The interrupts are rationed: a soft flash and a shake on the hook, and a flash and a shake when the
// gauge hits 100x. Everywhere else the picture stays calm.

export type FxEvent = { t: number; kind: string };

/**
 * Camera for the current frame. The picture is never still: a steady push-in from 1.0 to 1.06 across every shot (no
 * easing, so it never stops), a slow float of a few pixels and a fraction of a degree, the rationed shakes, and
 * `tremor` (0-1), a low hand-held tremble for the climax.
 */
export function camera(t: number, f: number, fps: number, shotStart: number, shotEnd: number, fx: FxEvent[], tremor = 0, shotIndex = 0) {
  const p = Math.max(0, Math.min(1, (t - shotStart) / Math.max(0.001, shotEnd - shotStart)));
  // shots alternate a push-in (1.04 -> 1.12) and a pull-back (1.12 -> 1.04), with a slow sideways pan whose direction
  // changes from shot to shot, so no two cuts in a row move the same way and no shot is ever still
  const pushIn = shotIndex % 2 === 0;
  let scale = pushIn ? 1.04 + 0.08 * p : 1.12 - 0.08 * p; // never below 1.04, so the drift never shows an edge
  const panDir = [1, -1, 0.5, -0.5][shotIndex % 4];
  let x = panDir * 20 * (p - 0.5) + 7 * Math.sin(t * 0.9 + 0.4) + 3 * Math.sin(t * 2.3);
  let y = (shotIndex % 3 === 1 ? -12 : 10) * (p - 0.5) + 6 * Math.sin(t * 0.7 + 1.3) + 2.5 * Math.sin(t * 1.9 + 2.1);
  let rot = 0.3 * Math.sin(t * 0.55 + 0.8);
  if (tremor > 0) {
    // smooth noise (sums of fast sines), not per-frame random, so it reads as a hand-held tremble and not as flicker
    x += tremor * (5 * Math.sin(t * 23.1) + 3 * Math.sin(t * 37.7 + 1));
    y += tremor * (4 * Math.sin(t * 19.3 + 2) + 3 * Math.sin(t * 41.9));
    rot += tremor * 0.25 * Math.sin(t * 17.3 + 0.5);
  }
  for (const e of fx) {
    const dt = t - e.t;
    if (e.kind === 'punch' && dt >= 0 && dt < 2) {
      // a gentle punch-in on a key word: about +5 %, landing with the spring and easing back over a second
      const k = springAt(f, fps, e.t, SNAP);
      scale *= 1 + 0.05 * k * Math.exp(-Math.max(0, dt - 0.35) / 0.55);
      continue;
    }
    if (dt < 0 || dt > 0.9) continue;
    if (e.kind === 'zoom') {
      const k = springAt(f, fps, e.t, SNAP);
      scale *= 1 + 0.16 * (1 - k);
    }
    if (e.kind === 'shake' || e.kind === 'redflash' || e.kind === 'microshake') {
      const amp = (e.kind === 'shake' ? 22 : e.kind === 'microshake' ? 9 : 12) * Math.exp(-dt / (e.kind === 'microshake' ? 0.18 : 0.12));
      x += (rand(f * 3.1 + e.t) - 0.5) * 2 * amp;
      y += (rand(f * 7.7 + e.t) - 0.5) * 2 * amp;
      rot += (rand(f * 1.3 + e.t) - 0.5) * 2 * amp * 0.06;
    }
    if (e.kind === 'glitch' && dt < 0.15) {
      x += (rand(f * 5.5) - 0.5) * 60;
    }
  }
  return { scale, x, y, rot };
}

/**
 * The climax weather (MALFUNCTION 54 to the 100x gauge): the frame darkens and a red vignette pulses at the edges.
 * Plain alpha gradients only (no blend modes or blurs, which cost several times the render time).
 */
export const ClimaxOverlay: React.FC<{ t: number; level: number }> = ({ t, level }) => {
  if (level <= 0.001) return null;
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.15);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#000', opacity: 0.26 * level }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 48%, rgba(255,42,42,0) 42%, rgba(255,42,42,${(0.22 + 0.26 * pulse).toFixed(3)}) 82%, rgba(120,0,6,${(0.55 + 0.2 * pulse).toFixed(3)}) 100%)`,
          opacity: level,
        }}
      />
    </AbsoluteFill>
  );
};

const inFrames = (f: number, fps: number, t: number, n: number) => {
  const s = Math.round(t * fps);
  return f >= s && f < s + n;
};

/** True while an invert interrupt is on (exactly two frames). */
export const inverted = (f: number, fps: number, fx: FxEvent[]) =>
  fx.some((e) => e.kind === 'invert' && inFrames(f, fps, e.t, 2));

/** White and red flashes. A white flash holds two full frames, then is gone. */
export const FlashOverlay: React.FC<{ f: number; fps: number; fx: FxEvent[] }> = ({ f, fps, fx }) => {
  let white = 0;
  let red = 0;
  for (const e of fx) {
    const s = Math.round(e.t * fps);
    const d = f - s;
    if (d < 0 || d > 12) continue;
    if (e.kind === 'flash') white = Math.max(white, d < 2 ? 1 : 0);
    // frame 0: a flash the alert still shows through, so the first frame (the thumbnail) is never blank
    if (e.kind === 'softflash') white = Math.max(white, d < 5 ? 0.22 * (1 - d / 5) : 0);
    if (e.kind === 'redflash') red = Math.max(red, d < 3 ? 0.8 : Math.max(0, 0.8 - (d - 3) * 0.12));
  }
  return (
    <>
      {red > 0 ? <AbsoluteFill style={{ background: COLOR.red, opacity: red, mixBlendMode: 'screen' }} /> : null}
      {white > 0 ? <AbsoluteFill style={{ background: '#FFFFFF', opacity: white }} /> : null}
    </>
  );
};

/** Horizontal glitch slices for a few frames after each glitch event. */
export const GlitchOverlay: React.FC<{ f: number; fps: number; fx: FxEvent[] }> = ({ f, fps, fx }) => {
  const active = fx.some((e) => e.kind === 'glitch' && f >= Math.round(e.t * fps) && f < Math.round(e.t * fps) + 9);
  if (!active) return null;
  const bars = Array.from({ length: 7 }, (_, i) => ({
    y: rand(f * 13 + i) * 1920,
    h: 12 + rand(f * 17 + i) * 90,
    dx: (rand(f * 19 + i) - 0.5) * 160,
    c: i % 2 ? COLOR.cyan : COLOR.red,
  }));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {bars.map((b, i) => (
          <rect key={i} x={b.dx} y={b.y} width={1080} height={b.h} fill={b.c} opacity={0.42} style={{ mixBlendMode: 'screen' }} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** A grid that never stops scrolling, laid over every shot at low opacity. */
export const GridOverlay: React.FC<{ f: number; color?: string; opacity?: number }> = ({ f, color = '#9FE8FF', opacity = 0.13 }) => {
  const size = 96;
  const off = (f * 2.2) % size;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'screen' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <pattern id="grid" width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`translate(${off * 0.35} ${off})`}>
            <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={color} strokeWidth={2} />
          </pattern>
        </defs>
        <rect x={-200} y={-200} width={1480} height={2320} fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Ultra-thin neon progress bar along the top edge, advancing in real time. */
export const ProgressBar: React.FC<{ f: number; total: number }> = ({ f, total }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 250, // below the apps' top bar (the safe area starts about 250 px down)
      height: 7,
      width: `${(100 * (f + 1)) / total}%`,
      background: COLOR.red,
      boxShadow: `0 0 18px ${COLOR.red}, 0 0 6px #FFB3B3`,
    }}
  />
);

/** CRT-ish scanlines and a vignette that keep the frame tight. */
export const Finish: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)',
        backgroundPosition: `0 ${(f * 1.5) % 5}px`,
      }}
    />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.72) 100%)' }} />
  </AbsoluteFill>
);

/** A radiation trefoil centred on (0, 0). */
export const Trefoil: React.FC<{ r: number; fill: string; rot?: number; bg?: string }> = ({ r, fill, rot = 0, bg }) => {
  const blade = (a: number) => {
    const a0 = ((a - 30) * Math.PI) / 180;
    const a1 = ((a + 30) * Math.PI) / 180;
    const ri = r * 0.28;
    return `M ${ri * Math.cos(a0)} ${ri * Math.sin(a0)} L ${r * Math.cos(a0)} ${r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} L ${ri * Math.cos(a1)} ${ri * Math.sin(a1)} A ${ri} ${ri} 0 0 0 ${ri * Math.cos(a0)} ${ri * Math.sin(a0)} Z`;
  };
  return (
    <g transform={`rotate(${rot})`}>
      {bg ? <circle r={r * 1.12} fill={bg} /> : null}
      {[-90, 30, 150].map((a) => (
        <path key={a} d={blade(a)} fill={fill} />
      ))}
      <circle r={r * 0.18} fill={fill} />
    </g>
  );
};

/**
 * AlertOverlay: every hard effect of the film in one overlay (white and red flashes, glitch slices). The brief rations
 * them to two moments (the hook and the 100x burst), so the plan's `fx` list holds only those.
 */
export const AlertOverlay: React.FC<{ f: number; fps: number; fx: FxEvent[] }> = ({ f, fps, fx }) => (
  <>
    <GlitchOverlay f={f} fps={fps} fx={fx} />
    <FlashOverlay f={f} fps={fps} fx={fx} />
  </>
);
