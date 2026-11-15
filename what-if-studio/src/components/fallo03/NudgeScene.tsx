import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, ShotProps, springAt } from '../motion';
import { clamp, Mars, num, OutText, P3, Probe, Stars } from './parts';

// NudgeScene: "Cada ajuste empuja la nave cuatro veces más fuerte de lo que crees."
// The route the team believes (green, dashed) and the real one (red). The probe flies towards Mars and on every adjustment
// (each one lands on a word: ajuste, empuja, cuatro, fuerte) a thruster fires and the probe drops a step below the green
// line, with an overshoot, while a "× 4,45" pops off it. The red trail it leaves drifts further and further from the plan.

const X0 = 170;
const X1 = 740;
const planY = (x: number) => 760 + 0.12 * (x - X0);
const STEP = 88;
const MARS = { x: 920, y: 1290, r: 250 };

export const NudgeScene: React.FC<ShotProps> = ({ t: tShot, f: fShot, fps, dur: durShot, mark, variant }) => {
  // two shots on one line ('wide', then 'close' from "cuatro veces"): both run on the clock of the sentence, so the probe and
  // its trail carry straight on across the cut
  const close = variant === 'close';
  const base = num(mark('d2'), 0.1) - 0.1;
  const t = tShot - base;
  const f = Math.round(t * fps);
  const dur = num(mark('d2end'), durShot + base) - base + 0.2;
  const at = (name: string, fb: number) => num(mark(name), fb + base) - base;
  const kicks = [at('ajuste', 0.4), at('empuja', 0.9), at('cuatro2', 1.7), at('fuerte', 2.4)];
  const kick = (at: number, tt: number) => (tt >= at - 0.06 ? springAt(Math.round(tt * fps), fps, at - 0.06, { stiffness: 300, damping: 11, mass: 0.6 }) : 0);
  const xAt = (tt: number) => X0 + (X1 - X0) * clamp(tt / Math.max(1, dur));
  const dropAt = (tt: number) => kicks.reduce((s, k) => s + STEP * kick(k, tt), 0);
  const px = xAt(t);
  const py = planY(px) + dropAt(t);
  const inK = close ? 1 : springAt(fShot, fps, 0, HARD);
  // the close shot: the camera right on the probe, following it down
  const zoomK = close ? springAt(fShot, fps, 0, { stiffness: 260, damping: 18, mass: 0.6 }) : 0;
  const Z = 1 + 0.5 * Math.min(1.05, zoomK);
  const world = close ? `translate(${540 + (px - 540) * (1 - zoomK)} ${760 + (py - 760) * (1 - zoomK)}) scale(${Z}) translate(${-px} ${-py})` : '';
  // the red trail: where the probe has been
  const trail: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const tt = (t * i) / 40;
    const x = xAt(tt);
    trail.push(`${x.toFixed(1)} ${(planY(x) + dropAt(tt)).toFixed(1)}`);
  }
  const fired = kicks.map((k) => (t >= k - 0.06 && t < k + 0.35 ? 1 - (t - k + 0.06) / 0.41 : 0));
  const behind = dropAt(t) / STEP; // 0..4 steps below the plan
  return (
    <AbsoluteFill style={{ background: P3.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg2} />
        <Stars t={t} n={70} />
        {close ? null : <OutText x={540} y={600} size={34} fill={P3.blue} text="CORRECCIONES DE RUMBO" mono opacity={clamp(inK * 1.5)} />}
        <g transform={world}>
        <Mars cx={MARS.x} cy={MARS.y} r={MARS.r} />
        {/* the plan */}
        <path d={`M ${X0} ${planY(X0)} L ${X1 + 60} ${planY(X1 + 60)}`} stroke={P3.green} strokeWidth={6} strokeDasharray="10 16" strokeDashoffset={-t * 90} fill="none" strokeLinecap="round" opacity={0.9} />
        <OutText x={X1 + 60} y={planY(X1 + 60) - 34} fill={P3.green} text="LO QUE CREES" anchor="end" mono size={34} />
        {/* the real route */}
        <polyline points={trail.join(' ')} stroke={P3.red} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {behind > 0.3 ? <OutText x={px} y={py + 130} size={34} fill={P3.red} text="LO QUE PASA" mono opacity={clamp(behind - 0.3)} /> : null}
        {/* the probe, with a thruster burst on every adjustment */}
        <g transform={`translate(0 ${4 * Math.sin(t * 6)})`}>
          {fired.map((k, i) =>
            k > 0 ? (
              <g key={i}>
                <path d={`M ${px - 22} ${py - 40} L ${px} ${py - 40 - 120 * k} L ${px + 22} ${py - 40} Z`} fill="#FDBA74" opacity={0.95 * k} />
                <circle cx={px} cy={py} r={70 + 90 * (1 - k)} fill="none" stroke="#FDBA74" strokeWidth={5} opacity={k} />
              </g>
            ) : null,
          )}
          <Probe x={px} y={py} s={0.68} rot={12 + 8 * behind + 5 * Math.sin(t * 4)} heat={0.12 * behind} />
        </g>
        {/* × 4,45 pops off the probe on every kick */}
        {kicks.map((k, i) => {
          if (t < k - 0.06 || t > k + 0.9) return null;
          const a = (t - k + 0.06) / 0.96;
          const pk = springAt(f, fps, k - 0.06, HARD);
          return (
            <g key={i} transform={`translate(${px + 120} ${py - 90 - 120 * a}) scale(${0.6 + 0.4 * Math.min(1.1, pk)})`} opacity={1 - a}>
              <OutText x={0} y={0} size={76} fill={P3.yellow} text="× 4,45" stroke={11} />
            </g>
          );
        })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
