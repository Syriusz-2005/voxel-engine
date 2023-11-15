import { DoubleSide, BufferAttribute, BufferGeometry, InstancedBufferGeometry, InstancedMesh, Mesh, MeshLambertMaterial, Object3D, PlaneGeometry, ShaderMaterial, Vector3, InstancedBufferAttribute, Matrix4, FrontSide, Box3, Camera, Frustum } from "three";
import Chunk from "./Chunk.ts";
import vertex from '../shader/vertex.glsl?raw';
import fragment from '../shader/fragment.glsl?raw';
import World from "./World.ts";


export default class ChunkRenderer {
  private meshes: Mesh[] = [];
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

  public get Meshes(): Mesh[] {
    return this.meshes;
  }

  private getAttrArray(facesCount: number, perVertexCount: number): Float32Array {
    return new Float32Array(facesCount * 6 * perVertexCount);
  }

  private setAttributes(geometry: InstancedBufferGeometry) {
    const vertices = new Float32Array([
      -0.5, -0.5,  0.5, // v0
      0.5, -0.5,  0.5, // v1
      0.5,  0.5,  0.5, // v2
    
      0.5,  0.5,  0.5, // v3
      -0.5,  0.5,  0.5, // v4
      -0.5, -0.5,  0.5  // v5
    ]);

    const chunkWorldPos = this.Chunk.WorldPos;
    
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('meshPosition', new BufferAttribute(new Float32Array([
      chunkWorldPos.x,
      chunkWorldPos.y,
      chunkWorldPos.z,
    ]), 3));
  }

  private getMaterial(isOpaque: boolean) {
    return new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        'chunkWorldPosition': {
          value: this.Chunk.WorldPos,
        },
        'frame': {
          value: 0,
        },
      },
      depthWrite: isOpaque,
      depthTest: true,
      transparent: !isOpaque,
      side: FrontSide,
    }); 
  }

  public getMesh(geometry: InstancedBufferGeometry, material: ShaderMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.position.copy(this.Chunk.WorldPos);
    this.meshes.push(mesh);
    return mesh;
  }

  public async updateGreededMesh() {
    const transparencyPasses = await this.chunk.getGreededTransparencyPasses();
  
    if (this.isDisposed) {
      this.remove();
      return;
    };

    this.disposeMeshes();

    let index = 0;
    for (const {faces} of transparencyPasses) {
      const geometry = new InstancedBufferGeometry();
      this.setAttributes(geometry);

      const isOpaque = index++ === 0;

      const material = this.getMaterial(isOpaque);
      const mesh = this.getMesh(geometry, material);

      for (const face of faces) {
        
      }
    }
  }

  private async updateMesh() {
    

    const chunkWorldPos = this.Chunk.WorldPos;


    // const material = new MeshLambertMaterial({});
    

    const {chunk} = this;

    const {transparencyPasses, facesCount} = await chunk.getRenderableVoxels();

    if (this.isDisposed) {
      this.remove();
      return;
    };
    this.disposeMeshes();

    let index = 0;
    let matArray: number[] = [];
    for (const {voxels, facesCount} of transparencyPasses)  {
      const geometry = new InstancedBufferGeometry();
      
      this.setAttributes(geometry);

      const isOpaque = index++ === 0;

      const material = this.getMaterial(isOpaque);

      const mesh = this.getMesh(geometry, material);


      const count = voxels.length;
  
      const elements = this.getAttrArray(facesCount, 16);
      const faceRotations = this.getAttrArray(facesCount, 1);
      const colors = this.getAttrArray(facesCount, 4);
      const voxelId = new Uint8Array(facesCount * 6);
  
      const object = new Object3D();
      let voxelPosition = new Vector3();
      let elementIndex = 0;
      let faceId = 0;
      let colorIndex = 0;
      let idIndex = 0;
      for (let i = 0; i < count; i++) {
        const renderableVoxel = voxels[i];
        const {PosInChunk} = renderableVoxel;
        voxelPosition = voxelPosition.copy(PosInChunk);
        let localFaceIndex = 0;
        for (let face of renderableVoxel.RenderableFaces) {
          object.rotation.set(0, 0, 0);
          object.position.set(
            voxelPosition.x + 0.5, 
            (voxelPosition.y + 0.5), 
            voxelPosition.z + 0.5,
          );
          object.scale.set(1, 1, 1);
          
          if (face.y !== 0) object.rotateX(-face.y * Math.PI / 2);
          if (face.x !== 0) object.rotateY(face.x * Math.PI / 2);
          if (face.z === -1) object.rotateY(Math.PI);
  
          object.updateMatrix();
    
          object.matrix.toArray(matArray);

          /*
            bottom 0
            top 1
            left 2
            right 3
            front 4
            back 5 
          */
          const rotationId = 
            face.y === -1 ? 0
            : face.y === 1 ? 1
            : face.x === -1 ? 2
            : face.x === 1 ? 3
            : face.z === -1 ? 4
            : 5;  
  
          // Each face has 6 vertices
          for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
            faceRotations[faceId + vertexIndex] = rotationId;
            voxelId[idIndex++] = renderableVoxel.Voxel.Id;
            
            colors[colorIndex++] = renderableVoxel.Voxel.Color.r;
            colors[colorIndex++] = renderableVoxel.Voxel.Color.g;
            colors[colorIndex++] = renderableVoxel.Voxel.Color.b;
            colors[colorIndex++] = renderableVoxel.Voxel.Opacity;
            
            for (let itemIndex = 0; itemIndex < matArray.length; itemIndex++) {
              elements[elementIndex] = matArray[itemIndex];
              elementIndex++;
            }
          }
          
          faceId += 6;
          localFaceIndex++;
        }
      }
      
      geometry.setAttribute('instanceMatrix', new InstancedBufferAttribute(elements, 16));
      geometry.setAttribute('faceRotation', new InstancedBufferAttribute(faceRotations, 1));
      geometry.setAttribute('voxelColor', new InstancedBufferAttribute(colors, 4));
      geometry.setAttribute('voxelId', new InstancedBufferAttribute(voxelId, 1));
    }
    
  }

  private addMeshes() {
    for (const mesh of this.meshes) {
      this.scene.add(mesh);
    }
  }

  public async init(): Promise<void> {
    await this.updateMesh();
    this.addMeshes();
  }

  public async update(): Promise<void> {
    await this.init();
  }

  private get ChunkBox(): Box3 {
    return new Box3(
      this.chunk.WorldPos,
      this.chunk.WorldPos.clone().add(this.chunk.ChunkDimensions),
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