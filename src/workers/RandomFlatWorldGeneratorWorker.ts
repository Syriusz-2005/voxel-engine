import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";
import Noise from 'noisejs';
console.log(Noise);
const noise = new Noise.Noise(Math.random());

const seaLevel = 20;

new WorkerVoxelGenerator((worldPos) => {

  if (worldPos.y < 6 && worldPos.x % 16 === 6 && worldPos.z % 16 === 6) {
    return 'dirt';
  }

  return 'air';
  const worldHeight = noise.simplex2(worldPos.x / 100, worldPos.z / 100) * 40 + 20;
  
  if (worldPos.y < worldHeight) {
    return 'dirt';
  }

  if (worldPos.y <= seaLevel) {
    return 'water';
  }
  
  return 'air';
});