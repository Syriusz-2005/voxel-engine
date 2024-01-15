import { WorldDataProvider } from "../types/WorldDataProvider.js";
import { WorldManagerConfig } from "./WorldManagerConfig.js";



export default class WorldNetworkClient implements WorldDataProvider {
  public getWorldConfig(): WorldManagerConfig {
    throw new Error("Method not implemented.");
  }
  public onChunkUpdate(callback: () => void): void {
      
  }
  public onTick(callback: (tickIndex: number) => void): void {
      
  }
}