"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { BodyModel } from "./BodyModel";

interface SceneProps {
  onSelectPart: (part: string) => void;
  selectedPart: string | null;
  gender: "male" | "female";
  viewMode: "full" | "head" | "torso" | "left-hand" | "right-hand" | "right-leg";
}

interface ControlsProps {
  viewMode: "full" | "head" | "torso" | "left-hand" | "right-hand" | "right-leg";
  gender: "male" | "female";
}

// Minimal interface for the OrbitControls ref based on usage
interface OrbitControlsRef {
  target: THREE.Vector3;
  update: () => void;
  object: THREE.Camera;
}

function Controls({ viewMode, gender }: ControlsProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Reset camera and controls when viewMode or gender changes
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      if (viewMode === 'head' || viewMode === 'torso' || viewMode === 'right-leg') {
        // Head/Torso/Leg View: Default to "lowest zoom level" (furthest distance)
        camera.position.set(0, 0, 6.0);
        controls.target.set(0, 0, 0);
      } else if (viewMode === 'left-hand' || viewMode === 'right-hand') {
        // Hand View: Slightly further back (lower zoom)
        camera.position.set(0, 0, 4.5);
        controls.target.set(0, 0, 0);
      } else {
        // Full Body: Default to mid-range (5 is mid of 2 and 8)
        camera.position.set(0, 1, 5);
        controls.target.set(0, 0, 0);
      }
      
      controls.update();
    }
  }, [viewMode, gender, camera]);

  useFrame(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      // Clamp the target to keep the model within the "window area"
      const limit = 1.5;
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -limit, limit);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, -limit, limit);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -limit, limit);
    }
  });

  // Dynamic zoom limits based on viewMode
  // Head: Min 2.5 (Close), Max 6.0 (Far)
  const isPartView = viewMode !== 'full';
  const minDistance = isPartView ? 2.0 : 2;
  const maxDistance = isPartView ? 6.0 : 8;

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      minDistance={minDistance} 
      maxDistance={maxDistance}
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
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          
          <BodyModel onSelectPart={onSelectPart} selectedPart={selectedPart} gender={gender} viewMode={viewMode} />
          
          {/* Shadows adjusted for lighter background */}
          <ContactShadows position={[0, -1.6, 0]} resolution={1024} scale={10} blur={1.5} opacity={0.3} far={10} color="#1e3a8a" />
          <Environment preset="studio" />
          
          <Controls key={`${viewMode}-${gender}`} viewMode={viewMode} gender={gender} />
        </Suspense>
      </Canvas>
    </div>
  );
}
