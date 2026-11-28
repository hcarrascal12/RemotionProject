/**
 * No Presiones · Sin resolver · Caso Nº 03 · El oso polar de "Noviembre 2026" — miniatura vertical (1080x1920).
 * Como la de Satoshi: es el gancho congelado (frame 60), con las mismas capas del vídeo, el titular en su forma
 * permanente ("HABLA DE NOVIEMBRE 2026", no caduca).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, HEAD } from './theme';
import { FilmFinish, NightSky, Punch, StatusBar, TimelineRail } from './ui';
import { BearShot } from './scenes';

export const THUMB_FRAME = 60; // se renderiza este frame (la composición dura 61)
const FRAME = THUMB_FRAME;

export const Polar05Thumb: React.FC = () => (
    <AbsoluteFill style={{ background: COL.bg }}>
      <NightSky />
      <BearShot zoom={1.38} />
      {/* el "2026" fantasma del gancho */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 380, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: `2px ${COL.ice}`, opacity: 0.18 }}>2026</div>
      <Punch text="HABLA DE|*NOVIEMBRE 2026*" at={FRAME - 16} y={1040} size={150} accent={COL.red} />
      <TimelineRail />
      <StatusBar />
      <FilmFinish />
    </AbsoluteFill>
);
