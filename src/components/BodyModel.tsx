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

// ==========================================
// 1. FULL BODY CONFIGURATION
// ==========================================

export const MALE_BODY_PARTS: BodyPartConfig[] = [
  { name: "Head", type: "sphere", position: [0, 1.5, 0], args: [0.25, 32, 32] },
  { name: "Torso", type: "box", position: [0, 0.7, 0], args: [0.55, 1.2, 0.3] },
  { name: "Left Hand", type: "box", position: [0.70, 0.60, -0.10], args: [0.3, 1.1, 0.3], rotation: [0, 0, -0.4] },
  { name: "Right Hand", type: "box", position: [-0.70, 0.60, -0.10], args: [0.3, 1.1, 0.3], rotation: [0, 0, 0.4] },
  { name: "Left Leg", type: "capsule", position: [0.25, -0.7, 0], args: [0.15, 1.5, 4, 8] },
  { name: "Right Leg", type: "capsule", position: [-0.25, -0.7, 0], args: [0.15, 1.5, 4, 8] },
];

export const FEMALE_BODY_PARTS: BodyPartConfig[] = [
  { name: "Head", type: "sphere", position: [0, 1.45, 0], args: [0.24, 32, 32] },
  { name: "Torso", type: "box", position: [0, 0.65, 0], args: [0.5, 1.1, 0.28] },
  { name: "Left Hand", type: "box", position: [0.50, 0.82, -0.1], args: [0.25, 1.0, 0.25], rotation: [0, 0, -0.4] },
  { name: "Right Hand", type: "box", position: [-0.50, 0.82, -0.1], args: [0.25, 1.0, 0.25], rotation: [0, 0, 0.4] },
  { name: "Left Leg", type: "capsule", position: [0.25, -0.55, -0.05], args: [0.14, 1.4, 4, 8] },
  { name: "Right Leg", type: "capsule", position: [-0.25, -0.55, -0.05], args: [0.14, 1.4, 4, 8] },
];



// ==========================================
// 2. TORSO CONFIGURATION (Fixed Depth)
// ==========================================

