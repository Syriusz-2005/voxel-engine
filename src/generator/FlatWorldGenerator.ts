import { Vector3 } from "three";
import Voxel from "../classes/Voxel.ts";
import WorldGenerator from "./WorldGenerator.ts";


export default class FlatWorldGenerator implements WorldGenerator {
  constructor() {}
  
  public getVoxelAt(worldPos: Vector3) {
    if (worldPos.y < 4) {
      return new Voxel('dirt');
    }

    if (worldPos.y < 5) {
      return new Voxel('grass');
    }

    return undefined;
  }
}