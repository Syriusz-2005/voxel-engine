import { ConfigSettings } from "../classes/Config.ts";



export type WorldDataProvider = {
  onTick(callback: (tickIndex: number) => void): void;
  onChunksUpdate(callback: () => void): void;
  getWorldConfig(): ConfigSettings;
}