uniform vec3 diffuse;
uniform float opacity;

varying vec2 uv;
varying vec3 vNormal;
varying vec3 vLightFront;

void main() {

  gl_FragColor = vec4( diffuse, 1.0 );
  gl_FragColor.xyz = vec3(1.0, vNormal.z, 1.0);

}
