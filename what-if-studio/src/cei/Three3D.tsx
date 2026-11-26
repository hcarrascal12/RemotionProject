import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';

// Elementos 3D procedurales (sin archivos externos): corazón, estrella y caja de regalo.
// Cámara: fov 40 a z=10 -> el plano z=0 mide 4,09 x 7,28 unidades (1080x1920 px).
export const WORLD_W = 4.09;
export const PX_PER_UNIT = 1080 / WORLD_W; // ~264 px por unidad

const heartGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.25, 0.25);
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.1, bevelSegments: 6, curveSegments: 28 });
  g.rotateZ(Math.PI);
  g.center();
  return g;
})();

const starGeo = (() => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.22;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4 });
  g.center();
  return g;
})();

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={1.1} />
    <directionalLight position={[3, 5, 6]} intensity={2.4} />
    <pointLight position={[-3, -2, 4]} intensity={18} color="#ffd9a0" />
  </>
);

export const Heart3D: React.FC<{ color?: string; scale?: number; position?: [number, number, number]; rot?: [number, number, number] }> = ({ color = '#ff3d63', scale = 1, position = [0, 0, 0], rot = [0, 0, 0] }) => (
  <mesh geometry={heartGeo} position={position} scale={scale} rotation={rot}>
    <meshStandardMaterial color={color} roughness={0.28} metalness={0.15} emissive={color} emissiveIntensity={0.18} />
  </mesh>
);

export const Star3D: React.FC<{ color?: string; scale?: number; position?: [number, number, number]; rot?: [number, number, number] }> = ({ color = '#ffd23f', scale = 1, position = [0, 0, 0], rot = [0, 0, 0] }) => (
  <mesh geometry={starGeo} position={position} scale={scale} rotation={rot}>
    <meshStandardMaterial color={color} roughness={0.25} metalness={0.25} emissive={color} emissiveIntensity={0.25} />
  </mesh>
);

export const Gift3D: React.FC<{ color: string; ribbon?: string; scale?: number; position?: [number, number, number]; rot?: [number, number, number] }> = ({ color, ribbon = '#ffd23f', scale = 1, position = [0, 0, 0], rot = [0, 0, 0] }) => (
  <group position={position} scale={scale} rotation={rot}>
    <mesh position={[0, -0.09, 0]}>
      <boxGeometry args={[0.8, 0.62, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.88, 0.18, 0.88]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <boxGeometry args={[0.14, 0.9, 0.9]} />
      <meshStandardMaterial color={ribbon} roughness={0.3} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <boxGeometry args={[0.9, 0.9, 0.14]} />
      <meshStandardMaterial color={ribbon} roughness={0.3} metalness={0.2} />
    </mesh>
    <mesh position={[-0.13, 0.46, 0]} rotation={[0, 0, 0.7]}>
      <torusGeometry args={[0.12, 0.045, 12, 24]} />
      <meshStandardMaterial color={ribbon} roughness={0.3} />
    </mesh>
    <mesh position={[0.13, 0.46, 0]} rotation={[0, 0, -0.7]}>
      <torusGeometry args={[0.12, 0.045, 12, 24]} />
      <meshStandardMaterial color={ribbon} roughness={0.3} />
    </mesh>
  </group>
);

const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const COLORS = ['#ff3d63', '#ff7a45', '#ffd23f', '#ff5fa2', '#5fb4ff'];

// Corazones y estrellas 3D que suben flotando por encima del video.
export const Floaters3D: React.FC<{ from: number; to: number; fps: number; density?: number }> = ({ from, to, fps, density = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const total = Math.round((to - from) * 0.9 * density);
  const items = useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
      <Lights />
      {items.map((i) => {
        const born = from + (i / total) * (to - from);
        const age = t - born;
        if (age < 0 || age > 4.2) return null;
        const x = (rnd(i + 3) - 0.5) * 3.6 + Math.sin(age * 2 + i) * 0.15;
        const y = -4.2 + age * 2.1;
        const sc = (0.3 + rnd(i * 7) * 0.3) * Math.min(1, age * 3) * Math.min(1, (4.2 - age) * 2);
        const z = rnd(i * 5) * 2 - 0.5;
        const rot: [number, number, number] = [age * 1.2 + i, age * 2.2 + i, Math.sin(age * 2) * 0.4];
        return i % 3 === 2 ? <Star3D key={i} position={[x, y, z]} scale={sc} rot={rot} /> : <Heart3D key={i} color={COLORS[i % COLORS.length]} position={[x, y, z]} scale={sc} rot={rot} />;
      })}
    </ThreeCanvas>
  );
};
