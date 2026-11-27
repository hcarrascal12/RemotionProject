/**
 * No Presiones · Casos reales de internet · Caso Nº 05 · Momo — miniatura vertical (1080x1920).
 * Es el gancho congelado: la cara a pantalla completa en la videollamada y «ESTA CARA ASUSTÓ A MEDIO MUNDO» completo,
 * con el cartel del caso arriba (misma cinta que los titulares del vídeo).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Finish, Headline, PaperBG } from './kit';
import { HookView } from './scenes';

export const THUMB_FRAME = 90; // frame del gancho que se congela (la composición dura 91; se renderiza el último)

export const Momo07Thumb: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    <HookView t={useCurrentFrame()} />
    <Headline text="CASO Nº 05 · *MOMO*" at={0} y={0} size={66} maxW={900} still sub />
    <Finish />
  </AbsoluteFill>
);
