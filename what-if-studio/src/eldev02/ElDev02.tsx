/**
 * No Presiones · Sin resolver · Caso Nº 02 · Satoshi Nakamoto — 1080x1920, 30 fps, 38.1 s, seamless loop. Voiced.
 * Persistent layers (background, camera rig, dust, hash rain, grain, timeline rail, status bar) sit outside the TransitionSeries
 * so they never cut.
 * Each sequence is its nominal length + TR so that, after the 8-frame overlaps, every scene starts on its SCENES time.
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { COL, DURATION, EASE, FPS, H, SCENES, TR, W } from './theme';
import { Camera, Dust, FilmFinish, GridBg, HashRain, StatusBar, TimelineRail, zoomBlur } from './ui';
import { FalseSatoshis, GenesisBlockHex, HookScene, LoopOutro, ProofSign, TerminalExit, WalletLock, Whitepaper3D } from './scenes';

const timing = linearTiming({ durationInFrames: TR, easing: EASE });
// TransitionSeries doesn't cross-fade progressively during the overlap — the entering sequence's own frame 0 only
// starts once the full transition duration has elapsed, so whatever it shows first is held at a rising opacity for
// that whole window. That's invisible for the length of the transition if the entering scene's first frames are
// themselves still building up (a card flying in, silhouettes animating in) — exactly the case for the hook→paper
// and wallet→fakes cuts. Keeping those two short (2 frames) shrinks that dead window to nothing worth noticing;
// the other three cuts land on scenes that are already fully legible on their own frame 0, so the full 8 frames reads
// as an actual cross-fade there.
const QUICK_TR = 2;
const quickTiming = linearTiming({ durationInFrames: QUICK_TR, easing: EASE });

export const ElDev02: React.FC<{ withAudio?: boolean; tiktok?: boolean }> = ({ withAudio = true, tiktok = false }) => (
  <AbsoluteFill style={{ background: COL.bg }}>
    <GridBg />
    {/* everything below lives inside a perspective rig with a continuously drifting virtual camera */}
    <Camera>
    <Dust amount={0.6} count={18} />
    <TransitionSeries>
      {/* this sequence's own trailing transition is the quick (2-frame) one, so it only needs +QUICK_TR of
          compensation — leaving it at +TR here was pulling every scene after it ~6 frames later than its
          voice-synced SCENES time. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.hook.len + QUICK_TR}>
        <HookScene tiktok={tiktok} />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f88 */}
      <TransitionSeries.Transition presentation={zoomBlur()} timing={quickTiming} />  {/* was slide-from-bottom: dragged the hook's bottom-anchored title off through a blank frame before the paper scene caught up */}
      <TransitionSeries.Sequence durationInFrames={SCENES.paper.len + TR}>
        <Whitepaper3D />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f238 */}
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={SCENES.genesis.len + TR}>
        <GenesisBlockHex />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f402 */}
      <TransitionSeries.Transition presentation={wipe({ direction: 'from-left' })} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={SCENES.exit.len + TR}>
        <TerminalExit />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f528 */}
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={timing} />
      {/* same fix: wallet's trailing transition is the quick one too. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.wallet.len + QUICK_TR}>
        <WalletLock />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f637 */}
      <TransitionSeries.Transition presentation={zoomBlur()} timing={quickTiming} />  {/* was flip-from-bottom: same gap, the wallet's lock/counter vanished a few frames before "VARIOS DIJERON" arrived */}
      <TransitionSeries.Sequence durationInFrames={SCENES.fakes.len + TR}>
        <FalseSatoshis />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f767 */}
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={SCENES.proof.len + TR}>
        <ProofSign />
      </TransitionSeries.Sequence>
      {/* SFX: digital-glitch-whoosh.wav @ f892 */}
      <TransitionSeries.Transition presentation={wipe({ direction: 'from-top' })} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={SCENES.loop.len}>
        <LoopOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {/* hash rain over the plates: explosive in the hook and the loop, faint in between */}
    <HashRain />
    <Dust amount={1} count={22} />
    </Camera>
    <FilmFinish />
    <TimelineRail />
    <StatusBar />
    {/* No separate captions track: the animated titles already carry the line, and a second text layer
        underneath only collided with them (e.g. the BTC counter vs. "QUIÉN ES." at the hook). */}
    {withAudio ? <Audio src={staticFile('eldev02/mix.wav')} /> : null}
  </AbsoluteFill>
);

export const ELDEV02 = { fps: FPS, width: W, height: H, durationInFrames: DURATION };
