import React from 'react';
import { COLOR, HEAVY } from './motion';

// KineticTitle: a giant line of text with impact physics. `k` is the progress of a stiff spring (0..1+): the line
// starts 3.2x big and tilted, lands with overshoot, and carries a red offset shadow. Used for the hook and for any
// slam (NO PRESIONES ESA TECLA). Set its spring from motion.ts (springAt(..., HARD)).

export const KineticTitle: React.FC<{ text: string; y: number; size: number; k: number; tilt: number; shadow?: string }> = ({ text, y, size, k, tilt, shadow = COLOR.red }) => {
  if (k <= 0.001) return null;
  const s = 3.2 - 2.2 * k;
  return (
    <g transform={`translate(540 ${y}) rotate(${tilt * (1 - k)}) scale(${s})`}>
      <text x={10} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={shadow} textLength={1000} lengthAdjust="spacingAndGlyphs">
        {text}
      </text>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontFamily={HEAVY}
        fontWeight={900}
        fontSize={size}
        fill="#FFF"
        stroke="#000"
        strokeWidth={12}
        paintOrder="stroke"
        textLength={1000}
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>
    </g>
  );
};
