/**
 * No Presiones · Casos reales de internet · Caso Nº 05 · Momo — 1080x1920, 30 fps, 38 s, loop. Sin voz todavía.
 * Estándar del canal: el estilo del Caso Nº 04 (tablero de papel, fotos 3D, rotuladora, un acento rojo).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { DURATION, FPS, H, SCENES, W } from './theme';
import { SceneIn, XFADE } from './ui';
import { Finish, Flash, HatWipe, PaperBG, ProgressLight, StatusBarLight, Whip } from './kit';
import { Chat, Hoax, Hook, Loop, Panic, Rumor, Sculpt, Trash } from './scenes';

const LIST: [keyof typeof SCENES, React.FC, string][] = [
  ['hook', Hook, 'JUL 2018'],
  ['chat', Chat, 'JUL 2018'],
  ['rumor', Rumor, '2018'],
  ['panic', Panic, 'FEB 2019'],
  ['hoax', Hoax, 'FEB–MAR 2019'],
  ['sculpt', Sculpt, '2016'],
  ['trash', Trash, '2018'],
  ['loop', Loop, '¿?'],
];

const NO_AUDIO = Boolean((getInputProps() as { noAudio?: boolean }).noAudio);

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...LIST].reverse().find(([k]) => f >= SCENES[k].from) ?? LIST[0];
  // en el frame 0 (y en el último) los ojos van a pantalla completa: la barra entra con la caída al tablero
  if (f < 22 || f > DURATION - 12) return null;
  return <StatusBarLight date={cur[2]} />;
};

export const Momo07: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    {LIST.map(([k, Scene]) => (
      <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].len + (k === 'loop' ? 0 : XFADE)}>
        <SceneIn len={SCENES[k].len} skipIn={k === 'hook' || k === 'hoax'} skipOut={k === 'loop'}>
          <Scene />
        </SceneIn>
      </Sequence>
    ))}
    {/* firma del canal: la cortinilla de rayas rojas y blancas */}
    <HatWipe at={SCENES.chat.from - 8} />
    <HatWipe at={SCENES.sculpt.from - 8} />
    <Whip at={SCENES.rumor.from - 3} dir={-1} />
    <Whip at={SCENES.panic.from - 3} />
    <Whip at={SCENES.trash.from - 3} dir={-1} />
    <Flash at={[SCENES.panic.from, SCENES.trash.from, SCENES.loop.from]} amp={0.5} />
    <Hud />
    <ProgressLight />
    <Finish />
    {NO_AUDIO ? null : <Audio src={staticFile('momo07/mix.wav')} />}
  </AbsoluteFill>
);

export const MOMO07 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
