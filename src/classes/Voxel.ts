import { Color } from "three";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry.js";


export default class Voxel {
  constructor(
    private name: VoxelType, 
  ) {}

  public update(name: VoxelType) {
    this.name = name;
    return this;
  }

  public get Name(): VoxelType {
    return this.name;
  }

  public get Color(): Color {
    const registryData = voxelRegistry[this.name];
    return registryData.color;
  }

  public get Opacity(): number {
    const registryData = voxelRegistry[this.name];
    return registryData.opacity ?? 1;
  }

  public get isLiquid(): boolean {
    const registryData = voxelRegistry[this.name];
    return registryData.isLiquid ?? false;
  }

  public get Id(): number {
    const registryData = voxelRegistry[this.name];
    return registryData.id;
  }

  public get Existing(): boolean {
    const registryData = voxelRegistry[this.name];
    return registryData.existing ?? true;
  }
}