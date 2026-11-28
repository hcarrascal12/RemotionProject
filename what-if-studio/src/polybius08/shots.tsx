/**
 * Caso Nº 06 · Polybius — planos al estilo de los Shorts ganadores analizados (Detrás de Ti, Víctimas del Frikismo,
 * Armatrix, Enigmas del Misterio): SIEMPRE un medio a pantalla completa (clip, foto o captura) con zoom lento,
 * cortes cada 2–3 s, el dato como un número grande encima (no tarjetas de papel) y los subtítulos de captions.tsx.
 * Hechos y fuentes: canal/no-presiones/caso-06-polybius/CASO-06-POLYBIUS.md (Skeptoid #362, Inverse 2020, Wikipedia).
 * Imágenes y clips: public/polybius08/ (cabinete CC BY-SA 3.0 de DocAtRS; foto de Asteroids CC BY 4.0 de Joho345;
 * captura real de coinop.org; 4 clips generados con IA, rotulados como recreación).
 */
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { COL, HEAD, MONO, W, ci, rnd, shake } from './theme';
import { Scribble, Stamp, Tag, enter } from './kit';
import { KEY } from './captions';

const CABINET = 'polybius08/cabinete-DocAtRS-CC-BY-SA-3.0.jpg'; // 446x1002
const ASTEROIDS = 'polybius08/asteroids-Joho345-CC-BY-4.0.jpg'; // 1280x1707, cabinete real y ACTUAL de Asteroids
const COINOP = 'polybius08/coinop-wayback-2003-real.png'; // 1920x869, copia de la Wayback Machine (abr-2003)
const TITLE = 'polybius08/coinop-titulo.jpeg'; // 255x302, supuesta pantalla de título
const CLIP = (n: string) => `polybius08/clips/${n}`;
export const CLIPS = {
  sala: '01-sala-arcade-1981.mp4',
  crt: '02-cabinete-crt-brillando.mp4',
  vector: '03-pantalla-vector-parpadeo.mp4',
  negro: '04-hombres-de-negro-silueta.mp4',
};

/* ------------------------------------------------------------------ */
/* Base: zoom lento + golpe de entrada (cada corte "pega" un poco)      */
/* ------------------------------------------------------------------ */
const KB: React.FC<{ len: number; z0?: number; z1?: number; x1?: number; y1?: number; origin?: string; children: React.ReactNode }> = ({ len, z0 = 1.02, z1 = 1.14, x1 = 0, y1 = 0, origin = '50% 50%', children }) => {
  const f = useCurrentFrame();
  const p = ci(f, 0, len, 0, 1, (t) => t);
  const punch = 0.09 * Math.exp(-f / 3.2);
  const s = z0 + (z1 - z0) * p + punch;
  return <AbsoluteFill style={{ transform: `translate(${x1 * p}px, ${y1 * p}px) scale(${s})`, transformOrigin: origin }}>{children}</AbsoluteFill>;
};

