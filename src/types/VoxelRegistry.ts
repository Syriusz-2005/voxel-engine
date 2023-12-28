import { Color } from "three";
import VoxelRegistry from "../classes/VoxelRegistry";

export type VoxelData = {
  color: THREE.Color;
  existing?: boolean;
  id: number;
  opacity?: number;
  isLiquid?: boolean;
}

function fabricateVoxelType(data: VoxelData) {
  return data;
}

export const voxelRegistry = {
  'unknown': fabricateVoxelType({
    id: 99,
    color: new Color(255, 0, 255),
  }),
  'air': fabricateVoxelType({
    existing: false, 
    color: new Color(0, 0, 0), 
    id: 0,
  }),
  'grass': fabricateVoxelType({
    color: new Color(0, 255, 0), 
    id: 1,
  }),
  'dirt': fabricateVoxelType({
    color: new Color(235, 143, 52), 
    id: 2,
  }),
  'water': fabricateVoxelType({
    color: new Color(0, 80, 255), 
    id: 3, 
    opacity: .2,
    isLiquid: true,
  }),
} as const;


export type VoxelType = keyof typeof voxelRegistry;
export type VoxelId = number;

export const voxelNamesRegistryById: {[key in number]: VoxelType} = Object.fromEntries(
  Object.entries(voxelRegistry)
    .map(([name, data]) => [data.id, name as VoxelType])
);

export const registry = new VoxelRegistry();