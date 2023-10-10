import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, Object3D } from "three";
import Chunk from "./Chunk.ts";


export default class ChunkRenderer {
  private mesh: InstancedMesh | undefined;

  constructor(
    private readonly chunk: Chunk,
    private readonly scene: THREE.Scene,
  ) {}

  public get Chunk(): Chunk {
    return this.chunk;
  }

  public updateMesh(): InstancedMesh {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshLambertMaterial();

    const {chunk} = this;

    const voxels = chunk.getRenderableVoxels();
    const count = voxels.length;

    const mesh = new InstancedMesh(geometry, material, count);
    console.log('rendering voxels: ', voxels);

    const object = new Object3D();
    for (let i = 0; i < count; i++) {
      const renderableVoxel = voxels[i];
      const {PosInChunk} = renderableVoxel;
      object.position.set(PosInChunk.x, PosInChunk.y, PosInChunk.z);

      object.updateMatrix();

      mesh.setMatrixAt(i, object.matrix);
      mesh.setColorAt(i, renderableVoxel.Voxel.Color);
    }

    mesh.instanceColor!.needsUpdate = true;

    this.mesh = mesh;

    return mesh;
  }

  private init(): void {
    this.updateMesh();
    this.scene.add(this.mesh!); 
  }

  public update(): void {
    this.remove();
    this.init();
  }

  public remove(): void {
    if (!this.mesh) return;
    this.mesh.dispose();
    this.scene.remove(this.mesh);
  }
}