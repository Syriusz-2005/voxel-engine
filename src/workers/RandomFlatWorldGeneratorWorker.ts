import { MathUtils } from "three";
import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";


new WorkerVoxelGenerator((worldPos) => {
  const worldHeight = MathUtils.randInt(500, 502);
  if (worldPos.y < worldHeight) {
    return 'dirt';
  }

  return 'air';
});