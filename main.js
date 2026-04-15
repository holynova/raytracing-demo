const canvas = document.getElementById("app");
const sampleCountEl = document.getElementById("sampleCount");
const fpsEl = document.getElementById("fps");
const errorPanel = document.getElementById("errorPanel");
const errorText = document.getElementById("errorText");
const uiElements = {
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  samplesLabel: document.getElementById("samplesLabel"),
  controlsTitle: document.getElementById("controlsTitle"),
  languageLabel: document.getElementById("languageLabel"),
  languageValue: document.getElementById("languageValue"),
  renderScaleLabel: document.getElementById("renderScaleLabel"),
  passesPerFrameLabel: document.getElementById("passesPerFrameLabel"),
  sampleSpeedLabel: document.getElementById("sampleSpeedLabel"),
  bounceLimitLabel: document.getElementById("bounceLimitLabel"),
  fovLabel: document.getElementById("fovLabel"),
  exposureLabel: document.getElementById("exposureLabel"),
  lightIntensityLabel: document.getElementById("lightIntensityLabel"),
  lightTogglesLabel: document.getElementById("lightTogglesLabel"),
  lightTogglesValue: document.getElementById("lightTogglesValue"),
  whiteLightLabel: document.getElementById("whiteLightLabel"),
  redLightLabel: document.getElementById("redLightLabel"),
  blueLightLabel: document.getElementById("blueLightLabel"),
  skyStrengthLabel: document.getElementById("skyStrengthLabel"),
  qualityPresetLabel: document.getElementById("qualityPresetLabel"),
  footerText: document.getElementById("footerText"),
  errorTitle: document.getElementById("errorTitle"),
};
const controlElements = {
  language: document.getElementById("language"),
  renderScale: document.getElementById("renderScale"),
  renderScaleValue: document.getElementById("renderScaleValue"),
  passesPerFrame: document.getElementById("passesPerFrame"),
  passesPerFrameValue: document.getElementById("passesPerFrameValue"),
  sampleSpeed: document.getElementById("sampleSpeed"),
  sampleSpeedValue: document.getElementById("sampleSpeedValue"),
  bounceLimit: document.getElementById("bounceLimit"),
  bounceLimitValue: document.getElementById("bounceLimitValue"),
  fov: document.getElementById("fov"),
  fovValue: document.getElementById("fovValue"),
  exposure: document.getElementById("exposure"),
  exposureValue: document.getElementById("exposureValue"),
  lightIntensity: document.getElementById("lightIntensity"),
  lightIntensityValue: document.getElementById("lightIntensityValue"),
  whiteLightEnabled: document.getElementById("whiteLightEnabled"),
  redLightEnabled: document.getElementById("redLightEnabled"),
  blueLightEnabled: document.getElementById("blueLightEnabled"),
  skyStrength: document.getElementById("skyStrength"),
  skyStrengthValue: document.getElementById("skyStrengthValue"),
  qualityPreset: document.getElementById("qualityPreset"),
  qualityPresetValue: document.getElementById("qualityPresetValue"),
  resetView: document.getElementById("resetView"),
};

const translations = {
  en: {
    htmlLang: "en",
    title: "3D Ray Tracing Demo",
    description:
      "The scene sits inside an open box at the center, with diffuse, metal, glass, emissive surfaces, and a standalone teapot. Dragging always orbits around the box center so the target stays in view.",
    samplesLabel: "Samples",
    controlsTitle: "Live Controls",
    languageLabel: "Language",
    languageValue: "English",
    renderScaleLabel: "Render Scale",
    passesPerFrameLabel: "Passes Per Frame",
    sampleSpeedLabel: "Sampling Speed",
    bounceLimitLabel: "Bounce Limit",
    fovLabel: "Camera FOV",
    exposureLabel: "Exposure",
    lightIntensityLabel: "Light Intensity",
    lightTogglesLabel: "Light Toggles",
    lightTogglesValue: "White / Red / Blue",
    whiteLightLabel: "White",
    redLightLabel: "Red",
    blueLightLabel: "Blue",
    skyStrengthLabel: "Sky Strength",
    qualityPresetLabel: "Preset",
    resetView: "Reset View And Sampling",
    footerText: "WebGL2 Path Tracing • Progressive Accumulation",
    errorTitle: "This Demo Is Not Supported",
    errorNoWebGL2: "This browser does not provide a WebGL2 context.",
    errorNoFloat: "This browser lacks EXT_color_buffer_float, so float accumulation is unavailable.",
    errorUnknown: "Unknown renderer initialization error.",
    presetFast: "Fast",
    presetBalanced: "Balanced",
    presetQuality: "Quality",
  },
  "zh-CN": {
    htmlLang: "zh-CN",
    title: "3D 光追材质 Demo",
    description:
      "场景被收纳进画面中央的开放盒子中，包含漫反射、金属、玻璃、发光面和一个独立摆放的茶壶。拖动时相机会始终绕盒子中心旋转，不再轻易丢失目标。",
    samplesLabel: "样本数",
    controlsTitle: "实时参数",
    languageLabel: "语言",
    languageValue: "中文",
    renderScaleLabel: "渲染分辨率",
    passesPerFrameLabel: "每帧采样次数",
    sampleSpeedLabel: "采样速度",
    bounceLimitLabel: "反弹次数",
    fovLabel: "视角 FOV",
    exposureLabel: "曝光",
    lightIntensityLabel: "灯光强度",
    lightTogglesLabel: "光源开关",
    lightTogglesValue: "白 / 红 / 蓝",
    whiteLightLabel: "白",
    redLightLabel: "红",
    blueLightLabel: "蓝",
    skyStrengthLabel: "环境光强度",
    qualityPresetLabel: "预设",
    resetView: "重置视角与采样",
    footerText: "WebGL2 Path Tracing • 逐帧累积降噪",
    errorTitle: "当前环境不支持该 Demo",
    errorNoWebGL2: "浏览器未提供 WebGL2 上下文。",
    errorNoFloat: "浏览器缺少 EXT_color_buffer_float，无法进行浮点累积渲染。",
    errorUnknown: "初始化渲染器时发生未知错误。",
    presetFast: "速度优先",
    presetBalanced: "平衡",
    presetQuality: "画质优先",
  },
};

