/**
 * No Presiones · Sin resolver · Caso Nº 04 · El Gato con Sombrero — 1080x1920, 30 fps, 38 s, loop. Sin voz todavía.
 * Misma arquitectura que el Caso Nº 03: capas persistentes (fondo, cámara, llovizna, línea de tiempo, barra de estado,
 * grano) fuera de las escenas; cada escena entra con fundido encadenado sobre la anterior.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile } from 'remotion';
import { COL, DURATION, FPS, H, SCENES, W } from './theme';
import { Camera, FilmFinish, LightSweep, NightSky, ProgressBar, SceneIn, Snow, StatusBar, TimelineRail, XFADE } from './ui';
import { Auction, Fear, Hook, Ireland, Loop, Police, Spread, Viral } from './scenes';

const LIST: [keyof typeof SCENES, React.FC][] = [
  ['hook', Hook],
  ['auction', Auction],
  ['ireland', Ireland],
  ['viral', Viral],
  ['police', Police],
  ['spread', Spread],
  ['fear', Fear],
  ['loop', Loop],
];

const NO_AUDIO = Boolean((getInputProps() as { noAudio?: boolean }).noAudio);

export const Gato06: React.FC = () => (
  <AbsoluteFill style={{ background: COL.bg }}>
    <NightSky />
    <Camera>
      {LIST.map(([k, Scene]) => (
        <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].len + (k === 'loop' ? 0 : XFADE)}>
          <SceneIn len={SCENES[k].len} skipIn={k === 'hook'} skipOut={k === 'loop'}>
            <Scene />
          </SceneIn>
        </Sequence>
      ))}
      <Snow count={70} />
      <LightSweep />
    </Camera>
    <TimelineRail />
    <StatusBar />
    <ProgressBar />
    <FilmFinish />
    {NO_AUDIO ? null : <Audio src={staticFile('gato06/mix.wav')} />}
  </AbsoluteFill>
);

export const GATO06 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
