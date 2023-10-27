
uniform vec3 chunkWorldPosition;

attribute mat4 instanceMatrix;
attribute vec3 vertices;
attribute vec3 meshPosition;
attribute float faceRotation;
attribute vec3 voxelColor;


varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
flat varying float vFaceRotation;
flat varying vec3 vColor;

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = meshPosition;
  vFaceRotation = faceRotation;
  vColor = voxelColor / 255.;

  mat4 matrix = instanceMatrix;


  gl_Position = 
    projectionMatrix
    * modelViewMatrix 
    * matrix
    * vec4(position, 1.0);
}