/** Degradado para que los subtítulos se lean sobre cualquier imagen. */
const Grad: React.FC<{ dim?: number }> = ({ dim = 0.3 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${dim + 0.35}) 0%, rgba(0,0,0,${dim * 0.35}) 30%, rgba(0,0,0,${dim * 0.5}) 60%, rgba(0,0,0,${dim + 0.45}) 100%)` }} />
);

/** Clip a pantalla completa. */
const Clip: React.FC<{ file: string; len: number; startFrom?: number; pos?: string; z0?: number; z1?: number; x1?: number; dim?: number; ia?: boolean }> = ({ file, len, startFrom = 0, pos = '50% 50%', z0, z1, x1, dim, ia = true }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <KB len={len} z0={z0} z1={z1} x1={x1}>
      <OffthreadVideo src={staticFile(CLIP(file))} muted startFrom={startFrom} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: 'contrast(1.1) saturate(0.95)' }} />
    </KB>
    <Grad dim={dim} />
    {ia ? <Tag text="RECREACIÓN · IMAGEN GENERADA CON IA" at={-6} y={1500} center size={20} /> : null}
  </AbsoluteFill>
);

/** Foto a pantalla completa con paneo. */
const Photo: React.FC<{ src: string; len: number; pos?: string; z0?: number; z1?: number; x1?: number; y1?: number; origin?: string; dim?: number }> = ({ src, len, pos = '50% 50%', z0 = 1.05, z1 = 1.35, x1 = 0, y1 = 0, origin, dim }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <KB len={len} z0={z0} z1={z1} x1={x1} y1={y1} origin={origin}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: 'contrast(1.08) saturate(0.9)' }} />
    </KB>
    <Grad dim={dim} />
  </AbsoluteFill>
);

/** Fondo oscuro con vectores tenues, para los planos que no tienen clip. */
const DarkBG: React.FC<{ glow?: number }> = ({ glow = 0.2 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#060807' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 38%, rgba(111,211,176,${glow}) 0%, rgba(0,0,0,0) 70%)` }} />
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)', transform: `translateY(${(f * 0.6) % 6}px)` }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Números grandes encima de la imagen (el dato, sin tarjetas)           */
/* ------------------------------------------------------------------ */
const BigNum: React.FC<{ text: string; y: number; at?: number; size?: number; color?: string; sub?: string }> = ({ text, y, at = 0, size = 250, color = KEY, sub }) => {
  const f = useCurrentFrame();
  const k = enter(f, at, 260, 12);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: '-0.03em', color, WebkitTextStroke: `${Math.round(size * 0.07)}px #000`, paintOrder: 'stroke fill', textShadow: '0 14px 0 rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6)' }}>{text}</div>
      {sub ? <div style={{ marginTop: 14, display: 'inline-block', fontFamily: MONO, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: '#fff', background: 'rgba(0,0,0,0.72)', padding: '8px 18px' }}>{sub}</div> : null}
    </div>
  );
};
const Count: React.FC<{ from: number; to: number; at?: number; dur?: number; prefix?: string; suffix?: string; y: number; size?: number; sub?: string }> = ({ from, to, at = 0, dur = 30, prefix = '', suffix = '', y, size, sub }) => {
  const f = useCurrentFrame();
  const v = Math.round(ci(f, at + 4, at + 4 + dur, from, to));
  return <BigNum text={`${prefix}${v}${suffix}`} y={y} at={at} size={size} sub={sub} />;
};

/** Franjas de interferencia. */
const Glitch: React.FC<{ t: number; n?: number; amp?: number }> = ({ t, n = 5, amp = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${rnd(t * 5 + i) * 100}%`, height: (6 + rnd(t + i) * 34) * amp, background: i % 2 ? 'rgba(227,38,47,0.55)' : 'rgba(111,211,176,0.4)', mixBlendMode: 'screen', transform: `translateX(${(rnd(t * 3 + i) - 0.5) * 80}px)` }} />
    ))}
  </AbsoluteFill>
);

/* ================================================================== */
/* GANCHO / CIERRE: el cabinete con el contador de máquinas en 0         */
/* HookView(t=0) es el último frame: el loop vuelve a esta imagen.        */
/* ================================================================== */
export const HookView: React.FC<{ t: number; len?: number }> = ({ t, len = 70 }) => {
  const g = t < 10 ? 1.3 : t < 24 ? 0.6 : 0.22;
  const vib = { x: t < 24 ? (t % 2 ? 1 : -1) * 4 : 0, y: 0 };
  const s = shake(t, 40, 14, 8);
  const push = 1 + 0.06 * ci(t, 0, len, 0, 1);
  const flick = 0.92 + 0.08 * Math.sin(t * 1.7);
  return (
    <AbsoluteFill style={{ background: '#070908', transform: `translate(${s.x + vib.x}px, ${s.y + vib.y}px)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 44%, rgba(111,211,176,0.28) 0%, rgba(111,211,176,0.06) 55%, rgba(0,0,0,0) 100%)' }} />
      <div style={{ position: 'absolute', left: W / 2 - 311, top: 960 - 760, width: 622, height: 1400, transform: `scale(${push})`, transformOrigin: '50% 40%', opacity: flick, boxShadow: '0 0 120px rgba(111,211,176,0.35)' }}>
        <Img src={staticFile(CABINET)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.12) saturate(1.05) brightness(1.05)' }} />
      </div>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)' }} />
      <Glitch t={t} n={Math.round(3 + 4 * g)} amp={g} />
      <BigNum text="0" y={420} at={-8} size={300} color="#E3262F" sub="MÁQUINAS ENCONTRADAS" />
      <Tag text="MAQUETA · NO ES UNA MÁQUINA ORIGINAL" at={-6} y={236} center size={22} red />
      <Tag text="FOTO: DOCATRS (ROGUE SYNAPSE) · CC BY-SA 3.0" at={-6} y={1520} center size={20} />
    </AbsoluteFill>
  );
};
export const HookShot: React.FC = () => <HookView t={useCurrentFrame()} />;
/** Cierre: cuenta atrás hacia t=0 para que el último frame sea idéntico al frame 0. */
export const LoopShot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  return <HookView t={Math.max(0, len - 1 - f)} />;
};