const gl = canvas.getContext("webgl2", {
  antialias: false,
  alpha: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
});

if (!gl) {
  fail("errorNoWebGL2");
}

const ext = gl.getExtension("EXT_color_buffer_float");
if (!ext) {
  fail("errorNoFloat");
}

const quadVs = `#version 300 es
precision highp float;

const vec2 POSITIONS[6] = vec2[6](
  vec2(-1.0, -1.0),
  vec2(1.0, -1.0),
  vec2(-1.0, 1.0),
  vec2(-1.0, 1.0),
  vec2(1.0, -1.0),
  vec2(1.0, 1.0)
);

out vec2 vUv;

void main() {
  vec2 pos = POSITIONS[gl_VertexID];
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const tracerFs = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uPrevTexture;
uniform vec2 uResolution;
uniform float uFrame;
uniform float uTime;
uniform float uReset;
uniform vec3 uCameraPos;
uniform vec3 uCameraForward;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform float uFocusDist;
uniform float uFov;
uniform int uBounceLimit;
uniform float uLightIntensity;
uniform float uSkyStrength;
uniform float uWhiteLightEnabled;
uniform float uRedLightEnabled;
uniform float uBlueLightEnabled;

#define MAX_BOUNCES 8
#define FAR_CLIP 100.0
#define PI 3.14159265359

struct Ray {
  vec3 origin;
  vec3 dir;
};

struct Material {
  vec3 albedo;
  vec3 emission;
  float roughness;
  float metallic;
  float ior;
  float transmission;
  float checker;
};

struct Hit {
  float t;
  vec3 position;
  vec3 normal;
  Material material;
  bool frontFace;
};

uint hash_u32(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

float rand(inout uint state) {
  state = hash_u32(state);
  return float(state) / 4294967295.0;
}

vec3 randomUnitVector(inout uint state) {
  float z = rand(state) * 2.0 - 1.0;
  float a = rand(state) * 2.0 * PI;
  float r = sqrt(max(0.0, 1.0 - z * z));
  return vec3(r * cos(a), r * sin(a), z);
}

vec3 randomHemisphere(vec3 normal, inout uint state) {
  vec3 v = randomUnitVector(state);
  return dot(v, normal) < 0.0 ? -v : v;
}

vec3 sampleCosineHemisphere(vec3 normal, inout uint state) {
  float r1 = rand(state);
  float r2 = rand(state);
  float phi = 2.0 * PI * r1;
  float r = sqrt(r2);
  vec3 tangent = normalize(abs(normal.y) < 0.999 ? cross(normal, vec3(0.0, 1.0, 0.0)) : cross(normal, vec3(1.0, 0.0, 0.0)));
  vec3 bitangent = cross(normal, tangent);
  vec3 local = vec3(r * cos(phi), sqrt(max(0.0, 1.0 - r2)), r * sin(phi));
  return normalize(tangent * local.x + normal * local.y + bitangent * local.z);
}

Material makeMaterial(
  vec3 albedo,
  vec3 emission,
  float roughness,
  float metallic,
  float ior,
  float transmission,
  float checker
) {
  Material mat;
  mat.albedo = albedo;
  mat.emission = emission;
  mat.roughness = roughness;
  mat.metallic = metallic;
  mat.ior = ior;
  mat.transmission = transmission;
  mat.checker = checker;
  return mat;
}

void setFaceNormal(Ray ray, vec3 outwardNormal, inout Hit hit) {
  hit.frontFace = dot(ray.dir, outwardNormal) < 0.0;
  hit.normal = hit.frontFace ? outwardNormal : -outwardNormal;
}

bool hitPlane(Ray ray, vec3 point, vec3 normal, Material material, inout Hit bestHit) {
  float denom = dot(ray.dir, normal);
  if (abs(denom) < 0.0001) {
    return false;
  }

  float t = dot(point - ray.origin, normal) / denom;
  if (t < 0.001 || t > bestHit.t) {
    return false;
  }

  bestHit.t = t;
  bestHit.position = ray.origin + ray.dir * t;
  bestHit.material = material;
  setFaceNormal(ray, normalize(normal), bestHit);
  return true;
}

bool hitSphere(Ray ray, vec3 center, float radius, Material material, inout Hit bestHit) {
  vec3 oc = ray.origin - center;
  float a = dot(ray.dir, ray.dir);
  float halfB = dot(oc, ray.dir);
  float c = dot(oc, oc) - radius * radius;
  float discriminant = halfB * halfB - a * c;
  if (discriminant < 0.0) {
    return false;
  }

  float sqrtd = sqrt(discriminant);
  float root = (-halfB - sqrtd) / a;
  if (root < 0.001 || root > bestHit.t) {
    root = (-halfB + sqrtd) / a;
    if (root < 0.001 || root > bestHit.t) {
      return false;
    }
  }

  bestHit.t = root;
  bestHit.position = ray.origin + ray.dir * root;
  vec3 outwardNormal = (bestHit.position - center) / radius;
  bestHit.material = material;
  setFaceNormal(ray, outwardNormal, bestHit);
  return true;
}

bool hitAabb(Ray ray, vec3 bmin, vec3 bmax, Material material, inout Hit bestHit) {
  vec3 invDir = 1.0 / ray.dir;
  vec3 t0 = (bmin - ray.origin) * invDir;
  vec3 t1 = (bmax - ray.origin) * invDir;
  vec3 tsmaller = min(t0, t1);
  vec3 tbigger = max(t0, t1);

  float tNear = max(max(tsmaller.x, tsmaller.y), tsmaller.z);
  float tFar = min(min(tbigger.x, tbigger.y), tbigger.z);

  if (tNear > tFar || tFar < 0.001) {
    return false;
  }

  float t = tNear > 0.001 ? tNear : tFar;
  if (t > bestHit.t) {
    return false;
  }

  vec3 pos = ray.origin + ray.dir * t;
  vec3 center = 0.5 * (bmin + bmax);
  vec3 extents = 0.5 * (bmax - bmin);
  vec3 local = pos - center;
  vec3 a = abs(local / extents);
  vec3 outwardNormal;

  if (a.x > a.y && a.x > a.z) {
    outwardNormal = vec3(sign(local.x), 0.0, 0.0);
  } else if (a.y > a.z) {
    outwardNormal = vec3(0.0, sign(local.y), 0.0);
  } else {
    outwardNormal = vec3(0.0, 0.0, sign(local.z));
  }

  bestHit.t = t;
  bestHit.position = pos;
  bestHit.material = material;
  setFaceNormal(ray, outwardNormal, bestHit);
  return true;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdTorusX(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.yz) - t.x, p.x);
  return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float sdEllipsoid(vec3 p, vec3 r) {
  vec3 pr = p / r;
  float k0 = length(pr);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float mapTeapot(vec3 p) {
  vec3 q = p - vec3(0.65, -0.45, -6.15);

  float body = sdEllipsoid(q - vec3(0.0, 0.22, 0.0), vec3(0.62, 0.48, 0.54));
  float lid = sdRoundBox(q - vec3(0.0, 0.64, 0.0), vec3(0.28, 0.07, 0.28), 0.06);
  float knob = sdSphere(q - vec3(0.0, 0.82, 0.0), 0.1);
  float foot = sdTorus(q - vec3(0.0, -0.12, 0.0), vec2(0.28, 0.05));
  float spout = sdCapsule(q, vec3(0.46, 0.34, 0.04), vec3(1.02, 0.52, 0.14), 0.09);
  float spoutLip = sdCapsule(q, vec3(0.92, 0.52, 0.14), vec3(1.08, 0.48, 0.14), 0.06);
  float handle = sdTorusX(q - vec3(-0.56, 0.32, 0.0), vec2(0.26, 0.07));

  float teapot = opSmoothUnion(body, lid, 0.12);
  teapot = opSmoothUnion(teapot, knob, 0.08);
  teapot = opSmoothUnion(teapot, foot, 0.06);
  teapot = opSmoothUnion(teapot, spout, 0.11);
  teapot = opSmoothUnion(teapot, spoutLip, 0.06);
  teapot = opSmoothUnion(teapot, handle, 0.09);
  return teapot;
}

vec3 teapotNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    mapTeapot(p + e.xyy) - mapTeapot(p - e.xyy),
    mapTeapot(p + e.yxy) - mapTeapot(p - e.yxy),
    mapTeapot(p + e.yyx) - mapTeapot(p - e.yyx)
  ));
}

bool hitTeapot(Ray ray, Material material, inout Hit bestHit) {
  float t = 0.0;
  for (int i = 0; i < 96; i++) {
    vec3 pos = ray.origin + ray.dir * t;
    float d = mapTeapot(pos);
    if (d < 0.001) {
      if (t < 0.001 || t > bestHit.t) {
        return false;
      }

      bestHit.t = t;
      bestHit.position = pos;
      bestHit.material = material;
      vec3 outwardNormal = teapotNormal(pos);
      setFaceNormal(ray, outwardNormal, bestHit);
      return true;
    }

    t += d;
    if (t > bestHit.t || t > FAR_CLIP) {
      break;
    }
  }

  return false;
}

float schlick(float cosine, float refIdx) {
  float r0 = (1.0 - refIdx) / (1.0 + refIdx);
  r0 = r0 * r0;
  return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}

vec3 checkerAlbedo(vec3 pos, vec3 baseColor) {
  float pattern = mod(floor(pos.x * 1.2) + floor(pos.z * 1.2), 2.0);
  vec3 tint = mix(vec3(0.12, 0.14, 0.16), vec3(0.85, 0.84, 0.8), pattern);
  return mix(baseColor, tint, 0.85);
}

bool traceScene(Ray ray, inout Hit bestHit) {
  bool hit = false;
  bestHit.t = FAR_CLIP;

  Material floorMat = makeMaterial(vec3(0.84), vec3(0.0), 0.96, 0.0, 1.0, 0.0, 1.0);
  Material ceilingMat = makeMaterial(vec3(0.74, 0.78, 0.84), vec3(0.0), 1.0, 0.0, 1.0, 0.0, 0.0);
  Material backWall = makeMaterial(vec3(0.78, 0.82, 0.88), vec3(0.0), 1.0, 0.0, 1.0, 0.0, 0.0);
  Material warmWall = makeMaterial(vec3(0.86, 0.44, 0.31), vec3(0.0), 1.0, 0.0, 1.0, 0.0, 0.0);
  Material coolWall = makeMaterial(vec3(0.24, 0.55, 0.84), vec3(0.0), 1.0, 0.0, 1.0, 0.0, 0.0);
  Material gold = makeMaterial(vec3(0.98, 0.8, 0.36), vec3(0.0), 0.06, 1.0, 1.0, 0.0, 0.0);
  Material brushedMetal = makeMaterial(vec3(0.86, 0.9, 0.94), vec3(0.0), 0.2, 1.0, 1.0, 0.0, 0.0);
  Material glass = makeMaterial(vec3(0.95, 0.98, 1.0), vec3(0.0), 0.0, 0.0, 1.45, 1.0, 0.0);
  Material matteRed = makeMaterial(vec3(0.84, 0.25, 0.2), vec3(0.0), 1.0, 0.0, 1.0, 0.0, 0.0);
  Material teapotMat = makeMaterial(vec3(0.68, 0.9, 0.84), vec3(0.0), 0.08, 1.0, 1.0, 0.0, 0.0);
  Material whiteLight = makeMaterial(vec3(1.0), vec3(13.0, 11.4, 9.8) * uLightIntensity / 13.0 * uWhiteLightEnabled, 0.0, 0.0, 1.0, 0.0, 0.0);
  Material redLight = makeMaterial(vec3(1.0), vec3(11.5, 1.2, 1.0) * uLightIntensity / 13.0 * uRedLightEnabled, 0.0, 0.0, 1.0, 0.0, 0.0);
  Material blueLight = makeMaterial(vec3(1.0), vec3(1.0, 1.8, 12.5) * uLightIntensity / 13.0 * uBlueLightEnabled, 0.0, 0.0, 1.0, 0.0, 0.0);

  hit = hitAabb(ray, vec3(-3.4, -1.0, -7.4), vec3(3.4, -0.96, -2.1), floorMat, bestHit) || hit;
  hit = hitAabb(ray, vec3(-3.4, 3.55, -7.4), vec3(3.4, 3.59, -2.1), ceilingMat, bestHit) || hit;
  hit = hitAabb(ray, vec3(-3.4, -1.0, -7.4), vec3(-3.36, 3.55, -2.1), warmWall, bestHit) || hit;
  hit = hitAabb(ray, vec3(3.36, -1.0, -7.4), vec3(3.4, 3.55, -2.1), coolWall, bestHit) || hit;
  hit = hitAabb(ray, vec3(-3.4, -1.0, -7.4), vec3(3.4, 3.55, -7.36), backWall, bestHit) || hit;

  hit = hitAabb(ray, vec3(-1.95, -1.0, -6.3), vec3(-0.9, 0.68, -5.0), matteRed, bestHit) || hit;
  hit = hitAabb(ray, vec3(1.1, -1.0, -4.95), vec3(2.4, -0.08, -3.45), brushedMetal, bestHit) || hit;
  hit = hitSphere(ray, vec3(0.0, -0.08, -4.85), 0.88, glass, bestHit) || hit;
  hit = hitSphere(ray, vec3(-2.05, -0.2, -3.85), 0.8, gold, bestHit) || hit;
  hit = hitSphere(ray, vec3(2.05, -0.28, -5.85), 0.72, brushedMetal, bestHit) || hit;
  hit = hitTeapot(ray, teapotMat, bestHit) || hit;
  hit = hitAabb(ray, vec3(-0.92, 3.15, -5.55), vec3(0.92, 3.35, -4.15), whiteLight, bestHit) || hit;
  hit = hitAabb(ray, vec3(-3.18, 1.05, -6.15), vec3(-3.04, 2.5, -3.15), redLight, bestHit) || hit;
  hit = hitAabb(ray, vec3(3.04, 1.05, -6.15), vec3(3.18, 2.5, -3.15), blueLight, bestHit) || hit;

  if (hit && bestHit.material.checker > 0.5) {
    bestHit.material.albedo = checkerAlbedo(bestHit.position, bestHit.material.albedo);
  }

  return hit;
}

vec3 skyColor(vec3 dir) {
  float t = 0.5 * (dir.y + 1.0);
  return mix(vec3(0.02, 0.03, 0.06), vec3(0.22, 0.34, 0.54), t) * uSkyStrength;
}

vec3 shade(Ray ray, inout uint rng) {
  vec3 throughput = vec3(1.0);
  vec3 radiance = vec3(0.0);

  for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    if (bounce >= uBounceLimit) {
      radiance += throughput * skyColor(ray.dir);
      break;
    }

    Hit hit;
    if (!traceScene(ray, hit)) {
      radiance += throughput * skyColor(ray.dir);
      break;
    }

    radiance += throughput * hit.material.emission;
    vec3 normal = hit.normal;
    vec3 albedo = hit.material.albedo;

    if (hit.material.transmission > 0.5) {
      float refractionRatio = hit.frontFace ? (1.0 / hit.material.ior) : hit.material.ior;
      float cosTheta = min(dot(-ray.dir, normal), 1.0);
      float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));
      bool cannotRefract = refractionRatio * sinTheta > 1.0;
      vec3 direction;

      if (cannotRefract || schlick(cosTheta, refractionRatio) > rand(rng)) {
        direction = reflect(ray.dir, normal);
      } else {
        direction = refract(ray.dir, normal, refractionRatio);
      }

      ray.origin = hit.position + direction * 0.002;
      ray.dir = normalize(mix(direction, randomHemisphere(direction, rng), hit.material.roughness * 0.1));
      throughput *= albedo;
      continue;
    }

    vec3 diffuseDir = sampleCosineHemisphere(normal, rng);
    vec3 reflectedDir = reflect(ray.dir, normal);
    reflectedDir = normalize(mix(reflectedDir, randomHemisphere(reflectedDir, rng), hit.material.roughness));

    float chooseSpec = mix(0.04, 1.0, hit.material.metallic);
    bool specular = rand(rng) < chooseSpec;
    vec3 nextDir = specular ? reflectedDir : diffuseDir;

    vec3 specColor = mix(vec3(0.04), albedo, hit.material.metallic);
    vec3 surfaceColor = specular ? specColor : albedo;
    throughput *= surfaceColor;

    ray.origin = hit.position + normal * 0.002;
    ray.dir = normalize(nextDir);

    if (bounce > 2) {
      float survival = clamp(max(throughput.r, max(throughput.g, throughput.b)), 0.15, 0.95);
      if (rand(rng) > survival) {
        break;
      }
      throughput /= survival;
    }
  }

  return radiance;
}

Ray makeCameraRay(vec2 uv, inout uint rng) {
  vec2 jitter = vec2(rand(rng), rand(rng)) - 0.5;
  vec2 pixel = ((gl_FragCoord.xy + jitter) / uResolution) * 2.0 - 1.0;
  float aspect = uResolution.x / uResolution.y;
  pixel.x *= aspect;

  float fovScale = tan(radians(uFov) * 0.5);
  vec3 imagePoint = uCameraPos + uCameraForward * uFocusDist;
  imagePoint += uCameraRight * pixel.x * fovScale * uFocusDist;
  imagePoint += uCameraUp * pixel.y * fovScale * uFocusDist;

  Ray ray;
  ray.origin = uCameraPos;
  ray.dir = normalize(imagePoint - uCameraPos);
  return ray;
}

void main() {
  uint seed = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + uint(uFrame) * 26699u + 89173u;
  seed ^= uint(uTime * 1000.0);

  Ray ray = makeCameraRay(vUv, seed);
  vec3 sampleColor = shade(ray, seed);

  vec3 prevColor = texture(uPrevTexture, vUv).rgb;
  float sampleIndex = max(uFrame, 1.0);
  vec3 color = uReset > 0.5 ? sampleColor : mix(prevColor, sampleColor, 1.0 / sampleIndex);
  outColor = vec4(color, 1.0);
}
`;

