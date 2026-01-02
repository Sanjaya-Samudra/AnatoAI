"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

// --- Configuration Data ---

interface BodyPartConfig {
  name: string;
  type: "sphere" | "capsule" | "box";
  position: [number, number, number];
  args: number[];
  pinOffset: [number, number, number];
  rotation?: [number, number, number];
}

// --- Configuration Data ---

// ADJUST PIN POSITIONS HERE
// The 'pinOffset' property controls where the pin appears relative to the body part's center.
// [x, y, z] - Increase these values to move pins further out from the body.
const FULL_BODY_PARTS: BodyPartConfig[] = [
  // --- Head Region ---
  { name: "Head", type: "sphere", position: [0, 1.65, 0], args: [0.25, 32, 32], pinOffset: [0, 0.15, 0.28] },
  { name: "Left Eye", type: "sphere", position: [0.06, 1.55, 0], args: [0.05, 16, 16], pinOffset: [0, 0, 0.28] },
  { name: "Right Eye", type: "sphere", position: [-0.06, 1.55, 0], args: [0.05, 16, 16], pinOffset: [0, 0, 0.28] },
  { name: "Left Ear", type: "sphere", position: [0.15, 1.55, -0.05], args: [0.05, 16, 16], pinOffset: [0.18, 0, 0] },
  { name: "Right Ear", type: "sphere", position: [-0.15, 1.55, -0.05], args: [0.05, 16, 16], pinOffset: [-0.18, 0, 0] },
  { name: "Mouth", type: "sphere", position: [0, 1.45, 0], args: [0.08, 16, 16], pinOffset: [0, 0, 0.28] },
  
  { name: "Neck", type: "capsule", position: [0, 1.3, 0], args: [0.1, 0.2, 4, 8], pinOffset: [0, 0, 0.18] },
  
  // --- Torso ---
  { name: "Chest", type: "box", position: [0, 1.0, 0], args: [0.6, 0.6, 0.3], pinOffset: [0, 0, 0.25] },
  { name: "Abdomen", type: "box", position: [0, 0.4, 0], args: [0.5, 0.6, 0.28], pinOffset: [0, 0, 0.28] },
  
  { name: "Upper Back", type: "box", position: [0, 1.1, 0], args: [0.6, 0.6, 0.3], pinOffset: [0, 0, -0.28] },
  { name: "Lower Back", type: "box", position: [0, 0.5, 0], args: [0.5, 0.5, 0.28], pinOffset: [0, 0, -0.28] },
  
  // --- Arms ---
  { name: "Left Shoulder", type: "sphere", position: [0.4, 1.2, 0], args: [0.15, 16, 16], pinOffset: [0, 0, 0.20] },
  { name: "Left Upper Arm", type: "capsule", position: [0.55, 0.9, 0], args: [0.1, 0.5, 4, 8], rotation: [0, 0, -0.2], pinOffset: [0, 0, 0.15] },
  { name: "Left Forearm", type: "capsule", position: [0.85, 0.35, 0], args: [0.09, 0.5, 4, 8], rotation: [0, 0, -0.35], pinOffset: [0, 0, 0.15] },
  { name: "Left Hand", type: "box", position: [1.0, 0.05, 0], args: [0.15, 0.2, 0.1], rotation: [0, 0, -0.35], pinOffset: [0, 0, 0.12] },

  { name: "Right Shoulder", type: "sphere", position: [-0.4, 1.2, 0], args: [0.15, 16, 16], pinOffset: [0, 0, 0.20] },
  { name: "Right Upper Arm", type: "capsule", position: [-0.55, 0.9, 0], args: [0.1, 0.5, 4, 8], rotation: [0, 0, 0.2], pinOffset: [0, 0, 0.15] },
  { name: "Right Forearm", type: "capsule", position: [-0.85, 0.35, 0], args: [0.09, 0.5, 4, 8], rotation: [0, 0, 0.35], pinOffset: [0, 0, 0.15] },
  { name: "Right Hand", type: "box", position: [-1.0, 0.05, 0], args: [0.15, 0.2, 0.1], rotation: [0, 0, 0.35], pinOffset: [0, 0, 0.12] },

  // --- Legs ---
  { name: "Left Thigh", type: "capsule", position: [0.25, -0.3, 0], args: [0.15, 0.7, 4, 8], pinOffset: [0, 0, 0.20] },
  { name: "Left Shin", type: "capsule", position: [0.25, -1.1, 0], args: [0.12, 0.7, 4, 8], pinOffset: [0, 0, 0.18] },
  { name: "Left Foot", type: "box", position: [0.25, -1.5, 0.1], args: [0.15, 0.1, 0.3], pinOffset: [0, 0, 0.20] },
  
  { name: "Right Thigh", type: "capsule", position: [-0.25, -0.3, 0], args: [0.15, 0.7, 4, 8], pinOffset: [0, 0, 0.20] },
  { name: "Right Shin", type: "capsule", position: [-0.25, -1.1, 0], args: [0.12, 0.7, 4, 8], pinOffset: [0, 0, 0.18] },
  { name: "Right Foot", type: "box", position: [-0.25, -1.5, 0.1], args: [0.15, 0.1, 0.3], pinOffset: [0, 0, 0.20] },
];

