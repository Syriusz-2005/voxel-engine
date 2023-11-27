import { Scene, Vector3 } from "three";
import Chunk from "./Chunk.ts";
import Voxel from "./Voxel.ts";
import ChunkRenderer from "./ChunkRenderer.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";
import { VoxelType } from "../types/VoxelRegistry.ts";
import WorldManager from "./WorldManager.ts";
import CoordTransformations from "../utils/CoordTransformations.ts";
import { WorldLike } from "../types/WorldLike.ts";



export default class World implements WorldLike {
  private renderers: Map<VectorRepresentation, ChunkRenderer> = new Map();

  public get Renderers(): Map<VectorRepresentation, ChunkRenderer> {
    return this.renderers;
  }

  private readonly chunkDimensions: Vector3;
  private transformations: CoordTransformations;

  constructor(
    private readonly chunkSize: number,
    private readonly chunkHeight: number,
    private readonly scene: Scene,  
    private readonly manager: WorldManager,
  ) {
    this.chunkDimensions = new Vector3(chunkSize, chunkHeight, chunkSize);
    this.transformations = new CoordTransformations(this.chunkDimensions);
  }


  public getChunkAt(vec: Vector3): Chunk | undefined {
    const renderer = this.renderers.get(Representation.toRepresentation(vec));

    return renderer?.Chunk;
  }

  private setChunkAt(vec: Vector3, chunk: Chunk): ChunkRenderer {
    const newRenderer = new ChunkRenderer(chunk, this.scene, vec, this.chunkSize, this, this.manager.Config.view);
    this.renderers.set(
      Representation.toRepresentation(vec), 
      newRenderer,
    );
    return newRenderer;
  }

  private createChunk(vec: Vector3): ChunkRenderer {
    const chunk = new Chunk(this.chunkSize, this.chunkHeight, this, vec);
    const renderer = this.setChunkAt(vec, chunk);
    return renderer;
  }

  public async generateChunkAt(vec: Vector3, generator: WorldGenerator): Promise<ChunkRenderer> {
    const renderer = this.createChunk(vec);
    await renderer.Chunk.generate(generator, vec);
    return renderer;
  }

  public disposeChunkAt(vec: Vector3): void {
    const representation = Representation.toRepresentation(vec);
    const renderer = this.renderers.get(representation);
    if (!renderer) return;

    renderer.remove();
    this.renderers.delete(representation);
  }

  public findChunksInRadius(center: Vector3, radius: number): ChunkRenderer[] {
    const renderers: ChunkRenderer[] = [];
    this.renderers.forEach((renderer, vecRepresentation) => {
      const vec = Representation.fromRepresentation(vecRepresentation);
      const distance = center.distanceTo(vec);
      if (distance < radius) {
        renderers.push(renderer);
      }
    });
    return renderers;
  }

  public findChunksOutOfRadius(center: Vector3, radius: number) {
    const renderers: ChunkRenderer[] = [];
    this.renderers.forEach((renderer, vecRepresentation) => {
      const vec = Representation.fromRepresentation(vecRepresentation);
      const distance = center.distanceTo(vec);
      if (distance > radius) {
        renderers.push(renderer);
      }
    });
    return renderers;
  }

  public getVoxelTypeAt(worldPos: Vector3): VoxelType {
    const chunkPos = this.transformations.transformToChunkPos(worldPos);
    const posInChunk = this.transformations.transformToPosInChunk(worldPos);

    const chunk = this.getChunkAt(chunkPos);
    if (!chunk || chunk.IsGenerating) return 'unknown';

    const voxelType = chunk.getVoxelAt(posInChunk);
    return voxelType;
  }

  public getVoxelAt(worldPos: Vector3): Voxel | undefined {
    const chunkPos = this.transformations.transformToChunkPos(worldPos);
    const posInChunk = this.transformations.transformToPosInChunk(worldPos);

    const chunk = this.getChunkAt(chunkPos);
    if (!chunk || chunk.IsGenerating) return undefined;

    const voxelType = chunk.getVoxelAt(posInChunk);
    return new Voxel(voxelType);
  }

  /**
   * Note that this functions renders all the available chunks in the entire world! kind of missing the point of chunks anyway but it's a start
   */
  public renderAll(): void {
    this.renderers.forEach(renderer => {
      renderer.update();
    });
  }

  public renderChunkAt(chunkPos: Vector3): void {
    const renderer = this.renderers.get(Representation.toRepresentation(chunkPos));
    if (!renderer) return;
    renderer.update();
  }
}