import React from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';

// A speedometer for the dose: the needle tears through the red zone to 100x, then the gauge bursts and
// "100x MORTAL" slams in.

const CX = 540;
const CY = 1000;
const R = 420;
const A0 = -210; // degrees, 0x
const A1 = 30; // degrees, 100x

const polar = (a: number, r: number) => [CX + Math.cos((a * Math.PI) / 180) * r, CY + Math.sin((a * Math.PI) / 180) * r];

const arc = (a0: number, a1: number, r: number) => {
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const Dial: React.FC<{ value: number; t: number; f: number; cracked: number }> = ({ value, t, f, cracked }) => {
  const a = A0 + (A1 - A0) * Math.min(1.08, value / 100) + (value > 80 ? Math.sin(t * 70) * 2 : 0);
  const [nx, ny] = polar(a, R - 40);
  return (
    <g>
      <circle cx={CX} cy={CY} r={R + 40} fill="#0B0B12" stroke="#2E2E3A" strokeWidth={14} />
      <path d={arc(A0, -130, R)} stroke={COLOR.green} strokeWidth={46} fill="none" />
      <path d={arc(-130, -50, R)} stroke={COLOR.yellow} strokeWidth={46} fill="none" />
      <path d={arc(-50, A1, R)} stroke={COLOR.red} strokeWidth={46} fill="none" opacity={0.78 + 0.12 * Math.sin(t * 4)} />
      {[0, 25, 50, 75, 100].map((v) => {
        const ta = A0 + ((A1 - A0) * v) / 100;
        const [x0, y0] = polar(ta, R - 40);
        const [x1, y1] = polar(ta, R - 90);
        const [lx, ly] = polar(ta, R - 150);
        return (
          <g key={v}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#FFF" strokeWidth={8} />
            <text x={lx} y={ly + 16} textAnchor="middle" fontFamily={MONO} fontSize={40} fill="#FFF">
              {v === 0 ? '1x' : `${v}x`}
            </text>
          </g>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={COLOR.red} strokeWidth={18} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={44} fill="#DDD" stroke="#000" strokeWidth={8} />
      <text x={CX} y={CY + 230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={value >= 99 ? COLOR.red : COLOR.yellow}>
        {`${Math.min(100, Math.max(1, Math.round(value)))}x`}
      </text>
      <text x={CX} y={CY + 290} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#AAA">
        × LA DOSIS NORMAL
      </text>
      {cracked > 0
        ? Array.from({ length: 9 }, (_, i) => {
            const ang = (i / 9) * 360 + rand(i) * 30;
            let d = `M ${CX} ${CY - 60}`;
            for (let s = 1; s <= 4; s++) {
              const [x, y] = polar(ang + (rand(i * 4 + s) - 0.5) * 24, ((R + 40) * s * cracked) / 4);
              d += ` L ${x} ${y - 60 * (1 - s / 4)}`;
            }
            return <path key={i} d={d} stroke="#FFF" strokeWidth={5} fill="none" opacity={0.9} />;
          })
        : null}
      <text x={CX} y={CY - 470} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={COLOR.red} opacity={0.6 + 0.4 * Math.sin(f / 4)}>
        RADIACIÓN RECIBIDA
      </text>
    </g>
  );
};

export const DangerGauge: React.FC<ShotProps> = ({ t, f, fps, variant = 'climb', mark }) => {
  if (variant === 'burst') {
    const burstAt = mark('burst');
    const b = t - burstAt;
    const cracked = lin(t, burstAt - 0.35, burstAt - 0.05);
    const k = springAt(f, fps, burstAt + 0.05, HARD);
    const k2 = springAt(f, fps, burstAt + 0.22, HARD);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <rect width={1080} height={1920} fill={b >= 0 ? '#250005' : '#08080E'} />
          {b < 0 ? <Dial value={100 + 6 * Math.sin(t * 50)} t={t} f={f} cracked={cracked} /> : null}
          {b >= 0
            ? Array.from({ length: 26 }, (_, i) => {
                const a = rand(i) * Math.PI * 2;
                const v = 900 + rand(i * 3) * 1600;
                const x = CX + Math.cos(a) * v * b;
                const y = CY + Math.sin(a) * v * b + 1400 * b * b;
                const s = 30 + rand(i * 5) * 70;
                return (
                  <polygon
                    key={i}
                    points={`0,${-s} ${s * 0.8},${s * 0.6} ${-s * 0.7},${s * 0.4}`}
                    fill={i % 3 === 0 ? COLOR.red : i % 3 === 1 ? '#DDE' : '#555'}
                    transform={`translate(${x} ${y}) rotate(${b * 720 * (rand(i * 7) - 0.5)})`}
                  />
                );
              })
            : null}
          {b >= 0 ? <circle cx={CX} cy={CY} r={200 + b * 1800} fill={COLOR.red} opacity={Math.max(0, 0.6 - b)} /> : null}
          {k > 0.01 ? (
            <g transform={`translate(540 860) scale(${2.8 - 1.8 * k}) rotate(${(1 - k) * -10})`}>
              <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={330} fill={COLOR.yellow} stroke="#000" strokeWidth={14} paintOrder="stroke">
                100x
              </text>
            </g>
          ) : null}
          {k2 > 0.01 ? (
            <g transform={`translate(540 1090) scale(${2.8 - 1.8 * k2})`}>
              <rect x={-420} y={-150} width={840} height={200} rx={20} fill={COLOR.red} stroke="#FFF" strokeWidth={8} />
              <text y={10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={170} fill="#FFF" textLength={760} lengthAdjust="spacingAndGlyphs">
                MORTAL
              </text>
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    );
  }

  // climb: to the red zone fast, overshoot pinned at 100x on "cien"
  const cienAt = mark('cien');
  const pre = ease(t, 0, Math.max(0.1, cienAt), 1, 70);
  const slam = cienAt > -10 ? spring({ frame: f - Math.round(cienAt * fps), fps, config: HARD }) : 0;
  const value = t < cienAt ? pre : 70 + 30 * slam;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill="#08080E" />
        <circle cx={CX} cy={CY} r={700} fill={COLOR.red} opacity={0.05 + 0.12 * (value / 100)} />
        <Dial value={value} t={t} f={f} cracked={0} />
      </svg>
    </AbsoluteFill>
  );
};
