import React from 'react';
import { HEAVY } from '../motion';
import { P3 } from '../fallo03/parts';

export { clamp, num, OutText, P3, sm, Stars } from '../fallo03/parts';

// Fallo #04 parts: the phone and its chat, the pending clock, the double check, the three apps (generic glyphs with their
// name next to them, never the real logos), the home wifi, a server rack.

export const C4 = { ...P3, wa: '#22C55E', ig: '#EC4899', fb: '#3B82F6', bubble: '#334155', bubbleOff: '#161B26', screen: '#0B1220', body: '#111827' };

/** A chat bubble, (x, y) its centre; `side` out (right, tail bottom-right) or in (left). */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; side?: 'in' | 'out'; fill?: string; stroke?: string; strokeW?: number; opacity?: number; s?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  side = 'out',
  fill = C4.bubble,
  stroke = '#475569',
  strokeW = 4,
  opacity = 1,
  s = 1,
  children,
}) => {
  const r = Math.min(34, h / 2.4);
  const x0 = -w / 2;
  const y0 = -h / 2;
  const tail = side === 'out' ? `M ${w / 2 - 34} ${h / 2 - 2} L ${w / 2 + 16} ${h / 2 + 18} L ${w / 2 - 6} ${h / 2 - 28} Z` : `M ${-w / 2 + 34} ${h / 2 - 2} L ${-w / 2 - 16} ${h / 2 + 18} L ${-w / 2 + 6} ${h / 2 - 28} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path d={tail} fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
      <rect x={x0} y={y0} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      <path d={tail} fill={fill} stroke="none" transform="translate(0 -3)" />
      {children}
    </g>
  );
};

/** The "not sent" clock: a small clock face whose hand keeps going round. */
export const PendingClock: React.FC<{ x: number; y: number; r?: number; t: number; color?: string; spin?: number }> = ({ x, y, r = 16, t, color = '#94A3B8', spin = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="none" stroke={color} strokeWidth={r * 0.22} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.62} stroke={color} strokeWidth={r * 0.2} strokeLinecap="round" transform={`rotate(${t * 300 * spin})`} />
    <line x1={0} y1={0} x2={r * 0.45} y2={0} stroke={color} strokeWidth={r * 0.2} strokeLinecap="round" />
  </g>
);

/** The double check of a delivered message, drawn in with k (0..1). */
export const DoubleCheck: React.FC<{ x: number; y: number; s?: number; k?: number; color?: string }> = ({ x, y, s = 1, k = 1, color = '#FFFFFF' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M -26 0 L -16 10 L 4 -12" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, k * 2)} />
    <path d="M -8 0 L 2 10 L 22 -12" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, k * 2 - 1))} />
  </g>
);

/** One of the three apps, as a generic glyph in a disc (with its name under it when `label`). `on` 1 lit, 0 dead grey. */
export const AppGlyph: React.FC<{ kind: 'wa' | 'ig' | 'fb'; x: number; y: number; r?: number; on?: number; label?: boolean; labelColor?: string }> = ({ kind, x, y, r = 80, on = 1, label = false, labelColor = '#CBD5E1' }) => {
  const tint = kind === 'wa' ? C4.wa : kind === 'ig' ? C4.ig : C4.fb;
  const lit = on > 0.5;
  const disc = lit ? tint : '#273449';
  const ink = lit ? '#FFFFFF' : '#94A3B8';
  const k = r / 80;
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit ? <circle r={r * 1.28} fill={tint} opacity={0.18 * on} /> : null}
      <circle r={r} fill={disc} stroke={lit ? '#FFFFFF' : '#64748B'} strokeWidth={5 * k} />
      <g transform={`scale(${k})`} fill="none" stroke={ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
        {kind === 'wa' ? (
          <g>
            <path d="M -30 34 L -24 14 A 38 38 0 1 1 -8 30 Z" />
            <path d="M -12 -14 Q -14 6 4 18 Q 14 22 18 14" strokeWidth={8} />
          </g>
        ) : kind === 'ig' ? (
          <g>
            <rect x={-38} y={-38} width={76} height={76} rx={22} />
            <circle r={18} />
            <circle cx={23} cy={-23} r={3} fill={ink} stroke="none" />
          </g>
        ) : (
          <text x={6} y={34} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill={ink} stroke="none">
            f
          </text>
        )}
      </g>
      {label ? (
        <text y={r + 54 * Math.max(0.7, k)} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30 * Math.max(0.8, k)} fill={labelColor} letterSpacing={1}>
          {kind === 'wa' ? 'WhatsApp' : kind === 'ig' ? 'Instagram' : 'Facebook'}
        </text>
      ) : null}
    </g>
  );
};

/** A phone, (x, y) its centre, 560 x 1000 at s = 1; children are drawn in screen space (origin at the screen's centre). */
export const PhoneBody: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; children?: React.ReactNode; time?: string }> = ({ x, y, s = 1, rot = 0, glow = 0.15, children, time = '21:47' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-300} y={-520} width={600} height={1040} rx={86} fill="#38BDF8" opacity={glow} transform="scale(1.04)" />
    <rect x={-290} y={-510} width={580} height={1020} rx={80} fill={C4.body} stroke="#334155" strokeWidth={10} />
    <rect x={-262} y={-482} width={524} height={964} rx={56} fill={C4.screen} />
    <rect x={-70} y={-466} width={140} height={30} rx={15} fill="#000" />
    <text x={-220} y={-420} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#CBD5E1">
      {time}
    </text>
    <g transform="translate(200 -430)">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 12} y={-6 - i * 5} width={8} height={10 + i * 5} rx={2} fill={i < 1 ? '#CBD5E1' : '#334155'} />
      ))}
    </g>
    {children}
  </g>
);

/** The home wifi icon: three arcs and a dot, `bars` 0..3 lit. */
export const Wifi: React.FC<{ x: number; y: number; s?: number; bars?: number; color?: string }> = ({ x, y, s = 1, bars = 3, color = '#FFFFFF' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round">
    {[1, 2, 3].map((i) => (
      <path key={i} d={`M ${-i * 52} ${-i * 22} A ${i * 70} ${i * 70} 0 0 1 ${i * 52} ${-i * 22}`} stroke={color} strokeWidth={22} opacity={i <= bars ? 1 : 0.18} />
    ))}
    <circle cx={0} cy={12} r={16} fill={color} />
  </g>
);

/** A server rack in a disc, the node of the network. */
export const ServerNode: React.FC<{ x: number; y: number; r?: number; on?: number; t?: number; color?: string }> = ({ x, y, r = 110, on = 1, t = 0, color = '#38BDF8' }) => {
  const lit = on > 0.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit ? <circle r={r * 1.3} fill={color} opacity={0.14 + 0.06 * Math.sin(t * 6)} /> : null}
      <circle r={r} fill="#0B1220" stroke={lit ? color : '#374151'} strokeWidth={8} />
      {[-1, 0, 1].map((i) => (
        <g key={i} transform={`translate(0 ${i * r * 0.36})`}>
          <rect x={-r * 0.52} y={-r * 0.14} width={r * 1.04} height={r * 0.28} rx={r * 0.06} fill={lit ? '#1E293B' : '#111827'} stroke={lit ? '#64748B' : '#1F2937'} strokeWidth={4} />
          {[0, 1, 2].map((j) => (
            <circle key={j} cx={r * (0.24 + j * 0.1)} cy={0} r={r * 0.035} fill={lit ? (Math.floor(t * 8 + i * 3 + j) % 3 === 0 ? '#4ADE80' : '#22D3EE') : '#374151'} />
          ))}
        </g>
      ))}
    </g>
  );
};
