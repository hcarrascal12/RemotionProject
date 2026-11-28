/**
 * No Presiones · Casos reales de internet · Caso Nº 06 · Polybius — 1080x1920, 30 fps, 40 s, loop. Sin voz todavía.
 * Diseño "ganadores": un medio a pantalla completa en cada plano (clip, foto, captura), cortes cada 2–3 s,
 * subtítulos palabra por palabra (captions.tsx) y el dato como número grande encima (shots.tsx).
 * Para añadir el audio cuando exista: public/polybius08/mix.wav y render con --props='{"audio":true}'.
 * Los tiempos de SHOTS y de captions.tsx son una estimación; reajustar a words.json con la voz real.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { COL, DURATION, FPS, H, MONO, W } from './theme';
import { Finish, Flash, ProgressLight } from './kit';
import { Captions } from './captions';
import { ApuestasShot, AsteroidsShot, CLIPS, CaptureShot, HookShot, LoopShot, MagazinesShot, MigrañaShot, PiezasShot, PortlandShot, PreguntaShot, QuoteShot, SalaShot, TerminalShot, TitleShot } from './shots';

const WITH_AUDIO = Boolean((getInputProps() as { audio?: boolean }).audio);

const SHOTS: { from: number; len: number; el: (len: number) => React.ReactNode }[] = [
  { from: 0, len: 70, el: () => <HookShot /> },
  { from: 70, len: 90, el: (l) => <SalaShot len={l} /> },
  { from: 160, len: 40, el: (l) => <TitleShot len={l} /> },
  { from: 200, len: 70, el: (l) => <PortlandShot len={l} /> },
  { from: 270, len: 60, el: (l) => <MagazinesShot len={l} /> },
  { from: 330, len: 60, el: (l) => <TerminalShot len={l} lines={['> buscar polybius.rom', '0 resultados']} tag="ILUSTRACIÓN · NINGÚN ROM HA SALIDO JAMÁS" /> },
  { from: 390, len: 60, el: (l) => <TerminalShot len={l} lines={['> buscar empresa Sinneslöschen', '0 resultados']} tag="ILUSTRACIÓN · SIN REGISTRO DE LA EMPRESA · INVERSE" clip={CLIPS.vector} stamp /> },
  { from: 450, len: 70, el: (l) => <CaptureShot len={l} mode="a" /> },
  { from: 520, len: 70, el: (l) => <CaptureShot len={l} mode="b" /> },
  { from: 590, len: 60, el: (l) => <PiezasShot len={l} /> },
  { from: 650, len: 70, el: (l) => <MigrañaShot len={l} /> },
  { from: 720, len: 70, el: (l) => <AsteroidsShot len={l} /> },
  { from: 790, len: 100, el: (l) => <ApuestasShot len={l} /> },
  { from: 890, len: 120, el: (l) => <QuoteShot len={l} /> },
  { from: 1010, len: 40, el: (l) => <PreguntaShot len={l} n={1} startFrom={30} pos="50% 50%" /> },
  { from: 1050, len: 40, el: (l) => <PreguntaShot len={l} n={2} startFrom={60} pos="40% 50%" /> },
  { from: 1090, len: 40, el: (l) => <PreguntaShot len={l} n={3} startFrom={80} pos="60% 50%" /> },
  { from: 1130, len: 70, el: (l) => <LoopShot len={l} /> },
];

/** Etiqueta fija del caso (no aparece en el gancho ni en el cierre, que son el cabinete). */
const Pill: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 160 || f >= 1130) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '8px 18px', borderLeft: `8px solid ${COL.red}` }}>CASO Nº 06 · CASOS REALES · NO PRESIONES</span>
    </div>
  );
};

export const Polybius08: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.len}>
        {s.el(s.len)}
      </Sequence>
    ))}
    <Flash at={SHOTS.slice(1).map((s) => s.from)} amp={0.16} />
    <Pill />
    <Captions />
    <ProgressLight />
    <Finish />
    {WITH_AUDIO ? <Audio src={staticFile('polybius08/mix.wav')} /> : null}
  </AbsoluteFill>
);

export const POLYBIUS08 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
