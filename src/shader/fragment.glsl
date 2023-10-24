uniform vec3 diffuse;
uniform float opacity;

varying vec2 uv;
varying vec3 vNormal;
varying vec3 vLightFront;

varying mat4 vInstanceMatrix;

void main() {

  float cl = vInstanceMatrix[3][0] / 16.0;
  gl_FragColor = vec4( diffuse, 1.0 );
  gl_FragColor.xyz = vec3(cl, cl, cl);

}
