import { Vector3 } from "three";
import Voxel from "./Voxel.js";



export default class RenderableFace {
  constructor(
    public readonly voxelPosition: Vector3,
    public readonly faceRotation: Vector3,
    public faceZLength: number,
    public readonly voxelType: Voxel,
  ) {}

  
}