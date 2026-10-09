"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import { MALE_TORSO_PARTS, FEMALE_TORSO_PARTS, MALE_HEAD_PARTS, FEMALE_HEAD_PARTS, MALE_LEFT_ARM_PARTS, FEMALE_LEFT_ARM_PARTS, MALE_RIGHT_ARM_PARTS, FEMALE_RIGHT_ARM_PARTS, MALE_LEFT_LEG_PARTS, FEMALE_LEFT_LEG_PARTS, MALE_RIGHT_LEG_PARTS, FEMALE_RIGHT_LEG_PARTS } from "@/lib/anatomy";
import { bodyRegionAt, type BodySurfaceBounds, type FullBodyRegion } from "@/lib/body-regions";

const MAX_MARK_DOTS = 800;

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
  const [markDots, setMarkDots] = useState<THREE.Vector3[]>([]);
  const markDotsRef = useRef<THREE.Vector3[]>([]);
  const markMesh = useRef<THREE.InstancedMesh>(null);
  const strokeRegion = useRef<FullBodyRegion | null>(null);
  const strokeActive = useRef(false);
  const strokeDragged = useRef(false);
  const areaReady = useRef(false);
  const strokeStartScreen = useRef<{ x: number; y: number } | null>(null);
  const previousPoint = useRef<THREE.Vector3 | null>(null);
  const dotTransform = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const endStroke = () => { strokeActive.current = false; };
    window.addEventListener('pointerup', endStroke);
    window.addEventListener('pointercancel', endStroke);
    return () => {
      window.removeEventListener('pointerup', endStroke);
      window.removeEventListener('pointercancel', endStroke);
    };
  }, []);

  useLayoutEffect(() => {
    if (!markMesh.current) return;
    markMesh.current.count = markDots.length;
    markDots.forEach((point, index) => {
      dotTransform.position.copy(point);
      dotTransform.updateMatrix();
      markMesh.current?.setMatrixAt(index, dotTransform.matrix);
    });
    markMesh.current.instanceMatrix.needsUpdate = true;
  }, [markDots, dotTransform]);

  useLayoutEffect(() => {
    markDotsRef.current = [];
    strokeRegion.current = null;
    strokeActive.current = false;
    if (markMesh.current) markMesh.current.count = 0;
  }, [clearSignal]);
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

  const { modelScale, modelPosition, surfaceBounds } = useMemo(() => {
    if (!scene) {
      return { 
        modelScale: [1, 1, 1] as [number, number, number], 
        modelPosition: [0, 0, 0] as [number, number, number],
        surfaceBounds: { bottom: -1.5, height: 3.25, width: 2, centerX: 0 } as BodySurfaceBounds,
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
    };
  }, [scene]);

  const stamp = (point: THREE.Vector3, event: ThreeEvent<PointerEvent>) => {
    if (markDotsRef.current.length + 5 > MAX_MARK_DOTS) return;
    // Sink each sphere's center just below the surface so only its outer half shows.
    const inward = event.ray.direction.clone().multiplyScalar(0.003);
    const right = new THREE.Vector3().setFromMatrixColumn(event.camera.matrixWorld, 0).multiplyScalar(0.016);
    const up = new THREE.Vector3().setFromMatrixColumn(event.camera.matrixWorld, 1).multiplyScalar(0.016);
    const center = point.clone().add(inward);
    markDotsRef.current.push(center, center.clone().add(right), center.clone().sub(right), center.clone().add(up), center.clone().sub(up));
  };

  const startMark = (event: ThreeEvent<PointerEvent>) => {
    if (viewMode !== 'full' || !marking || (event.nativeEvent.pointerType === 'mouse' && event.nativeEvent.button !== 0)) return;
    event.stopPropagation();
    const region = bodyRegionAt(event.point, surfaceBounds);
    strokeRegion.current = region;
    strokeActive.current = true;
    strokeDragged.current = false;
    areaReady.current = false;
    strokeStartScreen.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
    previousPoint.current = event.point.clone();
    markDotsRef.current = [];
    stamp(event.point, event);
    setMarkDots([...markDotsRef.current]);
    onAreaChange(region, false);
  };

  const continueMark = (event: ThreeEvent<PointerEvent>) => {
    if (!strokeActive.current || !marking || viewMode !== 'full') return;
    event.stopPropagation();
    const start = strokeStartScreen.current;
    if (start && Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y) >= 7) strokeDragged.current = true;
    if (!strokeDragged.current) return;
    const last = previousPoint.current;
    if (!last) return;
    const distance = last.distanceTo(event.point);
    if (distance < 0.028) return;
    if (distance > 0.35) {
      stamp(event.point, event);
      setMarkDots([...markDotsRef.current]);
      previousPoint.current = event.point.clone();
      if (!areaReady.current && strokeRegion.current) { areaReady.current = true; onAreaChange(strokeRegion.current, true); }
      return;
    }
    const steps = Math.min(12, Math.floor(distance / 0.028));
    for (let step = 1; step <= steps; step++) stamp(last.clone().lerp(event.point, step / steps), event);
    setMarkDots([...markDotsRef.current]);
    previousPoint.current = event.point.clone();
    if (!areaReady.current && markDotsRef.current.length >= 20 && strokeRegion.current) { areaReady.current = true; onAreaChange(strokeRegion.current, true); }
  };

  const finishMark = () => {
    if (!strokeActive.current) return;
    strokeActive.current = false;
    if (!strokeDragged.current && strokeRegion.current) {
      onSelectPart(strokeRegion.current);
    } else if (strokeRegion.current && markDotsRef.current.length > 5) {
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

      {viewMode === 'full' && <instancedMesh ref={markMesh} args={[undefined, undefined, MAX_MARK_DOTS]} raycast={() => undefined} frustumCulled={false}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.94} depthTest depthWrite={false} />
      </instancedMesh>}

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
