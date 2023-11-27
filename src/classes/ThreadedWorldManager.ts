import { Vector3 } from "three";
import WorldManager, { WorldManagerConfig } from "./WorldManager.ts";




export default class ThreadedWorldManager {
  private visibilityPoint: Vector3 | undefined;
  private frameIndex = 0;
  private readonly chunkSize: number;
  private readonly chunkHeight: number;
  
  constructor(
    private readonly config: WorldManagerConfig,
  ) {
    this.chunkSize = config.chunkSize;
    this.chunkHeight = config.chunkHeight;
  }

  public get Config(): WorldManagerConfig {
    return this.config;
  }

  public new(config: WorldManagerConfig): ThreadedWorldManager {
    return new ThreadedWorldManager(config);
  }

  public set VisibilityPoint(pos: Vector3) {
    this.visibilityPoint = pos.clone();
  }

  private getCameraChunk() {
    if (!this.visibilityPoint) return;
    return this.visibilityPoint
      .clone()
      .divideScalar(this.chunkSize)
      .floor();
  }

  public updateWorld() {

  }

}