import { Vector3 } from "three";
import Voxel from "./Voxel.ts";


export default class RenderableVoxel {
  constructor(
    private readonly voxel: Voxel,
    private readonly posInChunk: Vector3,
    private readonly renderableFaces: Vector3[],
  ) {}

  public get RenderableFaces(): Vector3[] {
    return this.renderableFaces;
  }

  public get Voxel(): Voxel {
    return this.voxel;
  }
  public get PosInChunk(): Vector3 {
    return this.posInChunk;
  }
}