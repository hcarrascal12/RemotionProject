/**
 * Caso Nº 06 · Polybius — escenas. Estilo del Caso Nº 04/05 (tablero de papel, rotuladora, un acento rojo).
 * Fórmula de los Shorts ganadores analizados: el "imposible" en los primeros 2 s con el material ya en pantalla,
 * pruebas visibles, giro con piezas reales, lista de 3 preguntas y pregunta final que enlaza con el primer frame.
 * Ritmo: un cambio visual cada 2–3 s (planos de 1,3 a 4,8 s, como pide canal/no-presiones/ESTILO-SHORTS.md).
 * Hechos y fuentes: canal/no-presiones/caso-06-polybius/CASO-06-POLYBIUS.md (Skeptoid #362, Inverse 2020, Wikipedia).
 * Imágenes: public/polybius08/ (cabinete CC BY-SA 3.0 de DocAtRS; captura real de coinop.org).
 */
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { COL, HEAD, MONO, SCENES, W, ci, rnd, shake } from './theme';
import { Headline, Stage, Stamp, Tag, Whip, enter } from './kit';

const CABINET = 'polybius08/cabinete-DocAtRS-CC-BY-SA-3.0.jpg'; // 446x1002
const ASTEROIDS = 'polybius08/asteroids-Joho345-CC-BY-4.0.jpg'; // 1280x1707, cabinete real de Asteroids (foto actual)
const COINOP = 'polybius08/coinop-wayback-2003-real.png'; // 1920x869, copia de la Wayback Machine (abr-2003)

