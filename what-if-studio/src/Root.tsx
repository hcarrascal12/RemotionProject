import React from 'react';
import { Curio01Board } from './curio01/Curio01Board';
import { Curio01, CURIO01 } from './curio01/Curio01';
import { Sabias01, Sabias01Board, SABIAS01 } from './sabias01/Sabias01';
import { Sabias01Cover } from './sabias01/Cover';
import { Carrusel01 } from './carrusel01/Carrusel01';
import { Carrusel02 } from './carrusel01/Carrusel02';
import { Carrusel03 } from './carrusel01/Carrusel03';
import { Composition } from 'remotion';
import { Fallo02Thumb } from './fallo02/Thumb';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { THERAC, Therac25 } from './therac25/Therac25';
import { FALLO02, Fallo02 } from './fallo02/Fallo02';
import { FALLO03, Fallo03 } from './fallo03/Fallo03';
import { FALLO04, Fallo04 } from './fallo04/Fallo04';
import { Fallo03Cover } from './fallo03/Cover';
import { Fallo02Cover } from './fallo02/Cover';
import { KidsStill } from './kids/KidsStill';
import { Kids, KIDS } from './kids/Kids';

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
      <Composition id="Kids" component={Kids} durationInFrames={Math.round(KIDS.duration * KIDS.fps)} fps={KIDS.fps} width={1920} height={1080} />
      <Composition id="KidsStill" component={KidsStill} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Fallo03" component={Fallo03} durationInFrames={Math.round(FALLO03.duration * FALLO03.fps)} fps={FALLO03.fps} width={FALLO03.width} height={FALLO03.height} />
      <Composition id="Fallo03FB" component={Fallo03} defaultProps={{ fb: true }} durationInFrames={Math.round(FALLO03.duration * FALLO03.fps)} fps={FALLO03.fps} width={FALLO03.width} height={FALLO03.height} />
      <Composition id="Fallo04" component={Fallo04} durationInFrames={Math.round(FALLO04.duration * FALLO04.fps)} fps={FALLO04.fps} width={FALLO04.width} height={FALLO04.height} />
      <Composition id="Sabias01" component={Sabias01} durationInFrames={Math.round(SABIAS01.duration * SABIAS01.fps)} fps={SABIAS01.fps} width={1080} height={1920} />
      <Composition id="Sabias01Board" component={Sabias01Board} durationInFrames={17} fps={30} width={1080} height={1920} />
      <Composition id="Curio01" component={Curio01} durationInFrames={Math.round(CURIO01.duration * CURIO01.fps)} fps={CURIO01.fps} width={1080} height={1920} />
      <Composition id="Curio01Board" component={Curio01Board} durationInFrames={5} fps={30} width={1080} height={1920} />
      <Composition id="Fallo04FB" component={Fallo04} defaultProps={{ fb: true }} durationInFrames={Math.round(FALLO04.duration * FALLO04.fps)} fps={FALLO04.fps} width={FALLO04.width} height={FALLO04.height} />
      <Composition id="Fallo02Cover" component={Fallo02Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Carrusel01" component={Carrusel01} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Carrusel02" component={Carrusel02} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Carrusel03" component={Carrusel03} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Sabias01Cover" component={Sabias01Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo03Cover" component={Fallo03Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo02Thumb" component={Fallo02Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo02" component={Fallo02} durationInFrames={Math.round(FALLO02.duration * FALLO02.fps)} fps={FALLO02.fps} width={FALLO02.width} height={FALLO02.height} />
    </>
  );
};
