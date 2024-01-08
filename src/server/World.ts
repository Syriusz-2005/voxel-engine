import { Vector3 } from "three";
import Config, { ConfigSettings } from "../classes/Config";
import PluginLoader from "../classes/PluginLoader";
import ThreadedSceneManager from "./ThreadedSceneManager";
import { WorldDataProvider } from "../types/WorldDataProvider";
import NetworkManager from "./NetworkManager";
import TickingService from "./TickingService";
import { PlayerProxy } from "../types/PlayerProxy";



export default class World implements WorldDataProvider {
  private readonly pluginLoader: PluginLoader = new PluginLoader(this);
  private readonly tickingService = new TickingService(20);
  private readonly scene: ThreadedSceneManager;


  constructor(
    private readonly config: Config,
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

  public getWorldConfig(): ConfigSettings {
    return this.config.settings;
  }
}