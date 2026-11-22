/**
 * The eight scenes of Archivo 02, art-directed as cinema, not as screens: full-bleed plates with ken burns and rim light,
 * holographic objects floating in a dark lit space, depth blur, and only the "bomb" phrase on screen (3–6 words).
 * No windows, no terminals, no readable paragraphs.
 *
 * Every scene reads its LOCAL frame (0 = its first frame inside the TransitionSeries). Global frame = SCENES.<id>.from + local.
 * SFX comments give the GLOBAL frame; the same cues live in sfx.json, read by tools/eldev02_audio.py.
 */
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COL, HEAD, MONO, W, ci, rnd } from './theme';
import { Badge, Float3D, Mono, Plate, Punch } from './ui';

const microShake = (f: number, at: number, amp = 4, len = 6) => (f >= at && f < at + len ? { x: (f % 2 ? 1 : -1) * amp, y: (((f + 1) % 3) - 1) * amp } : { x: 0, y: 0 });

/* ------------------------------------------------------------------ */
/* The face, full-bleed (Budapest bust, CC BY-SA 4.0 Elekes Andor).    */
/* Shared by frame 0 and the last frame so the loop closes on itself.  */
/* ------------------------------------------------------------------ */
const EYES = { x: 330, y: 470, w: 420, h: 120 }; // eye line of s2-face2.jpg at cover 1080x1920, position 50% 30%
const FaceBleed: React.FC<{ scale: number; barX: number }> = ({ scale, barX }) => (
  <Plate file="cicada01/s2-face2.jpg" pos="50% 30%" scale={scale} origin={`50% ${EYES.y + EYES.h / 2}px`} bright={0.95}>
    <div style={{ position: 'absolute', left: EYES.x - 20 + barX, top: EYES.y, width: EYES.w + 40, height: EYES.h, background: '#000', boxShadow: '0 0 0 3px #000, 0 18px 40px rgba(0,0,0,0.7)' }} />
  </Plate>
);

/** Thin HUD callout floating next to something: a leader line and a mono label. No box. */
const Callout: React.FC<{ x: number; y: number; dx: number; dy: number; text: string; color?: string; k: number }> = ({ x, y, dx, dy, text, color = COL.cyan, k }) => (
  <>
    <svg width={W} height={1920} style={{ position: 'absolute', inset: 0, opacity: k }}>
      <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth={2} />
      <polyline points={`${x},${y} ${x + dx * 0.6},${y + dy} ${x + dx},${y + dy}`} fill="none" stroke={color} strokeWidth={2} strokeDasharray={400} strokeDashoffset={400 * (1 - k)} />
    </svg>
    <div style={{ position: 'absolute', left: dx > 0 ? x + dx + 10 : undefined, right: dx < 0 ? W - (x + dx) + 10 : undefined, top: y + dy - 16, fontFamily: MONO, fontWeight: 800, fontSize: 24, color, opacity: k, letterSpacing: 2, textShadow: `0 0 12px ${color}88`, whiteSpace: 'nowrap' }}>{text}</div>
  </>
);