export const MALE_TORSO_PARTS: BodyPartConfig[] = [
  // --- FRONT TORSO (ANTERIOR) ---
  { name: "Left Clavicle (Left Collarbone Area)", type: "sphere", position: [0.5, 1.2, 0.18], args: [0.08, 16, 16] },
  { name: "Right Clavicle (Right Collarbone Area)", type: "sphere", position: [-0.5, 1.2, 0.18], args: [0.08, 16, 16] },
  { name: "Left Acromioclavicular Joint (Left Shoulder Tip)", type: "sphere", position: [0.60, 1.37, -0.2], args: [0.08, 16, 16] },
  { name: "Right Acromioclavicular Joint (Right Shoulder Tip)", type: "sphere", position: [-0.6, 1.37, -0.2], args: [0.08, 16, 16] },
  { name: "Sternum (Central Chest)", type: "sphere", position: [0, 0.4, 0.66], args: [0.09, 16, 16] },
  { name: "Left Pectoralis Major (Left Chest Muscle)", type: "sphere", position: [0.48, 0.65, 0.62], args: [0.09, 16, 16] },
  { name: "Right Pectoralis Major (Right Chest Muscle)", type: "sphere", position: [-0.48, 0.65, 0.62], args: [0.09, 16, 16] },
  { name: "Left Costochondral Region (Left Rib–Sternum Junction)", type: "sphere", position: [0.32, 0.05, 0.7], args: [0.07, 16, 16] },
  { name: "Right Costochondral Region (Right Rib–Sternum Junction)", type: "sphere", position: [-0.32, 0.05, 0.7], args: [0.07, 16, 16] },
  { name: "Left Costal Margin (Left Lower Rib Edge)", type: "sphere", position: [0.38, -0.3, 0.65], args: [0.08, 16, 16] },
  { name: "Right Costal Margin (Right Lower Rib Edge)", type: "sphere", position: [-0.38, -0.3, 0.65], args: [0.08, 16, 16] },
  { name: "Rectus Abdominis (Upper) (Upper Abdominal Wall)", type: "sphere", position: [0, -0.38, 0.72], args: [0.09, 16, 16] },
  { name: "Umbilicus (Navel Region)", type: "sphere", position: [0, -0.9, 0.72], args: [0.08, 16, 16] },
  { name: "Rectus Abdominis (Lower) (Lower Abdominal Wall)", type: "sphere", position: [0, -1.2, 0.73], args: [0.09, 16, 16] },
  { name: "Left Inguinal Region (Left Groin Surface)", type: "sphere", position: [0.42, -1.3, 0.58], args: [0.08, 16, 16] },
  { name: "Right Inguinal Region (Right Groin Surface)", type: "sphere", position: [-0.42, -1.3, 0.58], args: [0.08, 16, 16] },

  // --- SIDE TORSO (LATERAL) ---
  { name: "Left Intercostal Region (Left Side Rib Area)", type: "sphere", position: [0.76, 0.05, 0.1], args: [0.08, 16, 16] },
  { name: "Right Intercostal Region (Right Side Rib Area)", type: "sphere", position: [-0.76, 0.05, 0.1], args: [0.08, 16, 16] },
  { name: "Left External Oblique (Left Waist Side Muscle)", type: "sphere", position: [0.7, -0.4, 0.2], args: [0.08, 16, 16] },
  { name: "Right External Oblique (Right Waist Side Muscle)", type: "sphere", position: [-0.7, -0.4, 0.2], args: [0.08, 16, 16] },
  { name: "Left Iliac Crest (Left Hip Crest)", type: "sphere", position: [0.72, -0.98, 0.2], args: [0.08, 16, 16] },
  { name: "Right Iliac Crest (Right Hip Crest)", type: "sphere", position: [-0.72, -0.98, 0.2], args: [0.08, 16, 16] },

  // --- BACK TORSO (POSTERIOR) ---
  { name: "Left Trapezius (Left Upper Back Shoulder Area)", type: "sphere", position: [0.6, 1.2, -0.5], args: [0.08, 16, 16] },
  { name: "Right Trapezius (Right Upper Back Shoulder Area)", type: "sphere", position: [-0.6, 1.2, -0.5], args: [0.08, 16, 16] },
  { name: "Left Scapular Region (Left Shoulder Blade Area)", type: "sphere", position: [0.65, 0.68, -0.72], args: [0.09, 16, 16] },
  { name: "Right Scapular Region (Right Shoulder Blade Area)", type: "sphere", position: [-0.65, 0.68, -0.72], args: [0.09, 16, 16] },
  { name: "Left Thoracic Paraspinal Muscles (Left Mid-Back)", type: "sphere", position: [0.14, 0.2, -0.68], args: [0.08, 16, 16] },
  { name: "Right Thoracic Paraspinal Muscles (Right Mid-Back)", type: "sphere", position: [-0.14, 0.2, -0.68], args: [0.08, 16, 16] },
  { name: "Left Lumbar Paraspinal Muscles (Left Lower Back)", type: "sphere", position: [0.14, -0.3, -0.49], args: [0.08, 16, 16] },
  { name: "Right Lumbar Paraspinal Muscles (Right Lower Back)", type: "sphere", position: [-0.14, -0.3, -0.49], args: [0.08, 16, 16] },
  { name: "Lumbar Spine (Central Lower Back)", type: "sphere", position: [0, -0.74, -0.36], args: [0.08, 16, 16] },
  { name: "Left Sacroiliac Joint Region (Left Lower Back–Hip Junction)", type: "sphere", position: [0.16, -1.12, -0.51], args: [0.08, 16, 16] },
  { name: "Right Sacroiliac Joint Region (Right Lower Back–Hip Junction)", type: "sphere", position: [-0.16, -1.12, -0.51], args: [0.08, 16, 16] },
];

