import { InstancedBufferGeometry } from "three";
import WorkerPool from "../utils/WorkerPool.js";
import ChunkRenderer from "./ChunkRenderer.js";



export default class AttributesProvider {
  private workerPool = new WorkerPool(new URL('../workers/WorkerVoxelAttributesProvider', import.meta.url), 1);
  
  constructor(
    private readonly chunkRenderer: ChunkRenderer,
  ) {}

  public async setAttributes(geometry: InstancedBufferGeometry) {
    
  }
}