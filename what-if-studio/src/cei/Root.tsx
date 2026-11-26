import React from 'react';
import { Composition } from 'remotion';
import { Reel, REEL } from './Reel';
import { Full, FULL } from './Full';

export const Root: React.FC = () => (
  <>
    <Composition id="CeiReel" component={Reel} durationInFrames={Math.round(REEL.duration * REEL.fps)} fps={REEL.fps} width={1080} height={1920} />
    <Composition id="CeiFull" component={Full} durationInFrames={Math.round(FULL.duration * FULL.fps)} fps={FULL.fps} width={1080} height={1920} />
  </>
);