/* ================================================================== */
/* 1 · HOOK  [0.0 – 3.0 s]                                             */
/* ================================================================== */
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Frame 0 is already moving: zoom-out 1.35 → 1.0 on a tight spring, then an aggressive push keeps going.
  // SFX: sub-bass-impact.wav @ f0 · digital-glitch-whoosh.wav @ f0
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 220 } });
  const scale = 1.35 - 0.35 * s + 0.0012 * f;
  // The censor bar slams across the eyes.
  // SFX: censor-slam.wav @ f5
  const bar = spring({ frame: f - 4, fps, config: { damping: 20, stiffness: 480 } });
  const barX = interpolate(bar, [0, 1], [-1300, 0]);
  // Voice (faster take): "Inventó Bitcoin" (f0) · "Y nadie sabe quién es." (f47) · "Nunca tocó su fortuna." (f103–131).
  // A sealed wallet appears right on "fortuna" and locks with a hit and a micro-shake. The actual 750,000+ BTC count
  // is saved for the wallet scene (~19 s), where the voice says the number for the first time — no repeat reveal here.
  // SFX: badge-pop.wav @ f115 · sub-bass-impact.wav @ f131
  const SEAL_START = 103;
  const HIT = 131;
  const sealIn = ci(f, SEAL_START - 4, SEAL_START + 10, 0, 1);
  const sealClose = ci(f, SEAL_START + 6, HIT, 0, 1, Easing.out(Easing.cubic));
  const sh = microShake(f, HIT);
  const glow = ci(f, HIT, HIT + 10, 1, 0.35);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <FaceBleed scale={scale} barX={barX} />
      <Callout x={760} y={EYES.y + 60} dx={150} dy={-150} text="SUJETO: ¿?" k={ci(f, 10, 20, 0, 1)} color={COL.cyan} />
      <Float3D x={540} y={1040} rx={14} ry={-6}>
        <div style={{ position: 'relative', width: 220, height: 220, opacity: sealIn }}>
          <svg width={220} height={220} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: `drop-shadow(0 0 ${14 + 16 * glow}px rgba(0,240,255,${0.5 + 0.3 * glow}))` }}>
            <circle cx={110} cy={110} r={92} fill="rgba(13,16,22,0.65)" stroke={COL.cyan} strokeWidth={4} />
            <circle cx={110} cy={110} r={92} fill="none" stroke={COL.cyan} strokeWidth={4} strokeDasharray={578} strokeDashoffset={578 * (1 - sealClose)} />
            <path d={`M 78 ${96 - 10 * sealClose} L 78 70 A 32 32 0 0 1 142 70 L 142 ${96 - 10 * sealClose}`} fill="none" stroke={COL.cyan} strokeWidth={10} strokeLinecap="round" />
            <rect x={66} y={92} width={88} height={64} rx={10} fill={COL.cyan} />
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 214, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 30, color: COL.cyan, whiteSpace: 'nowrap', opacity: f >= SEAL_START + 6 ? 1 : 0 }}>0 TX</div>
        </div>
      </Float3D>
      <Punch text="INVENTÓ|*BITCOIN*" at={0} y={1200} size={96} />
      <Punch text="*NADIE SABE|QUIÉN ES.*" at={47} y={1392} size={96} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2 · WHITEPAPER  [3.0 – 6.5 s] · 31 OCT 2008                         */