export const FEMALE_TORSO_PARTS: BodyPartConfig[] = [
  // --- FRONT TORSO (ANTERIOR) ---
  { name: "Left Clavicle (Left Collarbone Area)", type: "sphere", position: [0.38, 1.24, 0.0], args: [0.08, 16, 16] },
  { name: "Right Clavicle (Right Collarbone Area)", type: "sphere", position: [-0.38, 1.24, 0.0], args: [0.08, 16, 16] },
  { name: "Left Acromioclavicular Joint (Left Shoulder Tip)", type: "sphere", position: [0.52, 1.32, -0.24], args: [0.08, 16, 16] },
  { name: "Right Acromioclavicular Joint (Right Shoulder Tip)", type: "sphere", position: [-0.52, 1.32, -0.24], args: [0.08, 16, 16] },
  { name: "Sternum (Central Chest)", type: "sphere", position: [0, 0.5, 0.51], args: [0.08, 16, 16] },
  { name: "Left Pectoralis Major (Upper Breast Area)", type: "sphere", position: [0.4, 0.52, 0.62], args: [0.09, 16, 16] },
  { name: "Right Pectoralis Major (Upper Breast Area)", type: "sphere", position: [-0.4, 0.52, 0.62], args: [0.09, 16, 16] },
  { name: "Left Costochondral Region (Left Rib–Sternum Junction)", type: "sphere", position: [0.1, 0.1, 0.55], args: [0.07, 16, 16] },
  { name: "Right Costochondral Region (Right Rib–Sternum Junction)", type: "sphere", position: [-0.1, 0.1, 0.55], args: [0.07, 16, 16] },
  { name: "Left Inframammary Fold (Lower Breast Fold)", type: "sphere", position: [0.5, 0.15, 0.65], args: [0.08, 16, 16] },
  { name: "Right Inframammary Fold (Lower Breast Fold)", type: "sphere", position: [-0.5, 0.15, 0.65], args: [0.08, 16, 16] },
  { name: "Left Costal Margin (Left Lower Rib Edge)", type: "sphere", position: [0.34, -0.3, 0.46], args: [0.08, 16, 16] },
  { name: "Right Costal Margin (Right Lower Rib Edge)", type: "sphere", position: [-0.34, -0.3, 0.46], args: [0.08, 16, 16] },
  { name: "Rectus Abdominis (Upper) (Upper Abdominal Wall)", type: "sphere", position: [0, -0.42, 0.51], args: [0.09, 16, 16] },
  { name: "Umbilicus (Navel Region)", type: "sphere", position: [0, -0.74, 0.5], args: [0.08, 16, 16] },
  { name: "Rectus Abdominis (Lower) (Lower Abdominal Wall)", type: "sphere", position: [0, -1, 0.51], args: [0.09, 16, 16] },
  { name: "Left Inguinal Region (Left Groin Surface)", type: "sphere", position: [0.25, -1.3, 0.36], args: [0.08, 16, 16] },
  { name: "Right Inguinal Region (Right Groin Surface)", type: "sphere", position: [-0.25, -1.3, 0.36], args: [0.08, 16, 16] },

  // --- SIDE TORSO (LATERAL) ---
  { name: "Left Intercostal Region (Left Side Rib Area)", type: "sphere", position: [0.63, 0.2, 0.01], args: [0.08, 16, 16] },
  { name: "Right Intercostal Region (Right Side Rib Area)", type: "sphere", position: [-0.63, 0.2, 0.01], args: [0.08, 16, 16] },
  { name: "Left External Oblique (Left Waist Side Muscle)", type: "sphere", position: [0.565, -0.3, 0.05], args: [0.08, 16, 16] },
  { name: "Right External Oblique (Right Waist Side Muscle)", type: "sphere", position: [-0.565, -0.3, 0.05], args: [0.08, 16, 16] },
  { name: "Left Iliac Crest (Left Hip Crest)", type: "sphere", position: [0.705, -0.86, 0.04], args: [0.08, 16, 16] },
  { name: "Right Iliac Crest (Right Hip Crest)", type: "sphere", position: [-0.705, -0.86, 0.04], args: [0.08, 16, 16] },

  // --- BACK TORSO (POSTERIOR) ---
  { name: "Left Trapezius (Left Upper Back Shoulder Area)", type: "sphere", position: [0.52, 1.1, -0.62], args: [0.08, 16, 16] },
  { name: "Right Trapezius (Right Upper Back Shoulder Area)", type: "sphere", position: [-0.52, 1.1, -0.62], args: [0.08, 16, 16] },
  { name: "Left Scapular Region (Left Shoulder Blade Area)", type: "sphere", position: [0.35, 0.56, -0.71], args: [0.09, 16, 16] },
  { name: "Right Scapular Region (Right Shoulder Blade Area)", type: "sphere", position: [-0.35, 0.56, -0.71], args: [0.09, 16, 16] },
  { name: "Left Thoracic Paraspinal Muscles (Left Mid-Back)", type: "sphere", position: [0.12, 0.2, -0.58], args: [0.08, 16, 16] },
  { name: "Right Thoracic Paraspinal Muscles (Right Mid-Back)", type: "sphere", position: [-0.12, 0.2, -0.58], args: [0.08, 16, 16] },
  { name: "Left Lumbar Paraspinal Muscles (Left Lower Back)", type: "sphere", position: [0.12, -0.35, -0.42], args: [0.08, 16, 16] },
  { name: "Right Lumbar Paraspinal Muscles (Right Lower Back)", type: "sphere", position: [-0.12, -0.35, -0.42], args: [0.08, 16, 16] },
  { name: "Lumbar Spine (Central Lower Back)", type: "sphere", position: [0, -0.6, -0.41], args: [0.08, 16, 16] },
  { name: "Left Sacroiliac Joint Region (Left Lower Back–Hip Junction)", type: "sphere", position: [0.18, -0.96, -0.64], args: [0.08, 16, 16] },
  { name: "Right Sacroiliac Joint Region (Right Lower Back–Hip Junction)", type: "sphere", position: [-0.18, -0.96, -0.64], args: [0.08, 16, 16] },
];

