import { Vector3 } from "three";
import Config, { ConfigSettings } from "../classes/Config.js";
import PluginLoader from "../classes/PluginLoader.js";
import ThreadedSceneManager from "./ThreadedSceneManager.js";
import { WorldDataProvider } from "../types/WorldDataProvider.js";
import NetworkManager from "./NetworkManager.js";
import TickingService from "./TickingService.js";
import { PlayerProxy } from "../types/PlayerProxy.js";
import ServerConfig from "./ServerConfig.js";
import { WorldManagerConfig } from "../classes/WorldManagerConfig.js";



export default class World implements WorldDataProvider {
  private readonly pluginLoader: PluginLoader = new PluginLoader(this);
  private readonly tickingService = new TickingService(20);
  private readonly scene: ThreadedSceneManager;


  constructor(
    private readonly config: Config | ServerConfig,
    private readonly networkManager: NetworkManager,
    private readonly proxy: PlayerProxy,
  ) {
    this.scene = new ThreadedSceneManager(config.getWorldConfig(), this.networkManager);
    this.pluginLoader.loadPlugin('vanilla');
  }

  public onTick(callback: (tickIndex: number) => void): void {
    this.tickingService.addEventListener('tick', (event) => callback(event.tickIndex));
  }

  public onChunkUpdate(callback: (chunkPos: Vector3) => void) {
    this.scene.addEventListener('chunkUpdate', (event) => callback(event.chunkPos));
  }

  public getWorldConfig(): WorldManagerConfig {
    return this.config.getWorldConfig();
  }
}