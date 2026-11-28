/**
 * No Presiones · Casos reales de internet · Caso Nº 06 · Polybius — 1080x1920, 30 fps, 40 s, loop. Sin voz todavía.
 * ≈80 % estilo ganadores (un medio a pantalla completa en cada plano, cortes cada 2–3 s, subtítulos palabra por palabra,
 * el dato encima de la imagen) y ≈20 % identidad del canal (rojo, sellos, barra de estado, cortinilla, papel en documentos).
 * Para añadir el audio cuando exista: public/polybius08/mix.wav y render con --props='{"audio":true}'.
 * Los tiempos de SHOTS y de captions.tsx son una estimación; reajustar a words.json con la voz real.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { DURATION, FPS, H, W } from './theme';
import { Finish, Flash, HatWipe, ProgressLight, StatusBarLight } from './kit';
import { Captions } from './captions';
import { ApuestasShot, AsteroidsShot, CLIPS, CaptureFull, HookShot, LoopShot, MagazinesShot, MigrañaShot, NadieShot, PiezasShot, PortlandShot, PreguntaShot, QuoteClip, SalaShot, TerminalShot, TitleShot } from './shots';

const WITH_AUDIO = Boolean((getInputProps() as { audio?: boolean }).audio);

const SHOTS: { from: number; len: number; el: (len: number) => React.ReactNode }[] = [
  // 1 · gancho en 3 cortes de ~1,7 s (el sello «0» solo en el primero)
  { from: 0, len: 50, el: () => <HookShot /> },
  { from: 50, len: 55, el: (l) => <SalaShot len={l} /> },
  { from: 105, len: 55, el: (l) => <NadieShot len={l} /> },
  { from: 160, len: 40, el: (l) => <TitleShot len={l} /> },
  { from: 200, len: 70, el: (l) => <PortlandShot len={l} /> },
  { from: 270, len: 60, el: (l) => <MagazinesShot len={l} /> },
  { from: 330, len: 60, el: (l) => <TerminalShot len={l} lines={['> buscar polybius.rom', '0 resultados']} tag="ILUSTRACIÓN · NINGÚN ROM HA SALIDO JAMÁS" /> },
  { from: 390, len: 60, el: (l) => <TerminalShot len={l} lines={['> buscar empresa Sinneslöschen', '0 resultados']} tag="ILUSTRACIÓN · SIN REGISTRO DE LA EMPRESA · INVERSE" clip={CLIPS.vector} /> },
  // 4 · la captura de coinop.org a pantalla completa, con círculo rojo
  { from: 450, len: 70, el: (l) => <CaptureFull len={l} cx={90} cy={110} ring={{ rx: 300, ry: 90, at: 18 }} z0={1.0} z1={1.25} /> },
  { from: 520, len: 70, el: (l) => <CaptureFull len={l} cx={407} cy={331} ring={{ rx: 250, ry: 70, at: 20 }} z0={1.25} z1={1.55} marker={{ left: 331, top: 322, w: 152, h: 20 }} /> },
  { from: 590, len: 60, el: (l) => <PiezasShot len={l} /> },
  { from: 650, len: 70, el: (l) => <MigrañaShot len={l} /> },
  { from: 720, len: 70, el: (l) => <AsteroidsShot len={l} /> },
  { from: 790, len: 100, el: (l) => <ApuestasShot len={l} /> },
  // 2 · la cita de Inverse en 2 s; luego «esa web» (la cabecera de coinop.org)
  { from: 890, len: 60, el: (l) => <QuoteClip len={l} /> },
  { from: 950, len: 60, el: (l) => <CaptureFull len={l} cx={70} cy={18} ring={{ rx: 250, ry: 70, at: 14 }} z0={1.1} z1={1.3} /> },
  // 3 · las tres preguntas, cada una con su clip y sin sellos
  { from: 1010, len: 40, el: (l) => <PreguntaShot len={l} file={CLIPS.sala} startFrom={20} pos="45% 50%" /> },
  { from: 1050, len: 40, el: (l) => <PreguntaShot len={l} file={CLIPS.vector} startFrom={40} pos="50% 50%" /> },
  { from: 1090, len: 40, el: (l) => <PreguntaShot len={l} file={CLIPS.crt} startFrom={60} pos="55% 50%" /> },
  { from: 1130, len: 70, el: (l) => <LoopShot len={l} /> },
];

/** Barra de estado del canal (no aparece en el gancho ni en el cierre, que son el cabinete). */
const DATES: [number, string][] = [[0, '1981'], [450, '2000–2003'], [590, 'PORTLAND 1981'], [890, '2020'], [1010, '¿?']];
const Bar: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 50 || f >= 1130) return null;
  const d = [...DATES].reverse().find(([at]) => f >= at)?.[1];
  return <StatusBarLight date={d} />;
};

export const Polybius08: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.len}>
        {s.el(s.len)}
      </Sequence>
    ))}
    <Flash at={SHOTS.slice(1).map((s) => s.from)} amp={0.16} />
    {[270, 590, 890].map((at) => <HatWipe key={at} at={at - 8} />)}
    <Bar />
    <Captions />
    <ProgressLight />
    <Finish />
    {WITH_AUDIO ? <Audio src={staticFile('polybius08/mix.wav')} /> : null}
  </AbsoluteFill>
);

export const POLYBIUS08 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
