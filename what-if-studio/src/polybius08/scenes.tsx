/**
 * Caso Nº 06 · Polybius — escenas. Estilo del Caso Nº 04/05 (tablero de papel, rotuladora, un acento rojo).
 * Fórmula de los Shorts ganadores analizados: gancho de "imposible" con el material ya en pantalla, pruebas visibles,
 * giro con piezas reales, lista de 3 preguntas y pregunta final que enlaza con el primer frame.
 * Hechos y fuentes: canal/no-presiones/caso-06-polybius/CASO-06-POLYBIUS.md (Skeptoid #362, Inverse 2020, Wikipedia).
 * Imágenes: public/polybius08/ (cabinete CC BY-SA 3.0 de DocAtRS; capturas de coinop.org).
 */
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { COL, H, HEAD, MONO, SCENES, W, ci, rnd, shake } from './theme';
import { Headline, Stage, Stamp, Tag, enter } from './kit';

const CABINET = 'polybius08/cabinete-DocAtRS-CC-BY-SA-3.0.jpg'; // 446x1002
const COINOP = 'polybius08/coinop-wayback-2003-real.png'; // 1920x869, copia de la Wayback Machine (abr-2003)

/** Franjas de interferencia. */
const Glitch: React.FC<{ t: number; n?: number; amp?: number }> = ({ t, n = 5, amp = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${rnd(t * 5 + i) * 100}%`, height: (6 + rnd(t + i) * 34) * amp, background: i % 2 ? 'rgba(227,38,47,0.55)' : 'rgba(111,211,176,0.4)', mixBlendMode: 'screen', transform: `translateX(${(rnd(t * 3 + i) - 0.5) * 80}px)` }} />
    ))}
  </AbsoluteFill>
);

/** Tarjeta de papel con un dato grande (para las pruebas). */
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

/* ================================================================== */
/* 1 · GANCHO / CIERRE: el cabinete, ya en el frame 0 (también portada) */
/* HookView(t=0) es el último frame: el loop vuelve a esta imagen.       */
/* ================================================================== */
export const HookView: React.FC<{ t: number; titles?: boolean }> = ({ t, titles = true }) => {
  const g = t < 10 ? 1.3 : t < 24 ? 0.6 : 0.22;
  const vib = { x: t < 24 ? (t % 2 ? 1 : -1) * 4 : 0, y: 0 };
  const s = shake(t, 38, 14, 8);
  const push = 1 + 0.04 * ci(t, 0, 110, 0, 1);
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
      {/* aviso de la maqueta y crédito de la foto (CC BY-SA 3.0): siempre visibles */}
      <Tag text="MAQUETA · NO ES UNA MÁQUINA ORIGINAL" at={-6} y={236} center size={22} red />
      <Tag text="FOTO: DOCATRS (ROGUE SYNAPSE) · CC BY-SA 3.0" at={-6} y={1520} center size={20} />
      {titles ? (
        <>
          <Headline text="1981 · *PORTLAND*" at={6} y={300} size={110} out={58} stagger={2} />
          <Headline text="UN VIDEOJUEGO QUE|ENFERMABA A *NIÑOS*" at={40} y={1100} size={104} out={104} stagger={10} />
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
/* 2 · CERO MÁQUINAS: «nadie ha encontrado una sola máquina»            */
/* ================================================================== */
const SLOTS: [number, number][] = [
  [270, 660], [540, 660], [810, 660],
  [270, 1000], [540, 1000], [810, 1000],
];
export const Zero: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={interpolateDolly(f)}>
        {SLOTS.map(([x, y], i) => {
          const k = enter(f, 4 + i * 8, 220, 15);
          if (k <= 0) return null;
          return (
            <div key={i} style={{ position: 'absolute', left: x - 90, top: y - 150, width: 180, height: 300, transform: `translateZ(${20 + i * 4}px) rotate(${(rnd(i + 3) - 0.5) * 6}deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2), border: `6px dashed ${COL.ink}`, borderRadius: 12, background: 'rgba(250,250,247,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 130, color: COL.red }}>
              ?
            </div>
          );
        })}
        <Tile y={1300} h={250} at={52} label="MÁQUINAS ENCONTRADAS" value="0" note="NINGUNA CONSERVADA · NINGUNA FOTO DE LA ÉPOCA" valueSize={170} />
      </Stage>
      <Headline text="HAY GENTE QUE|JURA HABERLO *JUGADO*" at={2} y={290} size={96} out={64} stagger={10} />
      <Headline text="NADIE HA ENCONTRADO|UNA SOLA *MÁQUINA*" at={66} y={290} size={96} stagger={10} />
    </AbsoluteFill>
  );
};
const interpolateDolly = (f: number) => ci(f, 0, 140, 0, 90);

