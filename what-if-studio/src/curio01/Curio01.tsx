import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { lin, ShotProps } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { CURIO_SHOTS, S1 } from './Curio01Board';

// "¿Sabías que…? #01", the emergency number can go down: a short vertical in the series' format (Pip, kinetic captions, the
// loop back into frame 0). Every time comes from timeline.json (tools/mkplan_curio01.py, then EPISODE=curio01
// tools/therac25_build.py), which also writes the mix played below, so picture and sound stay in sync.

type Shot = { id: string; kind: string; variant?: string; start: number; end: number };
type Timeline = { fps: number; width: number; height: number; duration: number; shots: Shot[]; fx: FxEvent[]; marks: Record<string, number>; visualLead?: Record<string, number>; subs: SubChunk[] };

export const CURIO01: Timeline = timelineJson as Timeline;

export const Curio01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = CURIO01;
  let idx = 0;
  for (let i = 0; i < T.shots.length; i++) if (T.shots[i].start <= t + 1e-6) idx = i;
  const shot = T.shots[idx];
  const View = CURIO_SHOTS[shot.kind];
  const props: ShotProps = {
    t: t - shot.start,
    f: f - Math.round(shot.start * fps),
    fps,
    dur: shot.end - shot.start,
    variant: shot.variant,
    mark: (name: string) => (T.marks[name] ?? Number.NaN) - (T.visualLead?.[name] ?? 0) - shot.start,
  };
  const last = idx === T.shots.length - 1;
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, 0, idx, 0.6);
  // the loop: in the last 0.32 s frame 0 fades back in, so the end runs straight into the start
  const w = last ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const lt = t - shot.start;
  const kb = idx === 0 ? 0 : Math.min(1, lt / Math.max(0.5, shot.end - shot.start)) * (1 - w);
  const side = idx % 2 ? 1 : -1;
  // every cut swipes in from the side (none on frame 0)
  const swipe = idx > 0 ? Math.exp(-lt / 0.07) : 0;
  const cam = { x: cam0.x * (1 - w) + side * 22 * kb + side * 260 * swipe, y: cam0.y * (1 - w) - 12 * kb, scale: (1 + (cam0.scale - 1) * (1 - w)) * (1 + 0.05 * kb), rot: cam0.rot * (1 - w) };
  return (
    <AbsoluteFill style={{ background: '#03060C' }}>
      <Audio src={staticFile('curio01/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : undefined }}>
        <View {...props} />
      </AbsoluteFill>
      {w > 0 ? (
        <AbsoluteFill style={{ opacity: w }}>
          <S1 t={0} f={0} fps={fps} dur={2} mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
      <Finish f={f} />
      {w > 0.5 ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};
