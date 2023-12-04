import { Vector3 } from "three";
import WorldManager, { WorldManagerConfig } from "./WorldManager.ts";
import ThreadedWorld from "./ThreadedWorld.ts";
import ThreadReceiver from "../utils/ThreadReceiver.ts";
import { WorldControllerMessage } from "./WorldController.ts";
import Chunk from "./Chunk.ts";
import ChunkRenderer from "./ChunkRenderer.ts";




export default class ThreadedWorldManager {
  private visibilityPoint: Vector3 | undefined;
  private frameIndex = 0;
  private readonly chunkSize: number;
  private readonly chunkHeight: number;
  private readonly world: ThreadedWorld;
  
  constructor(
    private readonly config: WorldManagerConfig,
    private readonly threadReceiver: ThreadReceiver<WorldControllerMessage>,
  ) {
    this.chunkSize = config.chunkSize;
    this.chunkHeight = config.chunkHeight;
    this.world = new ThreadedWorld(this, this.chunkSize, this.chunkHeight);
  }

  public get Config(): WorldManagerConfig {
    return this.config;
  }

  public set FrameIndex(index: number) {
    this.frameIndex = index;
  }

  public new(config: WorldManagerConfig): ThreadedWorldManager {
    return new ThreadedWorldManager(config, this.threadReceiver);
  }

  public set VisibilityPoint(pos: Vector3) {
    this.visibilityPoint = pos.clone();
  }

  private getCameraChunk() {
    if (!this.visibilityPoint) return;
    return this.visibilityPoint
      .clone()
      .divideScalar(this.chunkSize)
      .floor();
  }

  public processFrame(frameIndex: number, visibilityPoint: Vector3) {
    this.FrameIndex = frameIndex;
    this.VisibilityPoint = visibilityPoint;

    this.updateWorld();
  }

  private async updateWorld() {
    const currentChunk = this.getCameraChunk();

    if (!currentChunk) return;

    const chunksToDispose = this.world.findChunksOutOfRadius(currentChunk, this.Config.renderDistance);
    for (const chunk of chunksToDispose) {
      this.world.disposeChunkAt(chunk.ChunkPos);
    }

    this.threadReceiver.postMessage({
      command: 'chunkDispose',
      data: {
        chunkPos: chunksToDispose.map(chunk => chunk.ChunkPos.toArray())
      }
    });

    const renderDistance = this.config.renderDistance;

    const chunkPromises: Promise<Chunk>[] = [];

    for (let x = currentChunk.x - renderDistance; x < currentChunk.x + renderDistance; x++) {
      for (let z = currentChunk.z - renderDistance; z < currentChunk.z + renderDistance; z++) {
        const chunkPos = new Vector3(x, 0, z);
      
        if (chunkPos.distanceTo(currentChunk) < renderDistance) {
          const chunk = this.world.getChunkAt(chunkPos);
          if (!chunk) {
            const chunkPromise = this.world.generateChunkAt(chunkPos, this.Config.worldGenerator);
            chunkPromises.push(chunkPromise);  
          }
        }
      }
    }

    const chunks = await Promise.all(chunkPromises);

    for (const chunk of chunks) {
      if (chunk.ChunkPos.distanceTo(this.getCameraChunk()!) < renderDistance) {
        const posArr = chunk.ChunkPos.toArray();
        const attributes = await ChunkRenderer.generateAttributesForTransparencyPasses(chunk)
        this.threadReceiver.postMessage({
          command: 'chunkRender',
          data: {
            chunkPos: posArr,
            attributes,
          }
        });
      } else {
        this.world.disposeChunkAt(chunk.ChunkPos);
      }
    }
  }

}