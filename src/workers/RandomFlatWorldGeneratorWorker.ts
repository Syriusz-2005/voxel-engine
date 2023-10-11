import { MathUtils } from "three";
import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";


new WorkerVoxelGenerator((worldPos) => {
  const worldHeight = MathUtils.randInt(4, 5);
  if (worldPos.y < worldHeight) {
    return 'dirt';
  }

  return 'air';
});