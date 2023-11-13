import { Vector3 } from "three";
import Voxel from "./Voxel.ts";



export default class RenderableFace {
  constructor(
    public readonly faceRotation: Vector3,
    public faceZLength: number,
  ) {}

  
}