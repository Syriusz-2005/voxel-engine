import { Vector3 } from "three";
import { TaskData } from "./WorkerPool";
import { VoxelType, voxelRegistry } from "../types/VoxelRegistry";



export default class WorkerVoxelGenerator {
  private perfStart?: number = undefined;
  private perfSum: number = 0;
  private taskCount: number = 0;

  constructor(
    private readonly onGetVoxel: (worldPos: Vector3) => VoxelType,
  ) {
    self.onmessage = (event) => {
      this.perfStart = performance.now();
      const data: TaskData = event.data;

      // console.time('Chunk generation');
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
      const perfEnd = performance.now();
      this.perfSum += perfEnd - this.perfStart;
      this.taskCount++;

      if (this.taskCount % 20 === 0) {
        console.log(`Average time: ${this.perfSum / this.taskCount}ms`);
      }
    }
  }
}