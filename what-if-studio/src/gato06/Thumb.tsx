/**
 * No Presiones · Sin resolver · Caso Nº 04 · El Gato con Sombrero — miniatura vertical (1080x1920).
 * Como las anteriores: es el gancho congelado (frame 43: la foto ya en el tablero, el marcador cerrado y
 * «CIERREN SUS PUERTAS» completo), con el cartel del caso y las mismas capas del vídeo.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Finish, Headline, PaperBG } from './kit';
import { HookView } from './scenes';

export const THUMB_FRAME = 43; // se renderiza este frame (la composición dura 44)

export const Gato06Thumb: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    <HookView t={useCurrentFrame()} />
    <Headline text="CASO Nº 04 · *SIN RESOLVER*" at={0} y={300} size={58} maxW={900} still />
    <Finish />
  </AbsoluteFill>
);