const blitFs = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float uExposure;

vec3 tonemap(vec3 color) {
  color *= uExposure;
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0 / 2.2));
  return color;
}

void main() {
  vec3 color = texture(uTexture, vUv).rgb;
  outColor = vec4(tonemap(color), 1.0);
}
`;

const tracerProgram = createProgram(quadVs, tracerFs);
const blitProgram = createProgram(quadVs, blitFs);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const tracerUniforms = {
  prevTexture: gl.getUniformLocation(tracerProgram, "uPrevTexture"),
  resolution: gl.getUniformLocation(tracerProgram, "uResolution"),
  frame: gl.getUniformLocation(tracerProgram, "uFrame"),
  time: gl.getUniformLocation(tracerProgram, "uTime"),
  reset: gl.getUniformLocation(tracerProgram, "uReset"),
  cameraPos: gl.getUniformLocation(tracerProgram, "uCameraPos"),
  cameraForward: gl.getUniformLocation(tracerProgram, "uCameraForward"),
  cameraRight: gl.getUniformLocation(tracerProgram, "uCameraRight"),
  cameraUp: gl.getUniformLocation(tracerProgram, "uCameraUp"),
  focusDist: gl.getUniformLocation(tracerProgram, "uFocusDist"),
  fov: gl.getUniformLocation(tracerProgram, "uFov"),
  bounceLimit: gl.getUniformLocation(tracerProgram, "uBounceLimit"),
  lightIntensity: gl.getUniformLocation(tracerProgram, "uLightIntensity"),
  skyStrength: gl.getUniformLocation(tracerProgram, "uSkyStrength"),
  whiteLightEnabled: gl.getUniformLocation(tracerProgram, "uWhiteLightEnabled"),
  redLightEnabled: gl.getUniformLocation(tracerProgram, "uRedLightEnabled"),
  blueLightEnabled: gl.getUniformLocation(tracerProgram, "uBlueLightEnabled"),
};

const blitUniforms = {
  texture: gl.getUniformLocation(blitProgram, "uTexture"),
  exposure: gl.getUniformLocation(blitProgram, "uExposure"),
};

const state = {
  width: 0,
  height: 0,
  sampleCount: 0,
  resetAccumulation: true,
  yaw: 0.42,
  pitch: -0.08,
  distance: 8.2,
  target: [0, 1.1, -4.85],
  renderScale: 0.75,
  passesPerFrame: 1,
  sampleSpeed: 1,
  sampleCarry: 0,
  bounceLimit: 5,
  fov: 42,
  exposure: 1,
  lightIntensity: 13,
  skyStrength: 1,
  whiteLightEnabled: true,
  redLightEnabled: true,
  blueLightEnabled: true,
  language: "en",
  lastTime: performance.now(),
  fps: 0,
};

const defaultCamera = {
  yaw: 0.42,
  pitch: -0.08,
  distance: 8.2,
};

let ping = createRenderTarget(1, 1);
let pong = createRenderTarget(1, 1);

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Shader compile failed");
  }
  return shader;
}

function createProgram(vsSource, fsSource) {
  const program = gl.createProgram();
  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Program link failed");
  }

  return program;
}

function createRenderTarget(width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer incomplete: ${status}`);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { texture, framebuffer, width, height };
}

