import { Vector3 } from "three";
import Voxel from "../classes/Voxel.ts";

export default abstract class WorldGenerator {
  public abstract getVoxelAt: (worldPos: Vector3) => Voxel | undefined;
  /**
   * An optional method for world generator that can be used to improve the peformance of the world generator as it needs to return the blocks in one big batch (So it can be sent to the worker for example). It is also returning a promise so the generation proces can be fully async.
   */
  public abstract getChunkAt?: (chunkPos: Vector3) => Promise<{posInChunk: Vector3, voxel: Voxel}[]>;
}