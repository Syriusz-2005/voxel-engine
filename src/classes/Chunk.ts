import { Vector3 } from "three";
import { VoxelType, registry, voxelRegistry } from "../types/VoxelRegistry.ts";
import Voxel from "./Voxel.ts";
import RenderableVoxel from "./RenderableVoxel.ts";
import ChunkError from "../errors/ChunkError.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import Perf from "../utils/Perf.ts";
import World from "./World.ts";

const perfTest = new Perf('Voxel info generation', 400);

export type TransparencyPass = {voxels: RenderableVoxel[], facesCount: number};

export default class Chunk {
  private readonly data: ({type: VoxelType, pos: Vector3} | undefined)[][][];

  private isGenerating: boolean = false;
  private onGenerated?: () => void;

  constructor(
    private readonly size: number,
    private readonly height: number,
    private readonly world: World,
    private readonly chunkPos: Vector3,
  ) {
    this.data = new Array(size)
      .fill(undefined)
      .map(() => new Array(height)
        .fill(undefined)
        .map(() => new Array(size))
      );
    this.data[-1] = new Array(height)
      .fill(undefined)
      .map(() => new Array(size))
    this.data[size] = new Array(height)
      .fill(undefined)
      .map(() => new Array(size))  
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
 
  public get IsGenerating() {
    return this.isGenerating;
  }

  public getVoxelAt(vec: Vector3): VoxelType {
    if (vec.y > this.height) return 'air';
    return this.data[vec.x][vec.y][vec.z]?.type ?? 'air';
  }

  public setVoxelAt(vec: Vector3, value: Voxel): void {
    this.data[vec.x][vec.y][vec.z] = {type: value.Name, pos: vec};
  }

  public removeBlockAt(vec: Vector3): void {
    this.data[vec.x][vec.y][vec.z] = {type: 'air', pos: vec};
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

  public async generate(generator: WorldGenerator, chunkWorldPos: Vector3): Promise<void> {
    this.isGenerating = true;

    const voxels = await generator.getChunkAt(chunkWorldPos, this.size, this.height);
    
    voxels.forEach(({posInChunk, voxel}) => {
      this.setVoxelAt(posInChunk, voxel);
    });
    
    this.isGenerating = false;
  }

  public async getRenderableVoxels(
    subchunkIterator?: Generator<{
      type: VoxelType;
      pos: Vector3;
    }, void, unknown>
  ): Promise<{
    facesCount: number,
    transparencyPasses: TransparencyPass[],
  }> {
    const transparencyPasses = registry.getTransparencyPasses();
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

    const chunkWorldPos = this.chunkPos
      .clone()
      .multiplyScalar(this.size);

    for (const {type: voxelType, pos: vec} of subchunkIterator ?? this.each()) {
      const renderableFaces: Vector3[] = [];
  
      for (let i = 0; i < adjacents.length; i++) {
        const adj = adjacents[i];
        adj.copy(vec);
        adj.add(precompiledAdjacents[i]);
  
        const {x, y, z} = adj;
        if (y < 0 || y > this.height) {
          renderableFaces.push(precompiledAdjacents[i]);
          continue;
        }

        if (x < 0 || z < 0 || x >= this.size || z >= this.size) {
          let voxelNear = this.world.getVoxelAt(
            chunkWorldPos
              .clone()
              .add(adj)
          );
          if (!voxelNear) {
            // console.log('no voxel near', this.getVoxelAt(adj))
            voxelNear = new Voxel(this.getVoxelAt(adj));
          }
          if (voxelNear) {
            const currVoxelType = voxelRegistry[voxelNear.Name];
            if (
              currVoxelType.existing === false 
              || (
                currVoxelType.opacity !== undefined 
                && currVoxelType.opacity < 1 
                && voxelNear.Name !== voxelType
                )
            ) {
              renderableFaces.push(precompiledAdjacents[i]);
            }
          }
          
          continue;
        }

        const currVoxelName = this.getVoxelAt(adj);
        const currVoxelType = voxelRegistry[currVoxelName];
        if (
          currVoxelType.existing === false 
          || (
            currVoxelType.opacity !== undefined 
            && currVoxelType.opacity < 1 
            && currVoxelName !== voxelType
          )
        ) {
          renderableFaces.push(precompiledAdjacents[i]);
        }
      }
      
      if (renderableFaces.length === 0) continue;
  
      facesCount += renderableFaces.length;
      const voxel = new Voxel(voxelType);
      const renderableVoxel = new RenderableVoxel(voxel, vec, renderableFaces);

      const passId = voxel.Opacity > 0 && voxel.Opacity < 1 ? voxel.Id : 0;

      const prevTransparencyPass = transparencyPasses.get(passId)!;
      prevTransparencyPass.facesCount += renderableFaces.length;
      prevTransparencyPass.voxels.push(renderableVoxel);

    }


    perfTest.stop();

    
    return {
      facesCount,
      transparencyPasses: Array.from(transparencyPasses.values()),
    };
  }
}
