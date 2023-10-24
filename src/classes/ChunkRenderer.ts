import { DoubleSide, BufferAttribute, BufferGeometry, InstancedBufferGeometry, InstancedMesh, Mesh, MeshLambertMaterial, Object3D, PlaneGeometry, ShaderMaterial, Vector3, InstancedBufferAttribute } from "three";
import Chunk from "./Chunk.ts";
import vertex from '../shader/vertex.glsl?raw';
import fragment from '../shader/fragment.glsl?raw';
import World from "./World.ts";


export default class ChunkRenderer {
  private mesh: Mesh | undefined;
  private isDisposed: boolean = false;

  constructor(
    private readonly chunk: Chunk,
    private readonly scene: THREE.Scene,
    private readonly chunkPosition: THREE.Vector3,
    private readonly chunkSize: number,
    private readonly world: World,
  ) {}

  public get Chunk(): Chunk {
    return this.chunk;
  }

  public get Position(): THREE.Vector3 {
    return this.chunkPosition;
  }

  private async updateMesh(): Promise<Mesh | undefined> {
    const geometry = new InstancedBufferGeometry();
    
    const vertices = new Float32Array([
      -1.0, -1.0,  1.0, // v0
       1.0, -1.0,  1.0, // v1
       1.0,  1.0,  1.0, // v2
    
       1.0,  1.0,  1.0, // v3
      -1.0,  1.0,  1.0, // v4
      -1.0, -1.0,  1.0  // v5
    ]);

    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('meshPosition', new BufferAttribute(new Float32Array([
      this.chunkPosition.x * this.chunkSize,
      this.Position.y,
      this.chunkPosition.z * this.chunkSize,
    ]), 3))

    // const material = new MeshLambertMaterial({});
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        
      },
      depthWrite: false,
      transparent: true,
      // side: DoubleSide,
    })

    const {chunk} = this;

    const {voxels, facesCount} = await chunk.getRenderableVoxels();
    
    if (this.isDisposed) {
      this.remove();
      return;
    };
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.disposeMesh();
    }
    const count = voxels.length;


    this.mesh = new Mesh(geometry, material);
    const mesh = this.mesh;

    const elements = new Float32Array(facesCount * 16 * 6);

    const object = new Object3D();
    let voxelPosition = new Vector3();
    let elementIndex = 0;
    for (let i = 0; i < count; i++) {
      const renderableVoxel = voxels[i];
      const {PosInChunk} = renderableVoxel;
      const positionMultiplier = 1;
      voxelPosition = voxelPosition.copy(PosInChunk).multiplyScalar(positionMultiplier);
      let faceIndex = 0;
      for (let face of renderableVoxel.RenderableFaces) {
        object.rotation.set(0, 0, 0);
        object.position.set(
          voxelPosition.x + 0.5, 
          voxelPosition.y + 0.5, 
          voxelPosition.z + 0.5,
        );
        const facePos = face.clone().multiplyScalar(.5);
        object.position.x += (facePos.x);
        object.position.y += (facePos.y);
        object.position.z += (facePos.z);
        
        if (face.y !== 0) object.rotateX(-face.y * Math.PI / 2);
        if (face.x !== 0) object.rotateY(face.x * Math.PI / 2);
        if (face.z === -1) {
          
          object.rotateY(Math.PI);
        }

        object.updateMatrix();
  
        // mesh.setMatrixAt(faceIndex, object.matrix);
        // mesh.setColorAt(faceIndex, renderableVoxel.Voxel.Color);
        const matArray = [
          ...object.matrix
            .toArray()
            .values()
        ];

        // debugger
        for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
          for (let itemIndex = 0; itemIndex < matArray.length; itemIndex++) {
            elements[elementIndex] = matArray[itemIndex];
            elementIndex++;
          }
        }
        
        faceIndex++;
      }
    }
    
    geometry.setAttribute('instanceMatrix', new InstancedBufferAttribute(elements, 16));

    mesh.position.set(
      this.chunkPosition.x * this.chunkSize, 
      this.chunkPosition.y, 
      this.chunkPosition.z * this.chunkSize
    );
    // mesh.instanceColor!.needsUpdate = true;

    
    return mesh;
  }

  public async init(isUpdate: boolean = false): Promise<void> {
    if (isUpdate === false) {
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(0, 0, 1)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(0, 0, -1)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(1, 0, 0)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(-1, 0, 0)));
    }
    await this.updateMesh();
    if (this.mesh) {
      this.scene.add(this.mesh);
    }
  }

  public async update(): Promise<void> {
    await this.init(true);
  }

  private disposeMesh(): void {
    this.mesh!.geometry.dispose();

    const materials = this.mesh!.material;
    if (materials instanceof Array) {
      materials.forEach(material => material.dispose());
    } else {
      materials.dispose();
    }
    this.mesh!;
    delete this.mesh;
  }

  public remove(): void {
    this.isDisposed = true;
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.disposeMesh();
    }
  }
}