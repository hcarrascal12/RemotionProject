import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { ShotProps } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent, GridOverlay, inverted } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { LoopOut, ScrollStopperHook } from '../components/ScrollStopperHook';
import { KeyboardFast } from '../components/KeyboardFast';
import { TreatmentScene } from '../components/TreatmentScene';
import { ConsoleScene } from '../components/ConsoleScene';
import { OfficeScene } from '../components/OfficeScene';
import { GlitchScreen } from '../components/GlitchScreen';
import { Brakes } from '../components/Interlock';
import { ShieldJam } from '../components/ShieldJam';
import { FingerPress } from '../components/FingerPress';
import { DangerGauge } from '../components/DangerGauge';

// Therac-25, 1986: a 45 s vertical short at 60 fps. Every time in here comes from timeline.json, which
// tools/therac25_build.py writes from plan.json together with the audio, so picture and sound stay in sync.

type Shot = { id: string; kind: string; variant?: string; start: number; end: number; scene?: boolean };
type Timeline = {
  fps: number;
  width: number;
  height: number;
  duration: number;
  shots: Shot[];
  fx: FxEvent[];
  marks: Record<string, number>;
  /** seconds a graphic arrives before its word (the sound stays on the word): the text is read before it is heard */
  visualLead?: Record<string, number>;
  subs: SubChunk[];
};

export const THERAC: Timeline = timelineJson as Timeline;

const SHOTS: Record<string, React.FC<ShotProps>> = {
  hook: ScrollStopperHook,
  treat: TreatmentScene,
  console: ConsoleScene,
  office: OfficeScene,
  keys: KeyboardFast,
  screen: GlitchScreen,
  brakes: Brakes,
  shield: ShieldJam,
  finger: FingerPress,
  gauge: DangerGauge,
  loop: LoopOut,
};

/** The grid tint per kind, so the moving grid sits in each scene's palette. */
const GRID_TINT: Record<string, string> = {
  hook: '#FF6A6A',
  loop: '#FF6A6A',
  finger: '#FF6A6A',
  gauge: '#FF6A6A',
  screen: '#7CFFB2',
  office: '#FFE600',
};

// hideCaptions is for the cover still: npx remotion still ... --props='{"hideCaptions":true}'
export const Therac25: React.FC<{ hideCaptions?: boolean }> = ({ hideCaptions = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = THERAC;
  let idx = 0;
  for (let i = 0; i < T.shots.length; i++) if (T.shots[i].start <= t + 1e-6) idx = i;
  const shot = T.shots[idx];
  const local = t - shot.start;
  const View = SHOTS[shot.kind];
  const props: ShotProps = {
    t: local,
    f: f - Math.round(shot.start * fps),
    fps,
    dur: shot.end - shot.start,
    variant: shot.variant,
    mark: (name: string) => (T.marks[name] ?? Number.NaN) - (T.visualLead?.[name] ?? 0) - shot.start,
  };
  const cam = camera(t, f, fps, shot.start, shot.end, T.fx);
  return (
    <AbsoluteFill style={{ background: '#050508', filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      <Audio src={staticFile('therac25/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <View {...props} />
        <GridOverlay f={f} color={GRID_TINT[shot.kind] ?? '#9FE8FF'} />
      </AbsoluteFill>
      <Finish f={f} />
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};