/* ================================================================== */
/* 3 · LAS TRES PRUEBAS QUE FALTAN                                      */
/* ================================================================== */
export const Proof: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 270, 0, 110)}>
        <Tile y={620} at={34} label="REVISTAS DE LA ÉPOCA QUE LO MENCIONAN" value="0" note="ELECTRONIC GAMES 1981–84 · SKEPTOID" rot={-1.2} />
        <Tile y={920} at={104} label="ARCHIVOS DEL JUEGO (ROM)" value="0" note="NINGUNO HA SALIDO JAMÁS" rot={1} />
        <Tile y={1220} at={176} label="EMPRESA «SINNESLÖSCHEN»" value="SIN REGISTRO" note="NI EN ALEMANIA, NI EN EE. UU., NI EN JAPÓN · INVERSE" rot={-0.8} valueSize={96} />
      </Stage>
      <Headline text="SE LLAMABA *POLYBIUS*" at={2} y={300} size={104} stagger={8} />
      <Stamp text="SIN PRUEBAS" at={232} x={560} y={900} rot={-9} size={120} />
    </AbsoluteFill>
  );
};

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
      <Stage dolly={ci(f, 0, 200, 0, 90)}>
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
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL GIRO: había piezas reales                                     */
/* ================================================================== */
export const Real: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 340, 0, 110)}>
        <Tile y={760} h={330} at={30} label="PORTLAND · 1981" value="1981" note="DOS JUGADORES SE SIENTEN MAL · EL MISMO DÍA · LA MISMA SALA" rot={-1.2} />
        <Tile y={1130} h={330} at={150} label="DIEZ DÍAS DESPUÉS" value="+10 DÍAS" note="ALLANAMIENTOS EN SALAS DE LA ZONA · APUESTAS ILEGALES" rot={1} valueSize={130} />
      </Stage>
      <Headline text="PERO HABÍA|*PIEZAS REALES*" at={2} y={300} size={104} stagger={10} />
      <Tag text="FUENTE: SKEPTOID #362 (B. DUNNING, 2013)" at={40} y={1350} center size={22} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · LA CITA DE INVERSE                                               */
/* ================================================================== */
export const Quote: React.FC = () => {
  const f = useCurrentFrame();
  const k = enter(f, 8, 190, 15);
  return (
    <AbsoluteFill>
      <Stage dolly={ci(f, 0, 150, 0, 80)}>
        <div style={{ position: 'absolute', left: 90, width: W - 180, top: 520, height: 600, background: COL.card, boxShadow: '0 30px 60px rgba(30,20,10,0.4)', transform: `translateZ(40px) rotate(-1deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2), padding: '40px 44px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 200, lineHeight: 0.6, color: COL.red }}>“</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 62, lineHeight: 1.12, color: COL.ink, letterSpacing: '-0.01em', marginTop: 16 }}>
            ALMOST CERTAINLY INVENTED … <span style={{ color: COL.red }}>TO PROMOTE HIS WEBSITE</span>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: COL.muted, marginTop: 28 }}>INVERSE · 31 OCT 2020</div>
        </div>
      </Stage>
      <Headline text="*INVERSE* CONCLUYÓ" at={2} y={300} size={104} stagger={8} />
      <Headline text="SE INVENTÓ CASI SEGURO|PARA PROMOCIONAR *LA WEB*" at={66} y={1180} size={80} stagger={10} />
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
      <Stage dolly={ci(f, 0, 190, 0, 80)}>
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
    </AbsoluteFill>
  );
};
