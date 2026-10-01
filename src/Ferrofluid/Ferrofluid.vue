<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const props = defineProps({
  dpr: { type: Number, default: null },
  paused: { type: Boolean, default: false },
  colors: { type: Array, default: () => ['#ffffff', '#cccccc', '#999999'] },
  speed: { type: Number, default: 0.5 },
  scale: { type: Number, default: 2.0 },
  turbulence: { type: Number, default: 1 },
  fluidity: { type: Number, default: 0.1 },
  rimWidth: { type: Number, default: 0.22 },
  sharpness: { type: Number, default: 2.5 },
  shimmer: { type: Number, default: 1.5 },
  glow: { type: Number, default: 2 },
  flowDirection: { type: String, default: 'down' },
  opacity: { type: Number, default: 1 },
  mouseInteraction: { type: Boolean, default: true },
  mouseStrength: { type: Number, default: 1 },
  mouseRadius: { type: Number, default: 0.35 },
  mouseDampening: { type: Number, default: 0.15 },
  mixBlendMode: { type: String, default: '' },
  className: { type: String, default: '' }
})

const containerRef = ref(null)
const rendererRef = ref(null)
const programRef = ref(null)
const meshRef = ref(null)
const geometryRef = ref(null)
const rafRef = ref(null)
const mouseTargetRef = ref([0, 0])
const lastTimeRef = ref(0)
const roRef = ref(null)
const uniformsRef = ref(null)

const MAX_COLORS = 8

const hexToRGB = (hex) => {
  const c = hex.replace('#', '').padEnd(6, '0')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return [r, g, b]
}

const prepColors = (input) => {
  const base = (input && input.length ? input : ['#4F46E5', '#06B6D4', '#E0F2FE']).slice(0, MAX_COLORS)
  const count = base.length
  const arr = []
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]))
  const avg = [0, 0, 0]
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0]
    avg[1] += arr[i][1]
    avg[2] += arr[i][2]
  }
  avg[0] /= count
  avg[1] /= count
  avg[2] /= count
  return { arr, count, avg }
}

