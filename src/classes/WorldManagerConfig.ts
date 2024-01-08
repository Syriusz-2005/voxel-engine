import WorldGenerator from "../generator/WorldGenerator";
import { ConfigSettings } from "./Config";

export type WorldManagerConfig = {
  renderDistance: number;
  worldGenerator: WorldGenerator;
  chunkSize: number;
  chunkHeight: number;
  view: ConfigSettings['VIEW'];
}