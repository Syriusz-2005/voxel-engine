import { Vector3 } from "three";
import { VoxelId } from "../types/VoxelRegistry.ts";


export default class BlockArray {
  private readonly buffer: ArrayBuffer;
  private readonly blocks: Uint8Array;
  
  constructor(
    private readonly dimensions: Vector3,
  ) {
    this.buffer = new ArrayBuffer((dimensions.x + 2) * dimensions.y * (dimensions.x + 2));
    this.blocks = new Uint8Array(this.buffer);
  }

  private getIndex(x: number, y: number, z: number) {
    return x + (y * this.dimensions.x) + (z * this.dimensions.x * this.dimensions.y);
  }

  public getVoxelAt(vec: Vector3): VoxelId {
    return this.blocks[this.getIndex(vec.x + 1, vec.y, vec.z + 1)] as VoxelId;
  }

  public setVoxelAt(vec: Vector3, voxelId: VoxelId) {
    this.blocks[this.getIndex(vec.x + 1, vec.y, vec.z + 1)] = voxelId;
  }
}