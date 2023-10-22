import WorldGenerator from "./WorldGenerator.ts";
import { Generator } from "./WorldGenerator.ts";

export default class RandomFlatWorldGenerator extends Generator implements WorldGenerator {

  constructor() {
    super(new URL('../workers/RandomFlatWorldGeneratorWorker.ts', import.meta.url), 1);
  }

  
}