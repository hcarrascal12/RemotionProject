import { Easing, interpolate, spring } from 'remotion';
import { DEV } from '../design/devArtificial';

// Shared motion language for the vertical shorts: everything enters fast and lands hard, nothing floats.

/** The house ease: a fast attack that settles precisely. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** A stiff spring for slams and pops. */
export const HARD = { stiffness: 200, damping: 12, mass: 0.6 };
/** Stiffer still, with less overshoot, for UI that must read at once. */
export const SNAP = { stiffness: 200, damping: 20, mass: 0.5 };

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Eased value from a to b between t0 and t1 (seconds or frames, as long as they match t). */
export const ease = (t: number, t0: number, t1: number, a = 0, b = 1) =>
  interpolate(t, [t0, t1], [a, b], { ...CLAMP, easing: EASE });

/** Linear clamped value. */
export const lin = (t: number, t0: number, t1: number, a = 0, b = 1) => interpolate(t, [t0, t1], [a, b], CLAMP);

/** A spring that starts at `at` seconds on the shot clock (0 before it). */
export const springAt = (f: number, fps: number, at: number, config = HARD) =>
  spring({ frame: f - Math.round(at * fps), fps, config });

/** Deterministic pseudo-random number in [0, 1) for a seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A square blink: true for `on` of every `period` seconds. */
export const blink = (t: number, period: number, on = period / 2) => t % period < on;

export const COLOR = {
  red: DEV.palette.red,
  yellow: DEV.palette.key,
  cyan: DEV.palette.cyan,
  green: DEV.palette.green,
  amber: DEV.palette.amber,
  white: DEV.palette.white,
  ink: DEV.palette.bg,
  navy: DEV.palette.bg2,
};

export const HEAVY = 'Therac Heavy';
export const MONO = "'Fragment Mono', 'DejaVu Sans Mono', monospace";

/** What every shot receives: its own clock in seconds and frames, its length and the plan's marks on its clock. */
export type ShotProps = {
  t: number;
  f: number;
  fps: number;
  dur: number;
  variant?: string;
  /** A named mark from the plan, in seconds on this shot's clock (negative if it is before the shot). */
  mark: (name: string) => number;
};

export const fmtThousands = (n: number) => Math.round(n).toLocaleString('en-US');
