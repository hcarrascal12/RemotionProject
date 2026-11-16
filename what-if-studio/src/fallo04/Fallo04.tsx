import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { HARD, HEAVY, lin, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, ClimaxOverlay, Finish, FxEvent, GridOverlay, inverted } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { HookScene } from '../components/fallo04/HookScene';
import { CommandScene, DoorScene } from '../components/fallo04/StoryScenes';
import { BlameScene, KeyScene, LifeScene, TownScene } from '../components/fallo04/LifeScenes';
import { AppGlyph } from '../components/fallo04/parts';
import { CloseScene, CtaScene } from '../components/fallo04/CtaScene';
import { P3 } from '../components/fallo04/parts';

// Fallo #04, the Facebook, Instagram and WhatsApp outage of 4 October 2021: a 29-30 s vertical short at 30 fps, in the series'
// format (the What If engine, Pip, kinetic captions, the loop into frame 0). Every time in here comes from timeline.json, which
// tools/therac25_build.py (EPISODE=fallo04) writes from plan.json (tools/mkplan04.py) together with the audio, so picture and
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

export const FALLO04: Timeline = timelineJson as Timeline;

const fr = (name: string, plus = 0) => Math.round(((FALLO04.marks[name] ?? 0) + plus) * FALLO04.fps);

/**
 * SFX cue sheet (frames at 30 fps, from the voice's own word times): the map for the sound designer. The mix the build writes
 * already contains all of these (plan.json "sfx"); this is for laying them by hand in an editor.
 */
export const SFX_CUES = {
  clockTicks: 0, // accelerating ticks: the clock races 0:00 -> 6:00 in the first 45 frames
  clockHit: 45, // the clock lands on 6:00 (subtle impact)
  bubblesOff: [fr('hackeo', -0.35), fr('hackeo', -0.1), fr('hackeo', 0.15)], // the three bubbles go dark (pops)
  noHack: fr('hackeo'), // NO ERA UN HACKEO stamp
  wifiOk: fr('internet'), // the home wifi blip
  typing: fr('comando'), // the command typing
  switchOff: fr('apago'), // the master switch (mechanical)
  appsOff: [fr('apago', 0.14), fr('apago', 0.3), fr('tres', -0.05)], // the three apps die (pops)
  auditFail: fr('fallo'), // the barrier breaks (short glitch)
  linesCut: fr('entre'), // the lines between the servers snap (glitch, sparks)
  offTheMap: fr('borro'), // the apps vanish from the map
  accessDenied: fr('entrar'), // ACCESO DENEGADO (buzz)
  delivered: fr('abrir', 0.25), // the first bubble goes green (notification)
  riser: Math.round((FALLO04.duration - 1.8) * FALLO04.fps), // the loop: a riser into the hit of frame 0
};

/**
 * The one ask of the film, at the close (after the question, over the final glitch): a yellow pill in the middle of the
 * picture, from ctaIn to ctaOut, gone before the loop hands over to frame 0.
 */
