import { Vector3 } from "three";

export type VectorRepresentation = `${number}$${number}$${number}`

export default class Representation {
  public static toRepresentation(vec: Vector3): VectorRepresentation {
    return `${vec.x}$${vec.y}$${vec.z}`;
  }

  public static fromRepresentation(representation: VectorRepresentation): Vector3 {
    const [x, y, z] = representation.split('$');
    return new Vector3(Number(x), Number(y), Number(z));
  }
}
