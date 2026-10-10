"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import { MALE_TORSO_PARTS, FEMALE_TORSO_PARTS, MALE_HEAD_PARTS, FEMALE_HEAD_PARTS, MALE_LEFT_ARM_PARTS, FEMALE_LEFT_ARM_PARTS, MALE_RIGHT_ARM_PARTS, FEMALE_RIGHT_ARM_PARTS, MALE_LEFT_LEG_PARTS, FEMALE_LEFT_LEG_PARTS, MALE_RIGHT_LEG_PARTS, FEMALE_RIGHT_LEG_PARTS } from "@/lib/anatomy";
import { bodyRegionAt, type BodySurfaceBounds, type FullBodyRegion } from "@/lib/body-regions";
import { BodyPaintVolume, createPaintMaterial } from "@/lib/body-paint";

const BRUSH_RADIUS = 0.105;
const BRUSH_STEP = 0.032;

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
  marking: boolean;
  clearSignal: number;
  onAreaChange: (region: FullBodyRegion, hasArea: boolean) => void;
  onModelReady: () => void;
}

export const BodyModel: React.FC<BodyModelProps> = ({
  onSelectPart,
  selectedPart,
  gender,
  viewMode,
  marking,
  clearSignal,
  onAreaChange,
  onModelReady,
}) => {
  const strokeRegion = useRef<FullBodyRegion | null>(null);
  const strokeActive = useRef(false);
  const strokeDragged = useRef(false);
  const areaReady = useRef(false);
  const paintedSamples = useRef(0);
  const strokeStartScreen = useRef<{ x: number; y: number } | null>(null);
  const previousPoint = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const endStroke = () => { strokeActive.current = false; };
    window.addEventListener('pointerup', endStroke);
    window.addEventListener('pointercancel', endStroke);
    return () => {
      window.removeEventListener('pointerup', endStroke);
      window.removeEventListener('pointercancel', endStroke);
    };
  }, []);

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

  useEffect(() => {
    onModelReady();
  }, [onModelReady]);

  const { modelScale, modelPosition, surfaceBounds, paintMin, paintMax } = useMemo(() => {
    if (!scene) {
      return { 
        modelScale: [1, 1, 1] as [number, number, number], 
        modelPosition: [0, 0, 0] as [number, number, number],
        surfaceBounds: { bottom: -1.5, height: 3.25, width: 2, centerX: 0 } as BodySurfaceBounds,
        paintMin: new THREE.Vector3(-1, -1.6, -1),
        paintMax: new THREE.Vector3(1, 1.7, 1),
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
      modelPosition: position,
      surfaceBounds: {
        bottom: box.min.y * finalScale + position[1],
        height: size.y * finalScale,
        width: size.x * finalScale,
        centerX: center.x * finalScale + position[0],
      } as BodySurfaceBounds,
      paintMin: box.min.clone().multiplyScalar(finalScale).add(new THREE.Vector3(...position)).addScalar(-BRUSH_RADIUS),
      paintMax: box.max.clone().multiplyScalar(finalScale).add(new THREE.Vector3(...position)).addScalar(BRUSH_RADIUS),
    };
  }, [scene]);

  const paintVolume = useMemo(() => viewMode === 'full' ? new BodyPaintVolume(paintMin, paintMax) : null, [paintMin, paintMax, viewMode]);

  useEffect(() => {
    if (!paintVolume) return;
    const changed: { mesh: THREE.Mesh; original: THREE.Material | THREE.Material[]; painted: THREE.Material[] }[] = [];
    scene.traverse(child => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const original = mesh.material;
      const painted = (Array.isArray(original) ? original : [original]).map(material => createPaintMaterial(material, paintVolume));
      mesh.material = Array.isArray(original) ? painted : painted[0];
      changed.push({ mesh, original, painted });
    });
    return () => {
      changed.forEach(({ mesh, original, painted }) => {
        mesh.material = original;
        painted.forEach(material => material.dispose());
      });
      paintVolume.texture.dispose();
    };
  }, [scene, paintVolume]);

  useEffect(() => {
    strokeRegion.current = null;
    strokeActive.current = false;
    areaReady.current = false;
    paintedSamples.current = 0;
    previousPoint.current = null;
    paintVolume?.clear();
  }, [clearSignal, paintVolume]);

  const paintAt = (point: THREE.Vector3, region: FullBodyRegion) => {
    if (!paintVolume?.paint(point, region, surfaceBounds, BRUSH_RADIUS)) return;
    paintedSamples.current++;
    if (!areaReady.current && paintedSamples.current >= 3) {
      areaReady.current = true;
      onAreaChange(region, true);
    }
  };

  const startMark = (event: ThreeEvent<PointerEvent>) => {
    if (viewMode !== 'full' || !marking || (event.nativeEvent.pointerType === 'mouse' && event.nativeEvent.button !== 0)) return;
    event.stopPropagation();
    const region = bodyRegionAt(event.point, surfaceBounds);
    if (strokeRegion.current && strokeRegion.current !== region) return;
    if (!strokeRegion.current) {
      strokeRegion.current = region;
      onAreaChange(region, false);
    }
    strokeActive.current = true;
    strokeDragged.current = false;
    strokeStartScreen.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
    previousPoint.current = event.point.clone();
    paintAt(event.point, region);
  };

  const continueMark = (event: ThreeEvent<PointerEvent>) => {
    if (!strokeActive.current || !marking || viewMode !== 'full') return;
    event.stopPropagation();
    const start = strokeStartScreen.current;
    if (start && Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y) >= 7) strokeDragged.current = true;
    if (!strokeDragged.current) return;
    const region = strokeRegion.current;
    if (!region || bodyRegionAt(event.point, surfaceBounds) !== region) {
      previousPoint.current = null;
      return;
    }
    const last = previousPoint.current;
    if (!last) {
      paintAt(event.point, region);
      previousPoint.current = event.point.clone();
      return;
    }
    const distance = last.distanceTo(event.point);
    if (distance < BRUSH_STEP) return;
    if (distance > 0.4) {
      paintAt(event.point, region);
      previousPoint.current = event.point.clone();
      return;
    }
    const steps = Math.min(16, Math.ceil(distance / BRUSH_STEP));
    for (let step = 1; step <= steps; step++) {
      const point = last.clone().lerp(event.point, step / steps);
      if (bodyRegionAt(point, surfaceBounds) === region) paintAt(point, region);
    }
    previousPoint.current = event.point.clone();
  };

  const finishMark = () => {
    if (!strokeActive.current) return;
    strokeActive.current = false;
    if (!strokeDragged.current && strokeRegion.current) {
      onSelectPart(strokeRegion.current);
    } else if (strokeRegion.current && areaReady.current) {
      onAreaChange(strokeRegion.current, true);
    }
  };

  const selectOnClick = (event: ThreeEvent<MouseEvent>) => {
    if (viewMode !== 'full' || marking || event.delta >= 7) return;
    event.stopPropagation();
    onSelectPart(bodyRegionAt(event.point, surfaceBounds));
  };

  return (
    <group position={[0, 0, 0]}>
      {/* The Real 3D Model */}
      <group scale={modelScale} position={modelPosition} onPointerDown={startMark} onPointerMove={continueMark} onPointerUp={finishMark} onClick={selectOnClick}>
        <primitive object={scene} />
      </group>

      {/* Annotations Group */}
      <group>
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
