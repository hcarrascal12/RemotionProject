/**
 * No Presiones · Sin resolver · Caso Nº 02 · Satoshi Nakamoto — thumbnail, same "crypto-forensic terminal" identity
 * as the video (ElDev02.tsx): carbon black, Bitcoin amber + terminal cyan, Inter Black / JetBrains Mono, status bar.
 * One still frame, no motion needed — rendered with `remotion still`.
 */
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { COL, HEAD, MONO } from './theme';

const Grid: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
    <g stroke="#9FB3C8" strokeWidth={1}>
      {Array.from({ length: 24 }, (_, i) => {
        const x = (i - 6) * 120;
        return <line key={`a${i}`} x1={x} y1={0} x2={x + h * 1.2} y2={h} />;
      })}
      {Array.from({ length: 24 }, (_, i) => {
        const x = (i - 6) * 120 + w;
        return <line key={`b${i}`} x1={x} y1={0} x2={x - h * 1.2} y2={h} />;
      })}
    </g>
  </svg>
);

const StatusBar: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: 'absolute', left: 48, top: 40, width: w - 96, height: 36, display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${COL.border}`, fontFamily: MONO, fontWeight: 500, fontSize: 18, color: '#C9D2DE', letterSpacing: 1 }}>
    <div style={{ width: 10, height: 10, borderRadius: 5, background: COL.amber, boxShadow: `0 0 10px ${COL.amber}` }} />
    <span>SYS://NO_PRESIONES</span>
    <span style={{ color: COL.muted }}>•</span>
    <span style={{ color: COL.amber }}>SIN_RESOLVER_02</span>
  </div>
);

/** 1280x720 — YouTube / horizontal thumbnail. */
export const SatoshiThumbWide: React.FC = () => {
  const W = 1280, H = 720;
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Grid w={W} h={H} />
      {/* the face, cropped tight, lit from the right so the left half stays dark for the text */}
      <div style={{ position: 'absolute', left: 560, top: -60, width: 760, height: 840 }}>
        <Img src={staticFile('cicada01/s2-face2.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '38% 25%', filter: 'grayscale(1) contrast(1.3) brightness(0.85)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(7,8,10,1) 0%, rgba(7,8,10,0) 42%)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(247,147,26,0.55) 0%, rgba(247,147,26,0) 30%, rgba(0,240,255,0) 70%, rgba(0,240,255,0.35) 100%)', mixBlendMode: 'overlay' }} />
        {/* censor bar over the eyes (face at cover 760x840, 38%/25% focal point ≈ eye line here) */}
        <div style={{ position: 'absolute', left: 215, top: 300, width: 330, height: 86, background: '#000', boxShadow: '0 0 0 3px #000, 0 14px 30px rgba(0,0,0,0.7)' }} />
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, rgba(7,8,10,0.55) 0%, rgba(7,8,10,0) 60%)' }} />
      <StatusBar w={W} />
      {/* IDENTIDAD: DESCONOCIDA tag */}
      <div style={{ position: 'absolute', left: 48, top: 120, padding: '8px 18px', border: `2px solid ${COL.cyan}`, borderRadius: 999, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: COL.cyan, letterSpacing: 2, boxShadow: `0 0 20px rgba(0,240,255,0.35)` }}>
        IDENTIDAD: DESCONOCIDA
      </div>
      <div style={{ position: 'absolute', left: 48, top: 220, width: 620 }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 92, lineHeight: 0.98, letterSpacing: '-0.03em', textTransform: 'uppercase', color: COL.white, textShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>
          Inventó<br />Bitcoin
        </div>
        <div style={{ marginTop: 18, fontFamily: HEAD, fontWeight: 900, fontSize: 68, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', color: COL.amber, textShadow: '0 8px 24px rgba(0,0,0,0.9)', filter: 'drop-shadow(0 0 20px rgba(247,147,26,0.5))' }}>
          ¿Quién es?
        </div>
      </div>
      <div style={{ position: 'absolute', left: 48, bottom: 36, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: COL.muted, letterSpacing: 1 }}>
        SATOSHI NAKAMOTO · SIN RESOLVER
      </div>
    </AbsoluteFill>
  );
};

/** 1080x1920 — Instagram / TikTok / Shorts cover (same composition, vertical crop). */
export const SatoshiThumbTall: React.FC = () => {
  const W = 1080, H = 1920;
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Grid w={W} h={H} />
      <div style={{ position: 'absolute', left: 0, top: 120, width: W, height: 1150 }}>
        <Img src={staticFile('cicada01/s2-face2.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%', filter: 'grayscale(1) contrast(1.3) brightness(0.85)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(7,8,10,0.15) 0%, rgba(7,8,10,0) 35%, rgba(7,8,10,0.55) 78%, rgba(7,8,10,0.97) 100%)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(160deg, rgba(247,147,26,0.5) 0%, rgba(247,147,26,0.1) 55%, rgba(0,240,255,0.14) 100%)', mixBlendMode: 'soft-light' }} />
        <div style={{ position: 'absolute', left: 325, top: 445, width: 430, height: 118, background: '#000', boxShadow: '0 0 0 3px #000, 0 18px 40px rgba(0,0,0,0.7)' }} />
      </div>
      <StatusBar w={W} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '10px 22px', border: `2px solid ${COL.cyan}`, borderRadius: 999, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: COL.cyan, letterSpacing: 2, boxShadow: '0 0 20px rgba(0,240,255,0.35)' }}>
          IDENTIDAD: DESCONOCIDA
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center' }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 112, lineHeight: 0.98, letterSpacing: '-0.03em', textTransform: 'uppercase', color: COL.white, textShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>
          Inventó Bitcoin
        </div>
        <div style={{ marginTop: 24, fontFamily: HEAD, fontWeight: 900, fontSize: 88, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', color: COL.amber, textShadow: '0 8px 24px rgba(0,0,0,0.9)', filter: 'drop-shadow(0 0 22px rgba(247,147,26,0.5))' }}>
          ¿Quién es?
        </div>
        <div style={{ marginTop: 40, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: COL.muted, letterSpacing: 1.5 }}>
          SATOSHI NAKAMOTO · SIN RESOLVER
        </div>
      </div>
    </AbsoluteFill>
  );
};
