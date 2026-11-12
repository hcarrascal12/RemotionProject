// EL DEV ARTIFICIAL: the house design system for vertical (9:16) tech documentaries. One place for the palette, the
// safe areas, the timings and the springs, so every video in this project reads as the same channel.
//
// Rule #1: everything here serves one goal, stopping the scroll in the first 1.5 to 3 seconds and holding the viewer
// to the end. If a shot does not create curiosity, tension or impact, it is cut or redesigned.

export const DEV = {
  palette: {
    bg: '#05070A', // deep background
    bg2: '#0B0F17', // lifted background (panels, rooms after grading)
    red: '#FF2A2A', // alert
    green: '#00FF66', // terminal
    amber: '#FFB800', // warning
    white: '#F8FAFC',
    key: '#FFE600', // caption highlight (yellow); red is the other highlight
    cyan: '#3FD8FF', // cold light, beams
  },
  /** Pixels on the 1080 x 1920 frame. The apps put their own interface over the top 250 and the bottom 340. */
  safe: {
    top: 250,
    bottom: 340,
    captionTop: 1270,
    captionBottom: 1560,
    /** A shot's subject (face, data) stays above this line so the captions never cover it. */
    subjectBottom: 1250,
  },
  timing: {
    hookEnd: 3.0, // the first cut lands about here
    beatMin: 2.5, // a visual change every 2.5 to 4 seconds
    beatMax: 4.0,
    readPause: [0.5, 0.8], // key data holds still this long
    vacuum: 0.3, // strategic silence before a reveal
    outro: 4.5, // the binary question and the loop
  },
  spring: {
    hard: { stiffness: 200, damping: 12, mass: 0.6 },
    snap: { stiffness: 200, damping: 20, mass: 0.5 },
  },
  /** Hard effects (flash, shake) are rationed: only on these moments. */
  effectBudget: ['hook', 'burst'] as const,
} as const;

export type Rim = 'warm' | 'red' | 'green' | 'amber' | 'blue';
/** The rim-light filter id (defined in engine/kit.tsx) for each scene colour. */
export const RIM_ID: Record<Rim, string> = { warm: 'rimR', red: 'rimRed', green: 'rimGreen', amber: 'rimAmber', blue: 'rimBlue' };