/* ================================================================== */
/* Planos                                                               */
/* ================================================================== */
export const SalaShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.sala} len={len} startFrom={0} />
    <BigNum text="0" y={420} at={6} size={300} color="#E3262F" sub="MÁQUINAS ENCONTRADAS" />
  </AbsoluteFill>
);

export const TitleShot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const flick = 0.9 + 0.1 * Math.sin(f * 1.9);
  return (
    <AbsoluteFill>
      <DarkBG glow={0.35} />
      <KB len={len} z0={1.02} z1={1.18}>
        <div style={{ position: 'absolute', left: 190, top: 330, width: 700, height: 820, borderRadius: 38, overflow: 'hidden', background: '#030605', boxShadow: '0 0 0 14px #1b1f1d, 0 0 90px rgba(111,211,176,0.5)', opacity: flick }}>
          <Img src={staticFile(TITLE)} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', filter: 'contrast(1.2) saturate(1.3)' }} />
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)' }} />
        </div>
      </KB>
      <Tag text="SUPUESTA PANTALLA DE TÍTULO · COINOP.ORG" at={4} y={1500} center size={22} />
    </AbsoluteFill>
  );
};

export const PortlandShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.sala} len={len} startFrom={50} pos="30% 50%" z0={1.1} z1={1.3} />
    <BigNum text="1981" y={420} at={6} size={230} sub="PORTLAND · OREGÓN" />
  </AbsoluteFill>
);

