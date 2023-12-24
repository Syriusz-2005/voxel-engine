import { Vector3 } from "three";
import { WorldManagerConfig } from "./WorldManagerConfig.ts";
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
  private prevCameraChunk: Vector3 | undefined;
  
  constructor(
    private readonly config: WorldManagerConfig,
    private readonly threadReceiver: ThreadReceiver<WorldControllerMessage>,
  ) {
    this.chunkSize = config.chunkSize;
    this.chunkHeight = config.chunkHeight;
    this.world = new ThreadedWorld(this, this.chunkSize, this.chunkHeight);
    console.log(this)
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

    if (this.prevCameraChunk && this.prevCameraChunk.equals(currentChunk)) return;

    this.prevCameraChunk = currentChunk.clone();

    const chunksToDispose = this.world.findChunksOutOfRadius(currentChunk, this.Config.renderDistance);
    if (chunksToDispose.length > 0) {
        this.threadReceiver.postMessage({
          command: 'chunkDispose',
          data: {
            chunkPos: chunksToDispose.map(chunk => chunk.ChunkPos.toArray())
          }
        }, true);
    }

    for (const chunk of chunksToDispose) {
      this.world.disposeChunkAt(chunk.ChunkPos);
    }


    const renderDistance = this.config.renderDistance;

    const chunkPromises: Promise<Chunk>[] = [];

    for (const chunkPos of this.world.getSortedChunkPositions(currentChunk, renderDistance)) {
      if (chunkPos.distanceTo(currentChunk) < renderDistance) {
        const chunk = this.world.getChunkAt(chunkPos);
        if (!chunk) {
          const chunkPromise = this.world.generateChunkAt(chunkPos, this.Config.worldGenerator);
          chunkPromises.push(chunkPromise);  
        }
      }
    }
    // yeah this simple console log causes a huge memory leak that causes the engine to crash after just a few seconds of chunk loading/unloading
    // if (chunkPromises.length > 0) {
    //   console.log(chunkPromises);
    // }


    for await (const chunk of chunkPromises) {
      if (chunk.ChunkPos.distanceTo(this.getCameraChunk()!) < renderDistance) {
        const posArr = chunk.ChunkPos.toArray();
        const attributes = await ChunkRenderer.generateAttributesForTransparencyPasses(chunk);
        
        this.threadReceiver.postMessage({
          command: 'chunkRender',
          data: {
            chunkPos: posArr,
            attributes,
          }
        }, true);
      } else {
        this.world.disposeChunkAt(chunk.ChunkPos);
      }
    }

  }

}