import { Vector3 } from "three";
import { VoxelType } from "../types/VoxelRegistry.ts";
import Voxel from "./Voxel.ts";
import RenderableVoxel from "./RenderableVoxel.ts";
import ChunkError from "../errors/ChunkError.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";
import Perf from "../utils/Perf.ts";

const perfTest = new Perf('Voxel info generation', 400);

export default class Chunk {
  private readonly data: ({type: VoxelType, pos: Vector3} | undefined)[][][];

  private isGenerating: boolean = false;
  private onGenerated?: () => void;

  private strCache: VectorRepresentation | undefined;

  constructor(
    private readonly size: number,
    private readonly height: number,
  ) {
    this.data = new Array(size)
      .fill(undefined)
      .map(() => new Array(height)
        .fill(undefined)
        .map(() => new Array(size))
      );
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

  private isInBounds(vec: Vector3): boolean {
    const {x, y, z} = vec;
    return x >= 0 && y >= 0 && z >= 0 && x < this.size && y < this.height && z < this.size;
  }

  public getVoxelAt(vec: Vector3): VoxelType {
    if (vec.y > this.height) return 'air';
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block is out of bounds!`)
    return this.data[vec.x][vec.y][vec.z]?.type ?? 'air';
  }

  public setVoxelAt(vec: Vector3, value: Voxel): void {
    if (!this.isInBounds(vec)) 
      throw new ChunkError(`Block at ${vec.x} ${vec.y} ${vec.z} is out of bounds!`)
    this.data[vec.x][vec.y][vec.z] = {type: value.Name, pos: vec};
  }

  public removeBlockAt(vec: Vector3): void {
    this.data[vec.x][vec.y][vec.z] = undefined;
  }

  public *each() {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        for (let y = 0; y < this.height; y++) {
          const voxel = this.data[x][y][z];
          if (voxel) {
            yield voxel;
          }
        }
      }
    }
  }

  public *subchunk(yTop: number, yBottom: number) {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        for (let y = yBottom; y < yTop; y++) {
          const voxel = this.data[x][y][z];
          if (voxel) {
            yield voxel;
          }
        }
      }
    }
  }

  private generateVoxelsByOne(generator: WorldGenerator, chunkWorldPos: Vector3): void {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const height = this.height;
        for (let y = 0; y < height; y++) {
          const posInChunk = new Vector3(x, y, z);
          const worldPos = new Vector3(
            chunkWorldPos.x * this.size + x, 
            y,
            chunkWorldPos.z * this.size + z
          );
          
          const voxel = generator.getVoxelAt(worldPos);
          if (voxel) {
            this.setVoxelAt(posInChunk, voxel);
          }
        }
      }
    }
  }

  public async generate(generator: WorldGenerator, chunkWorldPos: Vector3): Promise<void> {
    this.isGenerating = true;
    if (generator.getChunkAt !== undefined) {
      const voxels = await generator.getChunkAt(chunkWorldPos, this.size, this.height);
      
      voxels.forEach(({posInChunk, voxel}) => {
        this.setVoxelAt(posInChunk, voxel);
      });
      this.isGenerating = false;
      return this.onGenerated?.();
    }

    this.generateVoxelsByOne(generator, chunkWorldPos);
    this.isGenerating = false;
    this.onGenerated?.();
  }

  public async getRenderableVoxels(
    subchunkIterator?: Generator<{
      type: "air" | "grass" | "dirt";
      pos: Vector3;
    }, void, unknown>
  ): Promise<{facesCount: number, voxels: RenderableVoxel[]}> {
    const voxels: RenderableVoxel[] = [];
    let facesCount = 0;
    await this.waitForGenerationComplete();
    
    perfTest.start();
    const precompiledAdjacents = [
      new Vector3(1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, -1, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, -1),
    ];

    const adjacents: Vector3[] = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ];

    for (const {type: voxelType, pos: vec} of subchunkIterator ?? this.each()) {
      const renderableFaces: Vector3[] = [];
  
      for (let i = 0; i < adjacents.length; i++) {
        const adj = adjacents[i];
        adj.copy(vec);
        adj.add(precompiledAdjacents[i]);
  
        if (!this.isInBounds(adj) || this.getVoxelAt(adj) === 'air') {
          renderableFaces.push(precompiledAdjacents[i]);
        }
      }
      
      if (renderableFaces.length === 0) continue;
  
      facesCount += renderableFaces.length;
      const voxel = new Voxel(voxelType);
      const renderableVoxel = new RenderableVoxel(voxel, vec, renderableFaces);
      voxels.push(renderableVoxel);
    }


    perfTest.stop();

    
    return {
      facesCount,
      voxels,
    };
  }
}
