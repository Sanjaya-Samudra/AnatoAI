"use client";

import React, { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { BodyModel } from "./BodyModel";
import ModelLoading from "./ModelLoading";
import { usePageVisible } from "./usePageVisible";
import type { FullBodyRegion } from "@/lib/body-regions";

interface SceneProps {
  onSelectPart: (part: string) => void;
  onAnalyzeArea: (region: FullBodyRegion) => void;
  selectedPart: string | null;
  gender: "male" | "female";
  viewMode: "full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg";
}

interface ControlsProps {
  viewMode: "full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg";
  gender: "male" | "female";
  marking: boolean;
}

function Controls({ viewMode, gender, marking }: ControlsProps) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();

  // Reset camera and controls when viewMode or gender changes
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      if (viewMode === 'head' || viewMode === 'torso' || viewMode === 'right-leg' || viewMode === 'left-leg') {
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
      enabled
      minDistance={minDistance} 
      maxDistance={maxDistance}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2} // Restrict going below the floor
      enablePan={true}
      enableZoom={true}
      enableRotate={viewMode !== 'full' || !marking}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  );
}

export default function Scene({ onSelectPart, onAnalyzeArea, selectedPart, gender, viewMode }: SceneProps) {
  const [quality, setQuality] = useState(1.5);
  const [marking, setMarking] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{ region: FullBodyRegion; hasArea: boolean } | null>(null);
  const [clearVersion, setClearVersion] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const handleModelReady = useCallback(() => setModelReady(true), []);
  const visible = usePageVisible();
  return (
    <div className="relative w-full h-full bg-transparent">
      <Canvas dpr={quality} frameloop={visible ? "always" : "never"} camera={{ position: [0, 1, 5], fov: 45 }} style={{ touchAction: viewMode === 'full' && marking ? 'none' : 'auto' }}>
        <Suspense fallback={null}>
          <PerformanceMonitor onDecline={() => setQuality(1)} onIncline={() => setQuality(1.5)} flipflops={2} onFallback={() => setQuality(1)} />
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          
          <BodyModel key={`${gender}-${viewMode}`} onSelectPart={onSelectPart} selectedPart={selectedPart} gender={gender} viewMode={viewMode} marking={marking} clearSignal={clearVersion} onAreaChange={(region, hasArea) => setSelectedArea({ region, hasArea })} onModelReady={handleModelReady} />
          
          {/* Shadows adjusted for lighter background */}
          <ContactShadows position={[0, -1.6, 0]} resolution={quality === 1 ? 512 : 1024} scale={10} blur={1.5} opacity={0.3} far={10} color="#1e3a8a" />
          <Environment preset="sunset" />
          
          <Controls key={`${viewMode}-${gender}`} viewMode={viewMode} gender={gender} marking={marking} />
        </Suspense>
      </Canvas>
      <ModelLoading />
      {viewMode === 'full' && modelReady && !selectedPart && <div className="absolute bottom-28 left-1/2 z-10 w-[min(92vw,400px)] -translate-x-1/2 rounded-2xl border border-blue-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:bottom-auto md:left-auto md:right-6 md:top-28 md:w-[330px] md:translate-x-0" aria-label="Full body area selection">
        <button type="button" aria-pressed={marking} onClick={() => setMarking(value => !value)} className={`w-full rounded-xl px-3 py-2 text-sm font-semibold ${marking ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-slate-800'}`}>{marking ? 'Done drawing' : 'Draw pain area'}</button>
        <p className="px-2 pt-2 text-center text-xs text-slate-600 dark:text-slate-300" role="status">{selectedArea ? `${selectedArea.region} selected${selectedArea.hasArea ? '' : ' - drag to mark a larger area'}` : marking ? 'Drag over the body to mark where it hurts. Right-drag to move the view.' : 'Click a region, left-drag to rotate, or right-drag to move the view.'}</p>
        {selectedArea && <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => { setSelectedArea(null); setClearVersion(value => value + 1); }} className="flex-1 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800">Cancel selection</button>
          <button type="button" disabled={!selectedArea.hasArea} onClick={() => onAnalyzeArea(selectedArea.region)} className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Analyze area</button>
        </div>}
      </div>}
    </div>
  );
}
