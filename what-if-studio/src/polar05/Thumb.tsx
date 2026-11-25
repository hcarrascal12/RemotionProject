/**
 * No Presiones · Sin resolver · Caso Nº 03 · El oso polar de "Noviembre 2026" — miniatura vertical (1080x1920).
 * Como la de Satoshi: es el gancho congelado (frame 60), con las mismas capas del vídeo, el titular en su forma
 * permanente ("HABLA DE NOVIEMBRE 2026", no caduca) y "UN MEME DE 2023" donde va el subtítulo.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, HEAD, SAFE_BOTTOM_Y } from './theme';
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
      {/* donde va el subtítulo, el dato que da contexto */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: SAFE_BOTTOM_Y - 130, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '6px 22px', borderRadius: 16, background: 'rgba(4,7,12,0.9)', border: '2px solid rgba(240,248,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 900, fontSize: 64, lineHeight: 1.12, letterSpacing: '-0.02em', color: COL.white, textShadow: '0 3px 0 #000' }}>
          UN MEME DE <span style={{ color: COL.ice, textShadow: `0 0 22px ${COL.ice}99, 0 3px 0 #000` }}>2023</span>
        </div>
      </div>
      <FilmFinish />
    </AbsoluteFill>
);
