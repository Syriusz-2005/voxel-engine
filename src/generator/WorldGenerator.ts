import { Vector3 } from "three";
import Voxel from "../classes/Voxel.ts";
import WorkerPool from "../utils/WorkerPool.ts";
import { voxelNamesRegistryById } from "../types/VoxelRegistry.ts";

export type VoxelPromiseResult = {posInChunk: Vector3, voxel: Voxel};

export abstract class Generator implements WorldGenerator {


  protected readonly pool: WorkerPool;

  constructor(
    private readonly url: URL,
    private readonly workersCount: number,
  ) {
    this.pool = new WorkerPool(this.url, this.workersCount);
  }

  public async getChunkAt(chunkPos: Vector3, chunkSize: number, chunkHeight: number): Promise<VoxelPromiseResult[]> {
    const chunkDataBuffer = await this.pool.scheduleTask({
      command: 'generateChunk',
      data: {
        chunkPos,
        chunkSize,
        chunkHeight,
      },
    }) as ArrayBufferLike;

    const chunkDataArray = new Uint8Array(chunkDataBuffer);
    
    const outlinedChunkSize = chunkSize + 2;
    const chunkData: VoxelPromiseResult[] = [];

    for (let i = 0; i < chunkDataArray.length; i++) {
      const voxelId = chunkDataArray[i];
      const voxelName = voxelNamesRegistryById[voxelId];
      if (voxelName === 'air') continue;
      const voxel = new Voxel(voxelName);
      const y = Math.floor(i / (outlinedChunkSize * outlinedChunkSize));
      const z = Math.floor((i - y * outlinedChunkSize * outlinedChunkSize) / outlinedChunkSize);
      const x = Math.floor(i - y * outlinedChunkSize * outlinedChunkSize - z * outlinedChunkSize);
      
      chunkData.push({
        voxel,
        posInChunk: new Vector3(x - 1, y, z - 1),
      });
    }

    return chunkData;
  }

}

export default abstract class WorldGenerator {
  /**
   * A method that is called when a chunk is requested to be generated.
   * @param chunkPos The position of the chunk to generate.
   * @param chunkSize The size of the chunk to generate.
   * @param chunkHeight The height of the chunk to generate.
   * @returns A promise that resolves to an array of voxel data.
   */
  public abstract getChunkAt: (chunkPos: Vector3, chunkSize: number, chunkHeight: number) => Promise<VoxelPromiseResult[]>;
}