const ShareCta: React.FC<{ t: number; f: number; fps: number; from: number; to: number; y?: number }> = ({ t, f, fps, from, to, y = 780 }) => {
  if (!(t >= from && t < to)) return null;
  const k = springAt(f, fps, from, HARD);
  const out = Math.max(0, Math.min(1, (to - t) / 0.2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 ${y}) scale(${(0.6 + 0.4 * Math.min(1.08, k)) * (1 + 0.025 * Math.sin(t * 7))})`} opacity={Math.min(1, k * 1.6) * out}>
          <rect x={-490} y={-66} width={980} height={132} rx={36} fill="#FFE600" stroke="#000" strokeWidth={8} />
          <path d="M -452 -24 L -392 0 L -452 24 L -440 0 Z" fill="#000" />
          <text x={36} y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            MÁNDASELO A ALGUIEN
          </text>
          <text x={36} y={42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            QUE REINICIÓ EL ROUTER ESE DÍA
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * The follow ask, on the emotional peak ("ni siquiera podían entrar"), where the viewer decides whether to come back: a dark pill with a
 * yellow edge. No date and no topic are promised, only that the series goes on. The closing ask stays a single one (share).
 */
const FollowCta: React.FC<{ t: number; f: number; fps: number; from: number; to: number }> = ({ t, f, fps, from, to }) => {
  if (!(t >= from && t < to)) return null;
  const k = springAt(f, fps, from, HARD);
  const out = Math.max(0, Math.min(1, (to - t) / 0.2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 300) scale(${(0.7 + 0.3 * Math.min(1.08, k)) * 0.85 * (1 + 0.02 * Math.sin(t * 8))})`} opacity={Math.min(1, k * 1.6) * out}>
          <rect x={-340} y={-46} width={680} height={92} rx={46} fill="#050A14" stroke="#FFE600" strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#FFE600" textLength={580} lengthAdjust="spacingAndGlyphs">
            SÍGUEME PARA EL FALLO #05
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Command: React.FC<ShotProps> = (p) => (p.variant === 'key' ? <KeyScene {...p} /> : <CommandScene {...p} />);

const SHOTS: Record<string, React.FC<ShotProps>> = {
  hook: HookScene,
  life: LifeScene,
  blame: BlameScene,
  command: Command,
  town: TownScene,
  door: DoorScene,
  cta: CtaScene,
  loop: CloseScene,
};

/**
 * Phone notifications that fail, dropping from the top like the real ones did that day: the film's pattern breaks, each on a
 * beat of the voice, under the series pill and clear of the captions.
 */
const BANNERS: { mark: string; plus: number; app: 'wa' | 'ig' | 'fb'; title: string; body: string }[] = [
  { mark: 'nadie', plus: 0.05, app: 'wa', title: 'WhatsApp', body: 'No se pudo enviar el mensaje' },
  { mark: 'familias', plus: 0.2, app: 'ig', title: 'Instagram', body: 'No se pudo actualizar el feed' },
  { mark: 'tuinternet', plus: 0.0, app: 'fb', title: 'Facebook', body: 'Algo salió mal. Inténtalo de nuevo' },
];
const Banner: React.FC<{ t: number; f: number; fps: number; at: number; app: 'wa' | 'ig' | 'fb'; title: string; body: string }> = ({ t, f, fps, at, app, title, body }) => {
  const hold = 1.3;
  if (!(t >= at && t < at + hold + 0.3)) return null;
  const k = springAt(f, fps, at, { stiffness: 260, damping: 20, mass: 0.6 });
  const up = Math.max(0, Math.min(1, (t - at - hold) / 0.25));
  const y = -140 + (330 + 140) * Math.min(1, k) - 470 * up * up;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 ${y})`}>
          <rect x={-460} y={-62} width={920} height={124} rx={30} fill="#F1F5F9" opacity={0.97} stroke="#0B0B0B" strokeWidth={4} />
          <AppGlyph kind={app} x={-390} y={0} r={36} on={1} />
          <text x={-330} y={-12} fontFamily={HEAVY} fontWeight={900} fontSize={32} fill="#0B1220">
            {title}
          </text>
          <text x={-330} y={32} fontFamily={HEAVY} fontWeight={700} fontSize={30} fill="#B91C1C">
            {body}
          </text>
          <text x={430} y={-12} textAnchor="end" fontFamily={HEAVY} fontWeight={700} fontSize={24} fill="#64748B">
            ahora
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// fb: the Facebook cut. There the share ask is the one that moves reach, so it sits on the emotional peak (right after "ni
// siquiera podían entrar"), the follow chip is left out, and the close keeps the bare question.
export const Fallo04: React.FC<{ hideCaptions?: boolean; noGrid?: boolean; noFinish?: boolean; fb?: boolean }> = ({ hideCaptions = false, noGrid = false, noFinish = false, fb = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = FALLO04;
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
  // weather: from the command until the question card
  const cIn = T.marks.climaxIn ?? Infinity;
  const cOut = T.marks.climaxOut ?? -Infinity;
  const climax = Math.max(0, Math.min(1, (t - cIn) / 0.3, (cOut - t) / 0.3));
  // the units cards fill the width edge to edge: there the camera moves less, so nothing is cropped
  const wide = shot.kind === 'command' || shot.kind === 'cta' || shot.kind === 'loop' || (shot.kind === 'hook' && shot.variant === 'loss');
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
  // every cut swipes in from the side, like changing apps (none on frame 0 and none into the loop card)
  const swipe = idx > 0 && shot.kind !== 'loop' ? Math.exp(-lt / 0.07) : 0;
  const swipeX = (idx % 2 ? 1 : -1) * 260 * swipe;
  const cam = { x: cam0.x + (camHome.x - cam0.x) * w + dx + kbX + swipeX, y: cam0.y + (camHome.y - cam0.y) * w + dy + kbY, scale: (cam0.scale + (camHome.scale - cam0.scale) * w) * ds * kbScale, rot: cam0.rot + (camHome.rot - cam0.rot) * w };
  // floating specks over the whole film: off on frame 0 and on the loop's last frame
  const speck = Math.min(1, t / 0.4) * drift;
  const fGrid = shot.kind === 'loop' && t >= T.duration - 1.5 / fps ? 0 : f;
  // the series pill: at the top from frame 0; on the closing card (which carries its own) it only comes back for the loop hand-off
  const pillK = shot.kind === 'loop' ? w : 1;
  // the timer: 0:00:00 on frame 0, time-lapse to 6:00:00 when the first bubble turns green ("restored"), then RESTABLECIDO;
  // on the loop hand-off it shows frame 0's 0:00:00 again
  const restored = T.marks.restored ?? T.duration - 3;
  const done = shot.kind !== 'loop' && t >= restored;
  const secs = shot.kind === 'loop' ? 0 : 6 * 3600 * Math.min(1, t / restored);
  const clock = `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
  const dotOn = Math.floor(t * 2) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: P3.bg, filter: inverted(f, fps, T.fx) ? 'invert(1)' : undefined }}>
      <Audio src={staticFile('fallo04/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : undefined }}>
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
            border: `5px solid ${done ? '#22C55E' : '#EF4444'}`,
            color: '#FACC15',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: HEAVY,
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 5,
            whiteSpace: 'nowrap',
          }}
        >
          <span>FALLO #04</span>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: done ? '#22C55E' : '#EF4444', opacity: done || dotOn ? 1 : 0.3 }} />
          <span style={{ color: done ? '#4ADE80' : '#F8FAFC', fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>{done ? 'RESTABLECIDO' : clock}</span>
        </div>
      ) : null}
      {hideCaptions ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
      {BANNERS.map((b) => (
        <Banner key={b.title} t={t} f={f} fps={fps} at={(T.marks[b.mark] ?? Infinity) + b.plus} app={b.app} title={b.title} body={b.body} />
      ))}
      {fb ? null : <FollowCta t={t} f={f} fps={fps} from={T.marks.followIn ?? Infinity} to={T.marks.followOut ?? -Infinity} />}
      {fb ? (
        <ShareCta t={t} f={f} fps={fps} from={T.marks.followIn ?? Infinity} to={T.marks.followOut ?? -Infinity} y={1150} />
      ) : (
        <ShareCta t={t} f={f} fps={fps} from={T.marks.ctaIn ?? Infinity} to={T.marks.ctaOut ?? -Infinity} />
      )}
    </AbsoluteFill>
  );
};
