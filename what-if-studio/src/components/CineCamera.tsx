import React from 'react';
import { KitDefs, SetDefs } from '../engine';
import { DEV } from '../design/devArtificial';

// CineCamera: a vertical camera onto the What If engine's 1920 x 1080 world, with the cinematic finish of El Dev
// Artificial: the palette grade, a vignette, light emitted by a monitor or a lamp, and an out-of-focus foreground.
//
//   cx, cy, zoom, rot  where the camera looks (centre of the frame, scale, tilt). Keep zoom at 1.8 or more so the
//                      world's height covers the 1920 px frame. Move them every frame for a push-in or a follow.
//   tint               the colour of the scene's light: it tints the grade and the vignette
//   light              a light source in world units that spills onto the scene (a monitor lighting a face)
//   fg                 foreground shapes near the lens, drawn blurred in front of everything for depth
//   vignette           0..1, how hard the corners fall off

export type Tint = 'neutral' | 'red' | 'green' | 'amber' | 'blue';
const TINT: Record<Tint, string> = { neutral: '#9FB4C7', red: DEV.palette.red, green: DEV.palette.green, amber: DEV.palette.amber, blue: DEV.palette.cyan };

export type Light = { x: number; y: number; r: number; color: string; o?: number };

export const CineCamera: React.FC<{
  cx: number;
  cy: number;
  zoom: number;
  rot?: number;
  tint?: Tint;
  vignette?: number;
  light?: Light | Light[];
  fg?: React.ReactNode;
  bg?: string;
  children: React.ReactNode;
}> = ({ cx, cy, zoom, rot = 0, tint = 'neutral', vignette = 0.6, light, fg, bg = DEV.palette.bg, children }) => {
  const lights = light ? (Array.isArray(light) ? light : [light]) : [];
  const c = TINT[tint];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <KitDefs />
      <SetDefs />
      <defs>
        <radialGradient id="devVig" cx="50%" cy="46%" r="72%">
          <stop offset="48%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.9} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={bg} />
      <g transform={`translate(540 960) rotate(${rot}) scale(${zoom}) translate(${-cx} ${-cy})`}>
        {children}
        {/* light spilling from a monitor or a lamp: it lifts what it touches, in the scene's colour */}
        {lights.map((l, i) => (
          <g key={i} opacity={l.o ?? 0.45}>
            <defs>
              <radialGradient id={`devLight${i}`}>
                <stop offset="0%" stopColor={l.color} stopOpacity={0.9} />
                <stop offset="55%" stopColor={l.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={l.color} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={l.x} cy={l.y} r={l.r} fill={`url(#devLight${i})`} />
          </g>
        ))}
        {fg}
      </g>
      {/* the grade: lifts the blacks to the palette's deep blue and pushes the mids toward the scene's light.
          Plain alpha layers: blend modes and blur filters over the whole frame cost about 7x in render time. */}
      <rect width={1080} height={1920} fill={DEV.palette.bg2} opacity={0.16} />
      <rect width={1080} height={1920} fill={c} opacity={0.035} />
      <rect width={1080} height={1920} fill="url(#devVig)" opacity={vignette} />
    </svg>
  );
};

/** Out-of-focus shapes at the lens edges (a cart, a stand): depth between the foreground and the room. */
export const edgeFg = (cx: number, cy: number, zoom: number) => {
  const wx = (sx: number) => cx + (sx - 540) / zoom;
  const wy = (sy: number) => cy + (sy - 960) / zoom;
  return (
    <g>
      <defs>
        <radialGradient id="devFgL" cx="0%" cy="100%" r="100%">
          <stop offset="0%" stopColor={DEV.palette.bg} stopOpacity={0.9} />
          <stop offset="60%" stopColor={DEV.palette.bg} stopOpacity={0.55} />
          <stop offset="100%" stopColor={DEV.palette.bg} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="devFgR" cx="100%" cy="100%" r="100%">
          <stop offset="0%" stopColor={DEV.palette.bg} stopOpacity={0.9} />
          <stop offset="60%" stopColor={DEV.palette.bg} stopOpacity={0.55} />
          <stop offset="100%" stopColor={DEV.palette.bg} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={wx(-60)} y={wy(1330)} width={(380) / zoom} height={(700) / zoom} fill="url(#devFgL)" />
      <rect x={wx(790)} y={wy(1450)} width={(350) / zoom} height={(580) / zoom} fill="url(#devFgR)" />
    </g>
  );
};

/** The previous name, kept so older scenes keep working. */
export const World = CineCamera;

/** Engine frames (30 fps) from shot seconds. */
export const ef = (t: number) => t * 30;