// --- Components ---

interface BodyPartProps {
  position: [number, number, number];
  args: [number, number, number, number] | [number, number, number]; 
  name: string;
  onSelect: (name: string) => void;
  selectedPart: string | null;
  type: "capsule" | "sphere" | "box";
  rotation?: [number, number, number];
  pinOffset?: [number, number, number];
}

const BodyPart: React.FC<BodyPartProps> = ({
  position,
  args,
  name,
  onSelect,
  selectedPart,
  type,
  rotation = [0, 0, 0],
  pinOffset = [0, 0, 0.15], 
}) => {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedPart === name;

  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      {/* The "Pin" Visual */}
      <group position={pinOffset}>
        {/* Pin Head */}
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(name);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHover(false);
          }}
        >
          {/* Small pin size */}
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial 
            color={isSelected ? "#f43f5e" : (hovered ? "#2dd4bf" : "#ffffff")} 
            emissive={isSelected ? "#f43f5e" : (hovered ? "#2dd4bf" : "#000000")}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
        
        {/* Pulse Effect for Selected */}
        {isSelected && (
           <mesh>
             <sphereGeometry args={[0.04, 16, 16]} />
             <meshBasicMaterial color="#f43f5e" transparent opacity={0.3} />
           </mesh>
        )}
      </group>
      
      {/* Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} position={[pinOffset[0], pinOffset[1] + 0.1, pinOffset[2]]}>
          <div className={`
            px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-md
            transform -translate-x-1/2 -translate-y-full transition-all duration-200
            ${isSelected 
              ? "bg-rose-500/90 text-white border border-rose-400" 
              : "bg-slate-900/80 text-teal-300 border border-teal-500/30"}
          `}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

interface BodyModelProps {
  onSelectPart: (part: string) => void;
  selectedPart: string | null;
}

export const BodyModel: React.FC<BodyModelProps> = ({
  onSelectPart,
  selectedPart,
}) => {
  const { scene: originalScene, animations } = useGLTF('/models/human.glb');
  // Clone the scene to avoid mutating the cached original
  const scene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene]);
  const { actions } = useAnimations(animations, scene);
  
  useEffect(() => {
    // Play idle animation if available
    if (actions && actions['Idle']) {
      actions['Idle'].play();
    } else if (actions && Object.keys(actions).length > 0) {
       // Play first animation found (often T-pose or Idle)
       Object.values(actions)[0]?.play();
    }
    
    // Traverse to fix materials or shadows
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Removed hologram material override to show realistic textures
      }
    });
  }, [scene, actions]);

  // Auto-scale and center logic
  const { modelScale, modelPosition } = useMemo(() => {
    if (!scene) {
      return { 
        modelScale: [1, 1, 1] as [number, number, number], 
        modelPosition: [0, 0, 0] as [number, number, number] 
      };
    }

    // Reset the scene scale to 1 to get accurate measurements of the original model
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // The pins span from Y = -1.5 (Feet) to Y = 1.7 (Head).
    // Total height range is roughly 3.2 units.
    const targetHeight = 3.25; 
    
    // Avoid division by zero
    const originalHeight = size.y > 0.01 ? size.y : 1;
    
    // If the model is still too large, you can manually reduce this multiplier (e.g., 0.8)
    const scaleMultiplier = 1.0;

    let finalScale = (targetHeight / originalHeight) * scaleMultiplier;

    // Safety check for invalid scale
    if (!isFinite(finalScale) || finalScale <= 0) {
        finalScale = 1;
    }

    // Center the model
    // Midpoint of pins is (1.7 + -1.5) / 2 = 0.1
    const targetCenterY = 0.1;
    
    // Adjust this if the model is too high or low
    const yOffset = 0.0; 

    const position: [number, number, number] = [
      -center.x * finalScale, 
      -center.y * finalScale + targetCenterY + yOffset, 
      -center.z * finalScale
    ];

    return {
      modelScale: [finalScale, finalScale, finalScale] as [number, number, number],
      modelPosition: position
    };
  }, [scene]);

  return (
    <group position={[0, 0, 0]}>
      {/* The Real 3D Model - Manually Scaled and Centered */}
      <group scale={modelScale} position={modelPosition}>
        <primitive object={scene} />
      </group>

      {/* Annotations (Cards + Pins + Lines) */}
      <group>
        {FULL_BODY_PARTS.map((part) => (
          <BodyPart
            key={part.name}
            position={part.position}
            args={part.args as [number, number, number] | [number, number, number, number]}
            name={part.name}
            type={part.type}
            rotation={part.rotation}
            pinOffset={part.pinOffset}
            onSelect={onSelectPart}
            selectedPart={selectedPart}
          />
        ))}
      </group>
    </group>
  );
};
