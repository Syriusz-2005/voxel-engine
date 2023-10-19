import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";
import Noise from 'noisejs';
console.log(Noise);
const noise = new Noise.Noise(Math.random());

new WorkerVoxelGenerator((worldPos) => {
  const worldHeight = noise.perlin2(worldPos.x / 100, worldPos.z / 100) * 10 + 20;
  if (worldPos.y < worldHeight) {
    return 'dirt';
  }
  
  return 'air';
});