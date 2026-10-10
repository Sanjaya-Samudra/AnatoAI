"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerformanceMonitor } from "@react-three/drei";
import { GlowModelRotator } from "./GlowModelRotator";
import { usePageVisible } from "./usePageVisible";
export default function LandingScene() {
 const visible = usePageVisible();
 const [quality, setQuality] = useState(1.5);
 return (
          <Canvas dpr={quality} frameloop={visible ? "always" : "never"}
            camera={{ position: [0, 0, 16], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <PerformanceMonitor onDecline={() => setQuality(1)} onIncline={() => setQuality(1.5)} flipflops={2} onFallback={() => setQuality(1)} />
            <Suspense fallback={null}><Environment preset="studio" /></Suspense>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />

            <Suspense fallback={null}>
              {/* Female Model - Left Corner - Counter Clockwise */}
              <GlowModelRotator
                modelPath="/models/female/GlowBodyFemale.glb"
                position={[-10, -0.5, 0]}
                scale={7}
                direction="counter-clockwise"
              />

              {/* Male Model - Right Corner - Clockwise */}
              <GlowModelRotator
                modelPath="/models/male/GlowBody.glb"
                position={[10, -0.5, 0]}
                scale={7}
                direction="clockwise"
              />
            </Suspense>

            <OrbitControls
              autoRotate={false}
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
 );
}