// ==========================================
// 3. HEAD CONFIGURATION
// ==========================================

export const MALE_HEAD_PARTS: BodyPartConfig[] = [
  { name: "Frontal Vertex", type: "sphere", position: [0, 1.4, 0.7], args: [0.06, 16, 16] },
  { name: "Central Vertex (Crown)", type: "sphere", position: [0, 1.67, 0], args: [0.06, 16, 16] },
  { name: "Right Parietal Region", type: "sphere", position: [-0.64, 1.4, 0], args: [0.06, 16, 16] },
  { name: "Left Parietal Region", type: "sphere", position: [0.64, 1.4, 0], args: [0.06, 16, 16] },
  { name: "Central Forehead (Glabella)", type: "sphere", position: [0, 0.52, 1.03], args: [0.06, 16, 16] },
  { name: "Right Frontal Region", type: "sphere", position: [-0.48, 0.84, 0.82], args: [0.06, 16, 16] },
  { name: "Left Frontal Region", type: "sphere", position: [0.48, 0.84, 0.82], args: [0.06, 16, 16] },
  { name: "Right Supraorbital Area", type: "sphere", position: [-0.32, 0.57, 0.98], args: [0.05, 16, 16] },
  { name: "Left Supraorbital Area", type: "sphere", position: [0.32, 0.57, 0.98], args: [0.05, 16, 16] },
  { name: "Right Temporal Region", type: "sphere", position: [-0.68, 0.40, 0.32], args: [0.06, 16, 16] },
  { name: "Left Temporal Region", type: "sphere", position: [0.68, 0.40, 0.32], args: [0.06, 16, 16] },
  { name: "Right Preauricular Area", type: "sphere", position: [-0.72, 0.1, 0.02], args: [0.06, 16, 16] },
  { name: "Left Preauricular Area", type: "sphere", position: [0.72, 0.1, 0.02], args: [0.06, 16, 16] },
  { name: "Right Jaw Angle", type: "sphere", position: [-0.68, -0.34, 0.08], args: [0.06, 16, 16] },
  { name: "Left Jaw Angle", type: "sphere", position: [0.68, -0.34, 0.08], args: [0.06, 16, 16] },
  { name: "Upper Lip / Maxillary", type: "sphere", position: [0, -0.32, 1.02], args: [0.05, 16, 16] },
  { name: "Chin (Mental Region)", type: "sphere", position: [0.01, -0.84, 0.88], args: [0.06, 16, 16] },
  { name: "Right Occipital Region", type: "sphere", position: [-0.6, -0.2, -0.82], args: [0.06, 16, 16] },
  { name: "Left Occipital Region", type: "sphere", position: [0.6, -0.2, -0.82], args: [0.06, 16, 16] },
  { name: "Central Occipital", type: "sphere", position: [0, -0.25, -1.05], args: [0.06, 16, 16] },
  { name: "Posterior Neck (Midline)", type: "sphere", position: [0, -0.78, -1.12], args: [0.06, 16, 16] },
  { name: "Right Posterolateral Neck", type: "sphere", position: [-0.68, -0.84, -0.82], args: [0.06, 16, 16] },
  { name: "Left Posterolateral Neck", type: "sphere", position: [0.68, -0.84, -0.82], args: [0.06, 16, 16] },
  { name: "Right Lateral Neck", type: "sphere", position: [-0.6, -1.08, -0.22], args: [0.06, 16, 16] },
  { name: "Left Lateral Neck", type: "sphere", position: [0.6, -1.08, -0.22], args: [0.06, 16, 16] },
];

