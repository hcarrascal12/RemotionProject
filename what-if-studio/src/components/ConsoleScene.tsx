import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, LOOKS, basePose, Pose, ControlRoom, ConsoleDesk, CTRL, CTRL_DESK, stand, reachAngle, faceAt, Glow } from '../engine';
import { World, ef } from './World';
import { COLOR, HEAVY, rand, ShotProps } from './motion';

// The control room, with one person in it: the operator (Mo, in his olive jacket), always at the console, the lead
// glass onto the bunker behind him. Variants:
//   click    medium: one finger, one key
//   type     he types at speed, sparks off the keyboard
//   press    the finger hovers over ENTER again, worried
//   worried  alone with the screen, the red lamp glowing behind the glass

const OP = LOOKS.mo;
const OP_AT = stand(CTRL, 0.56, 0.5);
const KEYS = (() => {
  const top = CTRL.P(0.5, CTRL_DESK.v, CTRL_DESK.w0);
  return { x: top.x + 150, y: top.y - 18 };
})();

const opBase = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: OP_AT.x, y: OP_AT.y, scale: OP_AT.scale, yaw: 0.2, look: 0.3, ...o });

const Sparks: React.FC<{ t: number; x: number; y: number; seed: number }> = ({ t, x, y, seed }) => {
  const age = t % 0.3;
  const n = Math.floor(t / 0.3);
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = -Math.PI / 2 + (rand(seed + n * 13 + i) - 0.5) * 2.6;
        const v = 160 + rand(seed + n * 7 + i) * 220;
        const px = x + Math.cos(a) * v * age;
        const py = y + Math.sin(a) * v * age + 500 * age * age;
        return <line key={i} x1={px} y1={py} x2={px - Math.cos(a) * 10} y2={py - Math.sin(a) * 10} stroke={i % 2 ? COLOR.cyan : '#FFF'} strokeWidth={3} strokeLinecap="round" opacity={1 - age / 0.3} />;
      })}
    </g>
  );
};

export const ConsoleScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant = 'click', mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);
  const reach = reachAngle(opBase(), KEYS);

  if (variant === 'type') {
    const fast = Math.sin(t * 34);
    const pose = opBase({
      armR: { a: reach - 4 + 7 * fast, b: 18 + 10 * fast },
      armL: { a: 40 + 7 * Math.sin(t * 34 + 1.6), b: 60 + 10 * fast },
      handR: 'point',
      handL: 'point',
      look: 0.6,
      headTilt: 4 + 2 * Math.sin(t * 6),
      tilt: 6,
      expr: 'cool',
    });
    return (
      <AbsoluteFill>
        <World cx={OP_AT.x + 40} cy={600} zoom={3.0 + 0.3 * p} rot={-1.5 + 3 * p}>
          <ControlRoom t={e} id="ct" />
          <Hero look={OP} pose={pose} rimId="rimBlue" shadow={0} />
          <ConsoleDesk t={e * 4} keyHit={1} />
          <Sparks t={t} x={KEYS.x - 30} y={KEYS.y} seed={3} />
          <Sparks t={t + 0.15} x={KEYS.x + 30} y={KEYS.y} seed={11} />
          {Array.from({ length: 7 }, (_, i) => {
            const age = (t + i * 0.23) % 0.9;
            const x = KEYS.x - 60 + rand(i * 5) * 120 + age * (rand(i) - 0.5) * 120;
            const y = KEYS.y - 20 - age * 260;
            return (
              <text key={i} x={x} y={y} fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={i % 2 ? COLOR.cyan : COLOR.yellow} opacity={1 - age / 0.9}>
                {['X', 'E', '↑', 'X', 'E', '↵', 'X'][i]}
              </text>
            );
          })}
        </World>
      </AbsoluteFill>
    );
  }

  if (variant === 'press') {
    // He leans in and the finger drifts over ENTER, then holds: the next shot is the press itself.
    const k = Math.min(1, t / Math.max(0.2, dur - 0.2));
    const eased = k * k * (3 - 2 * k);
    const pose = opBase({
      armR: { a: 22 + (reach - 22) * eased, b: -8 + 8 * eased },
      handR: 'point',
      look: 0.8,
      headTilt: 6 * eased,
      tilt: 5 * eased,
      expr: 'worried',
    });
    return (
      <AbsoluteFill>
        <World cx={OP_AT.x + 60} cy={580} zoom={2.5 + 0.35 * p}>
          <ControlRoom t={e} id="cpr" beam={false} />
          <Hero look={OP} pose={pose} rimId="rimR" shadow={0} />
          <ConsoleDesk t={e} />
          <circle cx={KEYS.x} cy={KEYS.y} r={26 + 6 * Math.sin(t * 3)} fill="none" stroke={COLOR.yellow} strokeWidth={4} opacity={0.35 + 0.4 * eased} />
        </World>
      </AbsoluteFill>
    );
  }

  if (variant === 'worried') {
    // Alone with the screen. The red lamp behind the glass glows steadily; he looks from the screen to the window.
    const look = 0.9 - 1.6 * Math.max(0, Math.min(1, (t - 0.7) / 0.6));
    const pose = opBase({
      armR: { a: 40, b: 40 },
      armL: { a: 30, b: 50 },
      look,
      yaw: 0.2 - 0.25 * Math.max(0, Math.min(1, (t - 0.7) / 0.6)),
      headTilt: -4,
      expr: 'worried',
    });
    return (
      <AbsoluteFill>
        <World cx={OP_AT.x + 120} cy={540} zoom={2.5 - 0.5 * p}>
          <ControlRoom t={e} id="cw" alarm beam />
          <Hero look={OP} pose={pose} rimId="rimR" shadow={0} />
          <ConsoleDesk t={e} />
          <Glow x={960} y={360} r={460} kind="red" o={0.22 + 0.08 * Math.sin(t * 2)} />
        </World>
      </AbsoluteFill>
    );
  }

  // click
  const at = mark('clic');
  const k = Math.max(0, Math.min(1, (t - (at - 0.35)) / 0.3));
  const hit = t >= at && t < at + 0.15;
  const pose = opBase({
    armR: { a: 20 + (reach - 20) * k, b: hit ? 6 : -10 + 10 * k },
    handR: 'point',
    look: 0.8,
    headTilt: 8,
    tilt: 4 * k,
    ...faceAt(e, [[0, 'neutral'], [Math.round(at * 30), 'smug']]),
  });
  const burst = t - at;
  return (
    <AbsoluteFill>
      <World cx={OP_AT.x + 50} cy={560} zoom={2.7 + 0.3 * p}>
        <ControlRoom t={e} id="cc" />
        <Hero look={OP} pose={pose} rimId="rimR" shadow={0} />
        <ConsoleDesk t={e} keyHit={hit ? 1 : 0} />
        {burst >= 0 && burst < 0.5 ? (
          <g style={{ mixBlendMode: 'screen' }}>
            <circle cx={KEYS.x} cy={KEYS.y} r={20 + burst * 260} fill="none" stroke={COLOR.yellow} strokeWidth={10 * (1 - burst / 0.5)} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const r0 = 30 + burst * 300;
              return <line key={i} x1={KEYS.x + Math.cos(a) * r0} y1={KEYS.y + Math.sin(a) * r0} x2={KEYS.x + Math.cos(a) * (r0 + 40)} y2={KEYS.y + Math.sin(a) * (r0 + 40)} stroke={i % 2 ? COLOR.red : '#FFF'} strokeWidth={5} strokeLinecap="round" opacity={1 - burst / 0.5} />;
            })}
          </g>
        ) : null}
      </World>
    </AbsoluteFill>
  );
};
