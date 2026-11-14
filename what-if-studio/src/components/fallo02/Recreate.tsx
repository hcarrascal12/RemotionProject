import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, Study, Desk, faceAt, LaptopBack, AlarmClock, Classroom, SchoolDesk, Terminal, TERMINAL, stand, reachAngle, Glow, LEG_LEN } from '../../engine';
import { CineCamera, edgeFg, ef } from '../CineCamera';
import { CharacterRig } from '../CharacterRig';
import { COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from '../motion';
import { Bsod, BLUE, Monitor, Stamp } from './parts';

// Fallo #02 as a RECREATION, in the What If style: every scene is a real place with a character in it. Pip, Pip in his
// hoodie, Mo, and the man in the suit, in the study at night, a classroom, the control room and an airport hall.
// Variants (the shot's `variant` in plan.json):
//   wake      Pip at his desk, tired; the date stamps in
//   bsod      Pip and a monitor that turns blue
//   crash     Pip and a monitor that does not know what to do, then blue
//   reboot    Pip pressing the power button, again and again
//   locked    Pip, the blue monitor, a padlock and the fix that cannot reach it
//   alone     Pip alone with a glowing laptop
//   hookbg    the same, dim, under the hook's titles
//   hacker    the hooded figure everybody imagines, crossed out
//   office    the man in the suit presses the red key ENVIAR
//   class     Mo at the board: a list of 20 and the 21st that is not there
//   crowd     the whole classroom on blue screens
//   ops       Mo in the control room pulling the update back
//   fix       Mo goes from laptop to laptop
//   terminal  an airport hall: the board turns CANCELADO, the cash machine is out of service

const PIP = LOOKS.pip;
const HOOD = LOOKS.pipHood;
const MO = LOOKS.mo;
const SUIT = LOOKS.suit;
const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

const deskPose = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: 960, y: 712, scale: 1, yaw: 0.1, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, ...o });

// ---------- the study ----------
const MON = { x: 620, y: 452, w: 300 };

const StudyShot: React.FC<ShotProps & { monitor?: React.ReactNode; laptop?: boolean; night?: boolean; look?: typeof PIP; pose: Pose; rim?: 'blue' | 'amber' | 'red'; lightColor?: string; zoom?: number; cx?: number; extra?: React.ReactNode; over?: React.ReactNode; dim?: number }> = ({
  t, dur, monitor, laptop = false, night = true, look = PIP, pose, rim = 'blue', lightColor = BLUE, zoom = 2.15, cx = 860, extra, over, dim = 0,
}) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);
  const glow = 0.8 + 0.2 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <CineCamera cx={cx} cy={560} zoom={zoom + 0.15 * p} tint={rim === 'blue' ? 'blue' : rim === 'red' ? 'red' : 'amber'} vignette={0.7} light={{ x: monitor ? 770 : 990, y: 600, r: 380, color: lightColor, o: 0.5 * glow }} fg={edgeFg(cx, 560, zoom)}>
        <Study t={e + 200} id="rc" night={night} />
        <CharacterRig look={look} pose={pose} t={t} rim={rim} seed={5} />
        <Desk x0={520} x1={1360} y={700} laptop={false} />
        {monitor ? <Monitor x={MON.x} y={MON.y} w={MON.w}>{monitor}</Monitor> : null}
        {laptop ? <LaptopBack x={1060} y={700} w={250} glow={glow} /> : null}
        {extra}
      </CineCamera>
      {dim > 0 ? <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}><rect width={1080} height={1920} fill="#04101F" opacity={dim} /></svg> : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>{over}</svg>
    </AbsoluteFill>
  );
};

const MW = MON.w;
const MH = MON.w * 0.62;

