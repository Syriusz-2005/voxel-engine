import { Vector3 } from "three";
import Chunk, { GreededTransparencyPass } from "./Chunk.ts";
import RenderableFace from "./RenderableFace.ts";
import Voxel from "./Voxel.ts";
import { registry, voxelRegistry } from "../types/VoxelRegistry.ts";



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

    const chunkSize = chunk.ChunkDimensions.x;
    const chunkHeight = chunk.ChunkDimensions.y;

    let voxelWorldPos = new Vector3();
    let currVoxelType = new Voxel('unknown');
    let adjVoxel = new Voxel('unknown');

    for (let x = 0; x < chunkSize; x++) {
      for (let y = 0; y < chunkHeight; y++) {
        for (let z = 0; z < chunkSize; z++) {
          const voxelData = chunk.Data[x][y][z];
          if (!voxelData) continue;
          const {type: currVoxel, pos: voxelPos} = voxelData;

          currVoxelType.update(currVoxel);
          const currVoxelProperties = voxelRegistry[currVoxel];
          const opacity = currVoxelProperties.opacity ?? 1;
          const passIndex = opacity > 0 && opacity < 1 ? currVoxelType.Id : 0;

          for (let i = 0; i < adjacents.length; i++) {
            const adj = adjacents[i];
            adj.copy(voxelPos);
            adj.add(ADJACENT_DIRECTIONS[i]);

            
            adjVoxel = adjVoxel.update('unknown');
            
            if (adj.y < 0 || adj.y >= chunkHeight) adjVoxel.update('air');
            if (
              adj.x < 0 || adj.z < 0 || adj.x >= chunkSize || adj.z >= chunkSize
            ) {
              voxelWorldPos = voxelWorldPos.copy(chunkWorldPos).add(adj);
              adjVoxel.update(chunk.World.getVoxelTypeAt(
                voxelWorldPos,
              ));
            }


            if (adjVoxel.Name === 'unknown') {
              adjVoxel.update(chunk.getVoxelAt(adj));
            }


            const adjVoxelType = voxelRegistry[adjVoxel.Name];
            if (
              adjVoxelType.existing === false
              || (
                adjVoxelType.opacity !== undefined 
                && adjVoxelType.opacity < 1 
                && adjVoxel.Name !== currVoxel
              )
            ) {
              const currFace = new RenderableFace(
                voxelPos,
                ADJACENT_DIRECTIONS[i],
                1,
                new Voxel(currVoxelType.Name),
              );
              this.pushFace(passIndex, currFace);
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