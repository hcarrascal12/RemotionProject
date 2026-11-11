import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, LOOKS, basePose, Pose, ControlRoom, ConsoleDesk, CTRL, CTRL_DESK, stand, reachAngle, faceAt, walkPose, Mug, toWorld, Glow } from '../engine';
import { World, ef } from './World';
import { blink, COLOR, HARD, HEAVY, rand, ShotProps, springAt } from './motion';

// The control room: the operator (Mo, in his olive jacket) at the console, the doctor in his white coat, the window
// onto the bunker behind them. Variants:
//   click   medium on the operator: one finger, one key
//   type    he types at full speed, sparks off the keyboard
//   wide    the room: operator at the console, the doctor at her shoulder, you through the glass
//   pair    the two of them read the screen; the doctor shrugs: all fine?
//   nobody  coffee and a walk-out while the lamp behind the glass blinks red

const OP = LOOKS.mo;
const DOC = LOOKS.doc;
const OP_AT = stand(CTRL, 0.56, 0.5);
const DOC_AT = stand(CTRL, 0.78, 0.44);
const KEYS = (() => {
  const top = CTRL.P(0.5, CTRL_DESK.v, CTRL_DESK.w0);
  return { x: top.x + 150, y: top.y - 18 };
})();

const opBase = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: OP_AT.x, y: OP_AT.y, scale: OP_AT.scale, yaw: 0.2, look: 0.3, ...o });
const docBase = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: DOC_AT.x, y: DOC_AT.y, scale: DOC_AT.scale, yaw: -0.35, look: -0.5, ...o });

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

export const ConsoleScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant = 'wide', mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);
  const reach = reachAngle(opBase(), KEYS);

  if (variant === 'click') {
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
  }

  if (variant === 'type') {
    const fast = Math.sin(t * 44);
    const pose = opBase({
      armR: { a: reach - 4 + 7 * fast, b: 18 + 10 * fast },
      armL: { a: 40 + 7 * Math.sin(t * 44 + 1.6), b: 60 + 10 * fast },
      handR: 'point',
      handL: 'point',
      look: 0.6,
      headTilt: 4 + 2 * Math.sin(t * 9),
      tilt: 6,
      expr: 'cool',
    });
    return (
      <AbsoluteFill>
        <World cx={OP_AT.x + 40} cy={600} zoom={3.0 + 0.5 * p} rot={-3 + 6 * p}>
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

  if (variant === 'pair') {
    const shrugAt = mark('nada');
    const sk = springAt(f, fps, shrugAt, HARD);
    const doc = docBase({
      armL: { a: 10 + 45 * sk, b: -8 + 85 * sk },
      armR: { a: 10 + 45 * sk, b: -8 + 85 * sk },
      headTilt: -8 * sk,
      look: -0.6,
      ...faceAt(e, [[0, 'neutral'], [Math.round(shrugAt * 30), 'oops']]),
    });
    const op = opBase({ armR: { a: reach, b: 0 }, handR: 'open', look: 0.4, expr: 'neutral', blink: blink(t, 1.3, 0.08) ? 1 : 0 });
    return (
      <AbsoluteFill>
        <World cx={1170} cy={560} zoom={2.15 + 0.2 * p}>
          <ControlRoom t={e} id="cp" />
          <Hero look={DOC} pose={doc} rimId="rimL" shadow={0} />
          <Hero look={OP} pose={op} rimId="rimR" shadow={0} />
          <ConsoleDesk t={e} />
        </World>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {sk > 0.01 ? (
            <g transform={`translate(540 1760) scale(${sk})`}>
              <rect x={-300} y={-90} width={600} height={160} rx={80} fill={COLOR.green} stroke="#000" strokeWidth={10} />
              <text y={25} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={92} fill="#000">
                ¿TODO OK?
              </text>
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'nobody') {
    const hand = opBase({ armR: { a: 150, b: 120 }, look: -0.4, headTilt: -6, expr: 'happy' });
    const sip = toWorld(hand, { x: 30, y: -150 });
    const walk = walkPose(DOC_AT.x - 90 + t * 55, t * 30 * 0.45, DOC_AT.y, DOC_AT.scale, { yaw: 0.8, expr: 'happy' }, 1);
    return (
      <AbsoluteFill>
        <World cx={1130} cy={540} zoom={1.95 + 0.2 * p}>
          <ControlRoom t={e} id="cn" alarm beam />
          <Hero look={OP} pose={hand} rimId="rimR" shadow={0} />
          <Mug x={sip.x} y={sip.y} rot={-20} f={e} />
          <Hero look={DOC} pose={walk} rimId="rimL" shadow={0} />
          <ConsoleDesk t={e} />
          <Glow x={960} y={360} r={420} kind="red" o={blink(t, 0.33) ? 0.35 : 0.1} />
        </World>
      </AbsoluteFill>
    );
  }

  // wide: the room
  const doc = docBase({ look: -0.7, armL: { a: 20, b: -10 }, armR: { a: 70, b: 70 }, expr: 'neutral' });
  const op = opBase({ armR: { a: reach, b: 4 }, handR: 'point', look: 0.5, expr: 'neutral' });
  return (
    <AbsoluteFill>
      <World cx={1165} cy={520} zoom={1.85 + 0.15 * p}>
        <ControlRoom t={e} id="cw" />
        <Hero look={DOC} pose={doc} rimId="rimL" shadow={0} />
        <Hero look={OP} pose={op} rimId="rimR" shadow={0} />
        <ConsoleDesk t={e} />
      </World>
    </AbsoluteFill>
  );
};
