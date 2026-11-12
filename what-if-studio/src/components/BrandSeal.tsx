import React from 'react';
import { HARD, HEAVY, springAt } from './motion';

// The channel's seal: the red NO button with its four screws (same drawing as the avatar and watermark).
// It slams in, holds, and leaves: on screen for at most 1.5 s, as the channel style asks.

export const SEAL_SECONDS = 1.4;

export const BrandSeal: React.FC<{ t: number; f: number; fps: number; at: number; x: number; y: number; size?: number; tilt?: number }> = ({
  t,
  f,
  fps,
  at,
  x,
  y,
  size = 210,
  tilt = 0,
}) => {
  const local = t - at;
  if (local < 0 || local > SEAL_SECONDS) return null;
  const k = springAt(f, fps, at, HARD);
  const out = Math.max(0, Math.min(1, (SEAL_SECONDS - local) / 0.18));
  const s = size / 240;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s * (0.5 + 0.5 * k)})`} opacity={Math.min(1, k * 1.6) * out}>
      <rect x={-108} y={-96} width={240} height={240} rx={46} fill="#000" />
      <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={8} />
      <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={5} />
      <rect x={-84} y={-86} width={110} height={26} rx={13} fill="#FF8A8A" opacity={0.55} />
      {[[-72, -72], [72, -72], [-72, 72], [72, 72]].map(([cx, cy]) => (
        <g key={`${cx}${cy}`}>
          <circle cx={cx} cy={cy} r={12} fill="#BDBDBD" stroke="#000" strokeWidth={3} />
          <path d={`M ${cx - 7} ${cy} H ${cx + 7} M ${cx} ${cy - 7} V ${cy + 7}`} stroke="#000" strokeWidth={3.5} />
        </g>
      ))}
      <text x={0} y={36} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke" letterSpacing={-2}>
        NO
      </text>
    </g>
  );
};
