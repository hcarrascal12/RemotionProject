import React from 'react';

// The fire station of "Operación Corazón": a bright garage, a wall phone and Carrito Rayo, the little red engine. Plain shapes
// in the What If engine's 1920 x 1080 world. Kid-friendly colours (light wall, warm floor), nothing dark.

export const Truck: React.FC<{ x: number; y: number; s?: number; siren?: number }> = ({ x, y, s = 1, siren = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={118} rx={300} ry={26} fill="#000" opacity={0.18} />
    {/* ladder */}
    <g stroke="#9CA3AF" strokeWidth={8} strokeLinecap="round">
      <line x1={-200} y1={-96} x2={150} y2={-96} />
      <line x1={-200} y1={-70} x2={150} y2={-70} />
      {[-180, -120, -60, 0, 60, 120].map((v) => <line key={v} x1={v} y1={-96} x2={v} y2={-70} />)}
    </g>
    {/* body */}
    <rect x={-250} y={-60} width={330} height={150} rx={20} fill="#E11D2E" stroke="#7F1D1D" strokeWidth={6} />
    <rect x={-250} y={0} width={330} height={16} fill="#FFFFFF" />
    <text x={-85} y={-18} textAnchor="middle" fontFamily="Therac Heavy" fontWeight={900} fontSize={34} fill="#FFFFFF" letterSpacing={3}>CARRITO RAYO</text>
    {/* cab */}
    <path d="M 80 -60 L 200 -60 Q 250 -60 262 -10 L 270 90 L 80 90 Z" fill="#E11D2E" stroke="#7F1D1D" strokeWidth={6} strokeLinejoin="round" />
    <path d="M 112 -44 L 196 -44 Q 226 -44 236 -8 L 238 28 L 112 28 Z" fill="#BFE9FF" stroke="#7F1D1D" strokeWidth={5} strokeLinejoin="round" />
    <rect x={262} y={44} width={18} height={30} rx={6} fill="#FDE68A" />
    {/* siren */}
    <rect x={130} y={-86} width={70} height={26} rx={12} fill={siren > 0.5 ? '#FDE047' : '#F59E0B'} stroke="#7F1D1D" strokeWidth={4} />
    {siren > 0.5 ? <circle cx={165} cy={-74} r={70} fill="#FDE047" opacity={0.25} /> : null}
    {/* wheels */}
    {[-150, 150].map((v) => (
      <g key={v}>
        <circle cx={v} cy={96} r={44} fill="#1F2937" stroke="#0B1220" strokeWidth={5} />
        <circle cx={v} cy={96} r={20} fill="#D1D5DB" />
      </g>
    ))}
  </g>
);

export const WallPhone: React.FC<{ x: number; y: number; ring?: number }> = ({ x, y, ring = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ring * 6 * Math.sin(ring * 40)})`}>
    <rect x={-36} y={-70} width={72} height={140} rx={16} fill="#EF4444" stroke="#7F1D1D" strokeWidth={5} />
    <rect x={-24} y={-52} width={48} height={34} rx={6} fill="#BFE9FF" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={-16 + c * 16} cy={-2 + r * 18} r={5} fill="#FDE68A" />))}
    <path d="M -50 -52 Q -66 -88 -20 -92 L 20 -92 Q 66 -88 50 -52" stroke="#1F2937" strokeWidth={14} fill="none" strokeLinecap="round" />
  </g>
);

export const Station: React.FC<{ t: number; truckX?: number; siren?: number; phoneRing?: number; showTruck?: boolean }> = ({ t, truckX = 1480, siren = 0, phoneRing = 0, showTruck = true }) => (
  <g>
    <defs>
      <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BFE3FF" />
        <stop offset="100%" stopColor="#E8F4FF" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#st-wall)" />
    {/* garage door and windows */}
    <rect x={1060} y={120} width={760} height={560} rx={14} fill="#F1F5F9" stroke="#94A3B8" strokeWidth={8} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1080} y={140 + i * 108} width={720} height={92} rx={8} fill="#E2E8F0" stroke="#CBD5E1" strokeWidth={4} />)}
    <rect x={120} y={150} width={330} height={250} rx={16} fill="#BAE6FD" stroke="#94A3B8" strokeWidth={8} />
    <line x1={285} y1={150} x2={285} y2={400} stroke="#94A3B8" strokeWidth={8} />
    <line x1={120} y1={275} x2={450} y2={275} stroke="#94A3B8" strokeWidth={8} />
    <circle cx={200} cy={210} r={28} fill="#FDE68A" opacity={0.9} />
    {/* sign */}
    <rect x={560} y={96} width={420} height={86} rx={20} fill="#E11D2E" stroke="#7F1D1D" strokeWidth={6} />
    <text x={770} y={154} textAnchor="middle" fontFamily="Therac Heavy" fontWeight={900} fontSize={46} fill="#FFFFFF" letterSpacing={4}>BOMBEROS</text>
    {/* floor */}
    <rect y={700} width={1920} height={380} fill="#C9B8A0" />
    <rect y={700} width={1920} height={14} fill="#A8957A" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 180 - 40} y={760} width={90} height={8} rx={4} fill="#B8A68C" />)}
    <WallPhone x={560} y={420} ring={phoneRing} />
    {showTruck ? <Truck x={truckX} y={760} s={1.25} siren={siren} /> : null}
  </g>
);
