import { BufferAttribute, InstancedBufferGeometry, Mesh, Object3D, ShaderMaterial, Vector3, InstancedBufferAttribute, Matrix4, FrontSide, Box3, Camera, Frustum } from "three";
import Chunk from "./Chunk.js";
import vertex from '../shader/vertex.glsl?raw';
import fragment from '../shader/fragment.glsl?raw';
import WorldScene from "./WorldScene.js";
import { ConfigSettings } from "./Config.js";
import Attribute from "../types/Attribute.js";


export default class ChunkRenderer {
  private meshes: Mesh[] = [];
  private isDisposed: boolean = false;
  public statFacesCount: number = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly chunkPosition: THREE.Vector3,
    private readonly chunkSize: number,
    private readonly world: WorldScene,
    private readonly view: ConfigSettings['VIEW'],
    private readonly worldPosition: Vector3,
  ) {}

  public get Position(): THREE.Vector3 {
    return this.chunkPosition;
  }

  public get Meshes(): Mesh[] {
    return this.meshes;
  }


  private setBufferAttributes(geometry: InstancedBufferGeometry) {
    const vertices = new Float32Array([
      -0.5, -0.5,  0.5, // v0
      0.5, -0.5,  0.5, // v1
      0.5,  0.5,  0.5, // v2
    
      0.5,  0.5,  0.5, // v3
      -0.5,  0.5,  0.5, // v4
      -0.5, -0.5,  0.5  // v5
    ]);

    const chunkWorldPos = this.worldPosition;
    
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('meshPosition', new BufferAttribute(new Float32Array([
      chunkWorldPos.x,
      chunkWorldPos.y,
      chunkWorldPos.z,
    ]), 3));
  }

  private getMaterial(isOpaque: boolean, view: ConfigSettings['VIEW']) {
    return new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        'chunkWorldPosition': {
          value: this.worldPosition,
        },
        'frame': {
          value: 0,
        },
      },
      depthWrite: isOpaque,
      depthTest: true,
      transparent: !isOpaque,
      side: FrontSide,
      wireframe: view === 'wireframe',
    }); 
  }

  private createMesh(geometry: InstancedBufferGeometry, material: ShaderMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.position.copy(this.worldPosition);
    this.meshes.push(mesh);
    return mesh;
  }

  private updateMeshes(passes: Attribute[][]): void {
  
    if (this.isDisposed) {
      this.remove();
      return;
    }

    this.disposeMeshes();

    for (let passIndex = 0; passIndex < passes.length; passIndex++) {
      const geometry = new InstancedBufferGeometry();
      const isOpaque = passIndex === 0;
      const material = this.getMaterial(isOpaque, this.view);
      const mesh = this.createMesh(geometry, material);

      const attributes = passes[passIndex];

      this.setBufferAttributes(geometry);

      for (const {name, arr, itemSize} of attributes) {
        geometry.setAttribute(name, new InstancedBufferAttribute(arr, itemSize));
      }

      mesh.frustumCulled = false;
    }

  }

  private addMeshes() {
    for (const mesh of this.meshes) {
      this.scene.add(mesh);
    }
  }

  public init(passes: Attribute[][]): void {
    this.updateMeshes(passes);
    this.addMeshes();
  }

  public update(passes: Attribute[][]): void {
    this.init(passes);
  }

  private get ChunkBox(): Box3 {
    return new Box3(
      this.worldPosition,
      this.world.transformations.TVector,
    );
  }


  public onMeshesRender(camera: Camera): boolean {
    const frustum = new Frustum();
    frustum.setFromProjectionMatrix(
      new Matrix4()
        .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    );

    
    const isIntersecting = frustum.intersectsBox(this.ChunkBox);

    this.meshes.forEach(mesh => {
      mesh.visible = isIntersecting;
    });

    return isIntersecting;
  }

  private disposeMeshes(): void {
    for (const mesh of this.meshes) {
      mesh!.geometry.dispose();
      this.scene.remove(mesh);
      
      const materials = mesh!.material;
      if (materials instanceof Array) {
        materials.forEach(material => material.dispose());
      } else {
        materials.dispose();
      }
    }
    this.meshes = [];
  }

  public remove(): void {
    this.isDisposed = true;
    this.disposeMeshes();
  }
}