import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../components/fonts';
import { KitDefs, SetDefs, faceAt } from '../engine';
import { Pepito, Tito, stand } from './cast';
import { Station } from './Station';

// A style check for "Operación Corazón" (scene 1): Tito at the wall phone in the fire station, Pepito calling in a bubble.
//   npx remotion still src/index.ts KidsStill out/kids/style.png
export const KidsStill: React.FC = () => (
  <AbsoluteFill>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      <Station t={0} truckX={1450} />
      <Tito pose={stand({ x: 760, y: 790, scale: 1.25, yaw: 0.1, armR: { a: 150, b: 90 }, armL: { a: 20, b: 10 }, ...faceAt(0, [[0, 'happy']]) })} t={0} />
      {/* Pepito calling: a round video bubble */}
      <g transform="translate(1500 330)">
        <circle r={190} fill="#FDE68A" stroke="#F59E0B" strokeWidth={10} />
        <clipPath id="kid-bubble"><circle r={180} /></clipPath>
        <g clipPath="url(#kid-bubble)">
          <rect x={-190} y={-190} width={380} height={380} fill="#A7F3D0" />
          <Pepito pose={stand({ x: 0, y: 190, scale: 1.0, armL: { a: 100, b: 60 }, armR: { a: 100, b: 60 }, ...faceAt(0, [[0, 'shock']]) })} t={0} />
        </g>
      </g>
    </svg>
  </AbsoluteFill>
);
