import { Vector3 } from "three";
import WorldGenerator, { VoxelPromiseResult } from "./WorldGenerator.ts";
import MathUtils from "../classes/MathUtils.ts";
import Voxel from "../classes/Voxel.ts";
import WorkerPool from "../utils/WorkerPool.ts";
import { voxelNamesRegistryById } from "../types/VoxelRegistry.ts";


export default class RandomFlatWorldGenerator implements WorldGenerator {
  private pool = new WorkerPool(new URL('../workers/RandomFlatWorldGeneratorWorker.ts', import.meta.url), 1);

  public getVoxelAt(worldPos: Vector3) {
    const worldHeight = MathUtils.randomInt(3, 4);
    if (worldPos.y < worldHeight) {
      return new Voxel('dirt');
    }

    return undefined;
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
    

    const chunkData: VoxelPromiseResult[] = [];

    for (let i = 0; i < chunkDataArray.length; i++) {
      const voxelId = chunkDataArray[i];
      const voxelName = voxelNamesRegistryById[voxelId];
      if (voxelName === 'air') continue;
      const voxel = new Voxel(voxelName);
      const y = Math.floor(i / (chunkSize * chunkSize));
      const z = Math.floor((i - y * chunkSize * chunkSize) / chunkSize);
      const x = Math.floor(i - y * chunkSize * chunkSize - z * chunkSize);
      
      chunkData.push({
        voxel,
        posInChunk: new Vector3(x, y, z),
      });
    }

    return chunkData;
  }
}