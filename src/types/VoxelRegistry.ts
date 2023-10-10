import { Color } from "three";

export type VoxelData = {
  color: THREE.Color;
  existing?: boolean;
}

export const voxelRegistry = {
  'air': {existing: false, color: new Color(0, 0, 0)},
  'grass': {color: new Color(0, 255, 0)},
  'dirt': {color: new Color(235, 143, 52)},
} as const;

export type VoxelType = keyof typeof voxelRegistry;