/** Franjas de interferencia. */
const Glitch: React.FC<{ t: number; n?: number; amp?: number }> = ({ t, n = 5, amp = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${rnd(t * 5 + i) * 100}%`, height: (6 + rnd(t + i) * 34) * amp, background: i % 2 ? 'rgba(227,38,47,0.55)' : 'rgba(111,211,176,0.4)', mixBlendMode: 'screen', transform: `translateX(${(rnd(t * 3 + i) - 0.5) * 80}px)` }} />
    ))}
  </AbsoluteFill>
);

/** Tarjeta de papel con un dato grande. `h` alto, `valueSize` tamaño del dato; `at` cuándo entra. */
const Tile: React.FC<{ y: number; h?: number; at: number; label: string; value: string; note: string; rot?: number; valueSize?: number }> = ({ y, h = 260, at, label, value, note, rot = 0, valueSize = 150 }) => {
  const f = useCurrentFrame();
  const k = enter(f, at, 200, 14);
  if (k <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: 90, width: W - 180, top: y - h / 2, height: h, background: COL.card, boxShadow: '0 26px 50px rgba(30,20,10,0.32), inset 0 0 0 1px rgba(0,0,0,0.08)', transform: `translateZ(30px) rotate(${rot}deg) translateX(${(1 - k) * 700}px)`, opacity: Math.min(1, k * 2), padding: '22px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: COL.ink }}>{label}</div>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: valueSize, lineHeight: 0.9, letterSpacing: '-0.03em', color: COL.red }}>{value}</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: COL.muted }}>{note}</div>
    </div>
  );
};

/** Plano: solo se ve entre `a` y `b` (frames de la escena). */
const Shot: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  return <>{children}</>;
};
/** Cámara de un plano: inclinación propia (cambia en cada plano) y empuje lento. */
const Cam: React.FC<{ a: number; b: number; rx: number; ry: number; dolly?: number; children: React.ReactNode }> = ({ a, b, rx, ry, dolly = 90, children }) => {
  const f = useCurrentFrame();
  return <Stage rx={rx} ry={ry} dolly={ci(f, a, b, 0, dolly)}>{children}</Stage>;
};


/** Tarjeta de dato con valor animado (el número cuenta o rueda mientras se ve el plano). */
const CountTile: React.FC<{ y: number; h?: number; at: number; label: string; note: string; rot?: number; valueSize?: number; from: number; to: number; dur?: number; prefix?: string; suffix?: string }> = ({ y, h = 520, at, label, note, rot = 0, valueSize = 250, from, to, dur = 40, prefix = '', suffix = '' }) => {
  const f = useCurrentFrame();
  const v = Math.round(ci(f, at + 4, at + 4 + dur, from, to));
  return <Tile y={y} h={h} at={at} label={label} value={`${prefix}${v}${suffix}`} note={note} rot={rot} valueSize={valueSize} />;
};

/** Pantalla de tubo (CRT): parpadeo, líneas de barrido y viñeta alrededor de cualquier contenido. */
const Crt: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => {
  const f = useCurrentFrame();
  const flick = 0.9 + 0.1 * Math.sin(f * 1.9) + (f % 23 === 0 ? 0.08 : 0);
  const roll = (f * 9) % (h + 120) - 60;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 38, overflow: 'hidden', background: '#030605', boxShadow: '0 0 0 14px #1b1f1d, 0 0 90px rgba(111,211,176,0.45), 0 30px 60px rgba(0,0,0,0.5)', transform: 'translateZ(40px)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: flick }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: roll, height: 90, background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)' }} />
    </div>
  );
};

/** Túnel vectorial que avanza (evoca los gráficos de vector de los arcades de la época; ilustrativo). */
const VectorTunnel: React.FC<{ speed?: number }> = ({ speed = 0.035 }) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="0 0 1000 1000" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {Array.from({ length: 9 }, (_, i) => {
        const k = (((i / 9) + f * speed) % 1);
        const s = Math.pow(k, 2.2) * 520 + 6;
        const hue = i % 3 === 0 ? '#E3262F' : '#6FD3B0';
        return <rect key={i} x={500 - s} y={500 - s} width={s * 2} height={s * 2} fill="none" stroke={hue} strokeWidth={2 + k * 7} opacity={0.25 + 0.75 * k} transform={`rotate(${f * 0.8 + i * 9} 500 500)`} />;
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={500} y1={500} x2={500 + Math.cos((i / 8) * Math.PI * 2 + f * 0.012) * 760} y2={500 + Math.sin((i / 8) * Math.PI * 2 + f * 0.012) * 760} stroke="#6FD3B0" strokeWidth={2} opacity={0.35} />
      ))}
    </svg>
  );
};

/** Rejilla de "portadas" (ilustrativa) que un haz rojo recorre marcando cada una con una X: nada encontrado. */
const ScanGrid: React.FC<{ y: number; at: number; dur: number }> = ({ y, at, dur }) => {
  const f = useCurrentFrame();
  const k = enter(f, at, 200, 14);
  if (k <= 0.001) return null;
  const cols = 4, rows = 4, cw = 190, ch = 150, gx = 22, gy = 20;
  const gridW = cols * cw + (cols - 1) * gx, gridH = rows * ch + (rows - 1) * gy;
  const beam = ci(f, at + 6, at + dur, 0, 1, (x) => x);
  return (
    <div style={{ position: 'absolute', left: W / 2 - gridW / 2, top: y - gridH / 2, width: gridW, height: gridH, opacity: Math.min(1, k * 2), transform: `translateZ(30px) scale(${0.85 + 0.15 * k})` }}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const hit = beam * rows > r + 0.4;
        return (
          <div key={i} style={{ position: 'absolute', left: c * (cw + gx), top: r * (ch + gy), width: cw, height: ch, background: COL.card, boxShadow: '0 10px 22px rgba(30,20,10,0.3)', transform: `rotate(${(rnd(i + 2) - 0.5) * 4}deg)`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 12, top: 12, right: 12, height: 18, background: COL.ink, opacity: 0.8 }} />
            <div style={{ position: 'absolute', left: 12, top: 40, width: 80, height: 60, background: COL.paper2 }} />
            <div style={{ position: 'absolute', left: 104, top: 40, right: 12, height: 10, background: COL.paper2 }} />
            <div style={{ position: 'absolute', left: 104, top: 60, right: 12, height: 10, background: COL.paper2 }} />
            {hit ? <div style={{ position: 'absolute', inset: 0, background: 'rgba(227,38,47,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 120, color: COL.red }}>✕</div> : null}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: -20, right: -20, top: beam * gridH - 4, height: 8, background: COL.red, boxShadow: '0 0 28px 6px rgba(227,38,47,0.8)', opacity: beam < 1 ? 1 : 0 }} />
    </div>
  );
};

/** Terminal que escribe una búsqueda y devuelve "0 resultados". */
const Terminal: React.FC<{ y: number; at: number; lines: string[] }> = ({ y, at, lines }) => {
  const f = useCurrentFrame();
  const k = enter(f, at, 200, 14);
  if (k <= 0.001) return null;
  const chars = Math.max(0, Math.floor((f - at - 6) * 1.6));
  let left = chars;
  return (
    <div style={{ position: 'absolute', left: 90, width: W - 180, top: y - 230, height: 460, background: '#0B0F0E', boxShadow: '0 26px 50px rgba(0,0,0,0.5), 0 0 0 6px #1b1f1d', transform: `translateZ(30px) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 2), padding: '34px 38px', boxSizing: 'border-box', fontFamily: MONO, fontWeight: 800, fontSize: 42, lineHeight: 1.5, color: COL.crt }}>
      {lines.map((ln, i) => {
        const show = Math.max(0, Math.min(ln.length, left));
        left -= ln.length + 4;
        const bad = ln.startsWith('0 ');
        return <div key={i} style={{ color: bad ? COL.red : COL.crt, fontSize: bad ? 64 : 42, minHeight: 64 }}>{show > 0 ? ln.slice(0, show) : ''}{show > 0 && show < ln.length && Math.floor(f / 4) % 2 === 0 ? '▌' : ''}</div>;
      })}
    </div>
  );
};

