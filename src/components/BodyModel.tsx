"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import { MALE_BODY_PARTS, FEMALE_BODY_PARTS, MALE_TORSO_PARTS, FEMALE_TORSO_PARTS, MALE_HEAD_PARTS, FEMALE_HEAD_PARTS, MALE_LEFT_ARM_PARTS, FEMALE_LEFT_ARM_PARTS, MALE_RIGHT_ARM_PARTS, FEMALE_RIGHT_ARM_PARTS, MALE_LEFT_LEG_PARTS, FEMALE_LEFT_LEG_PARTS, MALE_RIGHT_LEG_PARTS, FEMALE_RIGHT_LEG_PARTS } from "@/lib/anatomy";

interface BodyPartProps {
  position: [number, number, number];
  args: [number, number, number, number] | [number, number, number]; 
  name: string;
  onSelect: (name: string) => void;
  selectedPart: string | null;
  type: "capsule" | "sphere" | "box";
  rotation?: [number, number, number];
  markerRadius?: number;
}

const BodyPart: React.FC<BodyPartProps> = ({
  position,
  args,
  name,
  onSelect,
  selectedPart,
  type,
  rotation = [0, 0, 0],
  markerRadius = 0.07,
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
        <sphereGeometry args={[markerRadius, 16, 16]} />
        <meshStandardMaterial 
            color={isSelected ? "#2563eb" : (hovered ? "#3b82f6" : "#cbd5e1")}
            emissive={isSelected ? "#2563eb" : "#000000"}
            emissiveIntensity={isSelected ? 0.6 : 0} // Blue selected/hover, Slate-300 default
            transparent={false}
            opacity={1} 
            depthTest={true}
            depthWrite={true}
            roughness={0.5}
            metalness={0.2}
        />
      </mesh>
      
      {/* Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`
            max-w-48 break-words text-center px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-md font-sans
            transform transition-all duration-200
            ${isSelected ? "translate-x-4 -translate-y-1/2" : "-translate-x-1/2 -translate-y-full mb-4"}
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
  
  const scene = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(originalScene);
    
    // Apply specific rotations for hands to distinguish them
    if (viewMode === "left-hand") {
      clonedScene.rotation.y = gender === "male" ? Math.PI : 0;
    } else if (viewMode === "right-hand") {
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
    if (actions && actions['Idle']) {
      actions['Idle'].play();
    } else if (actions && Object.keys(actions).length > 0) {
       Object.values(actions)[0]?.play();
    }
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, actions]);

  const { modelScale, modelPosition } = useMemo(() => {
    if (!scene) {
      return { 
        modelScale: [1, 1, 1] as [number, number, number], 
        modelPosition: [0, 0, 0] as [number, number, number] 
      };
    }

    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 3.25; 
    const originalHeight = size.y > 0.01 ? size.y : 1;
    const scaleMultiplier = 1.0;
    let finalScale = (targetHeight / originalHeight) * scaleMultiplier;

    if (!isFinite(finalScale) || finalScale <= 0) {
        finalScale = 1;
    }

    const targetCenterY = 0.1;
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
      {/* The Real 3D Model */}
      <group scale={modelScale} position={modelPosition}>
        <primitive object={scene} />
      </group>

      {/* Annotations Group */}
      <group>
        {/* 1. Full Body View */}
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
            markerRadius={0.04} // Smaller markers for full body view
          />
        ))}

        {/* 2. Head View */}
        {viewMode === "head" && (gender === "male" ? MALE_HEAD_PARTS : FEMALE_HEAD_PARTS).map((part) => (
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

        {/* 3. Torso View */}
        {viewMode === "torso" && (gender === "male" ? MALE_TORSO_PARTS : FEMALE_TORSO_PARTS).map((part) => (
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

        {/* 4. Left Arm View */}
        {viewMode === "left-hand" && (gender === "male" ? MALE_LEFT_ARM_PARTS : FEMALE_LEFT_ARM_PARTS).map((part) => (
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

        {/* 5. Right Arm View */}
        {viewMode === "right-hand" && (gender === "male" ? MALE_RIGHT_ARM_PARTS : FEMALE_RIGHT_ARM_PARTS).map((part) => (
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
        {/* 6. Left Leg View */}
        {viewMode === "left-leg" && (gender === "male" ? MALE_LEFT_LEG_PARTS : FEMALE_LEFT_LEG_PARTS).map((part) => (
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

        {/* 7. Right Leg View */}
        {viewMode === "right-leg" && (gender === "male" ? MALE_RIGHT_LEG_PARTS : FEMALE_RIGHT_LEG_PARTS).map((part) => (
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
