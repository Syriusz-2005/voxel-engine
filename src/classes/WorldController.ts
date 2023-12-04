import { Scene, TypedArray, Vector3 } from "three";
import ThreadController from "../utils/ThreadController.ts";
import WorldManager, { WorldManagerConfig } from "./WorldManager.ts";
import Attribute from "../types/Attribute.ts";
import Config from "./Config.ts";
import World from "./World.ts";
import WorldGenerator from "../generator/WorldGenerator.ts";
import RandomFlatWorldGenerator from "../generator/RandomFlatWorldGenerator.ts";

export type NextFrameMessage = {
  command: 'nextFrame';
  data: {
    frameIndex: number;
    cameraPos: [number, number, number];
  }
}

export type ConfigUpdateMessage = {
  command: 'configUpdate';
  data: Omit<WorldManagerConfig, 'worldGenerator'>;
}

export type ChunkAllocateMessage = {
  command: 'chunkCreate';
  data: {
    chunkPos: [number, number, number];
  }
}

export type ChunkRenderMessage = {
  command: 'chunkRender';
  data: {
    chunkPos: [number, number, number];
    attributes: Attribute[][];
  }
}

export type ChunksDisposeMessage = {
  command: 'chunkDispose';
  data: {
    chunkPos: [number, number, number][];
  }
}

export type WorldControllerMessage = 
  NextFrameMessage 
  | ConfigUpdateMessage 
  | ChunkRenderMessage 
  | ChunksDisposeMessage 
  | ChunkAllocateMessage;

export default class WorldController {
  private readonly worldControllerThread = new ThreadController<WorldControllerMessage>(
    new URL('../workers/WorldControllerThread.ts', import.meta.url),
    (message) => {
      console.log(message);
      switch (message.command) {
        case 'chunkDispose':
          this.disposeChunks(message);
        break;

        case 'chunkCreate':
          this.allocateChunk(message);
        break;

        case 'chunkRender':
          this.renderChunk(message);
        break;
      }
    }
  );
  private readonly world: World;

  private renderChunk(msg: ChunkRenderMessage) {
    const chunkPos = new Vector3(...msg.data.chunkPos);
    this.world.renderChunkWithAttributes(chunkPos, msg.data.attributes);
  }

  private allocateChunk(msg: ChunkAllocateMessage) {
    const chunkPos = new Vector3(...msg.data.chunkPos);
    
    this.world.allocateChunkRenderer(chunkPos);
  }


  private disposeChunks(msg: ChunksDisposeMessage) {
    const chunkCoords = msg.data.chunkPos.map(([x, y, z]) => new Vector3(x, y, z));
    
    for (const coord of chunkCoords) {
      this.world.disposeChunkAt(coord);
    }
  
  }

  public async postNextFrame(msg: NextFrameMessage) {
    this.worldControllerThread.postMessage(msg);
  }

  public async postUpdateConfig(msg: ConfigUpdateMessage) {
    this.worldControllerThread.postMessage(msg);
  }

  private readonly generator: WorldGenerator = new RandomFlatWorldGenerator();

  constructor(
    private readonly config: Config,
    private readonly scene: Scene,
    private readonly chunkHeight: number,
    
    ) {
      this.world = new World(
        this.config.CHUNK_SIZE.getValue(),
        this.chunkHeight,
        this.scene,
        this,
      );
      this.worldControllerThread.postMessage({
        command: 'configUpdate',
        data: {
          chunkSize: this.Config.chunkSize,
          chunkHeight: this.chunkHeight,
          renderDistance: this.Config.renderDistance,
          view: this.Config.view,
        },
      })
  }

  /**
   * Disposes all chunk renderers and frees up the gpu resources connected with them.
   * Does not dispose the actual chunks which are stored in the worldController thread not in the main thread
   */
  public disposeRenderers()  {
    for (const [_, renderer] of this.world.Renderers) {
      renderer.remove();
    }
  }

  public get Config(): WorldManagerConfig {
    return {
      chunkSize: this.config.CHUNK_SIZE.getValue(),
      chunkHeight: this.chunkHeight,
      renderDistance: this.config.RENDER_DISTANCE.getValue(),
      view: this.config.view.getValue(),
      worldGenerator: this.generator,
    };
  }
}