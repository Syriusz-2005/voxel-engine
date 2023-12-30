import { BufferAttribute, InstancedBufferGeometry, Mesh, Object3D, ShaderMaterial, Vector3, InstancedBufferAttribute, Matrix4, FrontSide, Box3, Camera, Frustum } from "three";
import Chunk from "./Chunk.ts";
import vertex from '../shader/vertex.glsl?raw';
import fragment from '../shader/fragment.glsl?raw';
import WorldScene from "./WorldScene.ts";
import { ConfigSettings } from "./Config.ts";
import Attribute from "../types/Attribute.ts";


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

  private static getAttrArray(facesCount: number, perVertexCount: number): Float32Array {
    return new Float32Array(facesCount * 6 * perVertexCount);
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

  public static async generateAttributesForTransparencyPasses(chunk: Chunk): Promise<Attribute[][]> {
    const transparencyPasses = await chunk.getGreededTransparencyPasses();

    let matArray: number[] = [];

    const outPasses: Attribute[][] = [];

    for (let i = 0; i < transparencyPasses.length; i++) {
      const {faces} = transparencyPasses[i];
      const faceObject = new Object3D();

      const elements = this.getAttrArray(faces.length, 16);
      const faceRotations = this.getAttrArray(faces.length, 1);
      const colors = this.getAttrArray(faces.length, 4);
      const voxelId = new Uint8Array(faces.length * 6);

      outPasses.push([
        {
          name: 'faceRotation',
          arr: faceRotations,
          itemSize: 1,
        },
        {
          name: 'voxelId',
          arr: voxelId,
          itemSize: 1,
        },
        {
          name: 'voxelColor',
          arr: colors,
          itemSize: 4,
        },
        {
          name: 'instanceMatrix',
          arr: elements,
          itemSize: 16,
        },
      ]);

      let elementIndex = 0;
      let faceId = 0;
      let colorIndex = 0;
      let idIndex = 0;


      for (const {voxelPosition, faceRotation, faceZLength, voxelType} of faces) {
        faceObject.rotation.set(0, 0, 0);
        faceObject.position.set(
          voxelPosition.x + 0.5, 
          (voxelPosition.y + 0.5), 
          voxelPosition.z + 0.5,
        );
        faceObject.scale.setY(1);
        if (faceZLength > 1) {
          faceObject.position.setZ(voxelPosition.z + faceZLength / 2);
          // faceObject.scale.setZ(faceZLength);
        }
        
        if (faceRotation.y !== 0) {
          faceObject.rotateX(-faceRotation.y * Math.PI / 2);
          faceObject.scale.setY(faceZLength);
        }
        if (faceRotation.x !== 0) {
          faceObject.rotateY(faceRotation.x * Math.PI / 2);
        }
        if (faceRotation.z === -1) {
          faceObject.rotateY(Math.PI);
        }

        faceObject.updateMatrix();
        faceObject.matrix.toArray(matArray);

        /*
          bottom 0
          top 1
          left 2
          right 3
          front 4
          back 5 
        */
          const rotationId = 
          faceRotation.y === -1 ? 0
          : faceRotation.y === 1 ? 1
          : faceRotation.x === -1 ? 2
          : faceRotation.x === 1 ? 3
          : faceRotation.z === -1 ? 4
          : 5;  

        // Each face has 6 vertices
        for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
          faceRotations[faceId + vertexIndex] = rotationId;
          voxelId[idIndex++] = voxelType.Id;
          
          colors[colorIndex++] = voxelType.Color.r;
          colors[colorIndex++] = voxelType.Color.g;
          colors[colorIndex++] = voxelType.Color.b;
          colors[colorIndex++] = voxelType.Opacity;
          
          for (let itemIndex = 0; itemIndex < matArray.length; itemIndex++) {
            elements[elementIndex] = matArray[itemIndex];
            elementIndex++;
          }
        }
        
        faceId += 6;
      }

    }

    return outPasses;
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