/** Rejilla de portadas (ilustrativa) que un haz rojo recorre tachándolas. */
export const MagazinesShot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const cols = 4, rows = 4, cw = 218, ch = 168, gx = 22, gy = 22;
  const gridW = cols * cw + (cols - 1) * gx, gridH = rows * ch + (rows - 1) * gy;
  const beam = ci(f, 4, len - 8, 0, 1, (t) => t);
  return (
    <AbsoluteFill>
      <DarkBG />
      <KB len={len} z0={1.0} z1={1.08}>
        <div style={{ position: 'absolute', left: W / 2 - gridW / 2, top: 330, width: gridW, height: gridH }}>
          {Array.from({ length: cols * rows }, (_, i) => {
            const r = Math.floor(i / cols), c = i % cols;
            const hit = beam * rows > r + 0.4;
            return (
              <div key={i} style={{ position: 'absolute', left: c * (cw + gx), top: r * (ch + gy), width: cw, height: ch, background: '#F4F1EA', boxShadow: '0 10px 22px rgba(0,0,0,0.6)', transform: `rotate(${(rnd(i + 2) - 0.5) * 4}deg)`, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 12, top: 12, right: 12, height: 20, background: COL.ink, opacity: 0.85 }} />
                <div style={{ position: 'absolute', left: 12, top: 44, width: 90, height: 70, background: '#CFC9BD' }} />
                <div style={{ position: 'absolute', left: 114, top: 44, right: 12, height: 12, background: '#CFC9BD' }} />
                <div style={{ position: 'absolute', left: 114, top: 66, right: 12, height: 12, background: '#CFC9BD' }} />
                {hit ? <div style={{ position: 'absolute', inset: 0, background: 'rgba(227,38,47,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 130, color: COL.red }}>✕</div> : null}
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: -20, right: -20, top: beam * gridH - 4, height: 8, background: COL.red, boxShadow: '0 0 28px 6px rgba(227,38,47,0.8)', opacity: beam < 1 ? 1 : 0 }} />
        </div>
      </KB>
      <BigNum text="0" y={440} at={24} size={330} color="#E3262F" sub="MENCIONES EN REVISTAS" />
      <Tag text="ELECTRONIC GAMES 1981–84 · SKEPTOID · ILUSTRACIÓN" at={10} y={1500} center size={20} />
    </AbsoluteFill>
  );
};

/** Terminal que busca el archivo y devuelve "0 resultados". */
export const TerminalShot: React.FC<{ len: number; lines: string[]; tag: string; clip?: string; stamp?: boolean }> = ({ len, lines, tag, clip, stamp }) => {
  const f = useCurrentFrame();
  const chars = Math.max(0, Math.floor((f - 4) * 1.5));
  let left = chars;
  const k = enter(f, 2, 220, 14);
  return (
    <AbsoluteFill>
      {clip ? <Clip file={clip} len={len} startFrom={20} dim={0.45} ia /> : <DarkBG />}
      <KB len={len} z0={1.0} z1={1.06}>
        <div style={{ position: 'absolute', left: 90, width: W - 180, top: 340, height: 520, background: 'rgba(6,10,9,0.92)', boxShadow: '0 26px 60px rgba(0,0,0,0.6), 0 0 0 6px #1b1f1d', transform: `scale(${0.88 + 0.12 * k})`, opacity: Math.min(1, k * 2), padding: '36px 40px', boxSizing: 'border-box', fontFamily: MONO, fontWeight: 800, fontSize: 40, lineHeight: 1.5, color: COL.crt }}>
          {lines.map((ln, i) => {
            const show = Math.max(0, Math.min(ln.length, left));
            left -= ln.length + 4;
            const bad = ln.startsWith('0 ');
            return (
              <div key={i} style={{ color: bad ? COL.red : COL.crt, fontSize: bad ? 64 : 40, minHeight: 60 }}>
                {show > 0 ? ln.slice(0, show) : ''}
                {show > 0 && show < ln.length && Math.floor(f / 4) % 2 === 0 ? '▌' : ''}
              </div>
            );
          })}
        </div>
      </KB>
      {stamp ? <Stamp text="SIN PRUEBAS" at={26} x={560} y={900} rot={-9} size={110} /> : null}
      <Tag text={tag} at={6} y={clip ? 1450 : 1500} center size={20} />
    </AbsoluteFill>
  );
};

/** Captura real de coinop.org (Wayback, abr-2003) a pantalla casi completa, con zoom y resaltado. */
const HL1 = { left: 17, top: 36.2, w: 9.2, h: 4.4 };
const HL2 = { left: 17, top: 85.4, w: 36.8, h: 4.2 };
export const CaptureShot: React.FC<{ len: number; mode: 'a' | 'b' }> = ({ len, mode }) => {
  const f = useCurrentFrame();
  const cw = 1000, ch = Math.round((cw * 869) / 1920);
  const k = enter(f, 2, 220, 14);
  const a = mode === 'a';
  const scale = a ? ci(f, 0, len, 1.0, 1.5, (t) => t) : 1.5 + 1.1 * ci(f, 4, 28, 0, 1) - 0.25 * ci(f, 46, 62, 0, 1);
  const ox = a ? 20 : 22 + 14 * ci(f, 46, 62, 0, 1);
  const oy = a ? 18 : 36 + 51 * ci(f, 46, 62, 0, 1);
  const hl1 = a ? 0 : ci(f, 12, 26, 0, 1);
  const hl2 = a ? 0 : ci(f, 52, 64, 0, 1);
  return (
    <AbsoluteFill>
      <DarkBG glow={0.12} />
      <KB len={len} z0={1.0} z1={1.05}>
        <div style={{ position: 'absolute', left: W / 2 - cw / 2 - 14, top: 330, width: cw + 28, height: ch + 28, background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', transform: `rotate(-1deg) scale(${0.7 + 0.3 * k})`, opacity: Math.min(1, k * 2) }}>
          <div style={{ position: 'relative', width: cw, height: ch, margin: 14, overflow: 'hidden', background: '#fff' }}>
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: `${ox}% ${oy}%` }}>
              <Img src={staticFile(COINOP)} style={{ width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', left: `${HL1.left}%`, top: `${HL1.top}%`, width: `${HL1.w * hl1}%`, height: `${HL1.h}%`, background: 'rgba(227,38,47,0.3)', border: '3px solid #E3262F', opacity: hl1 > 0 ? 1 : 0 }} />
              <div style={{ position: 'absolute', left: `${HL2.left}%`, top: `${HL2.top}%`, width: `${HL2.w * hl2}%`, height: `${HL2.h}%`, background: 'rgba(227,38,47,0.3)', border: '3px solid #E3262F', opacity: hl2 > 0 ? 1 : 0 }} />
            </div>
          </div>
        </div>
      </KB>
      {a ? <Scribble cx={540} cy={470} rx={190} ry={70} at={30} dur={14} width={10} seed={2} /> : null}
      <Tag text="COPIA ARCHIVADA · ABR 2003 · WAYBACK MACHINE" at={6} y={1500} center size={22} />
    </AbsoluteFill>
  );
};

export const PiezasShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.negro} len={len} startFrom={10} dim={0.4} />
    <Count from={1970} to={1981} at={2} dur={34} y={400} size={260} sub="PORTLAND" />
  </AbsoluteFill>
);

export const MigrañaShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.vector} len={len} startFrom={0} />
    <BigNum text="MIGRAÑA" y={420} at={4} size={200} sub="TRAS JUGAR A TEMPEST · SKEPTOID" />
  </AbsoluteFill>
);

export const AsteroidsShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Photo src={ASTEROIDS} len={len} pos="50% 55%" z0={1.0} z1={1.45} y1={90} origin="50% 55%" />
    <Count from={0} to={28} at={2} dur={34} suffix=" H" y={380} size={280} sub="JUGANDO A ASTEROIDS · TERMINÓ CON MALESTAR" />
    <Tag text="FOTO: JOHO345 · CC BY 4.0 · CABINETE ACTUAL, NO DE 1981" at={8} y={1500} center size={20} />
  </AbsoluteFill>
);

export const ApuestasShot: React.FC<{ len: number }> = ({ len }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.negro} len={len} startFrom={40} pos="70% 50%" z0={1.15} z1={1.35} dim={0.4} />
    <Count from={0} to={10} at={2} dur={30} prefix="+" suffix=" DÍAS" y={400} size={230} sub="ALLANAMIENTOS · APUESTAS ILEGALES · SKEPTOID" />
  </AbsoluteFill>
);

