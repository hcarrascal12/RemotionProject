import React from 'react';
import { blink, COLOR, HEAVY, MONO, rand } from '../motion';

// Shared pieces for Fallo #02 (CrowdStrike, 19 July 2024): the blue screen, a monitor, small helpers.
// Everything is plain SVG so the scenes render fast (no blend modes or blurs over the whole frame).

export const BLUE = '#0078D7';
export const BLUE_DEEP = '#06182E';

/** A blue screen of death on a rect at (x, y) of size w x h: the sad face, the message and a progress line. */
export const Bsod: React.FC<{ x: number; y: number; w: number; h: number; t: number; pct?: number; glitch?: number }> = ({ x, y, w, h, t, pct = 0, glitch = 0 }) => {
  const s = w / 600;
  const jit = glitch > 0 ? (rand(Math.floor(t * 30)) - 0.5) * 18 * glitch : 0;
  return (
    <g transform={`translate(${x + jit} ${y})`}>
      <rect width={w} height={h} fill={BLUE} />
      <text x={36 * s} y={170 * s} fontFamily={HEAVY} fontWeight={900} fontSize={170 * s} fill="#FFF">
        :(
      </text>
      <text x={36 * s} y={250 * s} fontFamily={MONO} fontSize={21 * s} fill="#FFF">
        TU PC TUVO UN PROBLEMA
      </text>
      <text x={36 * s} y={282 * s} fontFamily={MONO} fontSize={21 * s} fill="#FFF">
        Y DEBE REINICIARSE.
      </text>
      <text x={36 * s} y={330 * s} fontFamily={MONO} fontSize={19 * s} fill="#DCEBFF">
        {Math.round(pct)}% COMPLETADO
      </text>
      {glitch > 0 ? (
        <>
          <rect x={0} y={h * (0.2 + 0.5 * rand(Math.floor(t * 20)))} width={w} height={8 * s} fill={COLOR.red} opacity={0.5 * glitch} />
          <rect x={0} y={h * (0.1 + 0.6 * rand(Math.floor(t * 20) + 5))} width={w} height={5 * s} fill={COLOR.cyan} opacity={0.5 * glitch} />
        </>
      ) : null}
    </g>
  );
};

/** A desktop monitor (front view) whose screen is whatever children draw inside 0..w x 0..h. */
export const Monitor: React.FC<{ x: number; y: number; w: number; children: React.ReactNode; on?: boolean }> = ({ x, y, w, children, on = true }) => {
  const h = w * 0.62;
  const b = w * 0.035;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w * 0.03} y={h + b - 2} width={w * 1.06} height={w * 0.03} rx={6} fill="#10151F" opacity={0.0} />
      <rect x={w * 0.43} y={h + b} width={w * 0.14} height={w * 0.16} fill="#222B3A" />
      <rect x={w * 0.28} y={h + b + w * 0.15} width={w * 0.44} height={w * 0.04} rx={w * 0.02} fill="#2B3547" />
      <rect x={-b} y={-b} width={w + 2 * b} height={h + 2 * b} rx={w * 0.04} fill="#2B3547" stroke="#0C1018" strokeWidth={w * 0.012} />
      <rect width={w} height={h} fill={on ? '#000' : '#0B0F16'} />
      <svg x={0} y={0} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {children}
      </svg>
    </g>
  );
};

/** A big stamp that lands with a spring (k from springAt): label on a framed card. */
export const Stamp: React.FC<{ k: number; x: number; y: number; label: string; sub?: string; color?: string; w?: number; size?: number; rot?: number }> = ({
  k,
  x,
  y,
  label,
  sub,
  color = COLOR.red,
  w = 800,
  size = 130,
  rot = -4,
}) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot * (1 - Math.min(1, k) * 0.6)}) scale(${2.6 - 1.6 * k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * (sub ? 1.9 : 1.45)} rx={22} fill="#000000B8" stroke={color} strokeWidth={12} />
      <text y={size * 0.1} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={color} textLength={w - 70} lengthAdjust="spacingAndGlyphs">
        {label}
      </text>
      {sub ? (
        <text y={size * 0.72} textAnchor="middle" fontFamily={MONO} fontSize={size * 0.27} fill="#FFF" letterSpacing={3}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** A small PC tile: a monitor icon that is dark, blue (crashed) or green (fixed). */
export const PcTile: React.FC<{ x: number; y: number; s?: number; state: 'ok' | 'blue' | 'fixed' | 'off' }> = ({ x, y, s = 1, state }) => {
  const fill = state === 'blue' ? BLUE : state === 'fixed' ? '#18C964' : state === 'ok' ? '#9FB4C7' : '#1B2432';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect width={96} height={64} rx={7} fill="#222B3A" stroke="#0C1018" strokeWidth={3} />
      <rect x={6} y={6} width={84} height={46} fill={fill} />
      {state === 'blue' ? (
        <text x={14} y={42} fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#FFF">
          :(
        </text>
      ) : null}
      {state === 'fixed' ? (
        <path d="M 30 30 L 43 42 L 66 18" stroke="#FFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      <rect x={40} y={64} width={16} height={9} fill="#222B3A" />
      <rect x={28} y={72} width={40} height={6} rx={3} fill="#2B3547" />
    </g>
  );
};

/** A blinking red label strip. */
export const Strip: React.FC<{ x: number; y: number; w: number; text: string; t: number; color?: string; size?: number }> = ({ x, y, w, text, t, color = COLOR.red, size = 44 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={size * 1.5} rx={size * 0.3} fill={blink(t, 0.5, 0.32) ? color : '#6B0F12'} stroke="#FFF" strokeWidth={5} />
    <text x={w / 2} y={size * 1.08} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill="#FFF">
      {text}
    </text>
  </g>
);
