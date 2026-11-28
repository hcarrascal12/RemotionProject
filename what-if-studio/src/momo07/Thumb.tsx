/**
 * No Presiones · Casos reales de internet · Caso Nº 05 · Momo — miniatura vertical (1080x1920).
 * Misma receta que la del gato: la foto en el tablero de papel, rodeada con rotulador rojo,
 * el cartel del caso dentro de la foto y el titular del gancho debajo, en la cinta del vídeo.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Card, Finish, Headline, PaperBG, Scribble, Stage } from './kit';
import { W } from './theme';

export const THUMB_FRAME = 24; // se renderiza este frame (el garabato ya está cerrado)

export const Momo07Thumb: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    <Stage dolly={150}>
      <Card src="momo07/momo-cara.jpg" x={W / 2} y={900} w={900} h={1120} rz={-2.5} ry={4} k={1} pos="57% 35%" imgScale={1.05} imgOrigin="57% 35%" filter="contrast(1.1)" />
      <Scribble cx={W / 2 + 100} cy={780} rx={325} ry={170} at={4} dur={9} />
    </Stage>
    <Headline text="CASO Nº 05 · *MOMO*" at={0} y={400} size={58} maxW={900} still />
    <Headline text="ESTA CARA ASUSTÓ|A *MEDIO MUNDO*" at={0} y={1440} size={120} maxW={940} still />
    <Finish />
  </AbsoluteFill>
);
