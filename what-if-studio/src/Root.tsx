import React from 'react';
import { Curio01Board } from './curio01/Curio01Board';
import { Curio01, CURIO01 } from './curio01/Curio01';
import { Sabias01, Sabias01Board, SABIAS01 } from './sabias01/Sabias01';
import { Sabias01Cover } from './sabias01/Cover';
import { Carrusel01 } from './carrusel01/Carrusel01';
import { Carrusel02 } from './carrusel01/Carrusel02';
import { Carrusel03 } from './carrusel01/Carrusel03';
import sabias01rTimeline from './sabias01r/timeline.json';
import { Fallo04WI, Fallo04WIBoard, FALLO04WI, FALLO04WI_SHOTS } from './fallo04wi/Fallo04WI';
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
import { Sin01, SIN01 } from './sin01/Sin01';
import { ElDev02, ELDEV02 } from './eldev02/ElDev02';
import { Polar05, POLAR05 } from './polar05/Polar05';
import { Polar05Thumb } from './polar05/Thumb';
import { Gato06Thumb } from './gato06/Thumb';
import { FbCover } from './gato06/FbCover';
import { YtBanner } from './gato06/YtBanner';
import { Gato06Stories } from './gato06/Stories';
import { Satoshi07, SATOSHI07 } from './satoshi07/Satoshi07';
import { Momo07, MOMO07 } from './momo07/Momo07';
import { Gato06, GATO06 } from './gato06/Gato06';
import { SatoshiThumbTall, SatoshiThumbWide } from './eldev02/Thumb';
import { Cicada01, CICADA01, Cicada01P1, CICADA01_P1, Cicada01Cover, Cicada01P2, CICADA01_P2, Satoshi02, SATOSHI02, Satoshi02Doc, Satoshi02Board } from './cicada01/Cicada01';

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
      <Composition id="Sabias01R" component={Sabias01} defaultProps={{ timeline: sabias01rTimeline as typeof SABIAS01, audio: 'sabias01r/mix.wav' }} durationInFrames={Math.round(sabias01rTimeline.duration * sabias01rTimeline.fps)} fps={sabias01rTimeline.fps} width={1080} height={1920} />
      <Composition id="Sabias01Board" component={Sabias01Board} durationInFrames={17} fps={30} width={1080} height={1920} />
      <Composition id="Curio01" component={Curio01} durationInFrames={Math.round(CURIO01.duration * CURIO01.fps)} fps={CURIO01.fps} width={1080} height={1920} />
      <Composition id="Curio01Board" component={Curio01Board} durationInFrames={5} fps={30} width={1080} height={1920} />
      <Composition id="Fallo04FB" component={Fallo04} defaultProps={{ fb: true }} durationInFrames={Math.round(FALLO04.duration * FALLO04.fps)} fps={FALLO04.fps} width={FALLO04.width} height={FALLO04.height} />
      <Composition id="Fallo02Cover" component={Fallo02Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Carrusel01" component={Carrusel01} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Carrusel02" component={Carrusel02} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Carrusel03" component={Carrusel03} durationInFrames={8} fps={30} width={1080} height={1350} />
      <Composition id="Fallo04WI" component={Fallo04WI} durationInFrames={Math.round(FALLO04WI.duration * FALLO04WI.fps)} fps={FALLO04WI.fps} width={1080} height={1920} />
      <Composition id="Fallo04WIBoard" component={Fallo04WIBoard} durationInFrames={FALLO04WI_SHOTS} fps={30} width={1080} height={1920} />
      <Composition id="Sabias01Cover" component={Sabias01Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo03Cover" component={Fallo03Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Fallo02Thumb" component={Fallo02Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Cicada01Cover" component={Cicada01Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Cicada01CoverB" component={Cicada01Cover} defaultProps={{ line2: 'LOS PEGÓ?' }} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Satoshi02Doc" component={Satoshi02Doc} durationInFrames={1200} fps={30} width={1080} height={1920} />
      <Composition id="Satoshi02Board" component={Satoshi02Board} durationInFrames={1200} fps={30} width={1080} height={1920} />
      <Composition id="ElDev02Satoshi" component={ElDev02} durationInFrames={ELDEV02.durationInFrames} fps={ELDEV02.fps} width={ELDEV02.width} height={ELDEV02.height} />
      <Composition id="ElDev02SatoshiTikTok" component={ElDev02} durationInFrames={ELDEV02.durationInFrames} fps={ELDEV02.fps} width={ELDEV02.width} height={ELDEV02.height} defaultProps={{ tiktok: true }} />
      <Composition id="Caso04Gato" component={Gato06} durationInFrames={GATO06.durationInFrames} fps={GATO06.fps} width={GATO06.width} height={GATO06.height} />
      <Composition id="Fallo05Thumb" component={Polar05Thumb} durationInFrames={61} fps={30} width={1080} height={1920} />
      <Composition id="Caso05Momo" component={Momo07} {...MOMO07} />
      <Composition id="SatoshiLargo" component={Satoshi07} {...SATOSHI07} />
      <Composition id="Caso04Stories" component={Gato06Stories} durationInFrames={12} fps={30} width={1080} height={1920} />
      <Composition id="YtBannerNoPresiones" component={YtBanner} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="FbCoverNoPresiones" component={FbCover} durationInFrames={1} fps={30} width={1640} height={624} />
      <Composition id="Caso04GatoThumb" component={Gato06Thumb} durationInFrames={44} fps={30} width={1080} height={1920} />
      <Composition id="Fallo05OsoPolar" component={Polar05} durationInFrames={POLAR05.durationInFrames} fps={POLAR05.fps} width={POLAR05.width} height={POLAR05.height} />
      <Composition id="SatoshiThumbWide" component={SatoshiThumbWide} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="SatoshiThumbTall" component={SatoshiThumbTall} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Satoshi02" component={Satoshi02} durationInFrames={Math.round(SATOSHI02.duration * SATOSHI02.fps)} fps={SATOSHI02.fps} width={1080} height={1920} />
      <Composition id="Cicada01P2" component={Cicada01P2} durationInFrames={Math.round(CICADA01_P2.duration * CICADA01_P2.fps)} fps={CICADA01_P2.fps} width={1080} height={1920} />
      <Composition id="Cicada01P1" component={Cicada01P1} durationInFrames={Math.round(CICADA01_P1.duration * CICADA01_P1.fps)} fps={CICADA01_P1.fps} width={1080} height={1920} />
      <Composition id="Cicada01" component={Cicada01} durationInFrames={Math.round(CICADA01.duration * CICADA01.fps)} fps={CICADA01.fps} width={1080} height={1920} />
      <Composition id="Sin01" component={Sin01} durationInFrames={Math.round(SIN01.duration * SIN01.fps)} fps={SIN01.fps} width={1080} height={1920} />
      <Composition id="Fallo02" component={Fallo02} durationInFrames={Math.round(FALLO02.duration * FALLO02.fps)} fps={FALLO02.fps} width={FALLO02.width} height={FALLO02.height} />
    </>
  );
};