/** La cita de Inverse, en grande y escribiéndose. */
const QA = 'ALMOST CERTAINLY INVENTED … ';
const QB = 'TO PROMOTE HIS WEBSITE';
export const QuoteShot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const n = Math.floor(Math.max(0, f - 8) * 1.5);
  const k = enter(f, 2, 200, 14);
  return (
    <AbsoluteFill>
      <DarkBG glow={0.25} />
      <KB len={len} z0={1.0} z1={1.07}>
        <div style={{ position: 'absolute', left: 80, right: 80, top: 330, opacity: Math.min(1, k * 2), transform: `scale(${0.9 + 0.1 * k})` }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 260, lineHeight: 0.6, color: COL.red }}>“</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 84, lineHeight: 1.12, color: '#fff', marginTop: 24, letterSpacing: '-0.01em' }}>
            {QA.slice(0, n)}
            <span style={{ color: KEY, background: f >= 70 ? 'rgba(255,210,31,0.16)' : undefined }}>{QB.slice(0, Math.max(0, n - QA.length))}</span>
            {n < QA.length + QB.length && Math.floor(f / 4) % 2 === 0 ? '▌' : ''}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: '#B8B2A6', marginTop: 34 }}>INVERSE · 31 OCT 2020</div>
        </div>
      </KB>
    </AbsoluteFill>
  );
};

export const PreguntaShot: React.FC<{ len: number; n: number; startFrom: number; pos: string }> = ({ len, n, startFrom, pos }) => (
  <AbsoluteFill>
    <Clip file={CLIPS.crt} len={len} startFrom={startFrom} pos={pos} dim={0.4} />
    <BigNum text={String(n)} y={380} at={2} size={320} color="#fff" sub={`PREGUNTA ${n} DE 3`} />
  </AbsoluteFill>
);
