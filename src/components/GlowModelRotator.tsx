"use client";

import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlowModelRotatorProps {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
}

export const GlowModelRotator: React.FC<GlowModelRotatorProps> = ({
  modelPath,
  position,
  scale = 1,
}) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid reusing the same instance
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);

  // Rotate on Y axis
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01; // Slow rotation
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};
