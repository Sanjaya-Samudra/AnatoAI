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
  rotation?: [number, number, number];
}

// --- Configuration Data ---

export const MALE_BODY_PARTS: BodyPartConfig[] = [
  // --- Head Region ---
  { name: "Head", type: "sphere", position: [0, 1.5, 0], args: [0.25, 32, 32] },
  
  // --- Torso ---
  { name: "Torso", type: "box", position: [0, 0.7, 0], args: [0.55, 1.2, 0.3] },
  
  // --- Hands (Arms) ---
  { name: "Left Hand", type: "box", position: [0.70, 0.60, -0.10], args: [0.3, 1.1, 0.3], rotation: [0, 0, -0.4] },
  { name: "Right Hand", type: "box", position: [-0.70, 0.60, -0.10], args: [0.3, 1.1, 0.3], rotation: [0, 0, 0.4] },

  // --- Legs ---
  { name: "Left Leg", type: "capsule", position: [0.25, -0.7, 0], args: [0.15, 1.5, 4, 8] },
  { name: "Right Leg", type: "capsule", position: [-0.25, -0.7, 0], args: [0.15, 1.5, 4, 8] },
];

export const FEMALE_BODY_PARTS: BodyPartConfig[] = [
  // --- Head Region ---
  { name: "Head", type: "sphere", position: [0, 1.45, 0], args: [0.24, 32, 32] },
  
  // --- Torso ---
  { name: "Torso", type: "box", position: [0, 0.65, 0], args: [0.5, 1.1, 0.28] },
  
  // --- Hands (Arms) ---
  { name: "Left Hand", type: "box", position: [0.50, 0.82, -0.1], args: [0.25, 1.0, 0.25], rotation: [0, 0, -0.4] },
  { name: "Right Hand", type: "box", position: [-0.50, 0.82, -0.1], args: [0.25, 1.0, 0.25], rotation: [0, 0, 0.4] },

  // --- Legs ---
  { name: "Left Leg", type: "capsule", position: [0.25, -0.55, -0.05], args: [0.14, 1.4, 4, 8] },
  { name: "Right Leg", type: "capsule", position: [-0.25, -0.55, -0.05], args: [0.14, 1.4, 4, 8] },
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
}

const BodyPart: React.FC<BodyPartProps> = ({
  position,
  args,
  name,
  onSelect,
  selectedPart,
  type,
  rotation = [0, 0, 0],
}) => {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedPart === name;

  return (
    <group position={position} rotation={new THREE.Euler(...rotation)}>
      {/* Interactive Volume (Hitbox) - Invisible but clickable */}
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
        {type === "box" && <boxGeometry args={args as [number, number, number]} />}
        {type === "sphere" && <sphereGeometry args={args as [number, number, number]} />}
        {type === "capsule" && <capsuleGeometry args={args as [number, number, number, number]} />}
        
        <meshBasicMaterial
          transparent
          opacity={0.0} // Fully invisible hitbox
          depthWrite={false}
        />
      </mesh>

      {/* Center Pinpoint Marker (Always visible inside) */}
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial 
            color={isSelected ? "#2563eb" : (hovered ? "#3b82f6" : "#ffffff")}
            transparent 
            opacity={0.9} 
            depthTest={false} // Visible through the body
            depthWrite={false}
        />
      </mesh>
      
      {/* Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`
            px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-md font-sans
            transform -translate-x-1/2 -translate-y-full transition-all duration-200
            mb-4
            ${isSelected 
              ? "bg-blue-600/95 text-white border border-blue-400" 
              : "bg-white/90 text-blue-700 border border-blue-300 shadow-md"}
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
  gender: "male" | "female";
  viewMode: "full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg";
}

export const BodyModel: React.FC<BodyModelProps> = ({
  onSelectPart,
  selectedPart,
  gender,
  viewMode,
}) => {
  const modelPath = useMemo(() => {
    if (viewMode === "head") {
      return gender === "male" ? "/models/male/male-head.glb" : "/models/female/female-head.glb";
    }
    if (viewMode === "torso") {
      return gender === "male" ? "/models/male/male-torso.glb" : "/models/female/female-torso.glb";
    }
    if (viewMode === "left-hand") {
      return gender === "male" ? "/models/male/male-left-arm.glb" : "/models/female/female-left-arm.glb";
    }
    if (viewMode === "right-hand") {
      return gender === "male" ? "/models/male/male-right-arm.glb" : "/models/female/female-right-arm.glb";
    }
    if (viewMode === "left-leg") {
      return gender === "male" ? "/models/male/male-left-leg.glb" : "/models/female/female-left-leg.glb";
    }
    if (viewMode === "right-leg") {
      return gender === "male" ? "/models/male/male-right-leg.glb" : "/models/female/female-right-leg.glb";
    }
    return gender === "male" ? "/models/male/male-body.glb" : "/models/female/female-body.glb";
  }, [gender, viewMode]);

  const { scene: originalScene, animations } = useGLTF(modelPath);
  // Clone the scene to avoid mutating the cached original
  const scene = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(originalScene);
    
    // Apply specific rotations for hands to distinguish them
    if (viewMode === "left-hand") {
      clonedScene.rotation.y = gender === "male" ? Math.PI : 0;
    } else if (viewMode === "right-hand") {
      // Male: Rotate 90 deg anticlockwise from PI (PI + PI/2 = 3PI/2 = -PI/2)
      clonedScene.rotation.y = gender === "male" ? -Math.PI / 2 : Math.PI; 
    } else if (viewMode === "torso") {
      clonedScene.rotation.y = -Math.PI / 2; // Rotate -90 degrees (clockwise) to face forward
    } else if (viewMode === "right-leg") {
      clonedScene.rotation.y = -Math.PI / 2; // Both genders: -90 degrees (clockwise)
    } else if (viewMode === "left-leg") {
      clonedScene.rotation.y = -Math.PI / 2; // Both genders: -90 degrees (clockwise)
    }
    
    return clonedScene;
  }, [originalScene, viewMode, gender]);
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
        {viewMode === "full" && (gender === "male" ? MALE_BODY_PARTS : FEMALE_BODY_PARTS).map((part) => (
          <BodyPart
            key={part.name}
            position={part.position}
            args={part.args as [number, number, number] | [number, number, number, number]}
            name={part.name}
            type={part.type}
            rotation={part.rotation}
            onSelect={onSelectPart}
            selectedPart={selectedPart}
          />
        ))}
      </group>
    </group>
  );
};
