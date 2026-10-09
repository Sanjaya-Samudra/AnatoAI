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
  { name: "Left Acromioclavicular Joint (Left Shoulder Tip)", type: "sphere", position: [0.60, 1.375, -0.2], args: [0.08, 16, 16] },
  { name: "Right Acromioclavicular Joint (Right Shoulder Tip)", type: "sphere", position: [-0.6, 1.375, -0.2], args: [0.08, 16, 16] },
  { name: "Sternum (Central Chest)", type: "sphere", position: [0, 0.4, 0.665], args: [0.09, 16, 16] },
  { name: "Left Pectoralis Major (Left Chest Muscle)", type: "sphere", position: [0.48, 0.65, 0.625], args: [0.09, 16, 16] },
  { name: "Right Pectoralis Major (Right Chest Muscle)", type: "sphere", position: [-0.48, 0.65, 0.625], args: [0.09, 16, 16] },
  { name: "Left Costochondral Region (Left Rib–Sternum Junction)", type: "sphere", position: [0.32, 0.05, 0.705], args: [0.07, 16, 16] },
  { name: "Right Costochondral Region (Right Rib–Sternum Junction)", type: "sphere", position: [-0.32, 0.05, 0.705], args: [0.07, 16, 16] },
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
  { name: "Frontal Vertex", type: "sphere", position: [0, 1.39, 0.69], args: [0.06, 16, 16] },
  { name: "Central Vertex (Crown)", type: "sphere", position: [0, 1.66, 0], args: [0.06, 16, 16] },
  { name: "Right Parietal Region", type: "sphere", position: [-0.638, 1.39, 0], args: [0.06, 16, 16] },
  { name: "Left Parietal Region", type: "sphere", position: [0.638, 1.39, 0], args: [0.06, 16, 16] },
  { name: "Central Forehead (Glabella)", type: "sphere", position: [0, 0.52, 1.02], args: [0.06, 16, 16] },
  { name: "Right Frontal Region", type: "sphere", position: [-0.48, 0.84, 0.815], args: [0.06, 16, 16] },
  { name: "Left Frontal Region", type: "sphere", position: [0.48, 0.84, 0.815], args: [0.06, 16, 16] },
  { name: "Right Supraorbital Area", type: "sphere", position: [-0.32, 0.57, 0.975], args: [0.05, 16, 16] },
  { name: "Left Supraorbital Area", type: "sphere", position: [0.32, 0.57, 0.975], args: [0.05, 16, 16] },
  { name: "Right Temporal Region", type: "sphere", position: [-0.66, 0.40, 0.32], args: [0.06, 16, 16] },
  { name: "Left Temporal Region", type: "sphere", position: [0.68, 0.40, 0.32], args: [0.06, 16, 16] },
  { name: "Right Preauricular Area", type: "sphere", position: [-0.72, 0.1, 0.02], args: [0.06, 16, 16] },
  { name: "Left Preauricular Area", type: "sphere", position: [0.72, 0.1, 0.02], args: [0.06, 16, 16] },
  { name: "Right Jaw Angle", type: "sphere", position: [-0.68, -0.34, 0.08], args: [0.06, 16, 16] },
  { name: "Left Jaw Angle", type: "sphere", position: [0.68, -0.34, 0.08], args: [0.06, 16, 16] },
  { name: "Upper Lip / Maxillary", type: "sphere", position: [0, -0.32, 1.001], args: [0.05, 16, 16] },
  { name: "Chin (Mental Region)", type: "sphere", position: [0.01, -0.84, 0.86], args: [0.06, 16, 16] },
  { name: "Right Occipital Region", type: "sphere", position: [-0.59, -0.2, -0.82], args: [0.06, 16, 16] },
  { name: "Left Occipital Region", type: "sphere", position: [0.59, -0.2, -0.82], args: [0.06, 16, 16] },
  { name: "Central Occipital", type: "sphere", position: [0, -0.25, -1.035], args: [0.06, 16, 16] },
  { name: "Posterior Neck (Midline)", type: "sphere", position: [0, -0.78, -1.095], args: [0.06, 16, 16] },
  { name: "Right Posterolateral Neck", type: "sphere", position: [-0.65, -0.84, -0.82], args: [0.06, 16, 16] },
  { name: "Left Posterolateral Neck", type: "sphere", position: [0.65, -0.84, -0.82], args: [0.06, 16, 16] },
  { name: "Right Lateral Neck", type: "sphere", position: [-0.55, -1.02, -0.22], args: [0.06, 16, 16] },
  { name: "Left Lateral Neck", type: "sphere", position: [0.55, -1.08, -0.22], args: [0.06, 16, 16] },
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
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [0.001, 1.6, 0.175], args: [0.08, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [-0.1, 0.8, 0.078], args: [0.08, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [0.247, 0.9, 0], args: [0.07, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [-0.32, 1.3, 0], args: [0.06, 16, 16] },

  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.015, 0.4, -0.1], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [0.247, 0.5, -0.2], args: [0.05, 16, 16] },
  { name: "Olecranon (Elbow Tip)", type: "sphere", position: [0.3, 0.5, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.2, 0.4, 0], args: [0.05, 16, 16] },

  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.025, -0.1, -0.1], args: [0.06, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [0.3, -0.1, -0.125], args: [0.06, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [0.028, -0.5, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [0.191, -0.5, -0.1], args: [0.05, 16, 16] },

  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.04, -0.85, 0.1], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [0.09, -1.2, -0.1], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [0.015, -0.95, -0.1], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [0.06, -1.4, -0.01], args: [0.05, 16, 16] },
];

