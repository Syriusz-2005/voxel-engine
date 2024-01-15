import WorldGenerator from "../generator/WorldGenerator.js";
import { ConfigSettings } from "./Config.js";

export type WorldManagerConfig = {
  renderDistance: number;
  worldGenerator: WorldGenerator;
  chunkSize: number;
  chunkHeight: number;
  view: ConfigSettings['VIEW'];
}