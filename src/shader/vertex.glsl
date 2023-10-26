
uniform vec3 chunkWorldPosition;
uniform mat4 cViewMatrix;

attribute mat4 instanceMatrix;
attribute vec3 vertices;
attribute vec3 meshPosition;
attribute float faceRotation;


varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
flat varying float vFaceRotation;

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = meshPosition;
  vFaceRotation = faceRotation;

  // float x = instanceMatrix[3][0];
  // float y = instanceMatrix[3][1];
  // float z = instanceMatrix[3][2];
  // vec3 pos = vec3(
  //   instanceMatrix[3][0] +,
  //   instanceMatrix[3][1],
  //   instanceMatrix[3][2]
  // );
  mat4 matrix = instanceMatrix;

  // matrix[3][0] *= 2.0;
  // matrix[3][1] *= 2.0;
  // matrix[3][2] *= 2.0;


  gl_Position = 
    projectionMatrix
    * modelViewMatrix 
    // * modelMatrix
    // * cViewMatrix
    * matrix
    * vec4(position, 1.0);
}
