/**
 * No Presiones · Casos reales de internet · Caso Nº 06 · Polybius — 1080x1920, 30 fps, 40 s, loop. Sin voz todavía.
 * Para añadir el audio cuando exista: public/polybius08/mix.wav y render con --props='{"audio":true}'.
 * Los tiempos de SCENES (theme.ts) son una estimación; reajustar a words.json con la voz real.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { DURATION, FPS, H, SCENES, W } from './theme';
import { SceneIn, XFADE } from './ui';
import { Flash, Finish, HatWipe, PaperBG, ProgressLight, StatusBarLight } from './kit';
import { Check, Hook, Legend, Loop, Page, Proof, Quote, Real } from './scenes';

const LIST: [keyof typeof SCENES, React.FC, string][] = [
  ['hook', Hook, '1981'],
  ['legend', Legend, '1981'],
  ['proof', Proof, '¿PRUEBAS?'],
  ['page', Page, '1998–2003'],
  ['real', Real, 'PORTLAND 1981'],
  ['quote', Quote, '2020'],
  ['check', Check, 'DUDA'],
  ['loop', Loop, '¿?'],
];

const WITH_AUDIO = Boolean((getInputProps() as { audio?: boolean }).audio);

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...LIST].reverse().find(([k]) => f >= SCENES[k].from) ?? LIST[0];
  if (f < SCENES.legend.from || f >= SCENES.loop.from) return null; // el gancho y el cierre son el cabinete, sin barra
  return <StatusBarLight date={cur[2]} />;
};

export const Polybius08: React.FC = () => (
  <AbsoluteFill>
    <PaperBG />
    {LIST.map(([k, Scene]) => (
      <Sequence key={k} from={SCENES[k].from} durationInFrames={SCENES[k].len + (k === 'loop' ? 0 : XFADE)}>
        <SceneIn len={SCENES[k].len} skipIn={k === 'hook'} skipOut={k === 'loop' || k === 'hook'}>
          <Scene />
        </SceneIn>
      </Sequence>
    ))}
    <HatWipe at={SCENES.proof.from - 8} />
    <HatWipe at={SCENES.real.from - 8} />
    <Flash at={[SCENES.legend.from, SCENES.proof.from, SCENES.page.from, SCENES.real.from, SCENES.quote.from, SCENES.check.from]} amp={0.45} />
    <Hud />
    <ProgressLight />
    <Finish />
    {WITH_AUDIO ? <Audio src={staticFile('polybius08/mix.wav')} /> : null}
  </AbsoluteFill>
);

export const POLYBIUS08 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
