import { Scene, Vector3 } from "three";
import World from "./World";
import WorldGenerator from "../generator/WorldGenerator";

export type WorldManagerConfig = {
  renderDistance: number;
  worldGenerator: WorldGenerator;
}

export default class WorldManager {
  private readonly world: World;
  private visibilityPoint: Vector3 | undefined;

  constructor(
    private readonly chunkSize: number,
    private readonly chunkHeight: number,
    private readonly scene: Scene,
    private readonly config: WorldManagerConfig,
  ) {
    this.world = new World(this.chunkSize, this.chunkHeight, this.scene);
    console.log(this);
  }

  public updateVisibilityPoint(pos: Vector3) {
    this.visibilityPoint = pos.clone();
  }

  private getCurrentChunk() {
    if (!this.visibilityPoint) return;
    return this.visibilityPoint
      .clone()
      .divideScalar(this.chunkSize)
      .floor();
  }

  public async updateWorld() {
    if (!this.visibilityPoint) {
      return;
    }
    const {renderDistance, worldGenerator} = this.config;


    const currentChunk = this.getCurrentChunk()!;

    const renderers = this.world.findChunksOutOfRadius(currentChunk, renderDistance);
    for (const renderer of renderers) {
      this.world.disposeChunkAt(renderer.Position);
    }

    for (let x = currentChunk.x - renderDistance; x < currentChunk.x + renderDistance; x++) {
      for (let z = currentChunk.z - renderDistance; z < currentChunk.z + renderDistance; z++) {
        const chunkPos = new Vector3(x, 0, z);
        if (chunkPos.distanceTo(currentChunk) < renderDistance) {
          const chunk = this.world.getChunkAt(chunkPos);
          if (!chunk) {
            this.world.generateChunkAt(chunkPos, worldGenerator)
              .then(async chunkRenderer => {
                if (chunkPos.distanceTo(this.getCurrentChunk()!) < renderDistance) {
                  await chunkRenderer.update();
                } else {
                  this.world.disposeChunkAt(chunkPos);
                }
              })
          }
        }
      }
    }

    
  } 
}