/** Plano a pantalla completa con una foto y movimiento de cámara (zoom + paneo). */
const PhotoShot: React.FC<{ src: string; a: number; b: number; from: { s: number; x: number; y: number }; to: { s: number; x: number; y: number }; origin?: string; dim?: number }> = ({ src, a, b, from, to, origin = '50% 50%', dim = 0.35 }) => {
  const f = useCurrentFrame();
  const s = ci(f, a, b, from.s, to.s, (x) => x);
  const x = ci(f, a, b, from.x, to.x, (x) => x);
  const y = ci(f, a, b, from.y, to.y, (x) => x);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', left: -x, top: -y, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`, transformOrigin: origin, filter: 'contrast(1.08) saturate(0.9)' }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${dim + 0.25}) 0%, rgba(0,0,0,${dim * 0.4}) 40%, rgba(0,0,0,${dim + 0.3}) 100%)` }} />
    </AbsoluteFill>
  );
};


/** Clips de archivo / recreaciones en vídeo (opcional). Se activan con --props='{"clips":true}' cuando existen los archivos de
 *  public/polybius08/clips/ (ver canal/no-presiones/caso-06-polybius/B-ROLL.md). Sin la prop, la composición usa solo
 *  fotos, capturas y animaciones. Cada clip arranca al empezar su plano y se ve en pantalla completa, atenuado, detrás de los titulares. */
