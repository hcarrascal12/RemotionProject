import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { HARD, HEAVY, lin, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, ClimaxOverlay, Finish, FxEvent, GridOverlay, inverted } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { HookScene } from '../components/fallo03/HookScene';
import { MissionControlScene } from '../components/fallo03/MissionControlScene';
import { UnitsMismatchScene } from '../components/fallo03/UnitsMismatchScene';
import { AtmosphereCrashScene } from '../components/fallo03/AtmosphereCrashScene';
import { AftermathScene } from '../components/fallo03/AftermathScene';
import { DebateLoopScene } from '../components/fallo03/DebateLoopScene';
import { P3 } from '../components/fallo03/parts';

// Fallo #03, Mars Climate Orbiter, 23 September 1999: a 45 s vertical short at 30 fps. Every time in here comes from
// timeline.json, which tools/therac25_build.py (EPISODE=fallo03) writes from plan.json together with the audio, so picture and
// sound stay in sync. The mix (voice, sound design, music, -14 LUFS) is the <Audio> below.

type Shot = { id: string; kind: string; variant?: string; start: number; end: number };
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

export const FALLO03: Timeline = timelineJson as Timeline;

/**
 * SFX cue sheet (frames at 30 fps): the map for the sound designer. The mix the build writes already contains all of these
 * (see plan.json "sfx"). To lay a clip by hand instead:
 *   <Sequence from={SFX_CUES.counterTick}><Audio src={staticFile('fallo03/sfx/tick-ramp.wav')} volume={0.5} /></Sequence>
 */
export const SFX_CUES = {
  counterTick: 0, // accelerating tick under the counters
  telemetryPing: Math.round((FALLO03.marks.nasa ?? 0) * FALLO03.fps), // space telemetry beep in the control room
  notEqual: Math.round(((FALLO03.marks.newtons ?? 0) + 0.2) * FALLO03.fps), // low alert on the red ≠
  atmosphereHum: Math.round((FALLO03.marks.km150 ?? 0) * FALLO03.fps), // the descent
  signalLost: Math.round((FALLO03.marks.perdida ?? 0) * FALLO03.fps), // the dry static cut
  balance: Math.round((FALLO03.marks.tag1 ?? 0) * FALLO03.fps), // the soft hit of the pans
};

const SHOTS: Record<string, React.FC<ShotProps>> = {
  hook: HookScene,
  mission: MissionControlScene,
  units: UnitsMismatchScene,
  crash: AtmosphereCrashScene,
  aftermath: AftermathScene,
  loop: DebateLoopScene,
};

export const Fallo03: React.FC<{ hideCaptions?: boolean; noGrid?: boolean; noFinish?: boolean }> = ({ hideCaptions = false, noGrid = false, noFinish = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = FALLO03;
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
  // weather: from the thrust explanation until the question card
  const cIn = T.marks.climaxIn ?? Infinity;
  const cOut = T.marks.climaxOut ?? -Infinity;
  const climax = Math.max(0, Math.min(1, (t - cIn) / 0.3, (cOut - t) / 0.3));
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, climax * 0.6, idx, 1.3);
  // the loop: in the last 0.3 s the camera settles on exactly the pose of frame 0
  const camHome = camera(0, 0, fps, T.shots[0].start, T.shots[0].end, T.fx, 0, 0, 1.3);
  const w = shot.kind === 'loop' ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const cam = { x: cam0.x + (camHome.x - cam0.x) * w, y: cam0.y + (camHome.y - cam0.y) * w, scale: cam0.scale + (camHome.scale - cam0.scale) * w, rot: cam0.rot + (camHome.rot - cam0.rot) * w };
  const fGrid = shot.kind === 'loop' && t >= T.duration - 1.5 / fps ? 0 : f;
  // the series pill: after the first 2 s of the hook, not on the closing card (which carries its own)
  const pillK = shot.kind === 'loop' ? 0 : springAt(f, fps, 2.0, HARD);
  return (
    <AbsoluteFill style={{ background: P3.bg, filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      <Audio src={staticFile('fallo03/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <View {...props} />
        {noGrid ? null : <GridOverlay f={fGrid} color={P3.blue} />}
      </AbsoluteFill>
      <ClimaxOverlay t={t} level={climax} />
      {noFinish ? null : <Finish f={f} />}
      {pillK > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 262,
            transform: `translateX(-50%) scale(${interpolate(pillK, [0, 1], [0.6, 1], { extrapolateRight: 'clamp' })})`,
            opacity: Math.min(1, pillK * 1.5),
            padding: '10px 34px',
            borderRadius: 999,
            background: 'rgba(7,9,15,0.9)',
            border: '4px solid #EF4444',
            color: '#FACC15',
            fontFamily: HEAVY,
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 5,
            whiteSpace: 'nowrap',
          }}
        >
          FALLO #03
        </div>
      ) : null}
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};
