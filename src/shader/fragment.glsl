uniform vec3 diffuse;
uniform float opacity;

varying vec2 uv;
varying vec3 vLightFront;

void main() {

  gl_FragColor = vec4( diffuse, opacity );
  gl_FragColor.xyz = vec3(1.0, 1.0, 1.0);

}
