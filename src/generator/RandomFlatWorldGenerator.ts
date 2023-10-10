import { Vector3 } from "three";
import WorldGenerator from "./WorldGenerator.ts";
import MathUtils from "../classes/MathUtils.ts";
import Voxel from "../classes/Voxel.ts";


export default class RandomFlatWorldGenerator implements WorldGenerator {
  public getVoxelAt(worldPos: Vector3) {
    const worldHeight = MathUtils.randomInt(4, 5);
    if (worldPos.y < worldHeight) {
      return new Voxel('dirt');
    }

    return undefined;
  }
}