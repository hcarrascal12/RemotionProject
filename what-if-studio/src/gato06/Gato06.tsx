/**
 * No Presiones · Sin resolver · Caso Nº 04 · El Gato con Sombrero — 1080x1920, 30 fps, 38 s, loop. Sin voz todavía.
 * Rediseño "tablero de investigación": papel claro, fotos en 3D, un solo acento rojo. Capas persistentes (papel,
 * barra de estado, progreso, acabado) fuera de las escenas; cada escena entra con fundido encadenado + barridos.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { DURATION, FPS, H, SCENES, W } from './theme';
import { SceneIn, XFADE } from './ui';
import { Finish, Flash, PaperBG, ProgressLight, StatusBarLight, Whip } from './kit';
import { Auction, Fear, Hook, Ireland, Loop, Police, Spread, Viral } from './scenes';

const LIST: [keyof typeof SCENES, React.FC, string][] = [
  ['hook', Hook, 'AGO 2026'],
  ['auction', Auction, '8 AGO 2026'],
  ['ireland', Ireland, '18 AGO 2026'],
  ['viral', Viral, 'AGO 2026'],
  ['police', Police, '20 AGO 2026'],
  ['spread', Spread, 'SEP 2026'],
  ['fear', Fear, 'AGO–SEP 2026'],
  ['loop', Loop, 'AGO 2026'],
];

const NO_AUDIO = Boolean((getInputProps() as { noAudio?: boolean }).noAudio);

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...LIST].reverse().find(([k]) => f >= SCENES[k].from) ?? LIST[0];
  return <StatusBarLight date={cur[2]} />;
};

export const Gato06: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    {LIST.map(([k, Scene]) => (
      <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].len + (k === 'loop' ? 0 : XFADE)}>
        <SceneIn len={SCENES[k].len} skipIn={k === 'hook'} skipOut={k === 'loop'}>
          <Scene />
        </SceneIn>
      </Sequence>
    ))}
    <Whip at={SCENES.auction.from - 3} />
    <Whip at={SCENES.police.from - 3} dir={-1} />
    <Whip at={SCENES.fear.from - 3} />
    <Flash at={[SCENES.ireland.from, SCENES.viral.from, SCENES.spread.from, SCENES.loop.from]} amp={0.5} />
    <Hud />
    <ProgressLight />
    <Finish />
    {NO_AUDIO ? null : <Audio src={staticFile('gato06/mix.wav')} />}
  </AbsoluteFill>
);

export const GATO06 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
