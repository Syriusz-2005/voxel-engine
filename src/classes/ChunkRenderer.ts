import { DoubleSide, BufferAttribute, BufferGeometry, InstancedBufferGeometry, InstancedMesh, Mesh, MeshLambertMaterial, Object3D, PlaneGeometry, ShaderMaterial, Vector3, InstancedBufferAttribute, Matrix4, FrontSide } from "three";
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

  private async updateMesh() {
    const vertices = new Float32Array([
      -0.5, -0.5,  0.5, // v0
      0.5, -0.5,  0.5, // v1
      0.5,  0.5,  0.5, // v2
    
      0.5,  0.5,  0.5, // v3
      -0.5,  0.5,  0.5, // v4
      -0.5, -0.5,  0.5  // v5
    ]);

    const chunkWorldPos = new Vector3(
      this.chunkPosition.x * this.chunkSize,
      this.Position.y,
      this.chunkPosition.z * this.chunkSize,
    );


    // const material = new MeshLambertMaterial({});
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        'chunkWorldPosition': {
          value: chunkWorldPos,
        },
        'cViewMatrix': {
          value: new Matrix4(),
        },
      },
      depthWrite: true,
      depthTest: true,
      transparent: true,
      // depthTest: false,
      // wireframe: true,
      // // linewidth: 8,
      // wireframeLinewidth: 24,
      side: FrontSide,
    });

    const {chunk} = this;

    const {transparencyPasses, facesCount} = await chunk.getRenderableVoxels();

    if (this.isDisposed) {
      this.remove();
      return;
    };
    this.disposeMeshes();

    for (const {voxels, facesCount} of transparencyPasses)  {
      const geometry = new InstancedBufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(vertices, 3));
      geometry.setAttribute('meshPosition', new BufferAttribute(new Float32Array([
        chunkWorldPos.x,
        chunkWorldPos.y,
        chunkWorldPos.z,
      ]), 3))

      const mesh = new Mesh(geometry, material);
      this.meshes.push(mesh);


      const count = voxels.length;
  
      const elements = this.getAttrArray(facesCount, 16);
      const faceRotations = this.getAttrArray(facesCount, 1);
      const colors = this.getAttrArray(facesCount, 4);
      const liquids = this.getAttrArray(facesCount, 1);
  
      const object = new Object3D();
      let voxelPosition = new Vector3();
      let elementIndex = 0;
      let faceId = 0;
      let colorIndex = 0;
      let isLiquidIndex = 0;
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
    
          const matArray = [
            ...object.matrix
              .toArray()
              .values()
          ];
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
  
          // debugger
          // Each face has 6 vertices
          for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
            faceRotations[faceId + vertexIndex] = rotationId;
            liquids[isLiquidIndex++] = renderableVoxel.Voxel.isLiquid ? 1 : 0;
            
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
      geometry.setAttribute('isLiquid', new InstancedBufferAttribute(liquids, 1));
  
      mesh.frustumCulled = false;
  
      mesh.position.copy(chunkWorldPos);
    }
    
  }

  private addMeshes() {
    for (const mesh of this.meshes) {
      this.scene.add(mesh);
    }
  }

  public async init(isUpdate: boolean = false): Promise<void> {
    if (isUpdate === false) {
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(0, 0, 1)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(0, 0, -1)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(1, 0, 0)));
      this.world.renderChunkAt(this.Position.clone().add(new Vector3(-1, 0, 0)));
    }
    await this.updateMesh();
    this.addMeshes();
  }

  public async update(): Promise<void> {
    await this.init(true);
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
  }

  public remove(): void {
    this.isDisposed = true;
    this.disposeMeshes();
  }
}