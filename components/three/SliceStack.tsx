"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const SLICE_COUNT = 9;
const SLICE_COLORS = ["#ffb454", "#4c8dff", "#43d9c8"];

function Slice({
  index,
  total,
  baseSpread,
}: {
  index: number;
  total: number;
  baseSpread: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const centered = index - (total - 1) / 2;
  const color = SLICE_COLORS[index % SLICE_COLORS.length];

  // deterministic pseudo-random jitter per slice, stable across renders
  const jitter = useMemo(() => {
    const s = Math.sin(index * 999) * 10000;
    const r = s - Math.floor(s);
    return { rx: (r - 0.5) * 0.06, rz: (r - 0.3) * 0.05 };
  }, [index]);

  useFrame(({ pointer, clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const spread = baseSpread + pointer.y * 0.9;
    ref.current.position.y = centered * spread;
    ref.current.rotation.x = jitter.rx + pointer.y * 0.15;
    ref.current.rotation.z = jitter.rz;
    ref.current.rotation.y = t * 0.12 + pointer.x * 0.5;
    ref.current.position.x = pointer.x * centered * 0.15;
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05 + (index % 3 === 0 ? 0.03 : 0)}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        <Edges scale={1} threshold={15} color={color} />
      </mesh>
      {/* small readout tick on alternating slices */}
      {index % 2 === 0 && (
        <mesh position={[1.15, 1.15, 0.01]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  useFrame(({ pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.x * 0.35,
      0.04
    );
  });
  const scale = Math.min(1, viewport.width / 6);
  return (
    <group ref={group} scale={scale}>
      {children}
    </group>
  );
}

export default function SliceStack({ dense = false }: { dense?: boolean }) {
  const count = dense ? 14 : SLICE_COUNT;
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Rig>
          {Array.from({ length: count }).map((_, i) => (
            <Slice key={i} index={i} total={count} baseSpread={0.34} />
          ))}
        </Rig>
        <Sparkles count={60} scale={[6, 4, 3]} size={1.4} speed={0.15} opacity={0.25} color="#4c8dff" />
        <ambientLight intensity={0.6} />
      </Suspense>
    </Canvas>
  );
}
