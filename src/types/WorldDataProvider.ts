import { ConfigSettings } from "../classes/Config.js";



export type WorldDataProvider = {
  onTick(callback: (tickIndex: number) => void): void;
  onChunkUpdate(callback: () => void): void;
  getWorldConfig(): ConfigSettings;
}