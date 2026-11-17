import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { HARD, HEAVY, lin, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { AppGlyph, C4, clamp, num, OutText } from '../components/fallo04/parts';
import { BOARD, TitleRoof, WHATIF_SHOTS_04 } from './WhatIfShots04';

// Fallo #04, the Facebook, Instagram and WhatsApp outage of 4 October 2021, in the direction of "¿Sabías que…? #01": the What If
// engine's dusk light, a new shot size on every cut, an edit layer of bursts and stickers, and the loop into frame 0. The voice is
// the recorded one. Times come from timeline.json (tools/mkplan04wi.py, then EPISODE=fallo04wi tools/therac25_build.py).

type Shot = { id: string; kind: string; variant?: string; start: number; end: number };
type Timeline = { fps: number; width: number; height: number; duration: number; shots: Shot[]; fx: FxEvent[]; marks: Record<string, number>; visualLead?: Record<string, number>; subs: SubChunk[] };
export const FALLO04WI: Timeline = timelineJson as Timeline;

const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** The series close: the door of the Fallos. #04 is shut; the next one, #05, waits behind a padlock; the button follows. */
const SeriesDoor: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const serie = num(mark('serie'), 0.1);
  const next = num(mark('siguiente'), 1.2);
  const doler = num(mark('doler'), 2.4);
  const tapAt = num(mark('tap'), doler + 0.45);
  const door = springAt(f, fps, Math.max(0, serie - 0.05), { stiffness: 140, damping: 18, mass: 0.8 });
  const doorY = 1920 - 1240 * Math.min(1, door);
  const five = t >= next - 0.05;
  const flip = clamp((t - (next - 0.05)) / 0.25);
  const follow = t >= doler - 0.1;
  const tap = t >= tapAt;
  const hand = clamp((t - tapAt + 0.45) / 0.35);
  const press = tap && t < tapAt + 0.15;
  const shake = five && !follow ? 5 * Math.sin(t * 40) : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s4dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1B45" />
            <stop offset="60%" stopColor="#7A3A5A" />
            <stop offset="100%" stopColor="#E0864A" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#s4dusk)" />
        <circle cx={540} cy={1500} r={260 + 10 * Math.sin(t * 2)} fill="#FDBA74" opacity={0.5} />
      </svg>
      <Over>
        {five ? (
          <g>
            <g transform={`translate(540 ${330 - 30 * (1 - flip)})`} opacity={flip}>
              <OutText x={0} y={0} size={70} fill="#FDE7C8" text="EL SIGUIENTE" stroke={10} />
            </g>
            <g transform={`translate(540 ${430 - 30 * (1 - flip)})`} opacity={flip}>
              <OutText x={0} y={0} size={70} fill="#FDBA74" text="TE VA A DOLER MÁS" stroke={12} />
            </g>
          </g>
        ) : null}
        <g transform={`translate(${shake} ${doorY})`}>
          <rect x={40} y={0} width={1000} height={1300} rx={60} fill="#050A14" stroke={C4.red} strokeWidth={10} />
          <g transform="translate(210 120) scale(0.42)">
            <rect x={-108} y={-96} width={240} height={240} rx={46} fill="#000" />
            <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={8} />
            <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={5} />
            <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
              NO
            </text>
          </g>
          <OutText x={630} y={150} size={80} fill="#FF2A2A" text="NO PRESIONES" stroke={12} />
          {/* #04, shut: the three apps dark; then #05 behind a padlock */}
          <g opacity={1 - flip}>
            <OutText x={540} y={330} size={130} fill="#FACC15" text="FALLO #04" stroke={16} />
            {(['wa', 'ig', 'fb'] as const).map((k, i) => (
              <g key={k} transform={`translate(${340 + i * 200} 560)`}>
                <AppGlyph kind={k} x={0} y={0} r={62} on={0} />
              </g>
            ))}
            <text x={540} y={720} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={36} fill="#FDE7C8">
              6 HORAS · 1 COMANDO
            </text>
          </g>
          <g opacity={flip} transform={`translate(0 ${20 * (1 - flip)})`}>
            <OutText x={540} y={330} size={130} fill="#FACC15" text="FALLO #05" stroke={16} />
            <g transform="translate(540 590)">
              <path d="M -70 -30 L -70 -90 A 70 70 0 0 1 70 -90 L 70 -30" fill="none" stroke="#CBD5E1" strokeWidth={26} strokeLinecap="round" />
              <rect x={-120} y={-34} width={240} height={190} rx={30} fill="#FACC15" stroke="#000" strokeWidth={8} />
              <circle cx={0} cy={40} r={22} fill="#050A14" />
              <rect x={-9} y={44} width={18} height={50} rx={8} fill="#050A14" />
              <circle cx={0} cy={40} r={150} fill="none" stroke="#EF4444" strokeWidth={5} opacity={0.3 + 0.2 * Math.sin(t * 6)} />
            </g>
            <text x={540} y={800} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={36} fill="#FDE7C8">
              ???
            </text>
          </g>
          {follow ? (
            <g transform={`translate(540 940) scale(${press ? 0.92 : (!tap ? 1.06 : 1) + 0.04 * Math.sin(t * 7)})`}>
              {tap && t < tapAt + 0.5 ? <rect x={-330 - 80 * (t - tapAt)} y={-58 - 40 * (t - tapAt)} width={660 + 160 * (t - tapAt)} height={116 + 80 * (t - tapAt)} rx={80} fill="none" stroke="#FACC15" strokeWidth={8} opacity={1 - (t - tapAt) / 0.5} /> : null}
              <rect x={-330} y={-58} width={660} height={116} rx={58} fill={tap ? '#FFFFFF' : '#F25F5C'} stroke="#000" strokeWidth={8} />
              <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={tap ? '#000' : '#FFFFFF'}>
                {tap ? 'SIGUIENDO ✓' : '+ SEGUIR'}
              </text>
            </g>
          ) : null}
          {follow ? (
            <text x={540} y={1060} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={32} fill="#FDE7C8" opacity={clamp((t - doler) / 0.3)}>
              SÍGUEME PARA EL FALLO #05
            </text>
          ) : null}
          {hand > 0 ? (
            <g transform={`translate(${760 - 150 * hand} ${1260 - 240 * hand + (press ? 14 : 0)}) rotate(-25)`}>
              <rect x={-44} y={0} width={88} height={260} rx={44} fill="#F2D3B5" stroke="#111" strokeWidth={6} />
              <rect x={-60} y={200} width={120} height={160} rx={40} fill="#2E2B3D" stroke="#111" strokeWidth={6} />
            </g>
          ) : null}
        </g>
      </Over>
    </AbsoluteFill>
  );
};

