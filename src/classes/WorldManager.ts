import { Camera, Material, Matrix4, Scene, ShaderMaterial, Vector3 } from "three";
import World from "./World";
import WorldGenerator from "../generator/WorldGenerator";
import { ConfigSettings } from "./Config.ts";

export type WorldManagerConfig = {
  renderDistance: number;
  worldGenerator: WorldGenerator;
  chunkSize: number;
  chunkHeight: number;
  view: ConfigSettings['VIEW'];
}

export default class WorldManager {
  private readonly world: World;
  private visibilityPoint: Vector3 | undefined;
  private frameIndex = 0;
  private readonly chunkSize: number;
  private readonly chunkHeight: number;

  constructor(
    private readonly scene: Scene,
    private readonly config: WorldManagerConfig,
  ) {
    this.chunkSize = config.chunkSize;
    this.chunkHeight = config.chunkHeight;
    this.world = new World(this.chunkSize, this.chunkHeight, this.scene, this);
    console.log(this);
  }

  public get Config(): WorldManagerConfig {
    return this.config;
  }

  public new(config: WorldManagerConfig) {
    this.destroy();
    return new WorldManager(
      this.scene,
      config,
    );
  }

  public updateVisibilityPoint(pos: Vector3) {
    this.visibilityPoint = pos.clone();
  }

  private forEachRenderer() {
    return this.world.Renderers.values(); 
  }

  private getCurrentChunk() {
    if (!this.visibilityPoint) return;
    return this.visibilityPoint
      .clone()
      .divideScalar(this.chunkSize)
      .floor();
  }

  public destroy() {
    for (const renderer of this.forEachRenderer()) {
      renderer.remove();
    }
  }

  public async updateWorld(camera: Camera): Promise<{
    visibleChunks: number; 
    chunkRenderRequests: number;
    facesCount: number;
  }> {
    let visibleChunks = 0;
    let chunkRenderRequests = 0;
    let facesCount = 0;

    if (!this.visibilityPoint) {
      return {visibleChunks, chunkRenderRequests, facesCount};
    }
    const {renderDistance, worldGenerator} = this.config;

    this.frameIndex++;
    for (const renderer of this.world.Renderers.values()) {
      const isVisible = renderer.onMeshesRender(camera);
      if (isVisible) {
        visibleChunks++;
        facesCount += renderer.statFacesCount;
      }
      for (const mesh of renderer.Meshes) {
        const material = mesh.material as ShaderMaterial;
        if (material) {
          material.uniforms['frame'].value = this.frameIndex;
        }
      }
    }

    const currentChunk = this.getCurrentChunk()!;

    const renderers = this.world.findChunksOutOfRadius(currentChunk, renderDistance);
    for (const renderer of renderers) {
      this.world.disposeChunkAt(renderer.Position);
    }

    for (let x = currentChunk.x - renderDistance; x < currentChunk.x + renderDistance; x++) {
      for (let z = currentChunk.z - renderDistance; z < currentChunk.z + renderDistance; z++) {
        const chunkPos = new Vector3(x, 0, z);
        if (chunkPos.distanceTo(currentChunk) < renderDistance) {
          const chunk = this.world.getChunkAt(chunkPos);
          if (!chunk) {
            chunkRenderRequests++;
            this.world.generateChunkAt(chunkPos, worldGenerator)
              .then(async chunkRenderer => {
                if (chunkPos.distanceTo(this.getCurrentChunk()!) < renderDistance) {
                  await chunkRenderer.init();
                } else {
                  this.world.disposeChunkAt(chunkPos);
                }
              })
          }
        }
      }
    }

    return {
      visibleChunks,
      chunkRenderRequests,
      facesCount,
    };
  } 
}