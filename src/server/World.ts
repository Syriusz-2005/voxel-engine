import { ConfigSettings } from "../classes/Config.ts";
import PluginLoader from "../classes/PluginLoader.ts";
import { WorldDataProvider } from "../types/WorldDataProvider.ts";



export default class World implements WorldDataProvider {
  private readonly pluginLoader: PluginLoader = new PluginLoader(this);
  private readonly tickingService: any;

  constructor(
    private readonly settings: ConfigSettings,
  ) {
    this.pluginLoader.loadPlugin('vanilla');
  }

  public onTick(callback: (tickIndex: number) => void): void {
    
  }

  public onChunksUpdate(callback: () => void) {

  }

  public getWorldConfig(): ConfigSettings {
    return this.settings;
  }
}