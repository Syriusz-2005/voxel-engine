
uniform vec3 chunkWorldPosition;
uniform uint frame;

attribute mat4 instanceMatrix;
attribute vec3 meshPosition;
attribute float faceRotation;
attribute vec4 voxelColor;
attribute float voxelId;


flat varying float vFaceRotation;
flat varying vec4 vColor;

void main() {
  vFaceRotation = faceRotation;
  vColor = vec4(voxelColor.xyz / 255., voxelColor.a);

  mat4 matrix = instanceMatrix;

  vec3 pos = position;

  vec3 localOffset = vec3(0.0);

  float worldPosZ = matrix[3][2] + chunkWorldPosition.z - pos.y;
  float worldPosX = matrix[3][0] + chunkWorldPosition.x + pos.x;

  if (voxelId == 3.0) {
    localOffset.y -= 0.15 
      + sin(worldPosX * 1.0 + float(frame) * 0.01 - 1000.) * 0.2
      + sin(worldPosZ * 1.0 + float(frame) * 0.03) * 0.1;
  }

  matrix[3][1] += localOffset.y;

  gl_Position = 
    (projectionMatrix
    * modelViewMatrix 
    * matrix
    * vec4(pos, 1.0));
}
