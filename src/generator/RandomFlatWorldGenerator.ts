import WorldGenerator from "./WorldGenerator.js";
import { Generator } from "./WorldGenerator.js";

export default class RandomFlatWorldGenerator extends Generator implements WorldGenerator {

  constructor() {
    super(new URL('../workers/RandomFlatWorldGeneratorWorker', import.meta.url), 1);
  }

  
}