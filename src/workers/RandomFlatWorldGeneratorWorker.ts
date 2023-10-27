import WorkerVoxelGenerator from "../utils/WorkerVoxelGenerator";
import Noise from 'noisejs';
console.log(Noise);
const noise = new Noise.Noise(Math.random());

const seaLevel = 20;

new WorkerVoxelGenerator((worldPos) => {

  // if (worldPos.x % 16 === 1 && worldPos.z % 16 === 1) {

  //   if (worldPos.y > 8 && worldPos.y < 11) {
  //     return 'dirt';
  //   }
  
  //   if (worldPos.y === 20) {
  //     return 'dirt';
  //   }
  // }


  // return 'air';

  // if (worldPos.y <= (noise.simplex2(worldPos.x / 10, worldPos.z / 10) > 0.7 ? 2 : 1)) return 'dirt';

  // return 'air';
  // if (
  //   worldPos.y < 2 
  //   && (
  //     (
  //       worldPos.x % 16 === 0 
  //       && worldPos.z % 16 === 0
  //     ) 
  //     || (
  //       worldPos.x % 16 === 0 
  //       && worldPos.z % 16 === 1
  //     )
  //   )
  // ) {
  //   return 'dirt';
  // }

  // return 'air';
  const worldHeight = noise.simplex2(worldPos.x / 100, worldPos.z / 100) * 14 + 10;
  
  if (worldPos.y < worldHeight) {
    return 'dirt';
  }

  // if (worldPos.y <= seaLevel) {
  //   return 'water';
  // }
  
  return 'air';
});