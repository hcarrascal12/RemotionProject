import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, ShotProps, springAt } from '../motion';
import { clamp, num, OutText, P3, sm, Stars } from './parts';

// UnitsMismatchScene: the idea of the film in one picture, in the style of "20 ≠ 21" from Fallo #02.
//   split   two facing blocks, 1 LIBRA-FUERZA (the ground software, yellow) and 1 NEWTON (NASA navigation, blue), and the red ≠
//   boost   what the team believes against what the thrusters really do: the same number is 4.45 times stronger

const Block: React.FC<{ x: number; y: number; w: number; h: number; k: number; color: string; head: string; big: string; unit: string; sub: string }> = ({ x, y, w, h, k, color, head, big, unit, sub }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${0.7 + 0.3 * Math.min(1.08, k)}) translate(${-(x + w / 2)} ${-(y + h / 2)})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={x} y={y} width={w} height={h} rx={30} fill="#0B1220" stroke={color} strokeWidth={8} />
      <OutText x={x + w / 2} y={y + 64} size={26} fill={color} text={head} mono />
      <OutText x={x + w / 2} y={y + 300} size={250} fill={P3.white} text={big} stroke={14} />
      <OutText x={x + w / 2} y={y + 390} size={42} fill={color} text={unit} stroke={7} />
      <OutText x={x + w / 2} y={y + 446} size={26} fill={P3.steel} text={sub} mono />
    </g>
  );
};

