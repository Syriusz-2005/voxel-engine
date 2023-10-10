import { Color } from "three";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry.ts";


export default class Voxel {
  constructor(
    private readonly name: VoxelType, 
  ) {}

  public get Name(): VoxelType {
    return this.name;
  }

  public get Color(): Color {
    const registryData = voxelRegistry[this.name];
    return registryData.color;
  }
}