function resizeRenderTarget(target, width, height) {
  if (target.width === width && target.height === height) {
    return target;
  }
  gl.bindTexture(gl.TEXTURE_2D, target.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
  target.width = width;
  target.height = height;
  return target;
}

function swapTargets() {
  const temp = ping;
  ping = pong;
  pong = temp;
}

function t(key) {
  try {
    const language = typeof state === "object" && state?.language ? state.language : "en";
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  } catch {
    return key;
  }
}

function applyLanguage() {
  const tr = translations[state.language] || translations.en;
  document.documentElement.lang = tr.htmlLang;
  document.title = tr.title;
  uiElements.title.textContent = tr.title;
  uiElements.description.textContent = tr.description;
  uiElements.samplesLabel.textContent = tr.samplesLabel;
  uiElements.controlsTitle.textContent = tr.controlsTitle;
  uiElements.languageLabel.textContent = tr.languageLabel;
  uiElements.languageValue.textContent = tr.languageValue;
  uiElements.renderScaleLabel.textContent = tr.renderScaleLabel;
  uiElements.passesPerFrameLabel.textContent = tr.passesPerFrameLabel;
  uiElements.sampleSpeedLabel.textContent = tr.sampleSpeedLabel;
  uiElements.bounceLimitLabel.textContent = tr.bounceLimitLabel;
  uiElements.fovLabel.textContent = tr.fovLabel;
  uiElements.exposureLabel.textContent = tr.exposureLabel;
  uiElements.lightIntensityLabel.textContent = tr.lightIntensityLabel;
  uiElements.lightTogglesLabel.textContent = tr.lightTogglesLabel;
  uiElements.lightTogglesValue.textContent = tr.lightTogglesValue;
  uiElements.whiteLightLabel.textContent = tr.whiteLightLabel;
  uiElements.redLightLabel.textContent = tr.redLightLabel;
  uiElements.blueLightLabel.textContent = tr.blueLightLabel;
  uiElements.skyStrengthLabel.textContent = tr.skyStrengthLabel;
  uiElements.qualityPresetLabel.textContent = tr.qualityPresetLabel;
  controlElements.resetView.textContent = tr.resetView;
  uiElements.footerText.textContent = tr.footerText;
  uiElements.errorTitle.textContent = tr.errorTitle;
  controlElements.qualityPreset.options[0].textContent = tr.presetFast;
  controlElements.qualityPreset.options[1].textContent = tr.presetBalanced;
  controlElements.qualityPreset.options[2].textContent = tr.presetQuality;
}

function fail(messageKeyOrText) {
  let message = messageKeyOrText;
  try {
    if (translations.en[messageKeyOrText]) {
      message = t(messageKeyOrText);
    }
  } catch {
    message = messageKeyOrText;
  }
  errorText.textContent = message;
  errorPanel.classList.add("visible");
  throw new Error(errorText.textContent);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function markDirty() {
  state.resetAccumulation = true;
  state.sampleCount = 0;
  state.sampleCarry = 0;
  sampleCountEl.textContent = "0";
}

function resize() {
  const dpr = Math.min((window.devicePixelRatio || 1) * state.renderScale, 1.5);
  const width = Math.max(1, Math.floor(window.innerWidth * dpr));
  const height = Math.max(1, Math.floor(window.innerHeight * dpr));

  if (width === state.width && height === state.height) {
    return;
  }

  state.width = width;
  state.height = height;
  canvas.width = width;
  canvas.height = height;

  resizeRenderTarget(ping, width, height);
  resizeRenderTarget(pong, width, height);

  gl.viewport(0, 0, width, height);
  markDirty();
}

function getCameraBasis() {
  const target = state.target;
  const cp = Math.cos(state.pitch);
  const sp = Math.sin(state.pitch);
  const cy = Math.cos(state.yaw);
  const sy = Math.sin(state.yaw);

  const cameraPos = [
    target[0] + state.distance * cp * sy,
    target[1] + state.distance * sp,
    target[2] + state.distance * cp * cy,
  ];

  const forward = normalize([
    target[0] - cameraPos[0],
    target[1] - cameraPos[1],
    target[2] - cameraPos[2],
  ]);
  const right = normalize(cross(forward, [0, 1, 0]));
  const up = normalize(cross(right, forward));

  return {
    cameraPos,
    forward,
    right,
    up,
  };
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function render(now) {
  resize();

  const dt = Math.max(0.0001, (now - state.lastTime) / 1000);
  state.lastTime = now;
  state.fps += (1 / dt - state.fps) * 0.08;
  fpsEl.textContent = state.fps.toFixed(1);

  const { cameraPos, forward, right, up } = getCameraBasis();

  gl.bindVertexArray(vao);
  gl.useProgram(tracerProgram);
  gl.uniform2f(tracerUniforms.resolution, state.width, state.height);
  gl.uniform1f(tracerUniforms.time, now * 0.001);
  gl.uniform3fv(tracerUniforms.cameraPos, cameraPos);
  gl.uniform3fv(tracerUniforms.cameraForward, forward);
  gl.uniform3fv(tracerUniforms.cameraRight, right);
  gl.uniform3fv(tracerUniforms.cameraUp, up);
  gl.uniform1f(tracerUniforms.focusDist, state.distance);
  gl.uniform1f(tracerUniforms.fov, state.fov);
  gl.uniform1i(tracerUniforms.bounceLimit, state.bounceLimit);
  gl.uniform1f(tracerUniforms.lightIntensity, state.lightIntensity);
  gl.uniform1f(tracerUniforms.skyStrength, state.skyStrength);
  gl.uniform1f(tracerUniforms.whiteLightEnabled, state.whiteLightEnabled ? 1 : 0);
  gl.uniform1f(tracerUniforms.redLightEnabled, state.redLightEnabled ? 1 : 0);
  gl.uniform1f(tracerUniforms.blueLightEnabled, state.blueLightEnabled ? 1 : 0);

  state.sampleCarry += state.passesPerFrame * state.sampleSpeed;
  const passesThisFrame = Math.floor(state.sampleCarry);
  state.sampleCarry -= passesThisFrame;

  for (let i = 0; i < passesThisFrame; i += 1) {
    const frameIndex = state.sampleCount + 1;
    gl.bindFramebuffer(gl.FRAMEBUFFER, pong.framebuffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ping.texture);
    gl.uniform1i(tracerUniforms.prevTexture, 0);
    gl.uniform1f(tracerUniforms.frame, Math.max(1, frameIndex));
    gl.uniform1f(tracerUniforms.reset, state.resetAccumulation && i === 0 ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    swapTargets();
    state.sampleCount += 1;
  }

  gl.useProgram(blitProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ping.texture);
  gl.uniform1i(blitUniforms.texture, 0);
  gl.uniform1f(blitUniforms.exposure, state.exposure);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  state.resetAccumulation = false;
  sampleCountEl.textContent = state.sampleCount.toString();

  requestAnimationFrame(render);
}

let isDragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDragging) {
    return;
  }

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;

  state.yaw -= dx * 0.0055;
  state.pitch = clamp(state.pitch + dy * 0.0042, -0.72, 0.42);
  markDirty();
});

canvas.addEventListener("pointerup", (event) => {
  isDragging = false;
  canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointerleave", () => {
  isDragging = false;
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    state.distance = clamp(state.distance + event.deltaY * 0.008, 6.4, 10.4);
    markDirty();
  },
  { passive: false },
);

window.addEventListener("resize", resize);

try {
  bindControls();
  resize();
  requestAnimationFrame((now) => {
    state.lastTime = now;
    render(now);
  });
} catch (error) {
  fail(error instanceof Error ? error.message : "errorUnknown");
}

function updateControlLabels() {
  controlElements.renderScaleValue.textContent = `${state.renderScale.toFixed(2)}x`;
  controlElements.passesPerFrameValue.textContent = String(state.passesPerFrame);
  controlElements.sampleSpeedValue.textContent = `${state.sampleSpeed.toFixed(2)}x`;
  controlElements.bounceLimitValue.textContent = String(state.bounceLimit);
  controlElements.fovValue.textContent = `${state.fov.toFixed(0)}°`;
  controlElements.exposureValue.textContent = state.exposure.toFixed(2);
  controlElements.lightIntensityValue.textContent = state.lightIntensity.toFixed(1);
  controlElements.skyStrengthValue.textContent = state.skyStrength.toFixed(2);

  const presetLabel =
    controlElements.qualityPreset.value === "fast"
      ? t("presetFast")
      : controlElements.qualityPreset.value === "quality"
        ? t("presetQuality")
        : t("presetBalanced");
  controlElements.qualityPresetValue.textContent = presetLabel;
  uiElements.languageValue.textContent = t("languageValue");
}

function applyPreset(preset) {
  if (preset === "fast") {
    state.renderScale = 0.55;
    state.passesPerFrame = 1;
    state.sampleSpeed = 1.3;
    state.bounceLimit = 3;
  } else if (preset === "quality") {
    state.renderScale = 1.0;
    state.passesPerFrame = 3;
    state.sampleSpeed = 1.0;
    state.bounceLimit = 7;
  } else {
    state.renderScale = 0.75;
    state.passesPerFrame = 1;
    state.sampleSpeed = 1.0;
    state.bounceLimit = 5;
  }

  controlElements.renderScale.value = String(state.renderScale);
  controlElements.passesPerFrame.value = String(state.passesPerFrame);
  controlElements.sampleSpeed.value = String(state.sampleSpeed);
  controlElements.bounceLimit.value = String(state.bounceLimit);
  updateControlLabels();
  resize();
  markDirty();
}

function resetView() {
  state.yaw = defaultCamera.yaw;
  state.pitch = defaultCamera.pitch;
  state.distance = defaultCamera.distance;
  markDirty();
}

function bindControls() {
  controlElements.language.addEventListener("change", (event) => {
    state.language = event.target.value;
    applyLanguage();
    updateControlLabels();
  });

  controlElements.renderScale.addEventListener("input", (event) => {
    state.renderScale = Number(event.target.value);
    updateControlLabels();
    resize();
  });

  controlElements.passesPerFrame.addEventListener("input", (event) => {
    state.passesPerFrame = Number(event.target.value);
    updateControlLabels();
    markDirty();
  });

  controlElements.sampleSpeed.addEventListener("input", (event) => {
    state.sampleSpeed = Number(event.target.value);
    state.sampleCarry = 0;
    updateControlLabels();
  });

  controlElements.bounceLimit.addEventListener("input", (event) => {
    state.bounceLimit = Number(event.target.value);
    updateControlLabels();
    markDirty();
  });

  controlElements.fov.addEventListener("input", (event) => {
    state.fov = Number(event.target.value);
    updateControlLabels();
    markDirty();
  });

  controlElements.exposure.addEventListener("input", (event) => {
    state.exposure = Number(event.target.value);
    updateControlLabels();
  });

  controlElements.lightIntensity.addEventListener("input", (event) => {
    state.lightIntensity = Number(event.target.value);
    updateControlLabels();
    markDirty();
  });

  controlElements.whiteLightEnabled.addEventListener("change", (event) => {
    state.whiteLightEnabled = event.target.checked;
    markDirty();
  });

  controlElements.redLightEnabled.addEventListener("change", (event) => {
    state.redLightEnabled = event.target.checked;
    markDirty();
  });

  controlElements.blueLightEnabled.addEventListener("change", (event) => {
    state.blueLightEnabled = event.target.checked;
    markDirty();
  });

  controlElements.skyStrength.addEventListener("input", (event) => {
    state.skyStrength = Number(event.target.value);
    updateControlLabels();
    markDirty();
  });

  controlElements.qualityPreset.addEventListener("change", (event) => {
    applyPreset(event.target.value);
  });

  controlElements.resetView.addEventListener("click", () => {
    resetView();
  });

  applyLanguage();
  updateControlLabels();
}
