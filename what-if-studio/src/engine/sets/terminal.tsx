import React from 'react';
import { S3, Box, makeRoom } from '../room';
import { RoomShell, FloorShadow, FloorPlant } from '../furnish';
import { FONT } from '../fonts';

// An airport hall, built with the room kit (Fallo #02): a departures board on the back wall, a row of benches, a cash
// machine on the right wall and a lit floor. `cancelled` is how many board rows have flipped to CANCELADO (0..5);
// `atmDown` (0..1) turns the cash machine's screen to FUERA DE SERVICIO.
export const TERMINAL = makeRoom({ x: 960, y: 470 }, { x0: 380, x1: 1540, y0: 170, y1: 745 }, 3.3);

const ROWS = [
  ['AV 204', 'BOGOTÁ', '08:15'],
  ['LA 551', 'MIAMI', '08:40'],
  ['IB 6302', 'MADRID', '09:05'],
  ['CM 118', 'PANAMÁ', '09:30'],
  ['AM 730', 'MÉXICO', '09:55'],
];

// `blank`: the board keeps its shape but its rows carry no words, for close shots where small text would only be noise
export const Terminal: React.FC<{ t: number; id?: string; cancelled?: number; atmDown?: number; blank?: boolean }> = ({ t, id = 'trm', cancelled = 0, atmDown = 0, blank = false }) => {
  const R = TERMINAL;
  const { P } = R;
  const a0 = P(0.82, 0.38, 0.22);
  const a1 = P(0.93, 0.56, 0.22);
  const blink = Math.floor(t / 14) % 2 === 0;
  return (
    <g>
      <RoomShell r={R} id={id} floor="tiles" wall="#2A3550" side="#202A42" floorC="#3A4560" lines="#2A3350" />
      {/* the departures board */}
      <rect x={540} y={200} width={840} height={250} rx={10} fill="#0B1220" stroke="#27405F" strokeWidth={6} />
      <text x={566} y={236} fontFamily={FONT.ui} fontSize={26} fill="#FFE600">
        SALIDAS
      </text>
      {ROWS.map(([code, city, hour], i) => {
        const y = 280 + i * 36;
        const off = i < cancelled;
        if (blank)
          return (
            <g key={code}>
              <rect x={566} y={y - 16} width={110} height={14} rx={4} fill="#22344F" />
              <rect x={720} y={y - 16} width={150 + 30 * (i % 3)} height={14} rx={4} fill="#22344F" />
              <rect x={1140} y={y - 22} width={200} height={28} rx={5} fill={off ? (blink ? '#FF2A2A' : '#C21E1E') : '#1B2A40'} />
            </g>
          );
        return (
          <g key={code}>
            <text x={566} y={y} fontFamily={FONT.ui} fontSize={22} fill="#DCEBFF">{code}</text>
            <text x={720} y={y} fontFamily={FONT.ui} fontSize={22} fill="#DCEBFF">{city}</text>
            <text x={960} y={y} fontFamily={FONT.ui} fontSize={22} fill="#9FB4C7">{hour}</text>
            <rect x={1140} y={y - 22} width={200} height={28} rx={5} fill={off ? (blink ? '#FF2A2A' : '#C21E1E') : '#1B2A40'} />
            <text x={1240} y={y - 1} textAnchor="middle" fontFamily={FONT.ui} fontSize={19} fill="#FFF">
              {off ? 'CANCELADO' : 'A TIEMPO'}
            </text>
          </g>
        );
      })}
      {/* benches along the back */}
      <FloorShadow r={R} u={[0.12, 0.5]} w={[0.22, 0.3]} />
      <Box r={R} u={[0.12, 0.5]} v={[0.8, 0.88]} w={[0.22, 0.3]} front="#6A4E40" top="#8A6A58" side="#4A3830" rim />
      <Box r={R} u={[0.12, 0.5]} v={[0.88, 1]} w={[0.23, 0.29]} front="#2E2A38" side="#2E2A38" />
      <FloorPlant r={R} u={0.06} w={0.3} />
      {/* the cash machine on the right */}
      <FloorShadow r={R} u={[0.8, 0.95]} w={[0.1, 0.24]} />
      <Box r={R} u={[0.8, 0.95]} v={[0.3, 1]} w={[0.1, 0.24]} front="#1C2A44" top="#3A4F78" side="#14203A" rim />
      <rect x={a0.x} y={a0.y} width={a1.x - a0.x} height={a1.y - a0.y} rx={5} fill={atmDown > 0.5 ? '#B01E1E' : '#2E6FD8'} />
      <text x={(a0.x + a1.x) / 2} y={(a0.y + a1.y) / 2 + 7} textAnchor="middle" fontFamily={FONT.ui} fontSize={16} fill="#FFF">
        {atmDown > 0.5 ? 'FUERA DE SERVICIO' : 'BANCO'}
      </text>
      <rect x={a0.x} y={a1.y + 14} width={a1.x - a0.x} height={12} rx={3} fill="#0A0F1C" />
    </g>
  );
};