export const UnitsMismatchScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  const boost = variant === 'boost';
  const libras = num(mark('libras'), 0.6);
  const newtons = num(mark('newtons'), 2.6);
  const cuatro = num(mark('cuatro'), 1.6);
  const otro = num(mark('otro'), Math.max(0.8, newtons - 1.0));
  // the yellow card is on from the first frame of the shot ("Un software calcula..."), the blue one on "Otro lo lee..."
  const kL = boost ? 1 : springAt(f, fps, 0.0, HARD);
  const kR = boost ? 1 : springAt(f, fps, otro - 0.05, HARD);
  const kNe = boost ? 1 : springAt(f, fps, otro + 0.25, { stiffness: 220, damping: 9, mass: 0.7 });
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
  // the thruster under the ground card: it fires as the software computes the thrust, harder on "libras"
  const burn = boost ? 0 : 0.55 + 0.45 * Math.min(1, Math.max(0, (t - libras + 0.3) / 0.3)) + 0.15 * Math.sin(t * 31);
  // boost: bars
  const bar = sm((t - cuatro + 0.15) / 0.9);
  const BASE = 190;
  const badge = springAt(f, fps, cuatro, HARD);
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg2} />
        <Stars t={t} n={60} />
        {!boost ? (
          <g>
            {/* the cards float a little, out of step with each other */}
            <g transform={`translate(0 ${6 * Math.sin(t * 2.1)})`}>
              <Block x={40} y={480} w={450} h={500} k={kL} color={P3.yellow} head="SOFTWARE DE TIERRA" big="1" unit="LIBRA-FUERZA" sub="1 lbf" />
            </g>
            {/* the thruster: a nozzle under the yellow card, firing */}
            <g transform={`translate(265 1050) scale(${0.7 + 0.3 * Math.min(1, kL)})`} opacity={Math.min(1, kL * 1.5)}>
              <rect x={-70} y={-40} width={140} height={60} rx={10} fill="#334155" stroke="#0F172A" strokeWidth={5} />
              <path d="M -46 20 L 46 20 L 70 100 L -70 100 Z" fill="#475569" stroke="#0F172A" strokeWidth={5} />
              <path d={`M -60 100 Q 0 ${100 + 150 * burn} 60 100 Z`} fill="#FB923C" opacity={0.9} />
              <path d={`M -34 100 Q 0 ${100 + 95 * burn} 34 100 Z`} fill="#FDE68A" />
              <OutText x={0} y={-60} size={24} fill={P3.yellow} text="EMPUJE" mono />
            </g>
            <g transform={`translate(0 ${6 * Math.sin(t * 2.1 + 2.2)})`}>
              <Block x={590} y={480} w={450} h={500} k={kR} color={P3.blue} head="NAVEGACIÓN NASA" big="1" unit="NEWTON" sub="1 N" />
            </g>
            {/* the data: once the second program reads it, packets of "lbf" travel from the ground to the navigation and arrive as "N" */}
            {kR > 0.01 ? (
              <g opacity={Math.min(1, kR)}>
                <line x1={380} y1={1230} x2={1010} y2={1230} stroke={P3.steel} strokeWidth={4} strokeDasharray="4 14" strokeDashoffset={-t * 120} opacity={0.5} />
                {Array.from({ length: 4 }, (_, i) => {
                  const u = (Math.max(0, t - otro) * 0.55 + i * 0.25) % 1;
                  const x = 400 + 590 * u;
                  const asN = u > 0.5;
                  const c = asN ? P3.blue : P3.yellow;
                  const pop = asN ? Math.max(0, 1 - (u - 0.5) / 0.08) : 0;
                  return (
                    <g key={i} transform={`translate(${x} 1230) scale(${1 + 0.35 * pop})`} opacity={Math.min(1, u / 0.06, (1 - u) / 0.08)}>
                      <rect x={-50} y={-30} width={100} height={60} rx={14} fill="#0B1220" stroke={c} strokeWidth={5} />
                      <OutText x={0} y={12} size={30} fill={c} text={asN ? 'N' : 'lbf'} stroke={4} mono />
                    </g>
                  );
                })}
                <OutText x={700} y={1180} size={24} fill={P3.red} text="SIN CONVERTIR" mono opacity={0.6 + 0.4 * glow} />
              </g>
            ) : null}
            {kNe > 0.01 ? (
              <g transform={`translate(540 770) scale(${(2.6 - 1.6 * Math.min(1.1, kNe)) * (1 + 0.08 * glow)}) rotate(${-8 * (1 - Math.min(1, kNe))})`} opacity={Math.min(1, kNe * 2)}>
                <circle r={150} fill={P3.red} opacity={0.18 + 0.12 * glow} />
                <OutText x={0} y={76} size={220} fill={P3.red} text="≠" stroke={16} />
              </g>
            ) : null}
          </g>
        ) : (
          <g transform="translate(540 800) scale(0.93) translate(-540 -800)">
            {/* the two units, small, with the ≠ between them */}
            <g transform="translate(0 -10)">
              <rect x={44} y={440} width={400} height={170} rx={26} fill="#0B1220" stroke={P3.yellow} strokeWidth={6} />
              <OutText x={244} y={540} size={62} fill={P3.white} text="1 LIBRA" stroke={8} />
              <OutText x={244} y={588} size={24} fill={P3.yellow} text="TIERRA" mono />
              <rect x={636} y={440} width={400} height={170} rx={26} fill="#0B1220" stroke={P3.blue} strokeWidth={6} />
              <OutText x={836} y={540} size={62} fill={P3.white} text="1 NEWTON" stroke={8} />
              <OutText x={836} y={588} size={24} fill={P3.blue} text="NASA" mono />
              <OutText x={540} y={560} size={130} fill={P3.red} text="≠" stroke={12} />
            </g>
            {/* the multiplier */}
            <g transform={`translate(540 800) scale(${(0.6 + 0.4 * Math.min(1.1, badge)) * (1 + 0.05 * glow)}) rotate(${3 * Math.sin(t * 5)})`} opacity={Math.min(1, badge * 2)}>
              <circle cx={0} cy={-60} r={190} fill={P3.yellow} opacity={0.08 + 0.08 * glow} />
              <OutText x={0} y={0} size={190} fill={P3.yellow} text="× 4,45" stroke={16} />
            </g>
            {/* the bars */}
            <OutText x={60} y={960} size={28} fill={P3.blue} text="LO QUE CREE EL EQUIPO" anchor="start" mono />
            <rect x={60} y={985} width={960} height={44} rx={10} fill="#0B1220" />
            <rect x={60} y={985} width={BASE} height={44} rx={10} fill={P3.blue} />
            <OutText x={60} y={1096} size={28} fill={P3.red} text="LO QUE EMPUJA DE VERDAD" anchor="start" mono />
            <rect x={60} y={1120} width={960} height={44} rx={10} fill="#0B1220" />
            <rect x={60} y={1120} width={BASE + (960 - BASE) * clamp(bar)} height={44} rx={10} fill={P3.red} />
            {/* chevrons racing along the red bar, and a hot tip that flickers */}
            <clipPath id="um-bar">
              <rect x={60} y={1120} width={BASE + (960 - BASE) * clamp(bar)} height={44} rx={10} />
            </clipPath>
            <g clipPath="url(#um-bar)">
              {Array.from({ length: 14 }, (_, i) => {
                const x = 40 + ((i * 80 + t * 420) % 1120);
                return <path key={i} d={`M ${x} 1126 L ${x + 22} 1142 L ${x} 1158`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round" />;
              })}
            </g>
            <circle cx={60 + BASE + (960 - BASE) * clamp(bar)} cy={1142} r={30 + 8 * glow} fill="#FDBA74" opacity={0.35 + 0.3 * glow} />
            {/* the blue bar breathes, it never sits still */}
            <rect x={60} y={985} width={BASE} height={44} rx={10} fill="#FFFFFF" opacity={0.12 * glow} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
