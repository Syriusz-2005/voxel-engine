import { EventDispatcher, Vector3 } from "three";
import { WorldManagerConfig } from "../classes/WorldManagerConfig";
import ThreadedScene from "../classes/ThreadedScene";
import ThreadReceiver from "../utils/ThreadReceiver";
import { WorldControllerMessage } from "../classes/WorldController";
import Chunk from "../classes/Chunk";
import ChunkRenderer from "../classes/ChunkRenderer";
import PluginLoader from "../classes/PluginLoader";
import EntityList from "./EntityList";




export default class ThreadedSceneManager extends EventDispatcher<{'chunkUpdate': {chunkPos: Vector3}}> {
  private visibilityPoint: Vector3 | undefined;
  private readonly chunkSize: number;
  private readonly chunkHeight: number;
  private readonly world: ThreadedScene;
  private readonly entities = new EntityList([]);
  private prevCameraChunk: Vector3 | undefined;
  
  constructor(
    private readonly config: WorldManagerConfig,
    private readonly threadReceiver: ThreadReceiver<WorldControllerMessage>,
  ) {
    super();
    this.chunkSize = config.chunkSize;
    this.chunkHeight = config.chunkHeight;
    this.world = new ThreadedScene(this, this.chunkSize, this.chunkHeight);
    console.log(this)
  }

  public get Config(): WorldManagerConfig {
    return this.config;
  }

  public new(config: WorldManagerConfig): ThreadedSceneManager {
    return new ThreadedSceneManager(config, this.threadReceiver);
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

  public processTick(visibilityPoint: Vector3) {
    this.VisibilityPoint = visibilityPoint;

    this.updateWorld();
  }

  public moveCamera(newPos: Vector3) {
    const players = this.entities.getPlayers();
    this.threadReceiver.postMessage(players, {
      command: 'cameraMove',
      data: {
        cameraPos: newPos.toArray(),
      }
    }, true);
    this.VisibilityPoint = newPos;
  }

  private async updateWorld() {
    const currentChunk = this.getCameraChunk();
    if (!currentChunk) return;

    if (this.prevCameraChunk && this.prevCameraChunk.equals(currentChunk)) return;

    this.prevCameraChunk = currentChunk.clone();
    const players = this.entities.getPlayers();

    const chunksToDispose = this.world.findChunksOutOfRadius(currentChunk, this.Config.renderDistance);
    if (chunksToDispose.length > 0) {
        this.threadReceiver.postMessage(players, {
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

    for await (const chunk of chunkPromises) {
      if (chunk.ChunkPos.distanceTo(this.getCameraChunk()!) < renderDistance) {
        const posArr = chunk.ChunkPos.toArray();
        const attributes = await ChunkRenderer.generateAttributesForTransparencyPasses(chunk);
        
        this.threadReceiver.postMessage(players, {
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