import { Vector3 } from "three";
import Chunk, { GreededTransparencyPass } from "./Chunk.ts";
import RenderableFace from "./RenderableFace.ts";



export default class GreededTransparencyPassManager implements GreededTransparencyPass {
  public faces: RenderableFace[] = [];
  
  
  public get facesCount(): number {
    return this.faces.length;
  }

  private pushFace(face: RenderableFace): number {
    const index = this.faces.push(face) - 1;

    return index;
  }

  private getFace(index: number): RenderableFace {
    return this.faces[index];
  }

  public createFaces(chunk: Chunk) {
    const adjacents = Chunk.PRECOMPILED_ADJACENTS;

    for (let x = 0; x < chunk.ChunkDimensions.x; x++) {
      for (let y = 0; y < chunk.ChunkDimensions.y; y++) {
        for (let z = 0; z < chunk.ChunkDimensions.z; z++) {
          const currVoxel = chunk.getVoxelAt(new Vector3(x, y, z));
          if (currVoxel === 'air') continue;
          for (let i = 0; i < adjacents.length; i++) {
            const currFaceIndex = this.facesCount;
            const adj = adjacents[i];
            const adjVoxel = chunk.getVoxelAt(new Vector3(x + adj.x, y + adj.y, z + adj.z));
            if (adjVoxel === 'air') {
              const currFace = new RenderableFace(
                adj,
                1,
              )
              this.pushFace(currFace);
            }
            if (y < 0 || y > chunk.Height) {
              
            }
            if (z < chunk.ChunkDimensions.z - 1) {
              const nextVoxel = chunk.getVoxelAt(new Vector3(x, y, z + 1));
              if (nextVoxel === currVoxel) {
                
                z++;
              }
            }
          }
        
        }
      }
    }
  }
}