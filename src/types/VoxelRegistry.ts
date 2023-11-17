import { Color } from "three";
import VoxelRegistry from "../classes/VoxelRegistry";

export type VoxelData = {
  color: THREE.Color;
  existing?: boolean;
  id: number;
  opacity?: number;
  isLiquid?: boolean;
}

export const voxelRegistry = {
  'unknown': {
    id: 9999,
    color: new Color(0, 0, 0),
  } as VoxelData,
  'air': {
    existing: false, 
    color: new Color(0, 0, 0), 
    id: 0,
  } as VoxelData,
  'grass': {
    color: new Color(0, 255, 0), 
    id: 1,
  } as VoxelData,
  'dirt': {
    color: new Color(235, 143, 52), 
    id: 2,
  } as VoxelData,
  'water': {
    color: new Color(0, 80, 255), 
    id: 3, 
    opacity: .2,
    isLiquid: true,
  } as VoxelData,
} as const;


export type VoxelType = keyof typeof voxelRegistry;

export const voxelNamesRegistryById: {[key in number]: VoxelType} = Object.fromEntries(
  Object.entries(voxelRegistry)
    .map(([name, data]) => [data.id, name as VoxelType])
);

export const registry = new VoxelRegistry();