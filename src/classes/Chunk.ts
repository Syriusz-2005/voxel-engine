import { Vector3 } from "three";
import { VoxelType } from "../types/VoxelRegistry.ts";
import Voxel from "./Voxel.ts";
import RenderableVoxel from "./RenderableVoxel.ts";
import ChunkError from "../errors/ChunkError.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";

export default class Chunk {
  private readonly data: Map<VectorRepresentation, VoxelType>;

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

  public getVoxelAt(vec: Vector3): VoxelType {
    const {x, y, z} = vec;
    if (y > this.height) return 'air';
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block at ${x} ${y} ${z} is out of bounds!`)
    return this.data.get(Representation.toRepresentation(vec)) ?? 'air';
  }

  public setVoxelAt(vec: Vector3, value: Voxel): void {
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block at ${vec.x} ${vec.y} ${vec.z} is out of bounds!`)
    this.data.set(Representation.toRepresentation(vec), value.Name);
  }

  public removeBlockAt(vec: Vector3): void {
    this.data.delete(Representation.toRepresentation(vec));
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
            this.setVoxelAt(posInChunk, voxel);
          }
        }
      }
    }
  }

  public getRenderableVoxels(): {facesCount: number, voxels: RenderableVoxel[]} {
    const voxels: RenderableVoxel[] = [];
    let facesCount = 0;
    this.data.forEach((voxelType, vecRepresentation) => {
      const voxel = new Voxel(voxelType);
      const vec = Representation.fromRepresentation(vecRepresentation);
      const {x, y, z} = vec;
      const adjacents = [
        new Vector3(x + 1, y, z),
        new Vector3(x - 1, y, z),
        new Vector3(x, y + 1, z),
        new Vector3(x, y - 1, z),
        new Vector3(x, y, z + 1),
        new Vector3(x, y, z - 1),
      ];
      const renderableFaces = adjacents
        .filter(adj => {
          if (!this.isInBounds(adj)) {
            return true;
          }

          const adjacentVoxel = this.getVoxelAt(adj);
          if (adjacentVoxel === 'air') {
            return true;
          }
        })
        .map(adj => adj.sub(vec));

      if (renderableFaces.length === 0) return;
      facesCount += renderableFaces.length;
      const renderableVoxel = new RenderableVoxel(voxel, vec, renderableFaces);
      voxels.push(renderableVoxel);
    });
    return {
      facesCount,
      voxels,
    };
  }
}