/* A physical sheet lying in the dark; only the name is in focus.      */
/* ================================================================== */
const SHEET = { w: 900, h: 598 }; // real first page 1200x798 (public domain) at 0.75
const NAME = { x: 381, y: 106, w: 162, h: 28 }; // "Satoshi Nakamoto" on the sheet
export const Whitepaper3D: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // SFX: digital-glitch-whoosh.wav @ f88 (cut in)
  const enter = spring({ frame: f, fps, config: { damping: 12, stiffness: 140 } });
  // The camera flies low over the sheet, then dives to the author's name.
  // SFX: digital-glitch-whoosh.wav @ f179 (dive)
  const dive = ci(f, 30, 60, 0, 1);
  const rx = interpolate(enter, [0, 1], [70, 48]) - 20 * dive;
  const rz = -12 + 6 * enter + 2 * Math.sin(f / 20);
  const scale = interpolate(dive, [0, 1], [1.0, 2.1]);
  const ty = interpolate(enter, [0, 1], [500, 0]) + interpolate(dive, [0, 1], [0, 330]);
  // SFX: highlighter-swipe.wav @ f171
  const hl = ci(f, 26, 34, 0, 1);
  // SFX: badge-pop.wav @ f197
  const badge = spring({ frame: f - 52, fps, config: { damping: 9, stiffness: 240 } });
  return (
    <AbsoluteFill>
      {/* amber key light pooling on the desk */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 45%, rgba(247,147,26,0.22) 0%, rgba(0,0,0,0) 70%)' }} />
      <AbsoluteFill style={{ perspective: 1100, perspectiveOrigin: '50% 30%' }}>
        <div style={{ position: 'absolute', left: (W - SHEET.w) / 2, top: 470, width: SHEET.w, height: SHEET.h, transformStyle: 'preserve-3d', transform: `translateY(${ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${scale})`, transformOrigin: `${NAME.x + NAME.w / 2}px ${NAME.y + NAME.h / 2}px` }}>
          {/* volumetric shadow under the sheet */}
          <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(-30px)', background: '#000', filter: 'blur(40px)', opacity: 0.85 }} />
          {/* the page out of focus… */}
          <Img src={staticFile('cicada01/s2-paper-real.jpg')} style={{ position: 'absolute', inset: 0, width: SHEET.w, height: SHEET.h, filter: 'blur(5px) brightness(0.8) sepia(0.25)', borderRadius: 4 }} />
          {/* …and a sharp band where the lens is focused: title, name, e-mail */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: SHEET.w, height: 190, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 70%, transparent 100%)' }}>
            <Img src={staticFile('cicada01/s2-paper-real.jpg')} style={{ width: SHEET.w, height: SHEET.h, filter: 'sepia(0.15) contrast(1.1)' }} />
          </div>
          <div style={{ position: 'absolute', left: NAME.x, top: NAME.y, width: NAME.w * hl, height: NAME.h, background: 'rgba(247,147,26,0.65)', mixBlendMode: 'multiply' }} />
          {/* rim light along the paper edges */}
          <div style={{ position: 'absolute', inset: -2, borderRadius: 6, boxShadow: '0 0 0 2px rgba(247,147,26,0.55), 0 0 40px rgba(247,147,26,0.45), 18px 0 50px rgba(0,240,255,0.25)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.4) 48%, rgba(255,255,255,0) 60%)', mixBlendMode: 'overlay', transform: `translateX(${-900 + 1800 * ci(f, 4, 40, 0, 1)}px)` }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(7,8,10,0) 54%, rgba(7,8,10,0.92) 64%, rgba(7,8,10,0.97) 100%)' }} />
      <Mono text="31 · OCT · 2008" y={330} at={2} size={34} color={COL.cyan} weight={800} />
      {f >= 52 ? <Badge text="¿PERSONA O GRUPO?" x={540} y={1050} k={badge} /> : null}
      <Punch text="LO FIRMÓ|*SATOSHI NAKAMOTO*" at={8} y={1240} size={100} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 · GENESIS BLOCK  [6.5 – 10.5 s] · 03 ENE 2009                     */
/* A hologram cube in a cloud of bytes; the bytes resolve into 4 words. */
/* ================================================================== */
const BOMB = 'SECOND BAILOUT FOR BANKS'; // from the real genesis coinbase: "...Chancellor on brink of second bailout for banks"
const toHex = (c: string) => c.charCodeAt(0).toString(16).padStart(2, '0');

const HoloCube: React.FC<{ size: number; rx: number; ry: number }> = ({ size, rx, ry }) => {
  const s = size / 2;
  const faces = [`translateZ(${s}px)`, `rotateY(180deg) translateZ(${s}px)`, `rotateY(90deg) translateZ(${s}px)`, `rotateY(-90deg) translateZ(${s}px)`, `rotateX(90deg) translateZ(${s}px)`, `rotateX(-90deg) translateZ(${s}px)`];
  return (
    <div style={{ width: size, height: size, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {faces.map((tr, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, transform: tr, border: `2px solid ${COL.cyan}`, background: 'linear-gradient(135deg, rgba(0,240,255,0.10), rgba(247,147,26,0.05))', boxShadow: 'inset 0 0 40px rgba(0,240,255,0.25), 0 0 30px rgba(0,240,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {i === 0 ? <span style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', fontFamily: MONO, fontWeight: 800, fontSize: size * 0.32, color: COL.amber, textShadow: '0 0 24px rgba(247,147,26,0.8)' }}>#0</span> : null}
        </div>
      ))}
    </div>
  );
};

export const GenesisBlockHex: React.FC = () => {
  const f = useCurrentFrame();
  // Inertia: a hard spin that bleeds off and lands facing the camera (750° ≡ 30°).
  // SFX: digital-glitch-whoosh.wav @ f248 · cube-spin f314–354
  const ry = 30 + 720 * (1 - Math.exp(-f / 14));
  const rx = -22 + 6 * Math.sin(f / 9);
  const up = ci(f, 38, 52, 0, 1);
  const cubeY = interpolate(up, [0, 1], [700, 520]);
  const cubeS = interpolate(up, [0, 1], [1, 0.62]);
  // Bytes orbit at three depths, blurred by distance, then get pulled into the phrase.
  // SFX: data-tick.wav every 3 frames @ f364–388 · decode-hit.wav @ f392
  const pull = ci(f, 44, 60, 0, 1, Easing.in(Easing.cubic));
  const decodeAt = (i: number) => 50 + i * 1.0;
  const lit = f >= 78;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${cubeY / 19.2}%, rgba(0,240,255,0.16) 0%, rgba(0,0,0,0) 45%)` }} />
      {Array.from({ length: 44 }, (_, i) => {
        const z = rnd(i * 2.1);
        const a = rnd(i * 4.3) * Math.PI * 2 + (f / 30) * (0.3 + z * 0.5);
        const r = 260 + 380 * rnd(i * 6.7);
        const ox = 540 + Math.cos(a) * r;
        const oy = cubeY + Math.sin(a) * r * 0.55;
        const x = ox + (540 - ox) * pull;
        const y = oy + (900 - oy) * pull;
        if (pull >= 1) return null;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: MONO, fontWeight: 800, fontSize: 18 + 30 * z, color: i % 5 === 0 ? COL.amber : COL.cyan, opacity: (0.2 + 0.6 * z) * (1 - pull * 0.7), textShadow: `0 0 ${8 + 10 * (1 - z)}px rgba(0,240,255,0.7)` }}>{toHex(String.fromCharCode(32 + ((i * 7) % 90)))}</div>;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cubeY - 170, display: 'flex', justifyContent: 'center', perspective: 1000, transform: `scale(${cubeS})` }}>
        <HoloCube size={340} rx={rx} ry={ry} />
      </div>
      {/* the cube's glow pooling on the floor of darkness */}
      <div style={{ position: 'absolute', left: 340, width: 400, top: cubeY + 210 * cubeS, height: 40, borderRadius: '50%', background: 'rgba(0,240,255,0.25)', filter: 'blur(24px)' }} />
      <Mono text="BLOQUE #0 · 03 · ENE · 2009" y={300} size={30} color={COL.cyan} weight={800} />
      {/* the bomb phrase, decoded from hex, floating in depth */}
      {f >= 48 ? (
        <Float3D x={540} y={900} rx={10} ry={-8}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, whiteSpace: 'nowrap', letterSpacing: 1 }}>
            {BOMB.split('').map((c, i) => {
              const done = f >= decodeAt(i);
              return <span key={i} style={{ color: done ? (lit ? COL.amber : COL.cyan) : '#3E4A5C', textShadow: done ? `0 0 ${lit ? 26 : 14}px ${lit ? 'rgba(247,147,26,0.85)' : 'rgba(0,240,255,0.6)'}` : undefined }}>{done ? (c === ' ' ? ' ' : c) : c === ' ' ? ' ' : toHex(c)[1]}</span>;
            })}
          </div>
        </Float3D>
      ) : null}
      <Mono text="THE TIMES · «SEGUNDO RESCATE A LOS BANCOS»" y={975} at={80} size={24} color={COL.white} />
      <Punch text="UN MENSAJE OCULTO|EN EL *BLOQUE 0.*" at={6} y={1150} size={104} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · THE EXIT  [10.5 – 14.5 s] · 2011                                */
/* Full-bleed see-through sculpture; one holographic line dissolves.   */
/* ================================================================== */
export const TerminalExit: React.FC = () => {
  const f = useCurrentFrame();
  const msg = "I've moved on to other things.";
  // Ken burns: a hard push and pan across the Lugano sculpture (CC BY-SA 4.0 Valentina Picozzi).
  const kb = ci(f, 0, 128, 0, 1, Easing.linear);
  // The line types in 0.8 s.
  // SFX: key-click.wav per character @ f470–494
  const typed = Math.floor(msg.length * ci(f, 10, 34, 0, 1, Easing.linear));
  // …then each letter breaks off and is sucked into the statue.
  // SFX: pixel-disintegrate.wav @ f518 · sub-bass-impact.wav @ f540
  const GO = 58;
  const flare = f >= 80 ? ci(f, 80, 92, 1, 0) : 0;
  return (
    <AbsoluteFill>
      <Plate file="cicada01/s2-vanish.jpg" pos="50% 40%" scale={1.32 - 0.22 * kb} x={-40 + 80 * kb} rot={-1.5 + 1.5 * kb} bright={0.62 + 0.25 * flare} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 52%, rgba(0,240,255,${0.35 * flare}) 0%, rgba(0,0,0,0) 45%)` }} />
      <Mono text="SATOSHI → MIKE HEARN · ABR 2011" y={330} at={2} size={26} color={COL.cyan} weight={800} />
      <Punch text="SU ÚLTIMO|*CORREO*" at={2} y={390} size={130} />
      {/* the farewell line, a hologram floating in front of the statue */}
      <Float3D x={540} y={860} rx={8} ry={-14} z={60}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, whiteSpace: 'nowrap', color: COL.white }}>
          {msg.split('').map((c, i) => {
            if (i >= typed) return null;
            const d = GO + rnd(i) * 10;
            const p = ci(f, d, d + 20, 0, 1, Easing.in(Easing.cubic));
            const dx = (450 - i * 30) * p + Math.sin(p * Math.PI) * (rnd(i * 3) - 0.5) * 200;
            const dy = 120 * p - Math.sin(p * Math.PI) * 140;
            return <span key={i} style={{ display: 'inline-block', transform: `translate(${dx}px, ${dy}px) scale(${1 - 0.8 * p}) rotate(${(rnd(i * 5) - 0.5) * 300 * p}deg)`, opacity: 1 - p, filter: `blur(${4 * p}px)`, color: p > 0 ? (i % 2 ? COL.cyan : COL.amber) : COL.white, textShadow: '0 0 18px rgba(0,240,255,0.7), 0 10px 30px rgba(0,0,0,0.9)' }}>{c === ' ' ? ' ' : c}</span>;
          })}
          {f < GO ? <span style={{ color: COL.amber, opacity: Math.floor(f / 4) % 2 ? 1 : 0.2 }}>▍</span> : null}
        </div>
      </Float3D>
      <Punch text="Y SE *ESFUMÓ.*" at={GO + 6} y={1220} size={150} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · THE WALLETS  [14.5 – 19.0 s]                                    */
