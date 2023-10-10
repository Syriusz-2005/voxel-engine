import { Scene, Vector3 } from "three";
import Chunk from "./Chunk.ts";
import Voxel from "./Voxel.ts";
import MissingChunkError from "../errors/MissingChunkError.ts";
import ChunkRenderer from "./ChunkRenderer.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";



export default class World {
  private readonly renderers: Map<VectorRepresentation, ChunkRenderer> = new Map();

  constructor(
    private readonly chunkSize: number,
    private readonly chunkHeight: number,
    private readonly scene: Scene,  
  ) {}

  public transformWorldPosToChunkPos(worldPos: Vector3): Vector3 {
    const {x, y, z} = worldPos;
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkHeight);
    const chunkZ = Math.floor(z / this.chunkSize);

    return new Vector3(chunkX, chunkY, chunkZ);
  }

  public transformWorldPosToPosInChunk(worldPos: Vector3): Vector3 {
    const {x, y, z} = worldPos;
    const posInChunkX = x % this.chunkSize;
    const posInChunkY = y % this.chunkHeight;
    const posInChunkZ = z % this.chunkSize;

    return new Vector3(posInChunkX, posInChunkY, posInChunkZ);
  }

  public getChunkAt(vec: Vector3): Chunk | undefined {
    const renderer = this.renderers.get(Representation.toRepresentation(vec));

    return renderer?.Chunk;
  }

  private setChunkAt(vec: Vector3, chunk: Chunk): ChunkRenderer {
    const newRenderer = new ChunkRenderer(chunk, this.scene, vec, this.chunkSize);
    this.renderers.set(
      Representation.toRepresentation(vec), 
      newRenderer,
    );
    return newRenderer;
  }

  private createChunk(vec: Vector3): ChunkRenderer {
    const chunk = new Chunk(this.chunkSize, this.chunkHeight);
    const renderer = this.setChunkAt(vec, chunk);
    return renderer;
  }

  public generateChunkAt(vec: Vector3, generator: WorldGenerator): ChunkRenderer {
    const renderer = this.createChunk(vec);
    renderer.Chunk.generate(generator, vec);
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

  public getVoxelAt(worldPos: Vector3): Voxel {
    const chunkPos = this.transformWorldPosToChunkPos(worldPos);
    const posInChunk = this.transformWorldPosToPosInChunk(worldPos);

    const chunk = this.getChunkAt(chunkPos);
    if (!chunk) throw new MissingChunkError(chunkPos);

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
}