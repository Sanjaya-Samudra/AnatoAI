import type { Vector3 } from 'three';

export const FULL_BODY_REGIONS = ['Head', 'Torso', 'Left Hand', 'Right Hand', 'Left Leg', 'Right Leg'] as const;
export type FullBodyRegion = typeof FULL_BODY_REGIONS[number];

export interface BodySurfaceBounds {
  bottom: number;
  height: number;
  width: number;
  centerX: number;
}

// The full-body assets have different native units, so classify points only
// after the existing model normalization has placed both bodies in the scene.
export function bodyRegionAt(point: Pick<Vector3, 'x' | 'y'>, bounds: BodySurfaceBounds): FullBodyRegion {
  const heightFraction = (point.y - bounds.bottom) / bounds.height;
  const lateralOffset = point.x - bounds.centerX;
  if (heightFraction >= 0.84) return 'Head';
  if (heightFraction >= 0.46) {
    if (Math.abs(lateralOffset) <= Math.max(0.24, bounds.width * 0.16)) return 'Torso';
    return lateralOffset >= 0 ? 'Left Hand' : 'Right Hand';
  }
  return lateralOffset >= 0 ? 'Left Leg' : 'Right Leg';
}