/* A blockchain floor receding in 3D; a holographic padlock slams.     */
/* ================================================================== */
const NODES = Array.from({ length: 46 }, (_, i) => ({ x: -200 + rnd(i * 3.1) * 1480, y: rnd(i * 7.7) * 1400 }));
const EDGES: [number, number][] = [];
NODES.forEach((a, i) => NODES.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 300) EDGES.push([i, j]); }));

const Padlock: React.FC<{ drop: number; locked: boolean }> = ({ drop, locked }) => {
  const c = locked ? COL.crimson : COL.amber;
  return (
    <svg width={300} height={340} viewBox="0 0 300 340" style={{ overflow: 'visible', filter: `drop-shadow(0 0 ${locked ? 40 : 22}px ${c}) drop-shadow(0 40px 30px rgba(0,0,0,0.9))` }}>
      <path d={`M 80 ${170 - drop} L 80 ${100 - drop} A 70 70 0 0 1 220 ${100 - drop} L 220 ${170 - drop}`} fill="none" stroke={c} strokeWidth={26} strokeLinecap="round" />
      <rect x={40} y={150} width={220} height={180} rx={26} fill="rgba(13,16,22,0.55)" stroke={c} strokeWidth={8} />
      <circle cx={150} cy={225} r={22} fill={c} />
      <rect x={141} y={232} width={18} height={50} rx={6} fill={c} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={48} x2={252} y1={166 + i * 28} y2={166 + i * 28} stroke={c} strokeOpacity={0.2} strokeWidth={2} />)}
    </svg>
  );
};

