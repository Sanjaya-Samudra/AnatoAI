import * as THREE from 'three';
import { bodyRegionAt, type BodySurfaceBounds, type FullBodyRegion } from './body-regions';

const WIDTH = 96;
const HEIGHT = 192;
const DEPTH = 64;

export class BodyPaintVolume {
  readonly texture: THREE.Data3DTexture;
  readonly min: THREE.Vector3;
  readonly size: THREE.Vector3;
  private readonly data = new Uint8Array(WIDTH * HEIGHT * DEPTH);

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min.clone();
    this.size = max.clone().sub(min);
    this.texture = new THREE.Data3DTexture(this.data, WIDTH, HEIGHT, DEPTH);
    this.texture.format = THREE.RedFormat;
    this.texture.type = THREE.UnsignedByteType;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.unpackAlignment = 1;
    this.texture.generateMipmaps = false;
    this.texture.needsUpdate = true;
  }

  paint(point: THREE.Vector3, region: FullBodyRegion, bodyBounds: BodySurfaceBounds, radius = 0.105): boolean {
    const axis = [WIDTH, HEIGHT, DEPTH] as const;
    const start = [0, 1, 2].map(index => Math.max(0, Math.floor(((point.getComponent(index) - radius - this.min.getComponent(index)) / this.size.getComponent(index)) * (axis[index] - 1))));
    const end = [0, 1, 2].map(index => Math.min(axis[index] - 1, Math.ceil(((point.getComponent(index) + radius - this.min.getComponent(index)) / this.size.getComponent(index)) * (axis[index] - 1))));
    let changed = false;

    for (let z = start[2]; z <= end[2]; z++) {
      const worldZ = this.min.z + z / (DEPTH - 1) * this.size.z;
      for (let y = start[1]; y <= end[1]; y++) {
        const worldY = this.min.y + y / (HEIGHT - 1) * this.size.y;
        for (let x = start[0]; x <= end[0]; x++) {
          const worldX = this.min.x + x / (WIDTH - 1) * this.size.x;
          if (bodyRegionAt({ x: worldX, y: worldY }, bodyBounds) !== region) continue;
          const distance = Math.hypot(worldX - point.x, worldY - point.y, worldZ - point.z);
          if (distance >= radius) continue;
          const edge = Math.min(1, (radius - distance) / (radius * 0.35));
          const strength = Math.round(245 * edge * edge * (3 - 2 * edge));
          const index = x + WIDTH * (y + HEIGHT * z);
          if (strength > this.data[index]) {
            this.data[index] = strength;
            changed = true;
          }
        }
      }
    }

    if (changed) this.texture.needsUpdate = true;
    return changed;
  }

  clear(): void {
    this.data.fill(0);
    this.texture.needsUpdate = true;
  }

  coverageAt(point: THREE.Vector3): number {
    const x = Math.round((point.x - this.min.x) / this.size.x * (WIDTH - 1));
    const y = Math.round((point.y - this.min.y) / this.size.y * (HEIGHT - 1));
    const z = Math.round((point.z - this.min.z) / this.size.z * (DEPTH - 1));
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || z < 0 || z >= DEPTH) return 0;
    return this.data[x + WIDTH * (y + HEIGHT * z)];
  }
}

export function createPaintMaterial(source: THREE.Material, volume: BodyPaintVolume): THREE.Material {
  const material = source.clone();
  const originalCompile = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    originalCompile(shader, renderer);
    shader.uniforms.bodyPaintMask = { value: volume.texture };
    shader.uniforms.bodyPaintMin = { value: volume.min };
    shader.uniforms.bodyPaintSize = { value: volume.size };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBodyPaintPosition;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvBodyPaintPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBodyPaintPosition;\nuniform highp sampler3D bodyPaintMask;\nuniform vec3 bodyPaintMin;\nuniform vec3 bodyPaintSize;')
      .replace('#include <color_fragment>', '#include <color_fragment>\nvec3 bodyPaintUVW = clamp((vBodyPaintPosition - bodyPaintMin) / bodyPaintSize, 0.0, 1.0);\nfloat bodyPaintCoverage = texture(bodyPaintMask, bodyPaintUVW).r;\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.34, 0.92), bodyPaintCoverage * 0.82);');
  };
  material.customProgramCacheKey = () => 'body-surface-paint-v1';
  material.needsUpdate = true;
  return material;
}
