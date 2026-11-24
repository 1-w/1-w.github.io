// Round soft sprite, added onto the frame (additive blending).
in vec3 vColor;
in float vFade;

out vec4 fragColor;

const float POINT_ALPHA = 1.0;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) {
    discard;
  }
  float falloff = (1.0 - r2) * (1.0 - r2);
  fragColor = linearToOutputTexel(vec4(vColor, POINT_ALPHA * falloff * vFade));
}
