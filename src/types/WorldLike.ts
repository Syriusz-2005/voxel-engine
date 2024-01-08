import { Vector3 } from "three";
import Voxel from "../classes/Voxel";


export type WorldLike = {
  getVoxelAt(vec: Vector3): Voxel | undefined;
  
}