import { InstancedMesh, MeshLambertMaterial, Object3D, PlaneGeometry } from "three";
import Chunk from "./Chunk.ts";


export default class ChunkRenderer {
  private mesh: InstancedMesh | undefined;
  private isDisposed: boolean = false;

  constructor(
    private readonly chunk: Chunk,
    private readonly scene: THREE.Scene,
    private readonly chunkPosition: THREE.Vector3,
    private readonly chunkSize: number,
  ) {}

  public get Chunk(): Chunk {
    return this.chunk;
  }

  public get Position(): THREE.Vector3 {
    return this.chunkPosition;
  }

  private async updateMesh(): Promise<InstancedMesh> {
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshLambertMaterial({});

    const {chunk} = this;

    const {voxels, facesCount} = await chunk.getRenderableVoxels();
    if (this.isDisposed) return this.mesh!;
    const count = voxels.length;

    const mesh = new InstancedMesh(geometry, material, facesCount);

    const object = new Object3D();
    let faceIndex = 0;
    for (let i = 0; i < count; i++) {
      const renderableVoxel = voxels[i];
      const {PosInChunk} = renderableVoxel;
      const positionMultiplier = 1;
      const voxelPosition = PosInChunk.clone().multiplyScalar(positionMultiplier);
      for (let face of renderableVoxel.RenderableFaces) {
        object.rotation.set(0, 0, 0);
        object.position.set(
          voxelPosition.x + 0.5, 
          voxelPosition.y + 0.5, 
          voxelPosition.z + 0.5,
        );
        const facePos = face.clone().multiplyScalar(.5);
        object.translateX(facePos.x);
        object.translateY(facePos.y);
        object.translateZ(facePos.z);

        if (face.y !== 0) object.rotateX(-face.y * Math.PI / 2);
        if (face.x !== 0) object.rotateY(face.x * Math.PI / 2);
        if (face.z === -1) object.rotateY(Math.PI);

        object.updateMatrix();
  
        mesh.setMatrixAt(faceIndex, object.matrix);
        mesh.setColorAt(faceIndex, renderableVoxel.Voxel.Color);

        faceIndex++;
      }
    }

    mesh.position.set(this.chunkPosition.x * this.chunkSize, this.chunkPosition.y, this.chunkPosition.z * this.chunkSize);
    mesh.instanceColor!.needsUpdate = true;

    this.mesh = mesh;

    return mesh;
  }

  private async init(): Promise<void> {
    this.isDisposed = false;
    await this.updateMesh();
    if (!this.mesh) return;
    this.scene.add(this.mesh!); 
  }

  public async update(): Promise<void> {
    this.remove();
    await this.init();
  }

  public remove(): void {
    this.isDisposed = true;
    if (!this.mesh) return;
    this.mesh.dispose();
    this.scene.remove(this.mesh);
  }
}