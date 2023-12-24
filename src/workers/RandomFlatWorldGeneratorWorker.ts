import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";
import Noise from 'noisejs';
console.log(Noise);
const noise = new Noise.Noise(1);

const seaLevel = 20;

new WorkerVoxelGenerator((worldPos) => {
  const worldHeight = noise.simplex2(worldPos.x / 100, worldPos.z / 100) * 18 + 18;

  if (worldPos.y < worldHeight) {
    if (worldPos.y > 22) {
      return 'grass';
    }
    
    return 'dirt';
  }

  if (worldPos.y <= seaLevel) {
    return 'water';
  }
  
  return 'air';
});