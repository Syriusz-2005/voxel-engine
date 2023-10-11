import { MathUtils, Vector3 } from "three";
import { TaskData } from "../utils/WorkerPool";
import { voxelRegistry } from "../types/VoxelRegistry";

self.onmessage = (event) => {
  const data: TaskData = event.data;

  console.time('Chunk generation');
  const {chunkPos: chunkPosRepresentation, chunkSize, chunkHeight} = data.data as {chunkPos: {x: number; y: number; z: number}, chunkSize: number, chunkHeight: number};

  const chunkPos = new Vector3(chunkPosRepresentation.x, chunkPosRepresentation.y, chunkPosRepresentation.z)
    .multiplyScalar(chunkSize);

  const chunkData = new Uint8Array(chunkSize * chunkSize * chunkHeight);

  for (let x = 0; x < chunkSize; x++) {
    for (let z = 0; z < chunkSize; z++) {
      for (let y = 0; y < chunkHeight; y++) {
        const index = x + z * chunkSize + y * chunkSize * chunkSize;
        const worldPos = new Vector3(x, y, z).add(chunkPos);
        const worldHeight = MathUtils.randInt(3, 4);
        if (worldPos.y < worldHeight) {
          chunkData[index] = voxelRegistry['dirt'].id;
        }
      }
    }
  }

  self.postMessage(chunkData.buffer, {transfer: [chunkData.buffer]});
  console.timeEnd('Chunk generation');
}