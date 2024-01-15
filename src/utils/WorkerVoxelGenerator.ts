import { Vector3 } from "three";
import { TaskData } from "./WorkerPool.js";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry.js";
import Perf from "./Perf.js";
import StorageClient from "../classes/StorageClient.js";
import VoxelArray from "../classes/VoxelArray.js";

const workerVoxelGeneratorTimer = new Perf('Worker generation time', 400);

export default class WorkerVoxelGenerator {
  private readonly storage = StorageClient.createNew();


  constructor(
    private readonly onGetVoxel: (worldPos: Vector3) => VoxelType,
  ) {
    self.onmessage = (event) => {
      
      const data: TaskData = event.data;

      workerVoxelGeneratorTimer.start();
      const {chunkPos: chunkPosRepresentation, chunkSize, chunkHeight} = data.data as {chunkPos: {x: number; y: number; z: number}, chunkSize: number, chunkHeight: number};

      const chunkPos = new Vector3(chunkPosRepresentation.x, chunkPosRepresentation.y, chunkPosRepresentation.z)
        .multiplyScalar(chunkSize);

      const outlinedChunkSize = chunkSize + 1;

      const arr = new VoxelArray(new Vector3(chunkSize, chunkHeight, chunkSize));

      const posInChunk = new Vector3();
      for (let x = -1; x < outlinedChunkSize; x++) {
        for (let z = -1; z < outlinedChunkSize; z++) {
          for (let y = 0; y < chunkHeight; y++) {
            posInChunk.set(x, y, z);
            const worldPos = new Vector3(x, y, z).add(chunkPos);
            const voxelType = this.onGetVoxel(worldPos);
            if (voxelType === 'air') continue;
            arr.setVoxelAt(posInChunk, voxelRegistry[voxelType].id);
          }
        }
      }

      self.postMessage(arr.Buffer, {transfer: [arr.Buffer]});
      workerVoxelGeneratorTimer.stop();
    }
  }
}