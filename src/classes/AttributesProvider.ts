import { InstancedBufferGeometry } from "three";
import WorkerPool from "../utils/WorkerPool.ts";
import ChunkRenderer from "./ChunkRenderer.ts";



export default class AttributesProvider {
  private workerPool = new WorkerPool(new URL('../workers/WorkerVoxelAttributesProvider', import.meta.url), 1);
  
  constructor(
    private readonly chunkRenderer: ChunkRenderer,
  ) {}

  public async setAttributes(geometry: InstancedBufferGeometry) {
    
  }
}