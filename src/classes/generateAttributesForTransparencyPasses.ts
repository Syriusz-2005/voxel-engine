import { Object3D } from "three";
import Attribute from "../types/Attribute.js";
import Chunk from "./Chunk.js";

export class AttributeGenerator {

  private static getAttrArray(facesCount: number, perVertexCount: number): Float32Array {
    return new Float32Array(facesCount * 6 * perVertexCount);
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
}