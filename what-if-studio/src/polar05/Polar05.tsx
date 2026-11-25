/**
 * No Presiones · Sin resolver · Fallo #05 · El oso polar de "Noviembre 2026" — 1080x1920, 30 fps, 38 s, loop.
 * Misma arquitectura que Satoshi: capas persistentes (cielo, cámara, nieve, línea de tiempo, barra de estado,
 * subtítulos, grano) fuera de las escenas, para que nunca corten; cada escena entra con zoom y desenfoque.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile } from 'remotion';
import { COL, DURATION, FPS, H, SCENES, W } from './theme';
import { Camera, FilmFinish, LightSweep, NightSky, ProgressBar, SceneIn, Snow, StatusBar, TimelineRail, XFADE } from './ui';
import { Captions } from './captions';
import { Back, Caption, Hook, Lore, Loop, Nothing, Now, Views } from './scenes';

const LIST: [keyof typeof SCENES, React.FC][] = [
  ['hook', Hook],
  ['caption', Caption],
  ['views', Views],
  ['back', Back],
  ['lore', Lore],
  ['now', Now],
  ['nothing', Nothing],
  ['loop', Loop],
];

const NO_AUDIO = Boolean((getInputProps() as { noAudio?: boolean }).noAudio);

export const Polar05: React.FC = () => (
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
      <Snow />
      <LightSweep />
    </Camera>
    <TimelineRail />
    <StatusBar />
    <ProgressBar />
    <Captions />
    <FilmFinish />
    {NO_AUDIO ? null : <Audio src={staticFile('polar05/mix.wav')} />}
  </AbsoluteFill>
);

export const POLAR05 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
