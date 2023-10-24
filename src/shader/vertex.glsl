varying vec2 vUv;
varying vec3 vNormal;

attribute mat4 instanceMatrix;
attribute vec3 vertices;

varying mat4 vInstanceMatrix;

void main() {
  vUv = uv;
  vNormal = normal;
  vInstanceMatrix = instanceMatrix;

  // float x = instanceMatrix[3][0];
  // float y = instanceMatrix[3][1];
  // float z = instanceMatrix[3][2];

  gl_Position = 
    projectionMatrix 
    * modelViewMatrix
    * instanceMatrix
    * vec4(position, 1.0);
}
