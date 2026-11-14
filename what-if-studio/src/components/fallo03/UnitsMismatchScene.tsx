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
  const kL = boost ? 1 : springAt(f, fps, libras - 0.05, HARD);
  const kR = boost ? 1 : springAt(f, fps, newtons - 0.05, HARD);
  const kNe = boost ? 1 : springAt(f, fps, newtons + 0.2, { stiffness: 220, damping: 9, mass: 0.7 });
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
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
            <Block x={40} y={480} w={450} h={500} k={kL} color={P3.yellow} head="SOFTWARE DE TIERRA" big="1" unit="LIBRA-FUERZA" sub="1 lbf" />
            <Block x={590} y={480} w={450} h={500} k={kR} color={P3.blue} head="NAVEGACIÓN NASA" big="1" unit="NEWTON" sub="1 N" />
            {kNe > 0.01 ? (
              <g transform={`translate(540 770) scale(${2.6 - 1.6 * Math.min(1.1, kNe)}) rotate(${-8 * (1 - Math.min(1, kNe))})`} opacity={Math.min(1, kNe * 2)}>
                <circle r={150} fill={P3.red} opacity={0.18 + 0.12 * glow} />
                <OutText x={0} y={76} size={220} fill={P3.red} text="≠" stroke={16} />
              </g>
            ) : null}
          </g>
        ) : (
          <g>
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
            <g transform={`translate(540 800) scale(${0.6 + 0.4 * Math.min(1.1, badge)})`} opacity={Math.min(1, badge * 2)}>
              <OutText x={0} y={0} size={190} fill={P3.yellow} text="× 4,45" stroke={16} />
            </g>
            {/* the bars */}
            <OutText x={60} y={960} size={28} fill={P3.blue} text="LO QUE CREE EL EQUIPO" anchor="start" mono />
            <rect x={60} y={985} width={960} height={44} rx={10} fill="#0B1220" />
            <rect x={60} y={985} width={BASE} height={44} rx={10} fill={P3.blue} />
            <OutText x={60} y={1096} size={28} fill={P3.red} text="LO QUE EMPUJA DE VERDAD" anchor="start" mono />
            <rect x={60} y={1120} width={960} height={44} rx={10} fill="#0B1220" />
            <rect x={60} y={1120} width={BASE + (960 - BASE) * clamp(bar)} height={44} rx={10} fill={P3.red} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
