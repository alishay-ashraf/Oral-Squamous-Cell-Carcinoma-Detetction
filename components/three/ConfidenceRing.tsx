"use client";

import { Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Ring({ confidence, color }: { confidence: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const arcRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.25 + pointer.x * 0.3;
      ref.current.rotation.x = 0.3 + pointer.y * 0.15;
    }
  });

  const arcLength = Math.max(0.02, confidence * Math.PI * 2);

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[1.15, 0.045, 24, 96]} />
        <meshBasicMaterial color="#262d38" transparent opacity={0.8} />
      </mesh>
      <mesh ref={arcRef} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.15, 0.07, 24, 96, arcLength]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Scene({ confidence, color }: { confidence: number; color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} gl={{ alpha: true }}>
      <Suspense fallback={null}>
        <Ring confidence={confidence} color={color} />
        <ambientLight intensity={0.8} />
      </Suspense>
    </Canvas>
  );
}

const DynamicScene = dynamic(() => Promise.resolve(Scene), { ssr: false });

export default function ConfidenceRing({
  confidence,
  color = "#ffb454",
}: {
  confidence: number;
  color?: string;
}) {
  return (
    <div className="relative w-full h-full">
      <DynamicScene confidence={confidence} color={color} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-semibold text-2xl text-bone">
          {(confidence * 100).toFixed(1)}%
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-2">
          confidence
        </span>
      </div>
    </div>
  );
}
