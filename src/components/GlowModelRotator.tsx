"use client";

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlowModelRotatorProps {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
  direction?: "clockwise" | "counter-clockwise";
}

export const GlowModelRotator: React.FC<GlowModelRotatorProps> = ({
  modelPath,
  position,
  scale = 1,
  direction = "clockwise",
}) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid reusing the same instance
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);

  // Rotate on Y axis
  useFrame((_, delta) => {
    if (groupRef.current) {
      const rotationSpeed = Math.min(delta, 0.05) * 0.3;
      groupRef.current.rotation.y += direction === "clockwise" ? rotationSpeed : -rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};
