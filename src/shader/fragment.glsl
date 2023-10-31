

// uniform vec3 chunkWorldPosition;

varying vec2 uv;
varying vec3 vNormal;
varying vec3 vLightFront;
varying vec3 vPosition;
flat varying float vFaceRotation;
flat varying vec4 vColor;
flat varying float vVoxelId;

varying vec3 vLocalOffset;

void main() {

  // float cl = vInstanceMatrix[3][0] / 32.0;
  
  float cl = 0.6;

  // cl += round(vFaceRotation - 1.0) == 0.0 ? 0.5 : 0.0;
  cl = max(0.2, vFaceRotation / 5.0);


  // gl_FragColor = vec4( diffuse, 1.0 );
  gl_FragColor = vec4(vec3(1.0), vColor.a);
  gl_FragColor.xyz = mix(
    vColor.xyz,
    vec3(0.0, 0.0, 0.0),
    cl * 0.5
  );
  
  if (vVoxelId == 3.0) {
    gl_FragColor.xyz = mix(
      vColor.xyz,
      vec3(0.0, 0.0, 1.0),
      vLocalOffset.y
    );
  }

}
