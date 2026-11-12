import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, ControlRoom, ConsoleDesk, CTRL, CTRL_DESK, stand, reachAngle, faceAt, toWorld, HEAD, Glow } from '../engine';
import { CineCamera, edgeFg, ef } from './CineCamera';
import { CharacterRig } from './CharacterRig';
import { KineticTitle } from './KineticTitle';
import { Rim } from '../design/devArtificial';
import { COLOR, HARD, HEAVY, rand, ShotProps, springAt } from './motion';

// The control room, with one person in it: the operator (Mo, in his olive jacket), always at the console, the lead
// glass onto the bunker behind him. Variants:
//   click    medium: one finger, one key
//   type     he types at speed, sparks off the keyboard
//   watch    he leans toward the screen as the first shot lands: the BEAM ON light, a red glow behind the glass
//   puzzled  he scratches his head over a code he cannot read, question marks rising
//   press    the finger hovers over ENTER again, worried
//   worried  alone with the screen, the red lamp glowing behind the glass

const OP = LOOKS.mo;
const OP_AT = stand(CTRL, 0.56, 0.5);
const KEYS = (() => {
  const top = CTRL.P(0.5, CTRL_DESK.v, CTRL_DESK.w0);
  return { x: top.x + 150, y: top.y - 18 };
})();

// the terminal's screen, from behind: the light it spills is what lights the operator's face
const SCREEN = (() => {
  const top = CTRL.P(0.5, CTRL_DESK.v, CTRL_DESK.w0);
  return { x: top.x - 40, y: top.y - 150 };
})();

/** The control-room camera: the palette grade, the monitor's light on the operator and blurred foreground edges. */
const Cam: React.FC<{ cx: number; cy: number; zoom: number; rot?: number; tint: 'green' | 'red' | 'amber'; screen?: string; children: React.ReactNode }> = ({ cx, cy, zoom, rot, tint, screen = COLOR.green, children }) => (
  <CineCamera cx={cx} cy={cy} zoom={zoom} rot={rot} tint={tint} vignette={0.7} light={{ x: SCREEN.x - 20, y: SCREEN.y + 40, r: 300, color: screen, o: 0.5 }} fg={edgeFg(cx, cy, zoom)}>
    {children}
  </CineCamera>
);

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

  if (variant === 'watch') {
    const k = Math.min(1, t / Math.max(0.3, dur - 0.2));
    const eased = k * k * (3 - 2 * k);
    const pose = opBase({
      armR: { a: 28, b: -4 },
      armL: { a: 20, b: 30 },
      handR: 'open',
      look: 0.9,
      tilt: 6 * eased,
      headTilt: 4 * eased,
      yaw: 0.25,
      ...faceAt(e, [[0, 'neutral'], [Math.round(Math.max(0.2, dur * 0.35) * 30), 'worried']]),
    });
    return (
      <AbsoluteFill>
        <Cam tint="red" cx={OP_AT.x + 90} cy={560} zoom={2.35 + 0.3 * p}>
          <ControlRoom t={e} id="cwa" alarm beam />
          <CharacterRig look={OP} pose={pose} t={t} rim="red" gaze={0.9} sweat={0.8} seed={3} />
          <ConsoleDesk t={e} />
          <Glow x={960} y={360} r={460} kind="red" o={0.26 + 0.06 * Math.sin(t * 2)} />
        </Cam>
      </AbsoluteFill>
    );
  }

  if (variant === 'puzzled') {
    const up = Math.min(1, t / 0.25);
    const pose = opBase({
      armR: { a: 20 + 140 * up, b: 95 * up },
      armL: { a: 20, b: -6 },
      handR: 'open',
      look: 0.5,
      headTilt: 9 * up + 2 * Math.sin(t * 6),
      yaw: 0.1,
      expr: 'oops',
    });
    const head = toWorld(pose, { x: HEAD.x, y: HEAD.y });
    return (
      <AbsoluteFill>
        <Cam tint="amber" cx={OP_AT.x + 30} cy={500} zoom={2.7 + 0.25 * p}>
          <ControlRoom t={e} id="cpz" />
          <CharacterRig look={OP} pose={pose} t={t} rim="amber" sweat={0.7} seed={4} />
          <ConsoleDesk t={e} />
          {[0, 1, 2].map((i) => {
            const age = (t * 0.9 + i / 3) % 1;
            return (
              <text key={i} x={head.x + 40 + i * 34 - age * 10} y={head.y - 70 - age * 130} fontFamily={HEAVY} fontWeight={900} fontSize={54 + i * 10} fill={COLOR.yellow} stroke="#000" strokeWidth={6} paintOrder="stroke" opacity={Math.min(1, age * 4) * (1 - age)}>
                ?
              </text>
            );
          })}
        </Cam>
      </AbsoluteFill>
    );
  }

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
        <Cam tint="green" cx={OP_AT.x + 40} cy={600} zoom={3.0 + 0.3 * p} rot={-1.5 + 3 * p}>
          <ControlRoom t={e} id="ct" />
          <CharacterRig look={OP} pose={pose} t={t} rim="green" gaze={0.6} sweat={0.4} seed={5} />
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
        </Cam>
      </AbsoluteFill>
    );
  }

  if (variant === 'press') {
    // He leans in and the finger drifts over ENTER, then holds: the next shot is the press itself.
    const k = Math.min(1, t / Math.max(0.2, dur - 0.2));
    const eased = k * k * (3 - 2 * k);
    const h1 = mark('h1'); // where the voice comes back
    const titleOn = t < h1 + 0.1 ? 1 : Math.max(0, 1 - (t - h1 - 0.1) / 0.25);
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
        <Cam tint="amber" cx={OP_AT.x + 60} cy={580} zoom={2.5 + 0.35 * p}>
          <ControlRoom t={e} id="cpr" beam={false} />
          <CharacterRig look={OP} pose={pose} t={t} rim="amber" gaze={0.8} sweat={1.0} seed={6} />
          <ConsoleDesk t={e} />
          <circle cx={KEYS.x} cy={KEYS.y} r={26 + 6 * Math.sin(t * 3)} fill="none" stroke={COLOR.yellow} strokeWidth={4} opacity={0.35 + 0.4 * eased} />
        </Cam>
        {/* the silent second: one idea on screen, nothing else, until the voice comes back */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <rect width={1080} height={1920} fill="#000" opacity={0.5 * titleOn} />
          <g opacity={titleOn}>
            <KineticTitle text="SEGUNDO" y={760} size={170} k={springAt(f, fps, 0.05, HARD)} tilt={-6} />
            <KineticTitle text="ENTER" y={960} size={240} k={springAt(f, fps, 0.3, HARD)} tilt={5} />
          </g>
        </svg>
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
        <Cam tint="red" cx={OP_AT.x + 120} cy={540} zoom={2.5 - 0.5 * p}>
          <ControlRoom t={e} id="cw" alarm beam />
          <CharacterRig look={OP} pose={pose} t={t} rim="red" sweat={0.9} seed={7} />
          <ConsoleDesk t={e} />
          <Glow x={960} y={360} r={460} kind="red" o={0.22 + 0.08 * Math.sin(t * 2)} />
        </Cam>
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
      <Cam tint="green" cx={OP_AT.x + 50} cy={560} zoom={2.7 + 0.3 * p}>
        <ControlRoom t={e} id="cc" />
        <CharacterRig look={OP} pose={pose} t={t} rim="green" gaze={0.8} sweat={0.2} seed={8} />
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
      </Cam>
    </AbsoluteFill>
  );
};
