import React from 'react';
import { DEV } from '../design/devArtificial';

// DepthBackdrop: what replaces a flat fill behind graphics. A deep palette base, a faint technical grid drifting
// slowly, a glow in the colour of the scene's light, and a vignette. `overlayOnly` draws just the glow and the
// vignette on top of a grid the graphic already has (the blueprint, the schematic).

export const DepthBackdrop: React.FC<{ t: number; color?: string; glow?: number; cy?: number; overlayOnly?: boolean }> = ({
  t,
  color = DEV.palette.cyan,
  glow = 0.16,
  cy = 900,
  overlayOnly = false,
}) => (
  <g>
    <defs>
      <radialGradient id="dbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="dbVig" cx="50%" cy="46%" r="75%">
        <stop offset="42%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.82} />
      </radialGradient>
      <pattern id="dbGrid" width={90} height={90} patternUnits="userSpaceOnUse">
        <path d="M 90 0 L 0 0 0 90" fill="none" stroke={color} strokeWidth={1.5} opacity={0.14} />
      </pattern>
    </defs>
    {overlayOnly ? null : <rect width={1080} height={1920} fill={DEV.palette.bg} />}
    {overlayOnly ? null : <rect width={1080} height={1920} fill="url(#dbGrid)" transform={`translate(0 ${(t * 16) % 90})`} />}
    <ellipse cx={540} cy={cy} rx={760} ry={820} fill="url(#dbGlow)" opacity={glow} />
    <rect width={1080} height={1920} fill="url(#dbVig)" />
  </g>
);
