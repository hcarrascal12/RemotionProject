import React from 'react';
import { Composition } from 'remotion';
import { Fallo02Thumb } from './fallo02/Thumb';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { THERAC, Therac25 } from './therac25/Therac25';
import { FALLO02, Fallo02 } from './fallo02/Fallo02';
import { FALLO03, Fallo03 } from './fallo03/Fallo03';
import { Fallo03Cover } from './fallo03/Cover';
import { KidsStill } from './kids/KidsStill';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
        </React.Fragment>
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      {/* Vertical short with its own size and frame rate, outside the studio's 16:9 episodes. */}
      <Composition
        id="Therac25"
        component={Therac25}
        durationInFrames={Math.round(THERAC.duration * THERAC.fps)}
        fps={THERAC.fps}
        width={THERAC.width}
        height={THERAC.height}
      />
      <Composition id="KidsStill" component={KidsStill} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Fallo03" component={Fallo03} durationInFrames={Math.round(FALLO03.duration * FALLO03.fps)} fps={FALLO03.fps} width={FALLO03.width} height={FALLO03.height} />
      <Composition id="Fallo03Cover" component={Fallo03Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo02Thumb" component={Fallo02Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo02" component={Fallo02} durationInFrames={Math.round(FALLO02.duration * FALLO02.fps)} fps={FALLO02.fps} width={FALLO02.width} height={FALLO02.height} />
    </>
  );
};
