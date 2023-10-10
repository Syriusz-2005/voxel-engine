import { InstancedMesh, MeshLambertMaterial, Object3D, PlaneGeometry, DoubleSide, Vector3 } from "three";
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
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshLambertMaterial({});

    const {chunk} = this;

    const {voxels, facesCount} = chunk.getRenderableVoxels();
    const count = voxels.length;

    const mesh = new InstancedMesh(geometry, material, facesCount);
    console.log('Rendering voxels: ', voxels);

    const object = new Object3D();
    let faceIndex = 0;
    for (let i = 0; i < count; i++) {
      const renderableVoxel = voxels[i];
      const {PosInChunk} = renderableVoxel;
      const positionMultiplier = 2;
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

        console.log(face);
        if (face.y !== 0) object.rotateX(-face.y * Math.PI / 2);
        if (face.x !== 0) object.rotateY(face.x * Math.PI / 2);
        if (face.z === -1) object.rotateY(Math.PI);
        // if (face.z !== 0) object.rotateZ(Math.PI);


        object.updateMatrix();
  
        mesh.setMatrixAt(faceIndex, object.matrix);
        mesh.setColorAt(faceIndex, renderableVoxel.Voxel.Color);

        faceIndex++;
      }

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