export const WalletLock: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // SFX: counter-tick-roll.wav @ f578–608
  const n = Math.round(750000 * ci(f, 4, 34, 0, 1, Easing.out(Easing.cubic)));
  // SFX: lock-slam.wav @ f630
  const LOCK = 56;
  const s = spring({ frame: f - LOCK, fps, config: { damping: 9, stiffness: 300 } });
  const drop = f < LOCK ? 70 * ci(f, 34, 50, 0, 1) : 70 * (1 - s);
  const locked = f >= LOCK + 2;
  const sh = microShake(f, LOCK, 8, 6);
  const t = f / 30;
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      {/* the chain as a floor stretching to the horizon, travelling toward camera */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: '50% 30%' }}>
        <div style={{ position: 'absolute', left: 0, top: 820, width: W, height: 1400, transformStyle: 'preserve-3d', transform: `rotateX(66deg) translateY(${-120 + ((f * 3) % 300)}px)`, transformOrigin: '50% 0%' }}>
          <svg width={W} height={1400} style={{ overflow: 'visible' }}>
            {EDGES.map(([a, b], i) => {
              const A = NODES[a];
              const B = NODES[b];
              const u = (t * (0.4 + rnd(i) * 0.6) + rnd(i * 3)) % 1;
              const col = locked && i % 3 === 0 ? COL.crimson : i % 2 ? COL.amber : COL.cyan;
              return (
                <g key={i}>
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={col} strokeOpacity={0.35} strokeWidth={2.5} />
                  <circle cx={A.x + (B.x - A.x) * u} cy={A.y + (B.y - A.y) * u} r={6} fill={col} />
                </g>
              );
            })}
            {NODES.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill={COL.bg} stroke={i % 2 ? COL.amber : COL.cyan} strokeWidth={3} />)}
          </svg>
        </div>
      </AbsoluteFill>
      {/* horizon haze */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(7,8,10,1) 36%, rgba(7,8,10,0.25) 50%, rgba(7,8,10,0.85) 60%, rgba(7,8,10,0.85) 70%, rgba(7,8,10,0.4) 100%)' }} />
      <Float3D x={540} y={520} rx={8} ry={-18 + 12 * Math.sin(t * 1.1)}>
        <div style={{ transform: `scale(${locked && f < LOCK + 6 ? 1.08 : 1})` }}>
          <Padlock drop={drop} locked={locked} />
        </div>
      </Float3D>
      {/* light pooling under the padlock */}
      <div style={{ position: 'absolute', left: 340, width: 400, top: 700, height: 60, borderRadius: '50%', background: locked ? 'rgba(255,42,85,0.35)' : 'rgba(247,147,26,0.3)', filter: 'blur(26px)' }} />
      {locked ? <Mono text="ESTADO: BLOQUEADO" y={760} size={28} color={COL.crimson} weight={800} /> : null}
      <Float3D x={540} y={880} rx={16}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 124, color: COL.amber, letterSpacing: -3, whiteSpace: 'nowrap', textShadow: '0 0 30px rgba(247,147,26,0.6), 0 24px 40px rgba(0,0,0,0.95)' }}>
          {n.toLocaleString('en-US')}
          {f >= 34 ? '+' : ''}
          <span style={{ fontSize: 58, marginLeft: 14 }}>BTC</span>
        </div>
      </Float3D>
      <Punch text="NI UN SOLO *SATOSHI*|SE HA MOVIDO." at={LOCK + 2} y={1110} size={110} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · THE FALSE SATOSHIS  [19.0 – 23.5 s]                             */