const flowVec = (d) => {
  switch (d) {
    case 'up': return [0, 1]
    case 'down': return [0, -1]
    case 'left': return [-1, 0]
    case 'right': return [1, 0]
    default: return [0, -1]
  }
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uMouseColor;
uniform vec2  uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = iTime;

  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mp = iMouse / iResolution.y * ref;
    float md = length(p - mp) / ref;
    float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow;
  ltn *= clamp(1.0 - mGlow, 0.0, 1.0);

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 col = palette(h);

  vec3 outc = col * ltn;
  float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  fragColor = vec4(outc, a * uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

const destroyWebGL = () => {
  if (rafRef.value) {
    cancelAnimationFrame(rafRef.value)
    rafRef.value = null
  }
  if (rendererRef.value) {
    const canvas = rendererRef.value.gl.canvas
    if (props.mouseInteraction) {
      canvas.removeEventListener('pointermove', onPointerMove)
    }
    if (roRef.value) {
      roRef.value.disconnect()
      roRef.value = null
    }
    if (canvas.parentElement === containerRef.value) {
      containerRef.value.removeChild(canvas)
    }
    const callIfFn = (obj, key) => {
      const fn = obj && obj[key]
      if (typeof fn === 'function') fn.call(obj)
    }
    callIfFn(programRef.value, 'remove')
    callIfFn(geometryRef.value, 'remove')
    callIfFn(meshRef.value, 'remove')
    callIfFn(rendererRef.value, 'destroy')
    programRef.value = null
    geometryRef.value = null
    meshRef.value = null
    rendererRef.value = null
    uniformsRef.value = null
  }
}

let onPointerMove = null

const initializeWebGL = async () => {
  destroyWebGL()

  if (!containerRef.value) return

  await nextTick()

  if (!containerRef.value) return

  const renderer = new Renderer({
    dpr: props.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
    alpha: true,
    antialias: true
  })
  rendererRef.value = renderer

  const gl = renderer.gl
  const canvas = gl.canvas
  gl.clearColor(0, 0, 0, 0)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'
  containerRef.value.appendChild(canvas)

  const { arr, count, avg } = prepColors(props.colors)

  const uniforms = {
    iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
    iMouse: { value: [0, 0] },
    iTime: { value: 0 },
    uColor0: { value: arr[0] },
    uColor1: { value: arr[1] },
    uColor2: { value: arr[2] },
    uColor3: { value: arr[3] },
    uColor4: { value: arr[4] },
    uColor5: { value: arr[5] },
    uColor6: { value: arr[6] },
    uColor7: { value: arr[7] },
    uColorCount: { value: count },
    uMouseColor: { value: avg },
    uFlow: { value: flowVec(props.flowDirection) },
    uSpeed: { value: props.speed },
    uScale: { value: props.scale },
    uTurbulence: { value: props.turbulence },
    uFluidity: { value: props.fluidity },
    uRimWidth: { value: props.rimWidth },
    uSharpness: { value: props.sharpness },
    uShimmer: { value: props.shimmer },
    uGlow: { value: props.glow },
    uOpacity: { value: props.opacity },
    uMouseEnabled: { value: props.mouseInteraction ? 1 : 0 },
    uMouseStrength: { value: props.mouseStrength },
    uMouseRadius: { value: props.mouseRadius }
  }
  uniformsRef.value = uniforms

  const program = new Program(gl, { vertex, fragment, uniforms })
  programRef.value = program

  const geometry = new Triangle(gl)
  geometryRef.value = geometry
  const mesh = new Mesh(gl, { geometry, program })
  meshRef.value = mesh

  const resize = () => {
    if (!containerRef.value || !rendererRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    rendererRef.value.setSize(rect.width, rect.height)
    if (uniformsRef.value) {
      uniformsRef.value.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
    }
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(containerRef.value)
  roRef.value = ro

  onPointerMove = (e) => {
    if (!rendererRef.value) return
    const rect = canvas.getBoundingClientRect()
    const sc = rendererRef.value.dpr || 1
    const x = (e.clientX - rect.left) * sc
    const y = (rect.height - (e.clientY - rect.top)) * sc
    mouseTargetRef.value = [x, y]
    if (props.mouseDampening <= 0 && uniformsRef.value) {
      uniformsRef.value.iMouse.value = [x, y]
    }
  }

  if (props.mouseInteraction) {
    canvas.addEventListener('pointermove', onPointerMove)
  }

  const loop = (t) => {
    rafRef.value = requestAnimationFrame(loop)
    if (!programRef.value || !meshRef.value || !uniformsRef.value || !rendererRef.value) return

    uniformsRef.value.iTime.value = t * 0.001

    if (props.mouseDampening > 0) {
      if (!lastTimeRef.value) lastTimeRef.value = t
      const dt = (t - lastTimeRef.value) / 1000
      lastTimeRef.value = t
      const tau = Math.max(1e-4, props.mouseDampening)
      let factor = 1 - Math.exp(-dt / tau)
      if (factor > 1) factor = 1
      const target = mouseTargetRef.value
      const cur = uniformsRef.value.iMouse.value
      cur[0] += (target[0] - cur[0]) * factor
      cur[1] += (target[1] - cur[1]) * factor
    } else {
      lastTimeRef.value = t
    }

    if (!props.paused) {
      try {
        rendererRef.value.render({ scene: meshRef.value })
      } catch (e) {
        console.error(e)
      }
    }
  }

  rafRef.value = requestAnimationFrame(loop)
}

onMounted(() => {
  initializeWebGL()
})

onUnmounted(() => {
  destroyWebGL()
})

watch(() => props.colors, () => {
  initializeWebGL()
}, { deep: true })
</script>

<template>
  <div
    ref="containerRef"
    class="ferrofluid-container"
    :class="className"
    :style="{ mixBlendMode: mixBlendMode || '', width: '100%', height: '100%' }"
  />
</template>

<style scoped>
.ferrofluid-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>