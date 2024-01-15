import Config from "../classes/Config.js";
import { WorldManagerConfig } from "../classes/WorldManagerConfig.js";
import RandomFlatWorldGenerator from "../generator/RandomFlatWorldGenerator.js";


export default class ServerConfig  {
  public readonly CHUNK_SIZE = 20;
  public readonly CONTROLS = 'orbit';
  public readonly RENDER_DISTANCE = 10;
  public readonly VIEW = 'normal';

  public getWorldConfig(): WorldManagerConfig {
    return {
      chunkSize: this.CHUNK_SIZE,
      chunkHeight: 64,
      renderDistance: this.RENDER_DISTANCE,
      view: this.VIEW,
      worldGenerator: new RandomFlatWorldGenerator(),
    }
  }
}