export const FEMALE_LEFT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [0.02, 1.4, -0.033], args: [0.07, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [-0.02, 1.0, -0.072], args: [0.06, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [0.025, 1.0, -0.3], args: [0.06, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [-0.192, 1.3, -0.1], args: [0.05, 16, 16] },

  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.075, 0.4, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.2, 0.4, -0.144], args: [0.05, 16, 16] },

  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.004, -0.1, -0.1], args: [0.05, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [0.228, -0.1, -0.09], args: [0.05, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [0.13, -0.5, -0.04], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [0.21, -0.5, -0.07], args: [0.05, 16, 16] },

  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [0.125, -0.89, 0.22], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [0.08, -1.06, -0.1], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [0.103, -0.9, 0.0], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [0.08,-1.34, 0.03], args: [0.05, 16, 16] },
];

// ==========================================
// 5. RIGHT ARM CONFIGURATION
// ==========================================

export const MALE_RIGHT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [-0.1, 1.3, -0.05], args: [0.05, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [0.032,1.0, -0.01], args: [0.05, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [-0.18,1.0, -0.15], args: [0.07, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [0.22, 1.3, -0.2], args: [0.06, 16, 16] },

  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.18, 0.7, -0.225], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [-0.175, 0.7, -0.1], args: [0.05, 16, 16] },
  { name: "Cubital Fossa (Inner Fold)", type: "sphere", position: [0.002, 0.5, -0.05], args: [0.05, 16, 16] },

  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [-0.11, -0.3, -0.0], args: [0.07, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [-0.282, -0.1, -0.1], args: [0.06, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [-0.16, -0.5, -0.0], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [-0.264, -0.5, -0.0], args: [0.05, 16, 16] },

  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.105, -0.76, 0.3], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [-0.2, -1.15, 0.15], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [-0.14, -0.8, 0.12], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [-0.11, -1.35, 0.01], args: [0.05, 16, 16] },
];

export const FEMALE_RIGHT_ARM_PARTS: BodyPartConfig[] = [
  // 1. Upper Arm (Shoulder to Elbow)
  { name: "Deltoid (Shoulder Muscle)", type: "sphere", position: [-0.1, 1.3, -0.15], args: [0.07, 16, 16] },
  { name: "Biceps Brachii (Front Arm)", type: "sphere", position: [0.1, 0.8, 0.033], args: [0.06, 16, 16] },
  { name: "Triceps Brachii (Back Arm)", type: "sphere", position: [-0.067, 0.9, -0.1], args: [0.06, 16, 16] },
  { name: "Axilla (Armpit)", type: "sphere", position: [0.14, 1.3, 0.1], args: [0.05, 16, 16] },

  // 2. Elbow Region
  { name: "Lateral Epicondyle (Outer Elbow)", type: "sphere", position: [-0.1, 0.4, -0.127], args: [0.05, 16, 16] },
  { name: "Medial Epicondyle (Inner Elbow)", type: "sphere", position: [-0.05, 0.4, -0.01], args: [0.05, 16, 16] },

  // 3. Forearm & Wrist
  { name: "Volar Forearm (Inner Forearm)", type: "sphere", position: [0.1, -0.1, -0.01], args: [0.05, 16, 16] },
  { name: "Dorsal Forearm (Outer Forearm)", type: "sphere", position: [-0.1, -0.1, -0.11], args: [0.05, 16, 16] },
  { name: "Carpal Region (Wrist Front)", type: "sphere", position: [0.0, -0.6, -0.08], args: [0.05, 16, 16] },
  { name: "Dorsal Carpal (Wrist Back)", type: "sphere", position: [-0.1, -0.7, -0.005], args: [0.05, 16, 16] },

  // 4. Hand & Fingers
  { name: "Thenar Eminence (Thumb Base)", type: "sphere", position: [-0.04, -0.913, 0.13], args: [0.05, 16, 16] },
  { name: "Metacarpals (Back of Hand)", type: "sphere", position: [-0.1, -1.1, -0.08], args: [0.05, 16, 16] },
  { name: "Palmar Region (Palm Center)", type: "sphere", position: [-0.07, -1.0, -0.01], args: [0.05, 16, 16] },
  { name: "Phalanges (Fingers)", type: "sphere", position: [-0.1, -1.4, -0.04], args: [0.05, 16, 16] },
];

// ==========================================
// 6. LEFT LEG CONFIGURATION
// ==========================================