/* Three hooded holograms fly out of the dark and are struck off.      */
/* ================================================================== */
const Hood: React.FC<{ color: string; id: string }> = ({ color, id }) => (
  <svg width={420} height={520} viewBox="0 0 420 520" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={0.85} />
        <stop offset="1" stopColor={color} stopOpacity={0.05} />
      </linearGradient>
    </defs>
    <path d="M 210 30 C 120 30 86 110 90 190 C 94 250 120 290 120 290 L 300 290 C 300 290 326 250 330 190 C 334 110 300 30 210 30 Z" fill={`url(#${id})`} />
    <ellipse cx={210} cy={185} rx={62} ry={78} fill="#07080A" />
    <path d="M 40 520 C 60 380 130 330 210 330 C 290 330 360 380 380 520 Z" fill={`url(#${id})`} />
    {Array.from({ length: 26 }, (_, i) => <line key={i} x1={40} x2={380} y1={30 + i * 19} y2={30 + i * 19} stroke="#07080A" strokeWidth={6} opacity={0.55} />)}
  </svg>
);

const PROFILE_AT = [6, 21, 36]; // one profile every 0.5 s
const COURT_AT = 51;
export const FalseSatoshis: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // SFX: slot-tick.wav @ f730, f745, f760, f775 · reject-buzz.wav @ f738, f753, f768 · gavel.wav @ f784
  const flash = PROFILE_AT.some((a) => f >= a + 8 && f < a + 11);
  const court = spring({ frame: f - COURT_AT, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Punch text="VARIOS DIJERON|*SER ÉL*" at={0} y={300} size={120} />
      {PROFILE_AT.map((at, i) => {
        if (f < at) return null;
        const inn = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 260 } });
        const out = ci(f, at + 12, at + 17, 0, 1, Easing.in(Easing.cubic));
        if (out >= 1) return null;
        const struck = f >= at + 8;
        const z = interpolate(inn, [0, 1], [-900, 0]) + 400 * out;
        const x = 540 + (i - 1) * 40 + (i % 2 ? 1 : -1) * 900 * out;
        return (
          <Float3D key={i} x={x} y={830} z={z} ry={(i - 1) * 16 + (i % 2 ? 40 : -40) * out} blur={6 * (1 - inn) + 8 * out}>
            <div style={{ position: 'relative', opacity: Math.min(1, inn * 1.5) }}>
              <Hood color={struck ? COL.crimson : COL.cyan} id={`hood${i}${struck ? 'x' : ''}`} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: -10, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 26, color: struck ? COL.crimson : COL.cyan, letterSpacing: 2 }}>«YO SOY SATOSHI»</div>
              {struck ? (
                <svg width={420} height={520} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                  <line x1={40} y1={60} x2={380} y2={470} stroke={COL.crimson} strokeWidth={22} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ci(f, at + 8, at + 11, 0, 1))} style={{ filter: `drop-shadow(0 0 16px ${COL.crimson})` }} />
                  <line x1={380} y1={60} x2={40} y2={470} stroke={COL.crimson} strokeWidth={22} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ci(f, at + 9, at + 12, 0, 1))} style={{ filter: `drop-shadow(0 0 16px ${COL.crimson})` }} />
                </svg>
              ) : null}
            </div>
          </Float3D>
        );
      })}
      {flash ? <AbsoluteFill style={{ background: 'rgba(255,42,85,0.14)' }} /> : null}
      {/* the ruling lands like a gavel */}
      {f >= COURT_AT ? (
        <Float3D x={540} y={820} rx={12} z={interpolate(court, [0, 1], [500, 0])}>
          <div style={{ textAlign: 'center', opacity: Math.min(1, court * 1.4) }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: COL.cyan, letterSpacing: 3, whiteSpace: 'nowrap' }}>TRIBUNAL DE LONDRES · 2024</div>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.03em', color: COL.white, marginTop: 18, whiteSpace: 'nowrap', textShadow: '0 0 40px rgba(0,0,0,0.9), 0 30px 50px rgba(0,0,0,0.95)' }}>
              «NO ES
              <br />
              <span style={{ color: COL.amber, filter: 'drop-shadow(0 0 22px rgba(247,147,26,0.6))' }}>SATOSHI»</span>
            </div>
          </div>
        </Float3D>
      ) : null}
      <Punch text="UNO DE ELLOS|*NO LO ERA.*" at={COURT_AT + 12} y={1180} size={110} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · THE IMPOSSIBLE PROOF  [23.5 – 27.5 s]                           */
