import { Config } from '@remotion/cli/config';

Config.setEntryPoint('./src/Root.tsx');
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
