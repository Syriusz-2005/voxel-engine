import { Vector3 } from "three";
import { TaskData } from "./WorkerPool";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry";
import Perf from "./Perf";
import StorageClient from "../classes/StorageClient.ts";

const workerVoxelGeneratorTimer = new Perf('Worker generation time', 400);

export default class WorkerVoxelGenerator {
  private readonly storage = StorageClient.createNew();


  constructor(
    private readonly onGetVoxel: (worldPos: Vector3) => VoxelType,
  ) {
    self.onmessage = (event) => {
      
      const data: TaskData = event.data;

      // console.time('Chunk generation');
      workerVoxelGeneratorTimer.start();
      const {chunkPos: chunkPosRepresentation, chunkSize, chunkHeight} = data.data as {chunkPos: {x: number; y: number; z: number}, chunkSize: number, chunkHeight: number};

      const chunkPos = new Vector3(chunkPosRepresentation.x, chunkPosRepresentation.y, chunkPosRepresentation.z)
        .multiplyScalar(chunkSize);

      const outlinedChunkSize = chunkSize + 2;

      const chunkData = new Uint8Array(outlinedChunkSize * outlinedChunkSize * chunkHeight);

      for (let x = 0; x < outlinedChunkSize; x++) {
        for (let z = 0; z < outlinedChunkSize; z++) {
          for (let y = 0; y < chunkHeight; y++) {
            const index = x + z * outlinedChunkSize + y * outlinedChunkSize * outlinedChunkSize;
            const worldPos = new Vector3(x, y, z).add(chunkPos);
            const voxelType = this.onGetVoxel(worldPos);
            if (voxelType === 'air') continue;
            chunkData[index] = voxelRegistry[voxelType].id;
          }
        }
      }

      self.postMessage(chunkData.buffer, {transfer: [chunkData.buffer]});
      workerVoxelGeneratorTimer.stop();
    }
  }
}