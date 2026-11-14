import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { lin, ShotProps } from '../components/motion';
import { Bsod, BLUE, Strip } from '../components/fallo02/parts';
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

/**
 * SFX cue sheet (frames at 60 fps) for the sound designer. The mix the build writes already contains all of these (see
 * plan.json "sfx"); this list is the map, and the commented <Audio> lines show how to lay any clip by hand instead:
 *
 *   <Sequence from={SFX_CUES.subHit}><Audio src={staticFile('fallo02/sfx/sub-hit.wav')} volume={0.9} /></Sequence>
 *   <Sequence from={SFX_CUES.electricError}><Audio src={staticFile('fallo02/sfx/electric-error.wav')} volume={0.7} /></Sequence>
 *   {SFX_CUES.whooshes.map((from) => <Sequence key={from} from={from}><Audio src={staticFile('fallo02/sfx/whoosh.wav')} volume={0.4} /></Sequence>)}
 */
export const SFX_CUES = {
  subHit: 0,
  electricError: Math.round((FALLO02.marks.veintiuno ?? 0) * FALLO02.fps), // the read of entry #21 fails
  impactCut: Math.round((FALLO02.marks.cutImpact ?? 0) * FALLO02.fps), // the 4-frame cut into the blue-screen flood
  whooshes: FALLO02.shots.slice(1).map((sh) => Math.round(sh.start * FALLO02.fps) - 12),
};

/**
 * The climax cut: a 4-frame impact (white, black, white with colour fringes, black) and then the whole picture floods with the
 * blue screen (#0078D7) and red looping alerts for about half a second, receding to show the scene underneath.
 */
const ClimaxCut: React.FC<{ t: number; at: number; fps: number }> = ({ t, at, fps }) => {
  const d = (t - at) * fps;
  if (!Number.isFinite(at) || d < 0 || d > 4 + 0.62 * fps) return null;
  if (d < 4) {
    const k = Math.floor(d);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <rect width={1080} height={1920} fill={k % 2 === 0 ? '#FFF' : '#000'} />
          {k === 2 ? (
            <g>
              <rect x={20} width={1080} height={1920} fill="#FF2A2A" opacity={0.5} />
              <rect x={-20} width={1080} height={1920} fill="#3FD8FF" opacity={0.5} />
              {[0.2, 0.45, 0.7].map((y, i) => <rect key={i} x={i % 2 ? 40 : -40} y={y * 1920} width={1080} height={70} fill="#000" opacity={0.65} />)}
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    );
  }
  const u = (d - 4) / (0.58 * fps);
  const op = u < 0.62 ? 1 : Math.max(0, 1 - (u - 0.62) / 0.38);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: op }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={BLUE} />
        <g transform="translate(70 420) scale(1.55)">
          <Bsod x={0} y={0} w={600} h={600} t={t} pct={Math.min(100, 12 + 90 * u)} glitch={0.6} />
        </g>
        <Strip x={60} y={300} w={960} text="REINICIANDO... ERROR" t={t} size={60} />
        <Strip x={60} y={1230} w={960} text="BUCLE INFINITO" t={t + 0.2} size={60} />
      </svg>
    </AbsoluteFill>
  );
};

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
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, climax * 0.8, idx, 1.7); // Fallo #02's personality: a punchier, tilted camera
  // the loop: in the last 0.3 s the camera settles on exactly the pose of frame 0, so the last frame is frame 0
  const camHome = camera(0, 0, fps, T.shots[0].start, T.shots[0].end, T.fx, 0, 0, 1.7);
  const w = shot.kind === 'loop' ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const cam = { x: cam0.x + (camHome.x - cam0.x) * w, y: cam0.y + (camHome.y - cam0.y) * w, scale: cam0.scale + (camHome.scale - cam0.scale) * w, rot: cam0.rot + (camHome.rot - cam0.rot) * w };
  const fGrid = shot.kind === 'loop' && t >= T.duration - 1.5 / fps ? 0 : f;
  return (
    <AbsoluteFill style={{ background: '#050508', filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      {/* the mix: voice, sound design and the music, mastered to -14 LUFS by the build script */}
      <Audio src={staticFile('fallo02/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <View {...props} />
        {noGrid ? null : <GridOverlay f={fGrid} color={GRID_TINT[shot.kind] ?? '#9FE8FF'} />}
      </AbsoluteFill>
      {noClimax ? null : <ClimaxOverlay t={t} level={climax * 0.22} />}
      {noFinish ? null : <Finish f={f} />}
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
      <ClimaxCut t={t} at={T.marks.cutImpact ?? Number.NaN} fps={fps} />
    </AbsoluteFill>
  );
};
