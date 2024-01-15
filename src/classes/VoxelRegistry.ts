import { VoxelType, voxelNamesRegistryById, voxelRegistry } from "../types/VoxelRegistry.js";
import { GreededTransparencyPass, TransparencyPass } from "./Chunk.js";



export default class VoxelRegistry {
  private readonly registry = voxelRegistry;
  private readonly voxelNamesRegistryById = voxelNamesRegistryById;

  public getVoxelByName(name: VoxelType) {
    return this.registry[name];
  }

  public getVoxelNameById(id: number) {
    return this.voxelNamesRegistryById[id];
  }

  public getTransparencyPasses(): Map<number, TransparencyPass> {
    const translucentVoxels = Object.entries(this.registry)
      .filter(([_, data]) => data.opacity !== undefined)
    
    const passes = new Map<number, TransparencyPass>();
    passes.set(0, {voxels: [], facesCount: 0});

    for (const [_, voxel] of translucentVoxels) {
      passes.set(voxel.id, {voxels: [], facesCount: 0});
    }

    return passes;
  }

  public getGreededTransparencyPasses(): Map<number, GreededTransparencyPass> {
    const translucentVoxels = Object.entries(this.registry)
      .filter(([_, data]) => data.opacity !== undefined)
    
    const passes = new Map<number, GreededTransparencyPass>();
    passes.set(0, {faces: []});

    for (const [_, voxel] of translucentVoxels) {
      passes.set(voxel.id, {faces: []});
    }

    return passes;
  }
}