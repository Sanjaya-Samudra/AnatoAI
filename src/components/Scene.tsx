"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { BodyModel } from "./BodyModel";

interface SceneProps {
  onSelectPart: (part: string) => void;
  selectedPart: string | null;
  gender: "male" | "female";
  viewMode: "full" | "head";
}

function Controls() {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      // Clamp the target to keep the model within the "window area"
      // This prevents panning too far away from the center
      const limit = 1.5;
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -limit, limit);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, -limit, limit);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -limit, limit);
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      minDistance={2} 
      maxDistance={8} // Restrict zoom out
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2} // Restrict going below the floor
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  );
}

export default function Scene({ onSelectPart, selectedPart, gender, viewMode }: SceneProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
          
          <BodyModel onSelectPart={onSelectPart} selectedPart={selectedPart} gender={gender} viewMode={viewMode} />
          
          {/* Moved shadows down to feet level (-1.6) to avoid cutting through the body */}
          <ContactShadows position={[0, -1.6, 0]} resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#000000" />
          <Environment preset="city" />
          
          <Controls />
        </Suspense>
      </Canvas>
    </div>
  );
}
