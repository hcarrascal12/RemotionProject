/**
 * No Presiones · Casos reales de internet · Satoshi Nakamoto — 1920x1080, 30 fps, 5 min. Sin voz todavía.
 * Mismo lenguaje visual que el Caso Nº 04 (tablero de papel, fotos 3D, rotuladora, un acento rojo), en horizontal.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { DURATION, FPS, H, SCENES, W } from './theme';
import { SceneIn, XFADE } from './ui';
import { Finish, Flash, HatWipe, PaperBG, ProgressLight, StatusBarLight, Whip } from './kit';
import { Crisis, End, Fortune, Genesis, Gone, Hal, Hook, Paper, Pizza, Proof, Suspects, Title } from './scenes';

const LIST: [keyof typeof SCENES, React.FC, string][] = [
  ['hook', Hook, '2008 – HOY'],
  ['title', Title, 'EXPEDIENTE'],
  ['crisis', Crisis, 'SEP 2008'],
  ['paper', Paper, '31 OCT 2008'],
  ['genesis', Genesis, '3 ENE 2009'],
  ['hal', Hal, 'ENE 2009'],
  ['pizza', Pizza, '22 MAY 2010'],
  ['gone', Gone, '2010 – 2011'],
  ['fortune', Fortune, 'HOY'],
  ['suspects', Suspects, '2014 – 2024'],
  ['proof', Proof, 'HOY'],
  ['end', End, '¿?'],
];

const NO_AUDIO = Boolean((getInputProps() as { noAudio?: boolean }).noAudio);

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...LIST].reverse().find(([k]) => f >= SCENES[k].from) ?? LIST[0];
  return <StatusBarLight date={cur[2]} />;
};

export const Satoshi07: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    {LIST.map(([k, Scene]) => (
      <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].len + (k === 'end' ? 0 : XFADE)}>
        <SceneIn len={SCENES[k].len} skipIn={k === 'hook'}>
          <Scene />
        </SceneIn>
      </Sequence>
    ))}
    {/* transiciones firma: el sombrero del Caso Nº 04 se vuelve una cortinilla de rayas en los cambios de capítulo */}
    {(['crisis', 'genesis', 'pizza', 'fortune', 'proof'] as const).map((k) => <HatWipe key={k} at={SCENES[k].from - 8} />)}
    {(['paper', 'hal', 'gone', 'suspects', 'end'] as const).map((k) => <Whip key={k} at={SCENES[k].from - 3} dir={k === 'hal' || k === 'suspects' ? -1 : 1} />)}
    <Flash at={[SCENES.title.from, SCENES.paper.from, SCENES.hal.from, SCENES.gone.from, SCENES.suspects.from, SCENES.end.from]} amp={0.45} />
    <Hud />
    <ProgressLight />
    <Finish />
    {NO_AUDIO ? null : <Audio src={staticFile('satoshi07/mix.wav')} />}
  </AbsoluteFill>
);

export const SATOSHI07 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