export const WITH_CLIPS = Boolean((getInputProps() as { clips?: boolean }).clips);
const Broll: React.FC<{ file: string; dim?: number; rate?: number }> = ({ file, dim = 0.35, rate = 1 }) => {
  if (!WITH_CLIPS) return null;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <OffthreadVideo src={staticFile(`polybius08/clips/${file}`)} muted playbackRate={rate} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(0.85)' }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${dim + 0.25}) 0%, rgba(0,0,0,${dim * 0.4}) 40%, rgba(0,0,0,${dim + 0.3}) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 1 · GANCHO / CIERRE: el cabinete con el contador de máquinas en 0     */
/* HookView(t=0) es el último frame: el loop vuelve a esta imagen.        */
/* ================================================================== */
export const HookView: React.FC<{ t: number; titles?: boolean }> = ({ t, titles = true }) => {
  const g = t < 10 ? 1.3 : t < 24 ? 0.6 : 0.22;
  const vib = { x: t < 24 ? (t % 2 ? 1 : -1) * 4 : 0, y: 0 };
  const s = shake(t, 40, 14, 8);
  const push = 1 + 0.05 * ci(t, 0, 150, 0, 1);
  const flick = 0.92 + 0.08 * Math.sin(t * 1.7);
  return (
    <AbsoluteFill style={{ background: '#070908', transform: `translate(${s.x + vib.x}px, ${s.y + vib.y}px)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 44%, rgba(111,211,176,0.28) 0%, rgba(111,211,176,0.06) 55%, rgba(0,0,0,0) 100%)' }} />
      {/* el cabinete (maqueta): foto 446x1002 ampliada con el filtro de pantalla antigua */}
      <div style={{ position: 'absolute', left: W / 2 - 311, top: 960 - 700, width: 622, height: 1400, transform: `scale(${push})`, transformOrigin: '50% 40%', opacity: flick, boxShadow: '0 0 120px rgba(111,211,176,0.35)' }}>
        <Img src={staticFile(CABINET)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.12) saturate(1.05) brightness(1.05)' }} />
      </div>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)' }} />
      <Glitch t={t} n={Math.round(3 + 4 * g)} amp={g} />
      {/* el "imposible", ya en el frame 0: contador de máquinas encontradas */}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 1320, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, background: 'rgba(250,250,247,0.96)', padding: '18px 28px', boxShadow: '0 20px 44px rgba(0,0,0,0.5)', transform: 'rotate(-1.2deg)' }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: COL.ink, lineHeight: 1.15 }}>MÁQUINAS<br />ENCONTRADAS</div>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 150, lineHeight: 0.9, color: COL.red }}>0</div>
      </div>
      {/* aviso de la maqueta y crédito de la foto (CC BY-SA 3.0): siempre visibles */}
      <Tag text="MAQUETA · NO ES UNA MÁQUINA ORIGINAL" at={-6} y={236} center size={22} red />
      <Tag text="FOTO: DOCATRS (ROGUE SYNAPSE) · CC BY-SA 3.0" at={-6} y={1520} center size={20} />
      {titles ? (
        <>
          <Headline text="HAY GENTE QUE|JURA HABERLO *JUGADO*" at={4} y={300} size={100} out={70} stagger={10} />
          <Headline text="NADIE HA ENCONTRADO|UNA SOLA *MÁQUINA*" at={74} y={300} size={100} out={144} stagger={10} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
export const Hook: React.FC = () => <HookView t={useCurrentFrame()} />;

/** Cierre: la pregunta final y, justo antes del último frame, vuelve exactamente a la imagen del frame 0. */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const len = SCENES.loop.len;
  const t = Math.max(0, len - 1 - f); // cuenta atrás: en el último frame t = 0, igual que el frame 0
  return (
    <AbsoluteFill>
      <HookView t={t} titles={false} />
      <Headline text="¿LO CONOCÍAS|O TE LO *CREÍSTE*?" at={4} y={1100} size={120} out={76} stagger={10} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2 · LA LEYENDA (3 planos de ~1,2 s): niños enfermos · Portland · el nombre */
/* ================================================================== */
export const Legend: React.FC = () => (
  <AbsoluteFill>
    <Shot a={0} b={40}>
      <Broll file="01-sala-arcade-1981.mp4" />
      <Cam a={0} b={40} rx={4} ry={-6}>
        <Tile y={800} h={420} at={2} label="SEGÚN LA LEYENDA" value="AMNESIA" note="CONVULSIONES · TERRORES NOCTURNOS · ALUCINACIONES" valueSize={130} rot={-1.2} />
      </Cam>
      <Headline text="SE DECÍA QUE|ENFERMABA A LOS *NIÑOS*" at={2} y={300} size={96} stagger={8} />
    </Shot>
    <Shot a={40} b={76}>
      <Broll file="02-cabinete-crt-brillando.mp4" />
      <Cam a={40} b={76} rx={-3} ry={6}>
        <Tile y={800} h={420} at={42} label="DÓNDE Y CUÁNDO" value="PORTLAND" note="OREGÓN · 1981 · SALAS DE ARCADE" valueSize={120} rot={1} />
      </Cam>
      <Headline text="EN *PORTLAND*" at={42} y={300} size={110} stagger={8} />
    </Shot>
    <Shot a={76} b={110}>
      <Cam a={76} b={110} rx={2} ry={-3}>
        <Crt x={540} y={840} w={760} h={880}>
          <AbsoluteFill style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Img src={staticFile('polybius08/coinop-titulo.jpeg')} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', filter: 'contrast(1.2) saturate(1.3)' }} />
          </AbsoluteFill>
        </Crt>
      </Cam>
      <Headline text="SE LLAMABA *POLYBIUS*" at={78} y={300} size={104} stagger={8} />
      <Tag text="SUPUESTA PANTALLA DE TÍTULO · COINOP.ORG" at={82} y={1330} center size={22} />
    </Shot>
    <Whip at={38} dir={1} />
    <Whip at={74} dir={-1} />
  </AbsoluteFill>
);

/* ================================================================== */
/* 3 · LAS TRES PRUEBAS QUE FALTAN (3 planos de ~3 s)                   */
/* ================================================================== */
export const Proof: React.FC = () => (
  <AbsoluteFill>
    <Shot a={0} b={86}>
      <Cam a={0} b={86} rx={4} ry={-6}>
        <ScanGrid y={830} at={2} dur={72} />
        <Tile y={1250} h={230} at={30} label="MENCIONES EN REVISTAS 1981–84" value="0" note="ELECTRONIC GAMES · SKEPTOID · ILUSTRACIÓN" valueSize={140} rot={-1} />
      </Cam>
      <Headline text="LAS *REVISTAS*|NO LO MENCIONAN" at={2} y={300} size={96} stagger={8} />
    </Shot>
    <Shot a={86} b={172}>
      <Cam a={86} b={172} rx={-3} ry={6}>
        <Terminal y={860} at={88} lines={['> buscar polybius.rom', '> buscando…', '0 resultados']} />
      </Cam>
      <Headline text="NI UN *ARCHIVO*|DEL JUEGO" at={88} y={300} size={96} stagger={8} />
      <Tag text="ILUSTRACIÓN · NINGÚN ROM HA SALIDO JAMÁS" at={96} y={1300} center size={22} />
    </Shot>
    <Shot a={172} b={270}>
      <Cam a={172} b={270} rx={2} ry={-3}>
        <Tile y={860} h={520} at={174} label="EMPRESA «SINNESLÖSCHEN»" value="SIN REGISTRO" note="NI EN ALEMANIA, NI EN EE. UU., NI EN JAPÓN · INVERSE" valueSize={110} rot={-0.8} />
      </Cam>
      <Headline text="DE SU *EMPRESA*|TAMPOCO HAY RASTRO" at={174} y={300} size={90} stagger={8} />
      <Stamp text="SIN PRUEBAS" at={226} x={560} y={1270} rot={-9} size={120} />
    </Shot>
    <Whip at={84} dir={1} />
    <Whip at={170} dir={-1} />
  </AbsoluteFill>
);

/* ================================================================== */
/* 4 · LA PRIMERA PÁGINA: coinop.org (copia real de la Wayback Machine, abr-2003) */
/* ================================================================== */
// zonas de la captura en % (1920x869): «We need information.» y la última línea del texto
const HL1 = { left: 17, top: 36.2, w: 9.2, h: 4.4 };
const HL2 = { left: 17, top: 85.4, w: 36.8, h: 4.2 };
export const Page: React.FC = () => {
  const f = useCurrentFrame();
  const cw = 960;
  const ch = Math.round((cw * 869) / 1920); // 435
  // zoom: vista completa → «We need information.» → última línea
  const z1 = ci(f, 62, 104, 0, 1);
  const z2 = ci(f, 132, 172, 0, 1);
  const scale = 1 + 1.5 * z1 - 0.2 * z2; // 1 → 2.5 → 2.3
  const ox = 22 + (36 - 22) * z2;
  const oy = 36 + (87 - 36) * z2;
  const k = enter(f, 6, 190, 15);
  const hl1 = ci(f, 74, 92, 0, 1);
  const hl2 = ci(f, 142, 160, 0, 1);
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 200, 0, 110)} rx={f < 62 ? 3 : f < 132 ? -2 : 2} ry={f < 62 ? -5 : f < 132 ? 4 : -2}>
        <div style={{ position: 'absolute', left: W / 2 - cw / 2 - 14, top: 860 - ch / 2 - 14, width: cw + 28, height: ch + 28, background: COL.card, boxShadow: '0 30px 60px rgba(30,20,10,0.4)', transform: `translateZ(40px) rotate(${-1.2}deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2) }}>
          <div style={{ position: 'relative', width: cw, height: ch, margin: 14, overflow: 'hidden', background: '#fff' }}>
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: `${ox}% ${oy}%` }}>
              <Img src={staticFile(COINOP)} style={{ width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', left: `${HL1.left}%`, top: `${HL1.top}%`, width: `${HL1.w * hl1}%`, height: `${HL1.h}%`, background: 'rgba(227,38,47,0.28)', border: '3px solid #E3262F', opacity: hl1 > 0 ? 1 : 0 }} />
              <div style={{ position: 'absolute', left: `${HL2.left}%`, top: `${HL2.top}%`, width: `${HL2.w * hl2}%`, height: `${HL2.h}%`, background: 'rgba(227,38,47,0.28)', border: '3px solid #E3262F', opacity: hl2 > 0 ? 1 : 0 }} />
            </div>
          </div>
        </div>
      </Stage>
      <Headline text="LA PRIMERA PÁGINA:|*COINOP.ORG*" at={2} y={300} size={104} out={74} stagger={10} />
      <Headline text="EN 2003 SEGUÍA|PIDIENDO *INFORMACIÓN*" at={80} y={300} size={96} stagger={10} />
      <Tag text="COPIA ARCHIVADA · ABR 2003 · WAYBACK MACHINE" at={14} y={1130} center size={22} />
      <Tag text="FECHA «1998»: DUDOSA" at={40} y={1190} center size={26} red />
      <Whip at={60} dir={1} />
      <Whip at={130} dir={-1} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL GIRO: había piezas reales (4 planos de ~2,8 s)                */
/* ================================================================== */
export const Real: React.FC = () => (
  <AbsoluteFill>
    <Shot a={0} b={90}>
      <Cam a={0} b={90} rx={4} ry={-6}>
        <CountTile y={860} at={4} label="PORTLAND" note="DOS JUGADORES SE SIENTEN MAL · EL MISMO DÍA · LA MISMA SALA" from={1970} to={1981} dur={44} valueSize={250} rot={-1.2} />
      </Cam>
      <Headline text="PERO HABÍA|*PIEZAS REALES*" at={2} y={300} size={104} stagger={10} />
    </Shot>
    <Shot a={90} b={135}>
      <Broll file="03-pantalla-vector-parpadeo.mp4" />
      <Cam a={90} b={135} rx={-3} ry={6}>
        {WITH_CLIPS ? null : <Crt x={540} y={760} w={860} h={760}><VectorTunnel /></Crt>}
        <Tile y={1250} h={230} at={96} label="UN JUGADOR" value="MIGRAÑA" note="TRAS JUGAR A TEMPEST · ANIMACIÓN ILUSTRATIVA" valueSize={110} rot={1} />
      </Cam>
      <Headline text="DOS JUGADORES *ENFERMOS*" at={92} y={300} size={84} stagger={8} />
    </Shot>
    <Shot a={135} b={180}>
      <PhotoShot src={ASTEROIDS} a={135} b={180} from={{ s: 1.0, x: 0, y: 0 }} to={{ s: 1.5, x: 0, y: 140 }} origin="50% 55%" />
      <Headline text="OTRO: *28 HORAS*|JUGANDO A ASTEROIDS" at={137} y={300} size={84} stagger={8} />
      <Tag text="FOTO: JOHO345 · CC BY 4.0 · CABINETE ACTUAL, NO DE 1981" at={140} y={1500} center size={20} />
    </Shot>
    <Shot a={180} b={268}>
      <Cam a={180} b={268} rx={2} ry={-4}>
        <CountTile y={860} at={182} label="DIEZ DÍAS DESPUÉS" note="ALLANAMIENTOS EN SALAS DE LA ZONA · APUESTAS ILEGALES" from={0} to={10} dur={40} prefix="+" suffix=" DÍAS" valueSize={190} rot={1} />
      </Cam>
      <Headline text="DIEZ DÍAS DESPUÉS" at={182} y={300} size={96} stagger={8} />
    </Shot>
    <Shot a={268} b={340}>
      <Broll file="04-hombres-de-negro-silueta.mp4" dim={0.5} />
      <Cam a={268} b={340} rx={-2} ry={4}>
        <Tile y={860} h={520} at={270} label="EL MOTIVO" value="APUESTAS" note="ALGUNOS DUEÑOS PAGABAN DINERO A LOS JUGADORES CON CONTADORES AÑADIDOS" valueSize={140} rot={-1} />
      </Cam>
      <Headline text="POR *APUESTAS* ILEGALES" at={270} y={300} size={84} stagger={8} />
    </Shot>
    <Tag text="FUENTE: SKEPTOID #362 (B. DUNNING, 2013)" at={20} y={1390} center size={22} />
    <Whip at={88} dir={1} />
    <Whip at={133} dir={-1} />
    <Whip at={178} dir={1} />
    <Whip at={266} dir={-1} />
  </AbsoluteFill>
);

/* ================================================================== */
/* 6 · LA CITA DE INVERSE (2 planos)                                    */
/* ================================================================== */
const QUOTE_A = 'ALMOST CERTAINLY INVENTED … ';
const QUOTE_B = 'TO PROMOTE HIS WEBSITE';
export const Quote: React.FC = () => {
  const f = useCurrentFrame();
  const k = enter(f, 8, 190, 15);
  const z = ci(f, 66, 90, 1, 1.18);
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 150, 0, 90)} rx={f < 66 ? 3 : -2} ry={f < 66 ? -5 : 5}>
        <div style={{ position: 'absolute', left: 90, width: W - 180, top: 520, height: 600, background: COL.card, boxShadow: '0 30px 60px rgba(30,20,10,0.4)', transform: `translateZ(40px) rotate(-1deg) scale(${(0.6 + 0.4 * k) * z})`, opacity: Math.min(1, k * 2), padding: '40px 44px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 200, lineHeight: 0.6, color: COL.red }}>“</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 62, lineHeight: 1.12, color: COL.ink, letterSpacing: '-0.01em', marginTop: 16 }}>
            {QUOTE_A.slice(0, Math.floor(Math.max(0, f - 14) * 1.7))}
            <span style={{ color: COL.red, background: f >= 70 ? 'rgba(227,38,47,0.14)' : undefined }}>{QUOTE_B.slice(0, Math.max(0, Math.floor((f - 14) * 1.7) - QUOTE_A.length))}</span>
            {f < 66 && Math.floor(f / 4) % 2 === 0 ? '▌' : ''}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: COL.muted, marginTop: 28 }}>INVERSE · 31 OCT 2020</div>
        </div>
      </Stage>
      <Headline text="*INVERSE* CONCLUYÓ" at={2} y={300} size={104} out={62} stagger={8} />
      <Headline text="SE INVENTÓ CASI SEGURO|PARA PROMOCIONAR *LA WEB*" at={66} y={1180} size={80} stagger={10} />
      <Whip at={64} dir={1} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · TRES PREGUNTAS PARA DUDAR DE UN MITO                             */
/* ================================================================== */
const QS = ['¿FUENTE DE LA ÉPOCA?', '¿EXISTE EL OBJETO?', '¿QUIÉN LO CONTÓ PRIMERO?'];
export const Check: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 180, 0, 80)} rx={f < 60 ? 3 : f < 110 ? -2 : 2} ry={f < 60 ? -5 : f < 110 ? 5 : -3}>
        {QS.map((q, i) => {
          const k = enter(f, 24 + i * 46, 200, 14);
          if (k <= 0.001) return null;
          const y = 640 + i * 250;
          return (
            <div key={q} style={{ position: 'absolute', left: 90, width: W - 180, top: y - 100, height: 200, background: COL.card, boxShadow: '0 24px 50px rgba(30,20,10,0.32)', transform: `translateZ(30px) rotate(${(i - 1) * 0.9}deg) translateX(${(1 - k) * 700}px)`, opacity: Math.min(1, k * 2), display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px', boxSizing: 'border-box' }}>
              <div style={{ width: 110, height: 110, borderRadius: 55, background: COL.red, color: '#fff', fontFamily: HEAD, fontWeight: 900, fontSize: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: COL.ink }}>{q}</div>
            </div>
          );
        })}
      </Stage>
      <Headline text="PARA DUDAR DE UN *MITO*" at={2} y={300} size={96} stagger={8} />
      <Whip at={58} dir={1} />
      <Whip at={108} dir={-1} />
    </AbsoluteFill>
  );
};
