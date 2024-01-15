import { ConfigSettings } from "../classes/Config.js";
import { WorldManagerConfig } from "../classes/WorldManagerConfig.js";



export type WorldDataProvider = {
  onTick(callback: (tickIndex: number) => void): void;
  onChunkUpdate(callback: () => void): void;
  getWorldConfig(): WorldManagerConfig;
}