import { VoxelType, voxelNamesRegistryById, voxelRegistry } from "../types/VoxelRegistry";
import { TransparencyPass } from "./Chunk";



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
}