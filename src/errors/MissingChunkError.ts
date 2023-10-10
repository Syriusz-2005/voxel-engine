import { Vector3 } from "three";

export default class MissingChunkError extends Error {
  public readonly pos: Vector3;
  
  constructor(chunkPos: Vector3) {
    super(`Missing chunk at ${chunkPos.toArray().join(', ')}`);
    this.name = 'MissingChunkError';
    this.pos = chunkPos;
  }
}