import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLOR, rand, springAt, SNAP } from './motion';

// Frame-wide effects: the camera (slow push, punches, shakes), the scrolling grid, the progress bar and the
// one-to-few-frame interrupts (flash, red flash, invert, glitch).

export type FxEvent = { t: number; kind: string };

/** Camera for the current frame: a slow continuous push across the shot, plus zoom punches and shakes. */
export function camera(t: number, f: number, fps: number, shotStart: number, shotEnd: number, fx: FxEvent[]) {
  const p = (t - shotStart) / Math.max(0.001, shotEnd - shotStart);
  let scale = 1 + 0.075 * p;
  let x = 0;
  let y = 0;
  let rot = 0;
  for (const e of fx) {
    const dt = t - e.t;
    if (dt < 0 || dt > 1.2) continue;
    if (e.kind === 'zoom') {
      const k = springAt(f, fps, e.t, SNAP);
      scale *= 1 + 0.16 * (1 - k);
    }
    if (e.kind === 'shake' || e.kind === 'redflash') {
      const amp = (e.kind === 'shake' ? 34 : 18) * Math.exp(-dt / 0.11);
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
    if (e.kind === 'softflash') white = Math.max(white, d < 8 ? 0.55 * (1 - d / 8) : 0);
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
      top: 0,
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
