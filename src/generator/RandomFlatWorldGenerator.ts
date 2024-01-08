import WorldGenerator from "./WorldGenerator";
import { Generator } from "./WorldGenerator";

export default class RandomFlatWorldGenerator extends Generator implements WorldGenerator {

  constructor() {
    super(new URL('../workers/RandomFlatWorldGeneratorWorker', import.meta.url), 1);
  }

  
}