import { Vector3 } from "three";
import Chunk, { GreededTransparencyPass } from "./Chunk.ts";
import RenderableFace from "./RenderableFace.ts";
import Voxel from "./Voxel.ts";
import { registry } from "../types/VoxelRegistry.ts";



export default class GreededTransparencyPassesManager {  
  public passes: Map<number, GreededTransparencyPass> = registry.getGreededTransparencyPasses();

  private pushFace(passIndex: number, face: RenderableFace) {
    this.passes
      .get(passIndex)
      ?.faces.push(face);
  }

  public createFaces(chunk: Chunk) {
    const ADJACENT_DIRECTIONS = Chunk.PRECOMPILED_ADJACENTS;
    const chunkWorldPos = chunk.WorldPos;

    const adjacents = Chunk.ADJACENTS_POOL;

    const passes = this.passes;


    for (let x = 0; x < chunk.ChunkDimensions.x; x++) {
      for (let y = 0; y < chunk.ChunkDimensions.y; y++) {
        for (let z = 0; z < chunk.ChunkDimensions.z; z++) {
          const voxelPos = new Vector3(x, y, z);;
          const currVoxel = chunk.getVoxelAt(voxelPos);
          if (currVoxel === 'air') continue;

          const currVoxelType = new Voxel(currVoxel);
          const passIndex = currVoxelType.Opacity > 0 && currVoxelType.Opacity < 1 ? currVoxelType.Id : 0;

          for (let i = 0; i < adjacents.length; i++) {
            const adj = adjacents[i];
            adj.copy(voxelPos);
            adj.add(ADJACENT_DIRECTIONS[i]);

            let adjVoxel: Voxel | undefined;
            const currFace = new RenderableFace(
              adj,
              1,
            );
            
            if (x < 0 || z < 0 || x >= chunk.Size || z >= chunk.Size) {
              adjVoxel = chunk.World.getVoxelAt(
                chunkWorldPos
                  .clone()
                  .add(adj)
              );
            }

            if (!adjVoxel) {
              adjVoxel = new Voxel(chunk.getVoxelAt(adj));
            }

            if (
              y < 0 
              || y > chunk.Height
              || adjVoxel.Existing === false
              || (
                adjVoxel.Opacity !== undefined 
                && adjVoxel.Opacity < 1 
                && adjVoxel.Name !== currVoxel
              )
            ) {
              this.pushFace(passIndex, currFace);
            }
            
            if (z < chunk.ChunkDimensions.z - 1) {
              const nextVoxel = chunk.getVoxelAt(
                voxelPos
                  .clone()
                  .add(new Vector3(0, 0, 1))
              );
              if (nextVoxel === currVoxel) {
                currFace.faceZLength++;
                z++;
              }
            }
          }
        

        }
      }
    }


    return {
      passes: Array.from(passes.values()),
    }
  }
}