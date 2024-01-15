import { Vector3 } from "three";
import { VoxelId, VoxelType, registry, voxelRegistry } from "../types/VoxelRegistry.js";
import Voxel from "./Voxel.js";
import RenderableVoxel from "./RenderableVoxel.js";
import WorldGenerator from "../generator/WorldGenerator.js";
import Perf from "../utils/Perf.js";
import RenderableFace from "./RenderableFace.js";
import GreededTransparencyPassesManager from "./GreededTransparencyPassManager.js";
import ThreadedScene from "./ThreadedScene.js";
import VoxelArray from "./VoxelArray.js";

const perfTest = new Perf('Voxel info generation', 400);

export type TransparencyPass = {
  voxels: RenderableVoxel[];
  facesCount: number
};

export type GreededTransparencyPass = {
  faces: RenderableFace[];
}

export default class Chunk {
  private isGenerating: boolean = false;
  private onGenerated?: () => void;

  public static readonly PRECOMPILED_ADJACENTS = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
  ] as const;

  public static readonly ADJACENTS_POOL = [
    new Vector3(),
    new Vector3(),
    new Vector3(),
    new Vector3(),
    new Vector3(),
    new Vector3(),
  ] as const;

  private readonly chunkDimensions: Vector3;
  private readonly voxels: VoxelArray;

  constructor(
    private readonly size: number,
    private readonly height: number,
    private readonly world: ThreadedScene,
    private readonly chunkPos: Vector3,
  ) {
    this.chunkDimensions = new Vector3(this.size, this.height, this.size);
    this.voxels = new VoxelArray(this.chunkDimensions);
  }

  public get ChunkPos(): Vector3 {
    return this.chunkPos;
  }

  public get ChunkDimensions(): Vector3 {
    return this.chunkDimensions;
  }

  public get Size(): number {
    return this.size; 
  }

  private setOnGeneratedListener(listener: () => void): void {
    this.onGenerated = () => listener();
  }

  private waitForGenerationComplete() {
    return new Promise<void>((resolve) => {
      if (this.isGenerating === false) resolve();
      this.setOnGeneratedListener(resolve);
    });
  }

  public isInBounds(vec: Vector3): boolean {
    const {x, y, z} = vec;
    return x >= 0 && y >= 0 && z >= 0 && x < this.size && y < this.height && z < this.size;
  }
 
  public get IsGenerating() {
    return this.isGenerating;
  }

  public getVoxelTypeAt(vec: Vector3): VoxelType {
    if (vec.y > this.height) return 'air';
    const id = this.voxels.getVoxelAt(vec);
    const voxelName = registry.getVoxelNameById(id);
    return voxelName;
  }

  public setVoxelAt(vec: Vector3, value: Voxel): void {
    if (vec.y > this.height) return;
    this.voxels.setVoxelAt(vec, value.Id);
  }

  public removeVoxelAt(vec: Vector3): void {
    this.voxels.setVoxelAt(vec, 0);
  }

  /**
   * Iterates for each voxel in the chunk. Skips the air voxels
   */
  public *each(): Generator<VoxelId> {
    let vec = new Vector3();
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        for (let y = 0; y < this.height; y++) {
          vec.set(x, y, z);
          const voxelId = this.voxels.getVoxelAt(vec);
          if (voxelId !== 0) {
            yield voxelId;
          }
        }
      }
    }
  }

  /**
   * Iterates for each voxel in the chunk regardless of the voxel type
   * Does not skip the air voxels
   */
  public *iterateThroughChunk(): Generator<VoxelId> {
    const vec = new Vector3();
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.size; z++) {
          vec.set(x, y, z);
          const voxelId = this.voxels.getVoxelAt(vec);
          yield voxelId;
        }
      }
    }
  }

  public static *each(chunkSize: number, chunkHeight: number) {
    for (let x = 0; x < chunkSize; x++) {
      for (let z = 0; z < chunkSize; z++) {
        for (let y = 0; y < chunkHeight; y++) {
          yield new Vector3(x, y, z);
        }
      }
    }
  }

  public *subchunk(yTop: number, yBottom: number) {
    const vec = new Vector3();
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        for (let y = yBottom; y < yTop; y++) {
          vec.set(x, y, z);
          const voxelId = this.voxels.getVoxelAt(vec);
          yield voxelId;
        }
      }
    }
  }

  public async generate(generator: WorldGenerator, chunkWorldPos: Vector3): Promise<void> {
    this.isGenerating = true;

    const voxels = await generator.getVoxelArrayAt(chunkWorldPos, this.size, this.height);
    
    this.voxels.setVoxels(voxels);
    
    this.isGenerating = false;
    this.onGenerated?.();
  }

  public get Height(): number {
    return this.height;
  }

  public get World(): ThreadedScene {
    return this.world;
  }

  public get WorldPos(): Vector3 {
    return this.chunkPos
      .clone()
      .multiply(this.ChunkDimensions);
  }

  public async getGreededTransparencyPasses(): Promise<GreededTransparencyPass[]> {
    await this.waitForGenerationComplete();
    const manager = new GreededTransparencyPassesManager();
    const {passes} = manager.createFaces(this);
    return passes;
  }
}