export const Recreation: React.FC<ShotProps> = (props) => {
  const { t, f, fps, dur, variant = 'alone', mark } = props;
  const e = ef(t);

  // ----- Pip wakes at his desk -----
  if (variant === 'wake') {
    const apago = num(mark('apago'), 0.5);
    const fecha = num(mark('fecha'), 1.6);
    const rub = Math.max(0, 1 - Math.max(0, t - apago + 0.1) / 0.3);
    const pose = deskPose({
      armR: { a: 20 + 120 * rub, b: 20 + 50 * rub },
      headTilt: 4 - 8 * Math.min(1, Math.max(0, (t - apago) / 0.5)),
      ...faceAt(e, [[0, 'tired'], [Math.round(apago * 30), 'shock']]),
    });
    return (
      <StudyShot
        {...props}
        pose={pose}
        laptop
        extra={<AlarmClock x={800} y={690} s={1.1} text="08:01" />}
      />
    );
  }

  // ----- Pip and the monitor -----
  if (variant === 'bsod' || variant === 'crash' || variant === 'reboot' || variant === 'locked') {
    const watch = (o: Partial<Pose>): Pose => deskPose({ x: 1010, yaw: -0.55, look: -0.8, ...o });
    if (variant === 'bsod') {
      const azul = num(mark('azul'), 0.9);
      const on = t >= azul - 0.1;
      const flick = on && t < azul + 0.35 ? (rand(Math.floor(t * 30)) > 0.5 ? 1 : 0.3) : 1;
      const recoil = t >= azul ? Math.exp(-(t - azul) / 0.22) : 0;
      const pose = watch({ armR: { a: 40, b: 40 }, tilt: 10 * recoil, squash: -0.07 * recoil, ...faceAt(e, [[0, 'neutral'], [Math.round(azul * 30), 'shock']]) });
      return (
        <StudyShot
          {...props}
          pose={pose}
          monitor={on ? <g opacity={flick}><Bsod x={0} y={0} w={MW} h={MH} t={t} pct={Math.min(100, 8 + 30 * lin(t, azul, azul + 2.2))} /></g> : <g><rect width={MW} height={MH} fill="#E9EEF5" /><circle cx={MW / 2} cy={MH / 2} r={22} fill="none" stroke="#0A6BD6" strokeWidth={6} strokeDasharray="40 90" transform={`rotate(${t * 360} ${MW / 2} ${MH / 2})`} /></g>}
        />
      );
    }
    if (variant === 'crash') {
      const bloquea = num(mark('bloquea'), 1.6);
      const crashed = t >= bloquea;
      const rc = t >= bloquea ? Math.exp(-(t - bloquea) / 0.2) : 0;
      const pose = watch({ armR: { a: 30 + 70 * Math.min(1, t / Math.max(0.2, bloquea)), b: 30 }, tilt: 12 * rc, squash: -0.08 * rc, ...faceAt(e, [[0, 'worried'], [Math.round(bloquea * 30), 'shock']]) });
      return (
        <StudyShot
          {...props}
          pose={pose}
          rim={crashed ? 'red' : 'blue'}
          lightColor={crashed ? COLOR.red : BLUE}
          monitor={crashed ? <Bsod x={0} y={0} w={MW} h={MH} t={t} pct={Math.min(100, 12 * (t - bloquea))} glitch={Math.max(0, 1 - (t - bloquea) / 0.8)} /> : (
            <g>
              <rect width={MW} height={MH} fill="#E9EEF5" />
              <circle cx={MW / 2} cy={MH / 2} r={26} fill="none" stroke="#0A6BD6" strokeWidth={7} strokeDasharray="50 110" transform={`rotate(${t * 360} ${MW / 2} ${MH / 2})`} />
            </g>
          )}
          extra={!crashed ? (
            <g>
              {Array.from({ length: 4 }, (_, i) => {
                const age = (t * 0.9 + i * 0.35) % 1.4;
                return <text key={i} x={690 + i * 60} y={430 - age * 90} fontFamily={HEAVY} fontWeight={900} fontSize={54} fill={COLOR.yellow} stroke="#000" strokeWidth={4} paintOrder="stroke" opacity={1 - age / 1.4}>?</text>;
              })}
            </g>
          ) : null}
        />
      );
    }
    if (variant === 'reboot') {
      const re = num(mark('reinicias'), 0.1);
      const otra = num(mark('otraVez'), 1.5);
      const cycle = 1.1;
      const ph = ((t - re + cycle) % cycle) / cycle;
      const second = t >= otra - 0.15;
      const showBsod = second || ph > 0.62;
      const attempts = 1 + Math.floor(Math.max(0, t - re) / cycle) + (second ? 1 : 0);
      const press = Math.max(0, 1 - ((t - re + cycle) % cycle) / 0.25);
      const pose = watch({ armR: { a: 70 + 12 * press, b: 22 }, handR: 'point', ...faceAt(e, [[0, 'worried'], [Math.round(otra * 30), 'dizzy']]) });
      return (
        <StudyShot
          {...props}
          pose={pose}
          monitor={showBsod ? <Bsod x={0} y={0} w={MW} h={MH} t={t} pct={Math.min(100, (ph / 0.38) * 100)} glitch={second && t < otra + 0.5 ? 0.8 : 0} /> : (
            <g>
              <rect width={MW} height={MH} fill="#000" />
              <text x={MW / 2} y={MH / 2 - 6} textAnchor="middle" fontFamily={MONO} fontSize={20} fill="#FFF">REINICIANDO</text>
              <circle cx={MW / 2} cy={MH / 2 + 30} r={14} fill="none" stroke="#FFF" strokeWidth={4} strokeDasharray="30 60" transform={`rotate(${t * 540} ${MW / 2} ${MH / 2 + 30})`} />
            </g>
          )}
          over={(
            <g transform="translate(540 370)">
              <rect x={-300} y={-70} width={600} height={140} rx={24} fill="#000000B0" stroke={COLOR.yellow} strokeWidth={8} />
              <text y={34} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={92} fill={COLOR.yellow}>{`INTENTO ${attempts}`}</text>
            </g>
          )}
        />
      );
    }
    // locked
    const tuya = num(mark('tuya'), 0.9);
    const k = springAt(f, fps, tuya - 0.1, HARD);
    const bounce = Math.abs(Math.sin(t * 5)) * 40;
    const pose = watch({ armR: { a: 20, b: 30 }, ...faceAt(e, [[0, 'worried']]) });
    return (
      <StudyShot
        {...props}
        pose={pose}
        rim="red"
        lightColor={COLOR.red}
        monitor={<g><Bsod x={0} y={0} w={MW} h={MH} t={t} pct={20} /></g>}
        extra={(
          <g>
            {/* the fix tries to reach the monitor and bounces off a padlock */}
            <g transform={`translate(${520 + 14 * Math.sin(t * 9)} ${460 - bounce * 0.3})`}>
              <rect x={-60} y={-34} width={120} height={68} rx={10} fill="#FFF" stroke="#18C964" strokeWidth={6} />
              <path d="M -24 0 L -6 18 L 28 -18" stroke="#18C964" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g transform={`translate(${MON.x + MW / 2} ${MON.y + MH / 2}) scale(${0.5 + 0.7 * Math.min(1, k)})`} opacity={Math.min(1, k * 1.4)}>
              <rect x={-44} y={-24} width={88} height={70} rx={10} fill={COLOR.red} stroke="#FFF" strokeWidth={6} />
              <path d="M -24 -24 L -24 -54 Q -24 -84 0 -84 Q 24 -84 24 -54 L 24 -24" fill="none" stroke="#FFF" strokeWidth={10} />
              <circle cy={10} r={9} fill="#FFF" />
            </g>
          </g>
        )}
      />
    );
  }

  // ----- the calendar: Friday 19 July 2024 -----
  if (variant === 'calendar') {
    const fecha = Math.max(0.3, num(mark('fecha'), 0.8));
    const k = springAt(f, fps, fecha, HARD);
    const circ = Math.min(1, Math.max(0, (t - fecha) / 0.35));
    const CX = 1255;
    const CY = 360;
    const pose = deskPose({ yaw: 0.6, look: 0.8, armR: { a: 70 + 20 * circ, b: 6 }, handR: 'point', headTilt: -3, ...faceAt(e, [[0, 'neutral'], [Math.round(fecha * 30), 'happy']]) });
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return (
      <StudyShot
        {...props}
        pose={pose}
        night={false}
        rim="amber"
        lightColor={COLOR.amber}
        cx={1090}
        zoom={2.2}
        extra={(
          <g transform={`translate(${CX} ${CY})`}>
            <rect x={-122} y={-20} width={244} height={296} rx={8} fill="#F4EEDD" stroke="#1E1824" strokeWidth={5} />
            <rect x={-122} y={-20} width={244} height={44} rx={8} fill="#B23A3A" />
            <text x={0} y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={24} fill="#FFF">JULIO 2024</text>
            {days.map((d, i) => <text key={d} x={-98 + i * 33} y={48} textAnchor="middle" fontFamily={MONO} fontSize={14} fill="#7A6A5A">{d}</text>)}
            {Array.from({ length: 31 }, (_, i) => {
              const c = i % 7;
              const r = Math.floor(i / 7);
              const day = i + 1;
              const hot = day === 19;
              return <text key={day} x={-98 + c * 33} y={78 + r * 42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={hot ? 22 : 18} fill={hot ? '#B01E1E' : '#2A2420'}>{day}</text>;
            })}
            <circle cx={-98 + 4 * 33} cy={78 + 2 * 42 - 8} r={21} fill="none" stroke="#E5252A" strokeWidth={5} strokeDasharray={132} strokeDashoffset={132 * (1 - circ)} transform={`rotate(-90 ${-98 + 4 * 33} ${78 + 2 * 42 - 8})`} />
          </g>
        )}
        over={<Stamp k={k} x={540} y={360} label="19 JUL 2024" sub="VIERNES" color={COLOR.yellow} w={760} size={120} />}
      />
    );
  }

  // ----- Pip alone -----
  if (variant === 'alone' || variant === 'hookbg') {
    const pose = deskPose({ headTilt: -4, ...faceAt(e, [[0, 'worried']]) });
    return <StudyShot {...props} pose={pose} laptop dim={variant === 'hookbg' ? 0.55 : 0} />;
  }

  // ----- the hooded figure -----
  if (variant === 'hacker') {
    const cy = num(mark('ciberataque'), 0.9);
    const x = springAt(f, fps, cy, HARD);
    const pose = deskPose({ headTilt: 4, armL: { a: 38, b: 34 }, armR: { a: 38, b: 34 }, ...faceAt(e, [[0, 'smug']]) });
    return (
      <StudyShot
        {...props}
        look={HOOD}
        pose={pose}
        laptop
        rim="red"
        lightColor={COLOR.red}
        over={x > 0.01 ? (
          <g transform={`translate(540 880) rotate(${-14 * (1 - Math.min(1, x))}) scale(${3 - 2 * x})`} opacity={Math.min(1, x * 1.5)}>
            <line x1={-360} y1={-300} x2={360} y2={400} stroke={COLOR.red} strokeWidth={34} strokeLinecap="round" />
            <line x1={360} y1={-300} x2={-360} y2={400} stroke={COLOR.red} strokeWidth={34} strokeLinecap="round" />
          </g>
        ) : null}
      />
    );
  }

  // ----- the man in the suit presses ENVIAR -----
  if (variant === 'office') {
    const envia = num(mark('envia'), 0.8);
    const k = springAt(f, fps, envia, HARD);
    const press = Math.max(0, 1 - Math.max(0, t - envia) / 0.25) * (t >= envia ? 1 : 0);
    const pose = deskPose({ yaw: 0.1, armR: { a: 40 + 40 * press, b: 24 }, handR: 'point', headTilt: -2, ...faceAt(e, [[0, 'smug']]) });
    const sent = ease(t, envia, envia + 1.2);
    return (
      <StudyShot
        {...props}
        look={SUIT}
        night={false}
        rim="amber"
        lightColor={COLOR.amber}
        pose={pose}
        extra={(
          <g>
            <rect x={1090} y={684 + 6 * press} width={150} height={30} rx={8} fill="#3A0004" />
            <rect x={1090} y={668 + 8 * press} width={150} height={32} rx={8} fill={COLOR.red} stroke="#FFF" strokeWidth={3} />
            <text x={1165} y={692 + 8 * press} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={24} fill="#FFF">ENVIAR</text>
          </g>
        )}
        over={(
          <g>
            {Array.from({ length: 8 }, (_, i) => {
              const s = Math.max(0, Math.min(1, sent * 1.4 - i * 0.07));
              if (s <= 0 || s >= 1) return null;
              return (
                <g key={i} transform={`translate(${380 + i * 85} ${900 - 640 * s}) rotate(${(i % 2 ? 1 : -1) * 12})`} opacity={1 - s * 0.6}>
                  <rect x={-34} y={-24} width={68} height={48} rx={6} fill="#FFF" stroke={COLOR.cyan} strokeWidth={4} />
                  <text y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={22} fill="#0A6BD6">.sys</text>
                </g>
              );
            })}
            <Stamp k={k} x={540} y={400} label="ACTUALIZACIÓN" color={COLOR.cyan} w={860} size={96} rot={-3} />
          </g>
        )}
      />
    );
  }

  // ----- the classroom: the list of 20 and the 21st, or the class on blue screens -----
  if (variant === 'class' || variant === 'crowd' || variant === 'classpoint') {
    const isList = variant !== 'crowd';
    const closeUp = variant === 'classpoint';
    const dato = Math.max(0.3, num(mark('dato'), 1.3));
    const v21 = Math.max(dato + 0.3, num(mark('veintiuno'), 1.9));
    const v20 = Math.max(v21 + 0.3, num(mark('veinte'), 2.9));
    const burst = num(mark('burst'), 0.5);
    const p = Math.min(1, Math.max(0, (t - (burst - 0.2)) / 1.3));
    const filled = closeUp ? 20 : Math.min(20, Math.floor(lin(t, 0.05, dato + 0.9, 0, 21)));
    const bad = closeUp ? true : t > v21 + 0.1;
    const moPos = { ...basePose, x: 1150, y: 760, scale: 1, yaw: -0.35 };
    const reach = reachAngle(moPos, { x: 1000, y: 470 });
    const point = closeUp ? Math.min(1, t / 0.25) : ease(t, dato - 0.1, v21 + 0.1);
    const pose: Pose = isList
      ? { ...moPos, armR: { a: 20 + (reach - 20) * point, b: -4 * point }, handR: 'point', headTilt: -4, ...faceAt(e, [[0, 'neutral'], [Math.round(v21 * 30), 'worried']]) }
      : { ...moPos, yaw: -0.1, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, ...faceAt(e, [[0, 'shock']]) };
    const board = isList ? (
      <g>
        <text x={740} y={232} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#E8E4D4">UNA LISTA DE 20</text>
        {Array.from({ length: 21 }, (_, i) => {
          const c = i % 7;
          const r = Math.floor(i / 7);
          const x = 446 + c * 86;
          const y = 258 + r * 86;
          const is21 = i === 20;
          const fill = is21 ? (bad ? COLOR.red : 'none') : i < filled ? '#3FD27A' : 'none';
          return (
            <g key={i}>
              <rect x={x} y={y} width={72} height={68} rx={8} fill={fill} stroke="#E8E4D4" strokeWidth={4} opacity={is21 && bad ? (Math.floor(t * 8) % 2 ? 1 : 0.55) : 1} />
              <text x={x + 36} y={y + 48} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={i < filled || (is21 && bad) ? '#04101F' : '#B8B4A4'}>{is21 ? (bad ? '?' : '21') : i + 1}</text>
            </g>
          );
        })}
      </g>
    ) : <Bsod x={426} y={196} w={628} h={328} t={t} pct={Math.min(100, 20 + 80 * p)} />;
    return (
      <AbsoluteFill>
        <CineCamera cx={closeUp ? 1010 : isList ? ease(t, dato, v21 + 0.2, 760, 1000) : 900} cy={closeUp ? 520 : 480} zoom={closeUp ? 2.3 : 1.85} tint={isList ? 'blue' : 'red'} vignette={0.7} fg={edgeFg(900, 480, 1.85)}>
          <Classroom t={e + 100} id="rcl" board={board} />
          <CharacterRig look={isList ? MO : PIP} pose={pose} t={t} rim={isList ? 'blue' : 'red'} seed={9} />
          <SchoolDesk x={1150} />
          {!isList ? <rect x={300} y={130} width={1200} height={600} fill={BLUE} opacity={0.12 + 0.05 * Math.sin(t * 8)} /> : null}
        </CineCamera>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {isList && closeUp ? <Stamp k={springAt(f, fps, 0.35, HARD)} x={540} y={400} label="NO EXISTE" sub="LA LISTA TIENE 20" color={COLOR.red} w={780} size={110} /> : null}
          {isList && !closeUp ? <Stamp k={springAt(f, fps, v20 + 0.15, HARD)} x={540} y={1130} label="NO EXISTE" sub="LA LISTA TIENE 20" color={COLOR.red} w={780} size={110} /> : isList ? null : (
            <g transform={`translate(540 430) scale(${0.8 + 0.2 * springAt(f, fps, burst - 0.1, HARD)})`}>
              <rect x={-440} y={-120} width={880} height={240} rx={28} fill="#000" stroke={COLOR.cyan} strokeWidth={10} />
              {/* the number was given in the hook: here it lands once and then turns into the new fact, how small a share of all Windows it is */}
              {t < burst + 0.75 ? (
                <g>
                  <text x={0} y={52} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={140} fill="#FFFFFF">8,500,000</text>
                  <text x={0} y={-62} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF">EQUIPOS BLOQUEADOS</text>
                </g>
              ) : (
                <g transform={`scale(${0.85 + 0.15 * Math.min(1.1, springAt(f, fps, burst + 0.75, HARD))})`}>
                  <text x={0} y={-62} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF">ESO ES</text>
                  <text x={0} y={60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={112} fill={COLOR.yellow}>MENOS DEL 1 %</text>
                  <text x={0} y={150} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#9FB4C7">DE TODOS LOS WINDOWS DEL MUNDO</text>
                </g>
              )}
            </g>
          )}
        </svg>
      </AbsoluteFill>
    );
  }

  // ----- Mo pulls the update back -----
  if (variant === 'ops') {
    const min78 = num(mark('min78'), 0.6);
    const ret = num(mark('retiran'), 1.4);
    const p = Math.min(1, Math.max(0, (t - 0.1) / Math.max(0.5, ret)));
    const mins = Math.round(78 * p);
    const hit = t >= ret ? Math.max(0, 1 - (t - ret) / 0.25) : 0;
    const pose = deskPose({ yaw: 0.1, armR: { a: 40 + 40 * hit, b: 24 }, handR: 'point', headTilt: 4, ...faceAt(e, [[0, 'worried'], [Math.round(ret * 30), 'neutral']]) });
    const k = springAt(f, fps, min78 - 0.1, HARD);
    return (
      <StudyShot
        {...props}
        look={MO}
        night={false}
        rim="amber"
        lightColor={COLOR.amber}
        pose={pose}
        cx={820}
        monitor={(
          <g>
            <rect width={MW} height={MH} fill="#0B1220" />
            <text x={MW / 2} y={MH / 2 - 22} textAnchor="middle" fontFamily={MONO} fontSize={17} fill="#FFF">{t >= ret ? 'ACTUALIZACIÓN RETIRADA' : 'RETIRANDO...'}</text>
            <rect x={30} y={MH / 2 - 4} width={MW - 60} height={14} rx={7} fill="#1B2A40" />
            <rect x={30} y={MH / 2 - 4} width={(MW - 60) * p} height={14} rx={7} fill={t >= ret ? '#18C964' : COLOR.yellow} />
            <text x={30} y={MH / 2 + 38} fontFamily={MONO} fontWeight={700} fontSize={16} fill="#FFF">04:09 UTC</text>
            <text x={MW - 30} y={MH / 2 + 38} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={16} fill={COLOR.yellow}>05:27 UTC</text>
          </g>
        )}
        extra={(
          <g>
            <rect x={1090} y={684 + 6 * hit} width={150} height={30} rx={8} fill="#0A4A24" />
            <rect x={1090} y={668 + 8 * hit} width={150} height={32} rx={8} fill="#18C964" stroke="#FFF" strokeWidth={3} />
            <text x={1165} y={692 + 8 * hit} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={22} fill="#04210F">RETIRAR</text>
          </g>
        )}
        over={(
          <g>
            <g transform={`translate(540 440) scale(${0.8 + 0.2 * Math.min(1, k)})`}>
              <circle r={130} fill="#0B1220E6" stroke={COLOR.yellow} strokeWidth={10} />
              {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-112} x2={0} y2={-98} stroke="#9FB4C7" strokeWidth={6} transform={`rotate(${i * 30})`} />)}
              <line x1={0} y1={0} x2={0} y2={-106} stroke={COLOR.red} strokeWidth={10} strokeLinecap="round" transform={`rotate(${p * 468})`} />
              <circle r={11} fill={COLOR.red} />
            </g>
            <text x={540} y={680} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={130} fill="#FFF" stroke="#000" strokeWidth={10} paintOrder="stroke">{`${mins} MIN`}</text>
          </g>
        )}
      />
    );
  }

  // ----- Mo goes from laptop to laptop -----
  if (variant === 'fix') {
    const mano = num(mark('mano'), 0.9);
    const total = 4;
    const xs = [700, 880, 1060, 1230];
    const stepLen = 0.5;
    const tt = Math.max(0, t - (mano - 0.3));
    const idx = Math.min(total - 1, Math.floor(tt / stepLen));
    const fixed = Math.min(total, Math.floor(tt / stepLen));
    const frac = Math.min(1, (tt - idx * stepLen) / 0.22);
    const from = idx === 0 ? xs[0] - 90 : xs[idx - 1] - 30;
    const mx = from + (xs[idx] - 30 - from) * ease(frac, 0, 1);
    const pose = deskPose({ x: mx, yaw: 0.3, armR: { a: 55 + 12 * Math.sin(t * 7), b: 16 }, handR: 'point', headTilt: 4, ...faceAt(e, [[0, 'neutral'], [Math.round(mano * 30), 'happy']]) });
    return (
      <AbsoluteFill>
        <CineCamera cx={950} cy={560} zoom={1.85} tint="green" vignette={0.65} fg={edgeFg(950, 560, 1.85)}>
          <Study t={e + 200} id="rfx" />
          <CharacterRig look={MO} pose={pose} t={t} rim="amber" seed={8} />
          <Desk x0={500} x1={1380} y={700} laptop={false} />
          {xs.map((x, i) => (
            <g key={i}>
              <LaptopBack x={x} y={700} w={150} glow={i < fixed ? 0.2 : 1} />
              {i < fixed ? <circle cx={x} cy={640} r={110} fill="#18C964" opacity={0.28} /> : null}
              {i < fixed ? <path d={`M ${x - 22} 630 L ${x - 6} 648 L ${x + 26} 612`} stroke="#18C964" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
            </g>
          ))}
        </CineCamera>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Stamp k={springAt(f, fps, mano - 0.1, HARD)} x={540} y={400} label="A MANO" sub="UNA POR UNA" color={COLOR.yellow} w={640} size={120} />
        </svg>
      </AbsoluteFill>
    );
  }

  // ----- an airport hall -----
  const vuelo = num(mark('vuelo'), 0.1);
  const banco = num(mark('banco'), 1.2);
  const isAtm = variant === 'atm';
  const cancelled = isAtm ? 5 : Math.min(5, Math.floor(lin(t, vuelo - 0.1, vuelo + 0.8, 0, 5.99)));
  const cx = isAtm ? 1240 : 760 + 20 * (t / Math.max(0.01, dur));
  const trav = stand(TERMINAL, 0.27, 0.3, 0.5);
  const atm = stand(TERMINAL, 0.8, 0.3, 0.5);
  const floorY = trav.y + LEG_LEN * trav.scale;
  const moPose: Pose = { ...basePose, x: trav.x, y: trav.y, scale: trav.scale, yaw: 0.35, look: 0.6, headTilt: -10, armR: { a: 20, b: 6 }, ...faceAt(e, [[0, 'neutral'], [Math.round(vuelo * 30), 'worried']]) };
  const pipPose: Pose = { ...basePose, x: atm.x, y: atm.y, scale: atm.scale, yaw: -0.6, look: -0.7, armR: { a: 30, b: 24 }, ...faceAt(e, [[0, 'neutral'], [isAtm ? 8 : 9999, 'shock']]) };
  return (
    <AbsoluteFill>
      <CineCamera cx={cx} cy={500} zoom={1.9} tint="blue" vignette={0.7} fg={edgeFg(cx, 500, 1.9)}>
        <Terminal t={e} id="rtm" cancelled={cancelled} atmDown={isAtm && t >= 0.35 ? 1 : 0} />
        <CharacterRig look={MO} pose={moPose} t={t} rim="blue" seed={2} />
        <g transform={`translate(${trav.x + 96 * trav.scale} ${floorY})`}>
          <rect x={-30} y={-96 * trav.scale} width={60} height={92 * trav.scale} rx={8} fill="#C2553E" stroke="#000" strokeWidth={3} />
          <rect x={-5} y={-132 * trav.scale} width={10} height={40 * trav.scale} fill="#2A2A30" />
        </g>
        <CharacterRig look={PIP} pose={pipPose} t={t} rim="blue" seed={3} />
        <Glow x={atm.x} y={atm.y - 40} r={220} kind={isAtm && t >= 0.35 ? 'red' : 'cool'} o={0.4} />
      </CineCamera>
    </AbsoluteFill>
  );
};
