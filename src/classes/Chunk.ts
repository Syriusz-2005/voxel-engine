import { Vector3 } from "three";
import { VoxelType } from "../types/VoxelRegistry.ts";
import Voxel from "./Voxel.ts";
import RenderableVoxel from "./RenderableVoxel.ts";
import ChunkError from "../errors/ChunkError.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";

export default class Chunk {
  private readonly data: Map<Vector3, VoxelType>;

  constructor(
    private readonly size: number,
    private readonly height: number,
  ) {
    this.data = new Map();
  }

  private isInBounds(vec: Vector3): boolean {
    const {x, y, z} = vec;
    return x >= 0 && y >= 0 && z >= 0 && x < this.size && y < this.height && z < this.size;
  }

  public getBlockAt(vec: Vector3): VoxelType {
    const {x, y, z} = vec;
    if (y > this.height) return 'air';
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block at ${x} ${y} ${z} is out of bounds!`)
    return this.data.get(vec) ?? 'air';
  }

  public setBlockAt(vec: Vector3, value: Voxel): void {
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block at ${vec.x} ${vec.y} ${vec.z} is out of bounds!`)
    this.data.set(vec, value.Name);
  }

  public removeBlockAt(vec: Vector3): void {
    this.data.delete(vec);
  }

  public generate(generator: WorldGenerator, chunkWorldPos: Vector3): void {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const height = this.height;
        for (let y = 0; y < height; y++) {
          const posInChunk = new Vector3(x, y, z);
          const worldPos = new Vector3(
            chunkWorldPos.x * this.size + x, 
            y,
            chunkWorldPos.z * this.size + z
          );
          
          const voxel = generator.getVoxelAt(worldPos);
          if (voxel) {
            this.setBlockAt(posInChunk, voxel);
          }
        }
      }
    }
  }

  public getRenderableVoxels(): RenderableVoxel[] {
    const voxels: RenderableVoxel[] = []
    this.data.forEach((voxelType, vec) => {
      const voxel = new Voxel(voxelType);
      voxels.push(new RenderableVoxel(voxel, vec));
    });
    return voxels;
  }
}
