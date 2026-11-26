import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/fonts';

// Reel vertical para Facebook: "Transformando Mi Realidad" (CEI), despedida del año 2026.
// Fuente: public/cei/src.mp4 (480x864, sin audio, con marca de CapCut). Todo el texto va dentro de la zona segura de Reels
// (arriba ~170 px y abajo ~420 px los tapa la interfaz de Facebook).
loadFont({ family: 'CeiInter', url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
const FONT = "'CeiInter', 'Noto Color Emoji', sans-serif";
const FPS = 30;

type Clip = { s: number; d: number; mode: 'cover' | 'blur' };
// s = segundo de inicio en el video original, d = duración. 'blur' = toma con barras negras: se ajusta al ancho sobre fondo difuminado.
const CLIPS: Clip[] = [
  { s: 0.0, d: 0.9, mode: 'blur' }, // niña con sandía (gancho)
  { s: 1.0, d: 0.8, mode: 'blur' }, // niño con el pulgar arriba
  { s: 1.85, d: 0.9, mode: 'blur' }, // niña con su plato
  { s: 3.4, d: 2.0, mode: 'cover' }, // entrando al salón
  { s: 16.5, d: 2.0, mode: 'cover' }, // mesa servida
  { s: 25.5, d: 2.8, mode: 'cover' }, // niña abre su lonchera
  { s: 39.0, d: 2.0, mode: 'cover' }, // mesa completa
  { s: 42.4, d: 2.0, mode: 'cover' }, // plato de frutas
  { s: 51.2, d: 1.2, mode: 'blur' },
  { s: 54.0, d: 1.3, mode: 'blur' },
  { s: 55.3, d: 1.3, mode: 'blur' },
  { s: 56.2, d: 1.1, mode: 'blur' },
  { s: 58.0, d: 1.4, mode: 'blur' },
  { s: 59.4, d: 1.3, mode: 'blur' },
];
const CLIPS_END = CLIPS.reduce((a, c) => a + c.d, 0); // 21.0 s
const OUTRO = 3.5;
export const REEL = { fps: FPS, duration: CLIPS_END + OUTRO };

const W = 1080;
const H = 1920;
const SRC_W = 480;
const SRC_H = 864;

const Video: React.FC<{ left: number; top: number; k: number; start: number; blurPx?: number }> = ({ left, top, k, start, blurPx }) => (
  <OffthreadVideo
    src={staticFile('cei/src.mp4')}
    trimBefore={Math.round(start * FPS)}
    muted
    style={{ position: 'absolute', left, top, width: SRC_W * k, height: SRC_H * k, maxWidth: 'none', filter: blurPx ? `blur(${blurPx}px) brightness(0.75) saturate(1.2)` : undefined }}
  />
);

const ClipView: React.FC<{ clip: Clip; frames: number }> = ({ clip, frames }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [1.0, 1.07]);
  if (clip.mode === 'cover') {
    // Recorte desde y=52 para sacar la marca de CapCut (esquina superior izquierda).
    const cropY = 52;
    const cropH = SRC_H - cropY;
    const k = Math.max(W / SRC_W, H / cropH);
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 60%' }}>
          <Video left={(W - SRC_W * k) / 2} top={-cropY * k} k={k} start={clip.s} />
        </div>
      </AbsoluteFill>
    );
  }
  // Toma con barras negras: contenido útil = y 110..754 (480x644).
  const cropY = 110;
  const cropH = 644;
  const kb = H / cropH; // fondo: cubre toda la pantalla
  const kf = W / SRC_W; // frente: ajustado al ancho
  const fh = cropH * kf;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#111' }}>
      <Video left={(W - SRC_W * kb) / 2} top={-cropY * kb} k={kb} start={clip.s} blurPx={36} />
      <div style={{ position: 'absolute', left: 0, top: (H - fh) / 2, width: W, height: fh, overflow: 'hidden', transform: `scale(${zoom})`, transformOrigin: '50% 45%' }}>
        <Video left={0} top={-cropY * kf} k={kf} start={clip.s} />
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ from: number; to: number; y: number; lines: { t: string; hl?: boolean }[][]; size?: number }> = ({ from, to, y, lines, size = 84 }) => {
  const frame = useCurrentFrame();
  const f0 = Math.round(from * FPS);
  const f1 = Math.round(to * FPS);
  if (frame < f0 || frame >= f1) return null;
  const pop = spring({ frame: frame - f0, fps: FPS, config: { damping: 12, stiffness: 180 } });
  const out = interpolate(frame, [f1 - 5, f1], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', opacity: out, transform: `scale(${0.85 + 0.15 * pop}) translateY(${(1 - pop) * 30}px)` }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.12, color: '#fff', WebkitTextStroke: '10px rgba(20,20,40,0.9)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.5)' }}>
          {ln.map((w, j) => (
            <span key={j} style={{ color: w.hl ? '#FFD84A' : '#fff' }}>{w.t}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 48, top: 170, opacity: o, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 14px', borderRadius: 999, background: 'rgba(20,30,70,0.72)', border: '2px solid rgba(255,255,255,0.35)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, background: '#FFD84A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎒</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#fff' }}>Transformando Mi Realidad</div>
    </div>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 140 } });
  const pulse = 1 + 0.03 * Math.sin(frame / 5);
  const row = (d: number): React.CSSProperties => ({ opacity: p(d), transform: `translateY(${(1 - p(d)) * 40}px)` });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg,#1d3a8a 0%,#2f6fd6 55%,#4aa3f0 100%)', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#fff', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 700, height: 700, borderRadius: 350, background: 'rgba(255,216,74,0.18)' }} />
      <div style={{ position: 'absolute', bottom: 200, left: -250, width: 600, height: 600, borderRadius: 300, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ marginTop: -120, padding: '0 70px' }}>
        <div style={{ ...row(0), fontSize: 100, lineHeight: 1.05 }}>Sé parte de<br />estas sonrisas 💛</div>
        <div style={{ ...row(4), fontSize: 42, marginTop: 34, fontWeight: 900, opacity: 0.95 * p(4) }}>Tu aporte ayuda a transformar la vida<br />de niños, jóvenes y madres</div>
        <div style={{ ...row(8), width: 220, height: 8, borderRadius: 4, background: '#FFD84A', margin: '52px auto' }} />
        <div style={{ ...row(10), fontSize: 36, opacity: 0.9 * p(10) }}>Fundación</div>
        <div style={{ ...row(12), fontSize: 66, lineHeight: 1.1 }}>Transformando Mi Realidad</div>
        <div style={{ ...row(14), fontSize: 36, marginTop: 14, opacity: 0.9 * p(14) }}>Programa CEI · Creciendo con Propósito</div>
        <div style={{ ...row(18), marginTop: 60, display: 'inline-block', transform: `scale(${pulse}) translateY(${(1 - p(18)) * 40}px)`, background: '#25D366', color: '#fff', fontSize: 46, lineHeight: 1.2, padding: '24px 48px', borderRadius: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          Quiero ayudar<br />WhatsApp 319 325 8780
        </div>
        <div style={{ ...row(22), fontSize: 34, marginTop: 28, opacity: 0.9 * p(22) }}>Dona o comparte este video 🙏</div>
        <div style={{ ...row(28), fontSize: 34, marginTop: 14, color: '#FFD84A', opacity: p(28) }}>👉 Mira la Parte 2 en nuestra página</div>
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  let t = 0;
  const seqs = CLIPS.map((c, i) => {
    const from = Math.round(t * FPS);
    const frames = Math.round(c.d * FPS);
    t += c.d;
    return (
      <Sequence key={i} from={from} durationInFrames={frames}>
        <ClipView clip={c} frames={frames} />
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('cei/music.wav')} volume={0.9} />
      {seqs}
      <Sequence from={0} durationInFrames={Math.round(CLIPS_END * FPS)}>
        <Chip />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 62%,rgba(0,0,0,0.35) 100%)' }} />
        <Caption from={0.05} to={2.6} y={290} size={70} lines={[[{ t: 'Las mamás prepararon' }], [{ t: 'su ' }, { t: 'DESAYUNO FAVORITO', hl: true }], [{ t: '🥹' }]]} />
        <Caption from={2.7} to={6.5} y={1120} lines={[[{ t: 'Último día de clases' }], [{ t: '2026 ', hl: true }, { t: '🎒' }]]} />
        <Caption from={6.7} to={13.3} y={1120} lines={[[{ t: 'Cada lonchera trae' }], [{ t: 'un ' }, { t: 'abrazo de mamá', hl: true }, { t: ' 💛' }]]} />
        <Caption from={13.5} to={17.0} y={1120} lines={[[{ t: 'Y esta fue' }], [{ t: 'su reacción… ', hl: true }, { t: '🥹' }]]} />
        <Caption from={17.2} to={20.9} y={1120} lines={[[{ t: '¡Sus sonrisas' }], [{ t: 'lo dicen todo! ', hl: true }, { t: '😍' }]]} />
      </Sequence>
      <Sequence from={Math.round(CLIPS_END * FPS)}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
