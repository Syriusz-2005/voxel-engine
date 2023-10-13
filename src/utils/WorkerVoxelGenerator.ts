import { Vector3 } from "three";
import { TaskData } from "./WorkerPool";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry";
import Perf from "./Perf";

const workerVoxelGeneratorTimer = new Perf('Worker generation time', 400);

export default class WorkerVoxelGenerator {

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

      const chunkData = new Uint8Array(chunkSize * chunkSize * chunkHeight);

      for (let x = 0; x < chunkSize; x++) {
        for (let z = 0; z < chunkSize; z++) {
          for (let y = 0; y < chunkHeight; y++) {
            const index = x + z * chunkSize + y * chunkSize * chunkSize;
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