export const FEMALE_HEAD_PARTS: BodyPartConfig[] = [
  { name: "Frontal Vertex", type: "sphere", position: [0, 1.4, 0.62], args: [0.06, 16, 16] },
  { name: "Central Vertex (Crown)", type: "sphere", position: [0, 1.675, 0], args: [0.06, 16, 16] },
  { name: "Right Parietal Region", type: "sphere", position: [-0.64, 1.4, 0], args: [0.06, 16, 16] },
  { name: "Left Parietal Region", type: "sphere", position: [0.64, 1.4, 0], args: [0.06, 16, 16] },
  { name: "Central Forehead (Glabella)", type: "sphere", position: [0, 0.72, 0.835], args: [0.06, 16, 16] },
  { name: "Right Frontal Region", type: "sphere", position: [-0.52, 1.05, 0.52], args: [0.06, 16, 16] },
  { name: "Left Frontal Region", type: "sphere", position: [0.52, 1.05, 0.52], args: [0.06, 16, 16] },
  { name: "Right Supraorbital Area", type: "sphere", position: [-0.32, 0.86, 0.75], args: [0.05, 16, 16] },
  { name: "Left Supraorbital Area", type: "sphere", position: [0.32, 0.86, 0.75], args: [0.05, 16, 16] },
  { name: "Right Temporal Region", type: "sphere", position: [-0.66, 0.60, 0.32], args: [0.06, 16, 16] },
  { name: "Left Temporal Region", type: "sphere", position: [0.66, 0.6, 0.32], args: [0.06, 16, 16] },
  { name: "Right Preauricular Area", type: "sphere", position: [-0.712, 0.25, 0.06], args: [0.06, 16, 16] },
  { name: "Left Preauricular Area", type: "sphere", position: [0.712, 0.25, 0.06], args: [0.06, 16, 16] },
  { name: "Right Jaw Angle", type: "sphere", position: [-0.6, -0.24, 0.18], args: [0.06, 16, 16] },
  { name: "Left Jaw Angle", type: "sphere", position: [0.6, -0.24, 0.18], args: [0.06, 16, 16] },
  { name: "Upper Lip / Maxillary", type: "sphere", position: [0, 0.1, 0.995], args: [0.05, 16, 16] },
  { name: "Chin (Mental Region)", type: "sphere", position: [0.01, -0.46, 0.88], args: [0.06, 16, 16] },
  { name: "Right Occipital Region", type: "sphere", position: [-0.58, -0.3, -0.48], args: [0.06, 16, 16] },
  { name: "Left Occipital Region", type: "sphere", position: [0.58, -0.3, -0.48], args: [0.06, 16, 16] },
  { name: "Central Occipital", type: "sphere", position: [0, -0.35, -0.78], args: [0.06, 16, 16] },
  { name: "Posterior Neck (Midline)", type: "sphere", position: [0, -0.78, -0.88], args: [0.06, 16, 16] },
  { name: "Right Posterolateral Neck", type: "sphere", position: [-0.555, -0.84, -0.5], args: [0.06, 16, 16] },
  { name: "Left Posterolateral Neck", type: "sphere", position: [0.555, -0.84, -0.5], args: [0.06, 16, 16] },
  { name: "Right Lateral Neck", type: "sphere", position: [-0.48, -1, -0.1], args: [0.06, 16, 16] },
  { name: "Left Lateral Neck", type: "sphere", position: [0.48, -1, -0.1], args: [0.06, 16, 16] },
];

