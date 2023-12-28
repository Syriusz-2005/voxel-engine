import { Vector3 } from "three";
import { VoxelId } from "../types/VoxelRegistry.ts";


export default class VoxelArray {
  private readonly buffer: ArrayBuffer;
  private readonly voxels: Uint8Array;
  
  constructor(
    private readonly dimensions: Vector3,
  ) {
    this.buffer = new ArrayBuffer((dimensions.x + 2) * dimensions.y * (dimensions.x + 2));
    this.voxels = new Uint8Array(this.buffer);
  }

  private getIndex(x: number, y: number, z: number) {
    return x + (y * this.dimensions.x) + (z * this.dimensions.x * this.dimensions.y);
  }

  public getVoxelAt(vec: Vector3): VoxelId {
    return this.voxels[this.getIndex(vec.x + 1, vec.y, vec.z + 1)] as VoxelId;
  }

  public setVoxelAt(vec: Vector3, voxelId: VoxelId) {
    this.voxels[this.getIndex(vec.x + 1, vec.y, vec.z + 1)] = voxelId;
  }

  /**
   * 
   * @param voxels must contain the correct amount of voxels. Must contain outline voxels. 
   */
  public setVoxels(voxels: Uint8Array) {
    this.voxels.set(voxels);
  }

  public get Buffer(): ArrayBuffer {
    return this.buffer;
  }
}