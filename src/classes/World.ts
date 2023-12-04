import { Scene, Vector3 } from "three";
import ChunkRenderer from "./ChunkRenderer.ts";
import Representation, { VectorRepresentation } from "./VectorRepresentation.ts";
import WorldManager from "./WorldManager.ts";
import CoordTransformations from "../utils/CoordTransformations.ts";
import WorldController from "./WorldController.ts";
import Attribute from "../types/Attribute.ts";



export default class World {
  private renderers: Map<VectorRepresentation, ChunkRenderer> = new Map();

  public get Renderers(): Map<VectorRepresentation, ChunkRenderer> {
    return this.renderers;
  }

  private readonly chunkDimensions: Vector3;
  public readonly transformations: CoordTransformations;

  constructor(
    private readonly chunkSize: number,
    private readonly chunkHeight: number,
    private readonly scene: Scene,  
    private readonly manager: WorldManager | WorldController,
  ) {
    this.chunkDimensions = new Vector3(chunkSize, chunkHeight, chunkSize);
    this.transformations = new CoordTransformations(this.chunkDimensions);
  }

  private setChunkAt(vec: Vector3): ChunkRenderer {
    const newRenderer = new ChunkRenderer(
      this.scene, 
      vec, 
      this.chunkSize, 
      this, 
      this.manager.Config.view, 
      vec.multiply(this.transformations.TVector),
    );
    this.renderers.set(
      Representation.toRepresentation(vec), 
      newRenderer,
    );
    return newRenderer;
  }


  public allocateChunkRenderer(chunkPos: Vector3) {
    const renderer = this.setChunkAt(chunkPos);
    return renderer;
  }

  public disposeChunkAt(vec: Vector3): void {
    const representation = Representation.toRepresentation(vec);
    const renderer = this.renderers.get(representation);
    if (!renderer) return;

    renderer.remove();
    this.renderers.delete(representation);
  }

  public findChunksInRadius(center: Vector3, radius: number): ChunkRenderer[] {
    const renderers: ChunkRenderer[] = [];
    this.renderers.forEach((renderer, vecRepresentation) => {
      const vec = Representation.fromRepresentation(vecRepresentation);
      const distance = center.distanceTo(vec);
      if (distance < radius) {
        renderers.push(renderer);
      }
    });
    return renderers;
  }

  public findChunksOutOfRadius(center: Vector3, radius: number) {
    const renderers: ChunkRenderer[] = [];
    this.renderers.forEach((renderer, vecRepresentation) => {
      const vec = Representation.fromRepresentation(vecRepresentation);
      const distance = center.distanceTo(vec);
      if (distance > radius) {
        renderers.push(renderer);
      }
    });
    return renderers;
  }


  public renderChunkWithAttributes(chunkPos: Vector3, passes: Attribute[][]) {
    let renderer = this.renderers.get(Representation.toRepresentation(chunkPos));
    if (!renderer) renderer = this.allocateChunkRenderer(chunkPos);

    renderer.update(passes);
  }
}