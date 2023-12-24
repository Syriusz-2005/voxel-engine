import WorldGenerator from "../generator/WorldGenerator.ts";
import { ConfigSettings } from "./Config.ts";

export type WorldManagerConfig = {
  renderDistance: number;
  worldGenerator: WorldGenerator;
  chunkSize: number;
  chunkHeight: number;
  view: ConfigSettings['VIEW'];
}