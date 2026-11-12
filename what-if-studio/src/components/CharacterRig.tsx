import React from 'react';
import { Hero, HEAD, Look, Pose, toWorld } from '../engine';
import { RIM_ID, Rim } from '../design/devArtificial';

// CharacterRig: wraps the engine's Hero with the acting layer of El Dev Artificial. The engine keeps the body and the
// keyed poses; this adds what makes a character feel alive in a tense shot:
//   - a natural blink every 2.5 to 4.5 s, eyes that drift while they look at something (gaze: -1 left .. 1 right)
//   - breathing, and a tiny continuous shake in the arms so a held pose is never frozen
//   - sweat beads sliding down the temples when the moment is critical (sweat: 0..1)
//   - a rim light in the colour of the light in the scene (warm, red, green, amber, blue) and a soft cast shadow
// `t` is the shot's clock in seconds; `seed` gives each character its own rhythm.

const teardrop = 'M 0 -9 C 5.5 -2 6.5 3.5 0 6.5 C -6.5 3.5 -5.5 -2 0 -9 Z';

const Sweat: React.FC<{ pose: Pose; t: number; amount: number; seed: number }> = ({ pose, t, amount, seed }) => {
  if (amount <= 0.01) return null;
  const sc = pose.scale;
  const side = 1 - 0.45 * Math.min(1, Math.abs(pose.yaw));
  const sides = [-1, 1].filter((s) => (pose.yaw > 0.5 ? s === -1 : pose.yaw < -0.5 ? s === 1 : true));
  return (
    <g>
      {sides.flatMap((s) =>
        [0, 1, 2].map((i) => {
          const age = (t * (0.55 + 0.25 * amount) + i / 3 + (s > 0 ? 0.37 : 0) + seed * 0.13) % 1;
          const p0 = toWorld(pose, { x: s * 50 * side + pose.yaw * 6, y: HEAD.y - 26 + i * 14 });
          const y = p0.y + age * 62 * sc;
          const o = Math.min(1, age * 7) * Math.min(1, (1 - age) * 3.2) * Math.min(1, amount * 1.4);
          const k = sc * (0.8 + 0.5 * (1 - age * 0.4)) * (1 + 0.15 * amount);
          return (
            <g key={`${s}${i}`} transform={`translate(${p0.x + s * age * 3 * sc} ${y}) scale(${k})`} opacity={o}>
              <path d={teardrop} fill="#BFE7FF" stroke="#FFFFFF" strokeWidth={1.2} />
              <ellipse cx={-1.8} cy={-1.5} rx={1.2} ry={2.2} fill="#FFFFFF" opacity={0.85} />
            </g>
          );
        }),
      )}
    </g>
  );
};

const CastShadow: React.FC<{ pose: Pose; amount: number }> = ({ pose, amount }) => {
  const c = toWorld(pose, { x: 0, y: -90 });
  const sc = pose.scale;
  return (
    <g transform={`translate(${c.x + 16 * sc} ${c.y + 34 * sc}) rotate(${pose.spin + 90})`} opacity={amount}>
      <defs>
        <radialGradient id="devCast" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse rx={150 * sc} ry={70 * sc} fill="url(#devCast)" />
    </g>
  );
};

export const CharacterRig: React.FC<{
  look: Look;
  pose: Pose;
  t: number;
  rim?: Rim;
  /** where the eyes go: -1 (screen left) to 1 (screen right). Defaults to the pose's own look. */
  gaze?: number;
  sweat?: number;
  idle?: boolean;
  seed?: number;
  /** the engine's contact shadow on the floor (off by default: desks and tables hide the feet) */
  floorShadow?: number;
  /** a soft shadow thrown under and behind the body (0..1); use it when the character lies on or leans over a surface */
  castShadow?: number;
}> = ({ look, pose, t, rim = 'warm', gaze, sweat = 0, idle = true, seed = 1, floorShadow = 0, castShadow = 0 }) => {
  let p = pose;
  if (idle) {
    const per = 2.6 + (seed % 7) * 0.28; // a blink every 2.5 to 4.5 s
    const ph = (t + seed * 0.61) % per;
    const shut = ph < 0.11 ? 1 : 0;
    const base = gaze ?? pose.look;
    p = {
      ...pose,
      blink: Math.max(pose.blink, shut),
      look: Math.max(-1, Math.min(1, base + 0.07 * Math.sin(2.1 * t + seed) + 0.05 * Math.sin(5.3 * t + seed * 2))),
      squash: pose.squash + 0.012 * Math.sin(2.4 * t + seed),
      armL: { ...pose.armL, a: pose.armL.a + 1.4 * Math.sin(2.2 * t + seed) },
      armR: { ...pose.armR, a: pose.armR.a + 1.4 * Math.sin(2.0 * t + seed + 1.3) },
    };
  } else if (gaze !== undefined) {
    p = { ...pose, look: gaze };
  }
  return (
    <g>
      {castShadow > 0 ? <CastShadow pose={p} amount={castShadow} /> : null}
      <Hero look={look} pose={p} rimId={RIM_ID[rim]} shadow={floorShadow} />
      <Sweat pose={p} t={t} amount={sweat} seed={seed} />
    </g>
  );
};
