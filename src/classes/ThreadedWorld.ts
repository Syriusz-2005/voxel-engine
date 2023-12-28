import { Vector3 } from "three";
import { WorldLike } from "../types/WorldLike.ts";
import Chunk from "./Chunk.ts";
import ThreadedWorldManager from "./ThreadedWorldManager.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";
import Voxel from "./Voxel.ts";
import CoordTransformations from "../utils/CoordTransformations.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import { VoxelType } from "../types/VoxelRegistry.ts";



export default class ThreadedWorld implements WorldLike {
  private chunks: Map<VectorRepresentation, Chunk> = new Map();
  
  private readonly chunkDimensions: Vector3;
  private transformations: CoordTransformations;


  constructor(
    private readonly manager: ThreadedWorldManager,
    chunkSize: number,
    chunkHeight: number,
  ) {
    this.chunkDimensions = new Vector3(chunkSize, chunkHeight, chunkSize);
    this.transformations = new CoordTransformations(this.chunkDimensions);
  }

  public getChunkAt(pos: Vector3): Chunk | undefined {
    return this.chunks.get(Representation.toRepresentation(pos));
  }

  public getVoxelAt(pos: Vector3): Voxel | undefined {
    const chunkPos = this.transformations.transformToChunkPos(pos);
    const posInChunk = this.transformations.transformToPosInChunk(pos);

    const chunk = this.getChunkAt(chunkPos);
    if (!chunk || chunk.IsGenerating) return undefined;

    const voxelType = chunk.getVoxelTypeAt(posInChunk);
    return new Voxel(voxelType);
  }

  public getVoxelTypeAt(pos: Vector3): VoxelType {
    const chunkPos = this.transformations.transformToChunkPos(pos);
    const posInChunk = this.transformations.transformToPosInChunk(pos);

    const chunk = this.getChunkAt(chunkPos);
    if (!chunk || chunk.IsGenerating) return 'unknown';

    return chunk.getVoxelTypeAt(posInChunk);
  }

  public disposeChunkAt(pos: Vector3) {
    const representation = Representation.toRepresentation(pos);
    const chunk = this.chunks.get(representation);
    if (!chunk) return;

    this.chunks.delete(representation);
  }

  public getSortedChunkPositions(center: Vector3, maxRadius: number) {
    let posArr = [];
    
    for (let z = center.z - maxRadius; z < center.z + maxRadius; z++) {
      for (let x = center.x - maxRadius; x < center.x + maxRadius; x++) {
        const chunkPos = new Vector3(x, 0, z);
        if (chunkPos.distanceTo(center) < maxRadius) {
          posArr.push(chunkPos);
        }
      }
    }

    posArr.sort((a, b) => center.distanceTo(a) - center.distanceTo(b));

    return posArr;
  }


  public findChunksOutOfRadius(center: Vector3, radius: number): Chunk[] {
    const chunks: Chunk[] = [];
    this.chunks.forEach((chunk, vecRepresentation) => {
      const vec = Representation.fromRepresentation(vecRepresentation);
      const distance = center.distanceTo(vec);
      if (distance > radius) {
        chunks.push(chunk);
      }
    });
    return chunks;
  }

  public async generateChunkAt(pos: Vector3, generator: WorldGenerator) {
    const chunk = new Chunk(
      this.manager.Config.chunkSize, 
      this.manager.Config.chunkHeight,
      this,
      pos
    );

    this.chunks.set(Representation.toRepresentation(pos), chunk);

    await chunk.generate(generator, pos);
    
    return chunk;
  }
}