export const MALE_LEFT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1, 0.195], args: [0.15, 0.8, 4, 8] },
   { name: "Hip (Coxal region)", type: "capsule", position: [-0.1, 1.5, -0.505], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [0.1, 0.3, 0.08], args: [0.12, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [-0.1, -0.25, -0.35], args: [0.12, 0.8, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0.18, -0.35, -0.114], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [0.015, -1.15, -0.2], args: [0.1, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [0.2, -1.337, 0.16], args: [0.25, 0.08, 0.5] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [0.1, -1.42, 0.05], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [0.24, -1.46, 0.46], args: [0.25, 0.08, 0.2] },
];

export const FEMALE_LEFT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1.1, 0.25], args: [0.14, 0.7, 4, 8] },
  { name: "Hip (Coxal region)", type: "capsule", position: [0.02, 1.5, -0.437], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [0, 0.5, 0.187], args: [0.11, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [-0.122, -0.2, -0.3], args: [0.11, 0.7, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0.05, -0.35, -0.007], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [-0.1, -1.08, -0.1], args: [0.09, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [0.032, -1.39, 0.18], args: [0.23, 0.08, 0.45] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [-0.07, -1.365, 0], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [0, -1.48, 0.37], args: [0.23, 0.08, 0.18] },
];

// ==========================================
// 6. RIGHT LEFT LEG CONFIGURATION
// ==========================================

export const MALE_RIGHT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1, 0.195], args: [0.15, 0.8, 4, 8] },
   { name: "Hip (Coxal region)", type: "capsule", position: [0.15, 1.5, -0.5], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [-0.1, 0.3, 0.075], args: [0.12, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [0.11, -0.25, -0.35], args: [0.12, 0.8, 4, 8] },
  { name: "Leg (Crural region)", type: "capsule", position: [-0.12, -0.35, -0.11], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [-0.01, -1.15, -0.2], args: [0.1, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [-0.18, -1.335, 0.15], args: [0.25, 0.08, 0.5] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [-0.1, -1.42, 0.1], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [-0.22, -1.46, 0.46], args: [0.25, 0.08, 0.2] },
];

export const FEMALE_RIGHT_LEG_PARTS: BodyPartConfig[] = [
  { name: "Thigh (Femoral)", type: "capsule", position: [0, 1.1, 0.25], args: [0.14, 0.7, 4, 8] },
  { name: "Hip (Coxal region)", type: "capsule", position: [0.15, 1.5, -0.39], args: [0.11, 0.7, 4, 8] },
  { name: "Knee (Patellar)", type: "sphere", position: [0, 0.5, 0.185], args: [0.11, 16, 16] },
  { name: "Calf (Sural)", type: "capsule", position: [0.125, -0.2, -0.3], args: [0.11, 0.7, 4, 8] },
  { name: "Front Leg (Crural region)", type: "capsule", position: [0, -0.35, -0.019], args: [0.12, 0.8, 4, 8] },
  { name: "Ankle (Tarsal)", type: "sphere", position: [0.11, -1.1, -0.12], args: [0.09, 16, 16] },
  { name: "Top of Foot (Dorsal region)", type: "box", position: [-0.025, -1.36, 0.13], args: [0.23, 0.08, 0.45] },
  { name: "Foot (Pedal / Pedal region)", type: "box", position: [0.08, -1.35, 0], args: [0.23, 0.08, 0.45] },
  { name: "Toes (Phalanges)", type: "box", position: [0.02, -1.477, 0.37], args: [0.23, 0.08, 0.18] },
];

// ==========================================
// 4. COMPONENTS
// ==========================================


export type BodyView = "full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg";
export type BodyGender = "male" | "female";
export const GENERAL_ASSISTANT = "AnatoAI Assistant";
export const VIEW_LABELS: Record<BodyView, string> = { full: "Full body", head: "Head", torso: "Torso", "left-hand": "Left arm & hand", "right-hand": "Right arm & hand", "left-leg": "Left leg", "right-leg": "Right leg" };
export const BODY_VIEWS = Object.keys(VIEW_LABELS) as BodyView[];
export const PARTS_BY_GENDER: Record<BodyGender, Record<BodyView, BodyPartConfig[]>> = {
  male: { full: MALE_BODY_PARTS, head: MALE_HEAD_PARTS, torso: MALE_TORSO_PARTS, "left-hand": MALE_LEFT_ARM_PARTS, "right-hand": MALE_RIGHT_ARM_PARTS, "left-leg": MALE_LEFT_LEG_PARTS, "right-leg": MALE_RIGHT_LEG_PARTS },
  female: { full: FEMALE_BODY_PARTS, head: FEMALE_HEAD_PARTS, torso: FEMALE_TORSO_PARTS, "left-hand": FEMALE_LEFT_ARM_PARTS, "right-hand": FEMALE_RIGHT_ARM_PARTS, "left-leg": FEMALE_LEFT_LEG_PARTS, "right-leg": FEMALE_RIGHT_LEG_PARTS },
};
export function searchableParts(gender: BodyGender) {
  return BODY_VIEWS.filter(view => view !== "full").flatMap(view => PARTS_BY_GENDER[gender][view].map(part => ({ name: part.name, view, region: VIEW_LABELS[view] })));
}
