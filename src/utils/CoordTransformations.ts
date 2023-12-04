import { Vector3 } from "three";



export default class CoordTransformations {
  constructor(
    private readonly transformationVector: Vector3,
  ) {}

  public get TVector(): Vector3 {
    return this.transformationVector;
  }

  
  public transformToChunkPos(worldPos: Vector3): Vector3 {
    const {x, y, z} = worldPos;
    const chunkX = Math.floor(x / this.transformationVector.x);
    const chunkY = Math.floor(y / this.transformationVector.y);
    const chunkZ = Math.floor(z / this.transformationVector.z);

    return new Vector3(chunkX, chunkY, chunkZ);
  }

  public transformToPosInChunk(worldPos: Vector3): Vector3 {
    
    const chunkWorldPos = this.transformToChunkPos(worldPos)
      .multiply(this.transformationVector);

    const posInChunk = worldPos.sub(chunkWorldPos);

    return posInChunk;
  }
}