// ==========================================
// 4. LEFT ARM CONFIGURATION
// ==========================================

export const MALE_LEFT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [0.02, 1.6, 0.2], args: [0.08, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [-0.1, 0.8, 0.1], args: [0.08, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [0.3, 0.9, 0], args: [0.07, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [0.2, 1.3, 0], args: [0.06, 16, 16] },
  
  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.1, 0.4, -0.1], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [0.3, 0.5, -0.2], args: [0.05, 16, 16] },
  { name: "Olecranon (Elbow Tip)", type: "sphere", position: [0.3, 0.5, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.2, 0.4, 0], args: [0.05, 16, 16] },
  
  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.1, -0.1, -0.1], args: [0.06, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [0.3, -0.1, -0.2], args: [0.06, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [-0.1, -0.5, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [0.3, -0.5, -0.1], args: [0.05, 16, 16] },
  
  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.1, -0.8, 0.1], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [0.2, -0.9, -0.1], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [0.1, -0.8, -0.2], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [-0.1, -1.3, -0.1], args: [0.05, 16, 16] },
];

export const FEMALE_LEFT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [0.02, 1.4, 0.01], args: [0.07, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [-0.1, 1.0, 0.0], args: [0.06, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [0.1, 1.0, -0.3], args: [0.06, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [-0.2, 1.3, -0.1], args: [0.05, 16, 16] },
  
  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.1, 0.4, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.2, 0.4, -0.1], args: [0.05, 16, 16] },
  
  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.04, -0.1, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [0.3, -0.1, -0.1], args: [0.05, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [0.1, -0.5, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [0.3, -0.5, -0.1], args: [0.05, 16, 16] },
  
  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [0.2, -1.0, 0.3], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [0.2, -1.0, -0.1], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [0.1, -1.0, 0.0], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [0.1,-1.3, -0.02], args: [0.05, 16, 16] },
];

// ==========================================
// 5. RIGHT ARM CONFIGURATION
// ==========================================

export const MALE_RIGHT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [-0.2, 1.3, -0.1], args: [0.05, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [-0.1,1.0, 0.0], args: [0.05, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [-0.2,1.0, -0.4], args: [0.07, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [0.3, 1.3, -0.2], args: [0.06, 16, 16] },
  
  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.2, 0.7, -0.3], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [-0.2, 0.7, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.1, 0.5, -0.05], args: [0.05, 16, 16] },
  
  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.1, -0.3, -0.0], args: [0.07, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [-0.3, -0.1, -0.1], args: [0.06, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [-0.1, -0.5, -0.0], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [-0.3, -0.5, -0.0], args: [0.05, 16, 16] },
  
  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.1, -0.7, 0.3], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [-0.3, -0.8, 0.1], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [-0.1, -0.8, 0.2], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [-0.1, -1.2, 0.1], args: [0.05, 16, 16] },
];

