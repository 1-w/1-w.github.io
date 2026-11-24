// Brain points: dequantize, size by distance, colour by tissue, fade near and far.
// Intro: during the intro hold, all points spin in the intro ball around uBallCentre and fade
// in; then each point moves to its place after a hashed delay.
// Ripples: a train of rings runs along the brain surface, away from the ripple seeds, and
// pulls the colour of the points it passes toward the ripple colour (surface distance from
// the build script, lane 4).
in float surfaceDistance;

uniform vec3 uBboxMin;
uniform vec3 uStep;
uniform int uGmCount;
uniform vec3 uColorGm;
uniform vec3 uColorWm;
uniform vec3 uColorRipple;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uIntro;
// Share of the intro taken by the intro hold (> 0).
uniform float uIntroHold;
uniform vec3 uBallCentre;
uniform float uTime;
uniform float uRipples;
// Surface distance (mm) per lane step, and the lane value that means no ripple.
uniform float uSurfaceStep;
uniform float uSurfaceNone;

out vec3 vColor;
out float vFade;

const float NEAR_FADE_START = 2.0;
const float NEAR_FADE_END = 10.0;
const float FAR_FADE_START = 120.0;
const float FAR_FADE_END = 320.0;
// Largest start delay after the intro hold, as a share of the intro.
const float INTRO_MAX_DELAY = 0.1;
// The intro ball is a 3D Gaussian with sigma BALL_RADIUS / 2. It turns around the world up
// axis at BALL_SPIN rad/s; each point wobbles by up to BALL_WOBBLE.
const float BALL_RADIUS = 30.0;
const float BALL_SPIN = 0.12;
const float BALL_WOBBLE = 1.5;
const float BALL_WOBBLE_RATE = 0.8;
// Alpha of a point in the intro ball, so all points in a small ball do not burn out to white.
const float BALL_ALPHA = 0.25;
// Smallest drawn sprite in CSS pixels; smaller sprites flicker as they move across pixel centres.
const float MIN_SPRITE = 2.0;
const float TAU = 6.28318530718;

// Ripple train: one ring every RIPPLE_SPACING mm of surface distance, moving at RIPPLE_SPEED
// mm/s; ring width RIPPLE_WIDTH mm; the gain falls as exp(-d / RIPPLE_REACH).
const float RIPPLE_SPEED = 10.0;
const float RIPPLE_SPACING = 60.0;
const float RIPPLE_WIDTH = 2.0;
const float RIPPLE_GAIN = 4.0;
const float RIPPLE_REACH = 150.0;

// Gain of the ripple train at this point; 0 for a point without a surface distance.
float rippleGain() {
  if (surfaceDistance > uSurfaceNone - 0.5) {
    return 0.0;
  }
  float d = surfaceDistance * uSurfaceStep;
  float x = (fract((d - uTime * RIPPLE_SPEED) / RIPPLE_SPACING) - 0.5) * RIPPLE_SPACING / RIPPLE_WIDTH;
  return RIPPLE_GAIN * exp(-x * x) * exp(-d / RIPPLE_REACH);
}

// lowbias32 integer hash, mapped to [0, 1).
float hash01(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return float(x) / 4294967296.0;
}

vec3 hashDirection(uint id) {
  float z = hash01(id * 3u + 1u) * 2.0 - 1.0;
  float angle = hash01(id * 3u + 2u) * TAU;
  float r = sqrt(1.0 - z * z);
  return vec3(r * cos(angle), r * sin(angle), z);
}

// Place of point `id` in the intro ball (Box-Muller from four hashes), turned and wobbled.
vec3 ballStart(uint id) {
  float a = sqrt(-2.0 * log(max(hash01(id * 3u + 7u), 1e-6)));
  float b = sqrt(-2.0 * log(max(hash01(id * 5u + 3u), 1e-6)));
  float t1 = TAU * hash01(id * 7u + 1u);
  float t2 = TAU * hash01(id * 11u + 2u);
  vec3 p = vec3(a * cos(t1), a * sin(t1), b * cos(t2)) * (BALL_RADIUS * 0.5);
  float spin = uTime * BALL_SPIN;
  p = vec3(p.x * cos(spin) - p.y * sin(spin), p.x * sin(spin) + p.y * cos(spin), p.z);
  p += hashDirection(id + 7919u) * BALL_WOBBLE * sin(uTime * BALL_WOBBLE_RATE + TAU * hash01(id * 13u + 5u));
  return uBallCentre + p;
}

void main() {
  uint id = uint(gl_VertexID);
  float delay = uIntroHold + hash01(id * 3u) * INTRO_MAX_DELAY;
  float local = clamp((uIntro - delay) / (1.0 - uIntroHold - INTRO_MAX_DELAY), 0.0, 1.0);
  float eased = local * local * (3.0 - 2.0 * local);

  vec3 rest = uBboxMin + position * uStep;
  vec3 world = mix(ballStart(id), rest, eased);
  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float size = uPointSize * uPixelRatio * 100.0 / depth;
  float minSize = MIN_SPRITE * uPixelRatio;
  gl_PointSize = clamp(size, minSize, 32.0);
  vec3 tissueColor = gl_VertexID < uGmCount ? uColorGm : uColorWm;
  // Ripples belong to the rest positions, so they wait until the points have arrived.
  float gain = uRipples * rippleGain() * eased;
  vColor = mix(tissueColor, uColorRipple, 1.0 - exp(-gain));
  // A sprite drawn larger than its size: alpha scales by the area ratio (size / minSize)^2.
  // The intro ball fades in over the first half of the intro hold.
  vFade = smoothstep(0.0, uIntroHold * 0.5, uIntro) * mix(BALL_ALPHA, 1.0, eased)
    * smoothstep(NEAR_FADE_START, NEAR_FADE_END, depth)
    * (1.0 - smoothstep(FAR_FADE_START, FAR_FADE_END, depth))
    * min(1.0, (size / minSize) * (size / minSize));
}