const SHOTS: Record<string, React.FC<ShotProps>> = { ...WHATIF_SHOTS_04, series: SeriesDoor };

/** The edit's own layer over every shot: comic bursts on the hits, stickers, and question cards that open each part. */
const BURSTS = ['horas', 'fue', 'comando', 'denegado', 'puerta', 'comando2', 'doler'];
const STICKERS: { mark: string; text: string; x: number; y: number; rot: number; bg: string; ink: string; dur: number }[] = [
  { mark: 'tres', text: '¡PUF!', x: 830, y: 900, rot: 10, bg: '#FDE047', ink: '#1E293B', dur: 1.0 },
  { mark: 'pedidos', text: '¡CERO!', x: 820, y: 960, rot: -8, bg: '#F25F5C', ink: '#FFFFFF', dur: 1.1 },
  { mark: 'puerta', text: '¡NO ABRE!', x: 800, y: 900, rot: 10, bg: '#F25F5C', ink: '#FFFFFF', dur: 1.2 },
  { mark: 'share', text: '¡POR FIN!', x: 250, y: 900, rot: -8, bg: '#14B8A6', ink: '#FFFFFF', dur: 1.2 },
];
const QUESTIONS: { at: string; text: string; dur: number }[] = [
  { at: 'hackeo', text: '¿FUE UN HACKEO?', dur: 1.3 },
  { at: 'siquiera', text: '¿Y SUS INGENIEROS?', dur: 1.3 },
];
const Edits: React.FC<{ t: number; f: number; fps: number; M: (n: string) => number }> = ({ t, f, fps, M }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {BURSTS.map((n) => {
        const k = (t - M(n)) / 0.35;
        if (k < 0 || k > 1) return null;
        return (
          <g key={n} opacity={1 - k}>
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2 + i;
              const r0 = 380 + 300 * k;
              return <line key={i} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 260)} y2={900 + Math.sin(a) * (r0 + 260)} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      {STICKERS.map((st) => {
        const at = M(st.mark);
        if (t < at || t > at + st.dur) return null;
        const k = springAt(f, fps, at, { stiffness: 260, damping: 11, mass: 0.6 });
        const out = Math.min(1, (at + st.dur - t) / 0.15);
        const w = st.text.length * 38 + 80;
        return (
          <g key={st.mark} transform={`translate(${st.x} ${st.y}) rotate(${st.rot + 4 * Math.sin(t * 9)}) scale(${(0.3 + 0.7 * Math.min(1.15, k)) * out})`}>
            <rect x={-w / 2} y={-58} width={w} height={116} rx={24} fill={st.bg} stroke="#1E293B" strokeWidth={7} />
            <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill={st.ink}>
              {st.text}
            </text>
          </g>
        );
      })}
      {QUESTIONS.map((q) => {
        const at = M(q.at) - 0.05;
        if (t < at || t > at + q.dur) return null;
        const k = springAt(f, fps, at, HARD);
        const out = Math.min(1, (at + q.dur - t) / 0.15);
        const w = q.text.length * 34 + 90;
        return (
          <g key={q.at} transform={`translate(540 ${300 - 40 * (1 - Math.min(1, k))})`} opacity={Math.min(1, k * 1.6) * out}>
            <rect x={-w / 2} y={-56} width={w} height={112} rx={56} fill="#1E293B" />
            <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#FDE047">
              {q.text}
            </text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

/** The one ask of the film (the share), over the end of the messages arriving. */
const ShareCta: React.FC<{ t: number; f: number; fps: number; from: number; to: number; y?: number }> = ({ t, f, fps, from, to, y = 1180 }) => {
  if (!(t >= from && t < to)) return null;
  const k = springAt(f, fps, from, HARD);
  const out = Math.max(0, Math.min(1, (to - t) / 0.2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 ${y + 260 * (1 - Math.min(1, k))}) rotate(${-6 * (1 - Math.min(1, k))}) scale(${(0.6 + 0.4 * Math.min(1.08, k)) * (1 + 0.025 * Math.sin(t * 7))})`} opacity={Math.min(1, k * 1.6) * out}>
          <rect x={-490} y={-66} width={980} height={132} rx={36} fill="#FFE600" stroke="#000" strokeWidth={8} />
          <path d="M -452 -24 L -392 0 L -452 24 L -440 0 Z" fill="#000" />
          <text x={36} y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            MÁNDASELO A QUIEN
          </text>
          <text x={36} y={42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#000" textLength={760} lengthAdjust="spacingAndGlyphs">
            SIEMPRE TE PREGUNTA SI YA LLEGASTE
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Fallo04WI: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = FALLO04WI;
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
  const last = idx === T.shots.length - 1;
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, 0, idx, 0.95);
  const w = last ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const lt = t - shot.start;
  const kb = idx === 0 ? 0 : Math.min(1, lt / Math.max(0.5, shot.end - shot.start)) * (1 - w);
  const side = idx % 2 ? 1 : -1;
  const swipe = idx > 0 ? Math.exp(-lt / 0.07) : 0;
  const cam = { x: cam0.x * (1 - w) + side * 22 * kb + side * 260 * swipe, y: cam0.y * (1 - w) - 12 * kb, scale: (1 + (cam0.scale - 1) * (1 - w)) * (1 + 0.05 * kb), rot: cam0.rot * (1 - w) };
  const M = (n: string) => T.marks[n] ?? Infinity;
  // glitch: the colours split for a moment when the apps disappear and when the badge is refused
  const glitch = ['tres', 'denegado'].some((n) => t >= M(n) - 0.02 && t < M(n) + 0.22);
  const filters = [swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : '', glitch ? `drop-shadow(${(8 + 6 * Math.sin(f)).toFixed(0)}px 0 0 rgba(255,0,60,0.65)) drop-shadow(-8px 0 0 rgba(0,220,255,0.65))` : ''].join(' ').trim();
  // the series pill: from frame 0; the close carries its own; it comes back for the loop hand-off
  const onSeries = shot.kind === 'series';
  const pillK = onSeries ? w : 1;
  const restored = M('restored');
  const done = !onSeries && t >= restored;
  const secs = onSeries ? 0 : 6 * 3600 * Math.min(1, t / restored);
  const clock = `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
  const dotOn = Math.floor(t * 2) % 2 === 0;
  const nameOn = idx === 0 || onSeries;
  return (
    <AbsoluteFill style={{ background: '#1B1224' }}>
      <Audio src={staticFile('fallo04wi/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: filters || undefined }}>
        <View {...props} />
      </AbsoluteFill>
      {w > 0 ? (
        <AbsoluteFill style={{ opacity: w }}>
          <TitleRoof t={0} f={0} fps={fps} dur={2} mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
      <Finish f={f} />
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
          <svg width={50} height={50} viewBox="-125 -125 250 250" style={{ display: 'block', marginLeft: -14 }}>
            <rect x={-120} y={-120} width={240} height={240} rx={46} fill="#FFF" stroke="#000" strokeWidth={10} />
            <rect x={-96} y={-96} width={192} height={192} rx={30} fill="#FF2A2A" stroke="#000" strokeWidth={6} />
            <text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={122} fill="#F8FAFC" stroke="#460004" strokeWidth={9} paintOrder="stroke">
              NO
            </text>
          </svg>
          {nameOn ? <span>FALLO #04</span> : null}
          <span style={{ width: 14, height: 14, borderRadius: 7, background: done ? '#22C55E' : '#EF4444', opacity: done || dotOn ? 1 : 0.3 }} />
          <span style={{ color: done ? '#4ADE80' : '#F8FAFC', fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>{done ? 'RESTABLECIDO' : clock}</span>
        </div>
      ) : null}
      {/* the beat after "...no abrían la puerta": the cause lands, in the caption band, until the next line */}
      {(() => {
        const at = (T.marks.puerta ?? Infinity) + 0.5;
        const until = (T.marks.todo ?? -Infinity) - 0.15;
        if (t < at || t > until) return null;
        const k = springAt(f, fps, at, HARD);
        return (
          <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg width={1080} height={1920} viewBox="0 0 1080 1920">
              <g transform={`translate(540 1500) scale(${0.7 + 0.3 * Math.min(1.06, k)})`} opacity={Math.min(1, k * 1.6, (until - t) / 0.12)}>
                <OutText x={0} y={0} size={62} fill="#FFFFFF" text="SIN ENTRAR," stroke={12} />
                <OutText x={0} y={80} size={58} fill="#FACC15" text="NADIE PODÍA ARREGLARLO" stroke={12} />
              </g>
            </svg>
          </AbsoluteFill>
        );
      })()}
      <Edits t={t} f={f} fps={fps} M={M} />
      {w > 0.5 || onSeries ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
      <ShareCta t={t} f={f} fps={fps} from={T.marks.ctaIn ?? Infinity} to={T.marks.ctaOut ?? -Infinity} />
    </AbsoluteFill>
  );
};

/** The storyboard: frame n is shot n, at a moment where everything in it is on screen. */
export const Fallo04WIBoard: React.FC = () => {
  const f = useCurrentFrame();
  const list: [React.FC<ShotProps>, string | undefined, number, Record<string, number>][] = [...BOARD, [SeriesDoor, undefined, 3.2, { serie: 0.1, siguiente: 1.0, doler: 2.2, tap: 2.7 }]];
  const [Shot, variant, t, m] = list[Math.min(list.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#1B1224' }}>
      <Shot t={t} f={Math.round(t * 30)} fps={30} dur={8} variant={variant} mark={(n) => m[n] ?? Number.NaN} />
    </AbsoluteFill>
  );
};
export const FALLO04WI_SHOTS = BOARD.length + 1;
