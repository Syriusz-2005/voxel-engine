import { Vector3 } from "three";
import Voxel from "../classes/Voxel.ts";

export default abstract class WorldGenerator {
  public abstract getVoxelAt: (worldPos: Vector3) => Voxel | undefined;
}