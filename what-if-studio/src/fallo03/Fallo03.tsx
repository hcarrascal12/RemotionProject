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
import { NudgeScene } from '../components/fallo03/NudgeScene';
import { CloseScene } from '../components/fallo03/CloseScene';
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

/**
 * The one ask of the film, on the beat that gets shared (the pound is not the newton): a yellow pill in the upper part of the
 * picture, held for the second half of the line and gone before the question.
 */
const ShareCta: React.FC<{ t: number; f: number; fps: number; from: number; to: number }> = ({ t, f, fps, from, to }) => {
  if (!(t >= from && t < to)) return null;
  const k = springAt(f, fps, from, HARD);
  const out = Math.max(0, Math.min(1, (to - t) / 0.2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 322) scale(${0.6 + 0.4 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6) * out}>
          <rect x={-490} y={-66} width={980} height={132} rx={36} fill="#FFE600" stroke="#000" strokeWidth={8} />
          <path d="M -452 -24 L -392 0 L -452 24 L -440 0 Z" fill="#000" />
          <text x={36} y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            MÁNDASELO A ALGUIEN
          </text>
          <text x={36} y={42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            QUE REVISA TODO DOS VECES
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS: Record<string, React.FC<ShotProps>> = {
  hook: HookScene,
  mission: MissionControlScene,
  units: UnitsMismatchScene,
  crash: AtmosphereCrashScene,
  aftermath: AftermathScene,
  nudge: NudgeScene,
  debate: DebateLoopScene,
  loop: CloseScene,
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
  // the units cards fill the width edge to edge: there the camera moves less, so nothing is cropped
  const wide = shot.kind === 'units' || shot.kind === 'debate' || shot.kind === 'loop' || (shot.kind === 'hook' && shot.variant === 'loss');
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, climax * 0.6, idx, wide ? 0.35 : 1.3);
  // the loop: in the last 0.3 s the camera settles on exactly the pose of frame 0
  const camHome = camera(0, 0, fps, T.shots[0].start, T.shots[0].end, T.fx, 0, 0, 0.35); // the same energy as the hook's own camera, so the last frame lands on frame 0's pose
  const w = shot.kind === 'loop' ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  // a slow drift on top of the cut camera, so no second is ever still; it is 0 on frame 0 and fades out into the loop
  const drift = 1 - w;
  const dx = 7 * Math.sin(t * 0.7) * drift;
  const dy = 5 * Math.sin(t * 0.53) * drift;
  const ds = 1 + 0.014 * Math.sin(t * 0.41) * drift;
  // every shot has its own slow move (Ken Burns): a push-in with a sideways glide, alternating direction shot to shot.
  // 0 on the first frame of every shot, so cuts stay clean; the first shot has its own zoom, so it is left alone.
  const lt = t - shot.start;
  const ld = Math.max(0.5, shot.end - shot.start);
  const kb = idx === 0 ? 0 : Math.min(1, lt / ld) * drift;
  const side = idx % 2 ? 1 : -1;
  const kbScale = 1 + (wide ? 0.02 : 0.06) * kb;
  const kbX = wide ? 0 : side * 26 * kb;
  const kbY = -14 * kb;
  const cam = { x: cam0.x + (camHome.x - cam0.x) * w + dx + kbX, y: cam0.y + (camHome.y - cam0.y) * w + dy + kbY, scale: (cam0.scale + (camHome.scale - cam0.scale) * w) * ds * kbScale, rot: cam0.rot + (camHome.rot - cam0.rot) * w };
  // floating specks over the whole film: off on frame 0 and on the loop's last frame
  const speck = Math.min(1, t / 0.4) * drift;
  const fGrid = shot.kind === 'loop' && t >= T.duration - 1.5 / fps ? 0 : f;
  // the series pill: at the top from frame 0; on the closing card (which carries its own) it only comes back for the loop hand-off
  const pillK = shot.kind === 'loop' ? w : 1;
  return (
    <AbsoluteFill style={{ background: P3.bg, filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      <Audio src={staticFile('fallo03/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <View {...props} />
        {noGrid ? null : <GridOverlay f={fGrid} color={P3.blue} />}
      </AbsoluteFill>
      {speck > 0.01 ? (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: speck }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            {Array.from({ length: 34 }, (_, i) => {
              const sp = 18 + (i % 7) * 9;
              const x = ((i * 157 + t * sp * (i % 2 ? 1 : -0.6)) % 1180 + 1180) % 1180 - 50;
              const y = ((i * 263 - t * sp * 1.4) % 2000 + 2000) % 2000 - 40;
              return <circle key={i} cx={x} cy={y} r={1.6 + (i % 4) * 0.9} fill={i % 5 === 0 ? '#FDBA74' : '#CFE8FF'} opacity={0.25 + 0.3 * Math.abs(Math.sin(t * 1.3 + i))} />;
            })}
            {/* a faint scan line sweeping down, like a telemetry screen */}
            <rect x={0} y={((t * 260) % 2300) - 200} width={1080} height={70} fill="#9FE8FF" opacity={0.035} />
          </svg>
        </AbsoluteFill>
      ) : null}
      <ClimaxOverlay t={t} level={climax} />
      {noFinish ? null : <Finish f={f} />}
      {pillK > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 140,
            transform: `translateX(-50%) scale(${interpolate(pillK, [0, 1], [0.92, 1], { extrapolateRight: 'clamp' })})`,
            opacity: Math.min(1, pillK * 1.5),
            padding: '8px 36px',
            borderRadius: 999,
            background: '#050A14',
            border: '5px solid #EF4444',
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
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
      <ShareCta t={t} f={f} fps={fps} from={(T.marks.cuatro2 ?? Infinity) - 0.1} to={T.marks.shareEnd ?? -Infinity} />
    </AbsoluteFill>
  );
};