/* A signature ring floating over the mining farm; it stalls at 99%.   */
/* ================================================================== */
export const ProofSign: React.FC = () => {
  const f = useCurrentFrame();
  const prog = ci(f, 14, 40, 0, 0.99, Easing.out(Easing.quad));
  // SFX: progress-tick.wav every 2 frames @ f906–928 · error-buzz.wav @ f944 · sub-bass-impact.wav @ f944
  const FAIL = 60;
  const fail = f >= FAIL;
  const stall = f > 40 && !fail && Math.floor(f / 3) % 2 === 0;
  const sh = microShake(f, FAIL, 7, 6);
  const c = fail ? COL.crimson : COL.amber;
  const R = 230;
  const L = 2 * Math.PI * R;
  const kb = ci(f, 0, 128, 0, 1, Easing.linear);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      {/* the mining farm, full-bleed and out of focus (CC BY 2.0 Marko Ahtisaari) */}
      <Plate file="cicada01/s2-farm.jpg" pos="50% 50%" scale={1.5 - 0.2 * kb} x={60 - 120 * kb} blur={7} bright={0.5} />
      <Punch text="BASTARÍA MOVER|*1 MONEDA*" at={0} y={300} size={120} />
      <Float3D x={540} y={830} rx={18 + 4 * Math.sin(f / 15)} ry={-14 + 10 * Math.sin(f / 20)}>
        <div style={{ position: 'relative', width: 560, height: 560 }}>
          <svg width={560} height={560} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <circle cx={280} cy={280} r={R} fill="none" stroke={COL.border} strokeWidth={22} />
            <circle cx={280} cy={280} r={R} fill="none" stroke={c} strokeWidth={22} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - prog)} transform="rotate(-90 280 280)" opacity={stall ? 0.55 : 1} style={{ filter: `drop-shadow(0 0 22px ${c})` }} />
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * Math.PI * 2;
              return <line key={i} x1={280 + Math.cos(a) * (R + 30)} y1={280 + Math.sin(a) * (R + 30)} x2={280 + Math.cos(a) * (R + (i % 5 ? 40 : 52))} y2={280 + Math.sin(a) * (R + (i % 5 ? 40 : 52))} stroke={c} strokeOpacity={0.5} strokeWidth={3} />;
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, color: c, textShadow: `0 0 26px ${c}` }}>
            <div style={{ fontSize: fail ? 64 : 120, lineHeight: 1, whiteSpace: 'nowrap' }}>{fail ? '0 FIRMAS' : `${Math.round(prog * 100)}%`}</div>
            <div style={{ fontSize: 24, marginTop: 14, color: fail ? COL.crimson : COL.cyan, letterSpacing: 2 }}>{fail ? 'TIMEOUT' : 'FIRMANDO…'}</div>
          </div>
        </div>
      </Float3D>
      <Mono text="DIRECCIÓN 1A1zP1…DivfNa · BLOQUE 0" y={1130} at={6} size={22} color={COL.muted} />
      {fail ? <AbsoluteFill style={{ background: `rgba(255,42,85,${0.18 * ci(f, FAIL, FAIL + 8, 1, 0)})` }} /> : null}
      <Punch text="NADIE LO HA|HECHO." at={FAIL + 2} y={1190} size={130} color={COL.crimson} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8 · LOOP OUT  [27.5 – 30.0 s]                                       */
/* ================================================================== */
export const LoopOutro: React.FC = () => {
  const f = useCurrentFrame();
  // Zoom back into the face until it matches frame 0 (scale 1.35, bar off-screen), hashes accelerating.
  // The call to action stays on screen to the very last frame (the clip is cut short rather than held on a blank
  // face) so the question is still there when the video ends — that's what asks for the comment.
  // SFX: riser.wav @ f1046–1090 · reverse-swell.wav @ f1078 → loops into sub-bass-impact @ f0
  const scale = ci(f, 0, 74, 1.02, 1.35, Easing.in(Easing.cubic));
  const bob = Math.sin(f / 4) * 10;
  return (
    <AbsoluteFill>
      <FaceBleed scale={scale} barX={-1300} />
      <Punch text="¿QUIÉN CREES|QUE ES *SATOSHI?*" at={2} y={1120} size={112} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1370 + bob, textAlign: 'center', fontSize: 84 }}>👇</div>
      <Mono text="TU TEORÍA EN COMENTARIOS" y={1490} at={8} size={26} color={COL.amber} weight={800} />
    </AbsoluteFill>
  );
};
