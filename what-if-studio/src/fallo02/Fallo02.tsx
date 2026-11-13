import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { ShotProps } from '../components/motion';
import { AlertOverlay, camera, ClimaxOverlay, Finish, FxEvent, GridOverlay, inverted } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { Hook02, LoopOut02 } from '../components/fallo02/Hook02';
import { Recreation } from '../components/fallo02/Recreate';

// Fallo #02, CrowdStrike, 19 July 2024: a 45 s vertical short at 60 fps. Every time in here comes from timeline.json, which
// tools/therac25_build.py (EPISODE=fallo02) writes from plan.json together with the audio, so picture and sound stay in sync.
// Audio: the mix (voice, sound design and music, -14 LUFS) is the <Audio> below; to swap the music, change plan.json "music".

type Shot = { id: string; kind: string; variant?: string; start: number; end: number; scene?: boolean };
type Timeline = {
  fps: number;
  width: number;
  height: number;
  duration: number;
  shots: Shot[];
  fx: FxEvent[];
  marks: Record<string, number>;
  visualLead?: Record<string, number>;
  subs: SubChunk[];
};

export const FALLO02: Timeline = timelineJson as Timeline;

const SHOTS: Record<string, React.FC<ShotProps>> = {
  hook: Hook02,
  rec: Recreation,
  loop: LoopOut02,
};

const GRID_TINT: Record<string, string> = {
  hook: '#6FB6FF',
  loop: '#6FB6FF',
};

export const Fallo02: React.FC<{ hideCaptions?: boolean; noGrid?: boolean; noFinish?: boolean; noClimax?: boolean }> = ({ hideCaptions = false, noGrid = false, noFinish = false, noClimax = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = FALLO02;
  let idx = 0;
  for (let i = 0; i < T.shots.length; i++) if (T.shots[i].start <= t + 1e-6) idx = i;
  const shot = T.shots[idx];
  const View = SHOTS[shot.kind];
  const props: ShotProps = {
    t: t - shot.start,
    f: f - Math.round(shot.start * fps),
    fps,
    dur: shot.end - shot.start,
    variant: shot.variant,
    mark: (name: string) => (T.marks[name] ?? Number.NaN) - (T.visualLead?.[name] ?? 0) - shot.start,
  };
  // climax weather: from "se bloquea" until the question card, faded in and out over 0.3 s
  const cIn = T.marks.climaxIn ?? Infinity;
  const cOut = T.marks.climaxOut ?? -Infinity;
  const climax = Math.max(0, Math.min(1, (t - cIn) / 0.3, (cOut - t) / 0.3));
  const cam = camera(t, f, fps, shot.start, shot.end, T.fx, climax * 0.8, idx);
  return (
    <AbsoluteFill style={{ background: '#050508', filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      {/* the mix: voice, sound design and the music, mastered to -14 LUFS by the build script */}
      <Audio src={staticFile('fallo02/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <View {...props} />
        {noGrid ? null : <GridOverlay f={f} color={GRID_TINT[shot.kind] ?? '#9FE8FF'} />}
      </AbsoluteFill>
      {noClimax ? null : <ClimaxOverlay t={t} level={climax} />}
      {noFinish ? null : <Finish f={f} />}
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};
