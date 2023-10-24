varying vec2 vUv;
varying vec3 vNormal;

attribute mat4 instanceMatrix;
attribute vec3 vertices;
attribute vec3 meshPosition;

uniform vec3 chunkWorldPosition;

varying mat4 vInstanceMatrix;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = meshPosition;
  vInstanceMatrix = instanceMatrix;

  // float x = instanceMatrix[3][0];
  // float y = instanceMatrix[3][1];
  // float z = instanceMatrix[3][2];
  // vec3 pos = vec3(
  //   instanceMatrix[3][0] +,
  //   instanceMatrix[3][1],
  //   instanceMatrix[3][2]
  // );

  gl_Position = 
    projectionMatrix 
    * modelViewMatrix
    * instanceMatrix
    * vec4(position, 1.0);
}
