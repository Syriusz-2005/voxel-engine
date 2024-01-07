import { Vector3 } from "three";
import Config, { ConfigSettings } from "../classes/Config.ts";
import PluginLoader from "../classes/PluginLoader.ts";
import ThreadedSceneManager from "./ThreadedSceneManager.ts";
import { WorldDataProvider } from "../types/WorldDataProvider.ts";
import NetworkManager from "./NetworkManager.ts";
import TickingService from "./TickingService.ts";



export default class World implements WorldDataProvider {
  private readonly pluginLoader: PluginLoader = new PluginLoader(this);
  private readonly tickingService = new TickingService(20);
  private readonly networkManager = new NetworkManager((message) => {
    console.log(message);
  });
  private readonly scene: ThreadedSceneManager;


  constructor(
    private readonly config: Config,
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