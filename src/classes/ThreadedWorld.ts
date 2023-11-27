import { Vector3 } from "three";
import { WorldLike } from "../types/WorldLike.ts";
import Chunk from "./Chunk.ts";
import ThreadedWorldManager from "./ThreadedWorldManager.ts";
import { VectorRepresentation } from "./VectorRepresentation.ts";
import Voxel from "./Voxel.ts";



export default class ThreadedWorld implements WorldLike {
  private chunks: Map<VectorRepresentation, Chunk> = new Map();
  
  constructor(
    private readonly manager: ThreadedWorldManager,
  ) {}

  public getVoxelAt(vec: Vector3): Voxel | undefined {
    
  }
}