export const FEMALE_RIGHT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [-0.1, 1.3, -0.2], args: [0.07, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [0.1, 0.8, 0.1], args: [0.06, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [0.2, 0.9, -0.1], args: [0.06, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [0.2, 1.3, 0.2], args: [0.05, 16, 16] },
  
  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.1, 0.4, -0.2], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [-0.1, 0.4, 0.01], args: [0.05, 16, 16] },

  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [0.1, -0.1, 0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [-0.1, -0.1, -0.2], args: [0.05, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [0.0, -0.6, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [-0.1, -0.7, -0.1], args: [0.05, 16, 16] },
  
  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.1, -0.8, 0.1], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [-0.2, -1.0, -0.01], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [0.01, -1.0, -0.01], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [-0.1, -1.3, -0.1], args: [0.05, 16, 16] },
];

// ==========================================
// 6. LEFT LEG CONFIGURATION
// ==========================================

export const MALE_LEFT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1, 0.22], args: [0.15, 0.8, 4, 8] },
   { name: "Hip (Coxal region)", type: "capsule", position: [-0.1, 1.5, -0.53], args: [0.11, 0.7, 4, 8] }, 
  { name: "Knee (Patellar)", type: "sphere", position: [0.1, 0.3, 0.12], args: [0.12, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [-0.1, -0.25, -0.42], args: [0.12, 0.8, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0.18, -0.35, -0.08], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [-0.01, -1.15, -0.18], args: [0.1, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [0.2, -1.29, 0.16], args: [0.25, 0.08, 0.5] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [0.05, -1.5, 0.05], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [0.3, -1.45, 0.6], args: [0.25, 0.08, 0.2] },
];

export const FEMALE_LEFT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1.1, 0.28], args: [0.14, 0.7, 4, 8] },
  { name: "Hip (Coxal region)", type: "capsule", position: [0.02, 1.5, -0.46], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [0, 0.5, 0.22], args: [0.11, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [-0.15, -0.2, -0.35], args: [0.11, 0.7, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0.05, -0.35, 0.02], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [-0.13, -1.08, -0.1], args: [0.09, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [0.032, -1.34, 0.18], args: [0.23, 0.08, 0.45] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [-0.13, -1.45, 0], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [0.08, -1.48, 0.56], args: [0.23, 0.08, 0.18] },
];

// ==========================================
// 6. RIGHT LEFT LEG CONFIGURATION
// ==========================================

export const MALE_RIGHT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1, 0.22], args: [0.15, 0.8, 4, 8] },
   { name: "Hip (Coxal region)", type: "capsule", position: [0.15, 1.5, -0.52], args: [0.11, 0.7, 4, 8] }, 
  { name: "Knee (Patellar)", type: "sphere", position: [-0.1, 0.3, 0.12], args: [0.12, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [0.14, -0.25, -0.38], args: [0.12, 0.8, 4, 8] },
  { name: "Leg (Crural region)", type: "capsule", position: [-0.12, -0.35, -0.08], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [0.03, -1.15, -0.2], args: [0.1, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [-0.18, -1.3, 0.15], args: [0.25, 0.08, 0.5] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [-0.05, -1.5, 0.1], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [-0.25, -1.45, 0.65], args: [0.25, 0.08, 0.2] },
];

export const FEMALE_RIGHT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1.1, 0.27], args: [0.14, 0.7, 4, 8] },
  { name: "Hip (Coxal region)", type: "capsule", position: [0.15, 1.5, -0.43], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [0, 0.5, 0.22], args: [0.11, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [0.15, -0.2, -0.33], args: [0.11, 0.7, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0, -0.35, 0.03], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [0.13, -1.1, -0.12], args: [0.09, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [-0.025, -1.3, 0.13], args: [0.23, 0.08, 0.45] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [0.15, -1.4, 0], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [-0.07, -1.45, 0.54], args: [0.23, 0.08, 0.18] },
];

// ==========================================
// 4. COMPONENTS
// ==========================================

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
            color={isSelected ? "#ea384c" : (hovered ? "#3b82f6" : "#cbd5e1")} // Red selected, Blue hover, Slate-300 default
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