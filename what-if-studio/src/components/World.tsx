import React from 'react';
import { KitDefs, SetDefs } from '../engine';

// A vertical camera onto the What If engine's 1920 x 1080 world: centre (cx, cy) at the middle of the 1080 x 1920
// frame, scaled by zoom. Keep zoom at 1.8 or more so the world's height covers the frame. Shots pass the engine's
// clock in 30 fps frames (ef), the rate its sets and rig were tuned at.

export const World: React.FC<{ cx: number; cy: number; zoom: number; rot?: number; bg?: string; children: React.ReactNode }> = ({
  cx,
  cy,
  zoom,
  rot = 0,
  bg = '#0E0C1E',
  children,
}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <KitDefs />
    <SetDefs />
    <rect width={1080} height={1920} fill={bg} />
    <g transform={`translate(540 960) rotate(${rot}) scale(${zoom}) translate(${-cx} ${-cy})`}>{children}</g>
  </svg>
);

/** Engine frames (30 fps) from shot seconds. */
export const ef = (t: number) => t * 30;
