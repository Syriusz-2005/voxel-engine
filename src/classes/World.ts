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

  private setChunkAt(vec: Vector3, chunk: Chunk): void {
    this.renderers.set(
      Representation.toRepresentation(vec), 
      new ChunkRenderer(chunk, this.scene, vec, this.chunkSize),
    );
  }

  public createChunk(vec: Vector3): Chunk {
    const chunk = new Chunk(this.chunkSize, this.chunkHeight);
    this.setChunkAt(vec, chunk);
    return chunk;
  }

  public generateChunkAt(vec: Vector3, generator: WorldGenerator) {
    const chunk = this.createChunk(vec);
    chunk.generate(generator, vec);
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