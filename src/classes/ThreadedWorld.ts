import { Vector3 } from "three";
import { WorldLike } from "../types/WorldLike.ts";
import Chunk from "./Chunk.ts";
import ThreadedWorldManager from "./ThreadedWorldManager.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";
import Voxel from "./Voxel.ts";
import CoordTransformations from "../utils/CoordTransformations.ts";



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

    const voxelType = chunk.getVoxelAt(posInChunk);
    return new Voxel(voxelType);
  }
}