import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { HEAVY } from './motion';

// The heavy display face for hooks and subtitles, loaded from public/ so renders work offline.
loadFont({ family: HEAVY, url: staticFile('fonts/Inter-Black.otf'), weight: '900' });
