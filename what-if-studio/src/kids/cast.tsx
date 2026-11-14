import React from 'react';
import { HEAD, Look, LOOKS, Pose, basePose, toWorld } from '../engine';
import { CharacterRig } from '../components/CharacterRig';

// "Operación Corazón": the cast of the children's audio-video. Original characters on the What If rig: Tito the firefighter
// (a red helmet over the rig's head), Pepito the little monkey (ears and a tail), and Samuel (a Bible under his arm).

export const TITO_LOOK: Look = {
  skin: '#E9B98A', skinShade: '#D29E70', hand: '#E9B98A', jacket: '#F7C61B', jacketShade: '#D9A90C', accent: '#E5E7EB', limb: '#1E3A8A', line: '#3A2A1E', shoe: '#1F2937', face: '#2B1B12', hair: '#2B1B12',
};
export const PEPITO_LOOK: Look = {
  skin: '#B07A45', skinShade: '#94602F', hand: '#B07A45', jacket: '#3B82F6', jacketShade: '#2563EB', accent: '#FDE68A', limb: '#8A5A2E', line: '#3A2414', shoe: '#EF4444', face: '#24150C', hair: '#6B4423',
};
export const SAMUEL_LOOK: Look = {
  skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#7C3AED', jacketShade: '#6D28D9', accent: '#FDE68A', limb: '#374151', line: '#2A1C18', shoe: '#92400E', face: '#1F130E', hair: '#2A1C18', extra: 'curls',
};
export { LOOKS };

const headFrame = (pose: Pose) => {
  const c = toWorld(pose, { x: HEAD.x, y: HEAD.y });
  return `translate(${c.x} ${c.y}) rotate(${pose.headTilt + pose.tilt}) scale(${pose.scale})`;
};

/** Tito: the rig in a yellow jacket with reflective stripe, plus his red helmet. */
export const Tito: React.FC<{ pose: Pose; t: number }> = ({ pose, t }) => (
  <g>
    <CharacterRig look={TITO_LOOK} pose={pose} t={t} rim="amber" seed={2} />
    <g transform={headFrame(pose)}>
      <path d="M -72 -26 Q -74 -112 0 -118 Q 74 -112 72 -26 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth={5} strokeLinejoin="round" />
      <path d="M -88 -24 L 88 -24 L 80 -10 L -80 -10 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth={5} strokeLinejoin="round" />
      <circle cx={0} cy={-76} r={17} fill="#FACC15" stroke="#7F1D1D" strokeWidth={4} />
      <path d="M 0 -88 L 4 -79 L 14 -78 L 7 -71 L 9 -62 L 0 -67 L -9 -62 L -7 -71 L -14 -78 L -4 -79 Z" fill="#DC2626" />
    </g>
  </g>
);

/** Pepito: a little monkey, ears and a curly tail. */
export const Pepito: React.FC<{ pose: Pose; t: number }> = ({ pose, t }) => {
  const hip = toWorld(pose, { x: -14, y: 0 });
  const s = pose.scale;
  const sway = 10 * Math.sin(t * 3);
  return (
    <g>
      <path
        d={`M ${hip.x} ${hip.y - 6 * s} Q ${hip.x - 90 * s} ${hip.y + 20 * s + sway} ${hip.x - 70 * s} ${hip.y - 70 * s} Q ${hip.x - 62 * s} ${hip.y - 110 * s} ${hip.x - 30 * s} ${hip.y - 104 * s}`}
        stroke={PEPITO_LOOK.line} strokeWidth={22 * s} fill="none" strokeLinecap="round"
      />
      <path
        d={`M ${hip.x} ${hip.y - 6 * s} Q ${hip.x - 90 * s} ${hip.y + 20 * s + sway} ${hip.x - 70 * s} ${hip.y - 70 * s} Q ${hip.x - 62 * s} ${hip.y - 110 * s} ${hip.x - 30 * s} ${hip.y - 104 * s}`}
        stroke="#B07A45" strokeWidth={14 * s} fill="none" strokeLinecap="round"
      />
      <g transform={headFrame(pose)}>
        {[-1, 1].map((d) => (
          <g key={d}>
            <circle cx={d * 66} cy={-4} r={28} fill="#B07A45" stroke="#3A2414" strokeWidth={5} />
            <circle cx={d * 66} cy={-4} r={15} fill="#F2C9A0" />
          </g>
        ))}
      </g>
      <CharacterRig look={PEPITO_LOOK} pose={pose} t={t} rim="blue" seed={4} />
      <g transform={headFrame(pose)}>
        <ellipse cx={0} cy={26} rx={34} ry={22} fill="#F2C9A0" opacity={0.0} />
        <path d="M -50 -40 Q 0 -78 50 -40 Q 30 -26 0 -34 Q -30 -26 -50 -40 Z" fill="#6B4423" stroke="#3A2414" strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};

export const Samuel: React.FC<{ pose: Pose; t: number }> = ({ pose, t }) => (
  <g>
    <CharacterRig look={SAMUEL_LOOK} pose={pose} t={t} rim="blue" seed={7} />
  </g>
);

export const stand = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: 960, y: 760, scale: 1.2, ...o });
