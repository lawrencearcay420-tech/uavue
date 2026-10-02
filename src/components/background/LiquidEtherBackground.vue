<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  speed: { type: Number, default: 0.25 },
  autoSpeed: { type: Number, default: 0.25 },
  autoIntensity: { type: Number, default: 1.0 },
  mouseForce: { type: Number, default: 1.0 },
  mouseRadius: { type: Number, default: 0.5 },
  colors: { type: Array, default: () => [] },
  opacity: { type: Number, default: 1 },
  quality: { type: String, default: 'auto' },
  interactive: { type: Boolean, default: true },
  className: { type: String, default: '' }
})

const containerRef = ref(null)
const themeColors = ref([])

const lightColors = [
  '#f5f1e8',
  '#e4d7c6',
  '#d9c8b5',
  '#b9b1a0',
  '#ffffff'
]

const darkColors = [
  '#0b0d10',
  '#1a1d24',
  '#2a2f3a',
  '#3e4757',
  '#516176'
]

const resolveColors = () => {
  if (props.colors.length > 0) {
    return props.colors
  }

  return document.documentElement.classList.contains('dark') ? darkColors : lightColors
}

const updateThemeColors = () => {
  const palette = resolveColors()
  themeColors.value = palette.slice(0, 5)
}

onMounted(() => {
  updateThemeColors()
  const observer = new MutationObserver(() => updateThemeColors())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onUnmounted(() => observer.disconnect())
})

watch(() => props.colors, () => updateThemeColors(), { deep: true })

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const motionEnabled = () => !prefersReducedMotion.matches

const containerStyle = () => ({
  '--liquid-a': themeColors.value[0] || '#f5f1e8',
  '--liquid-b': themeColors.value[1] || '#e4d7c6',
  '--liquid-c': themeColors.value[2] || '#d9c8b5',
  '--liquid-d': themeColors.value[3] || '#b9b1a0',
  '--liquid-e': themeColors.value[4] || '#ffffff',
  '--speed': `${Math.max(8, 22 - props.speed * 20)}s`,
  opacity: props.opacity
})
</script>

<template>
  <div
    ref="containerRef"
    class="liquid-ether-container"
    :class="[className, { 'reduced-motion': !motionEnabled() }]"
    :style="containerStyle()"
  >
    <span class="orb orb-1" />
    <span class="orb orb-2" />
    <span class="orb orb-3" />
    <span class="orb orb-4" />
  </div>
</template>

<style scoped>
.liquid-ether-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.75), transparent 35%),
              radial-gradient(circle at bottom right, rgba(255,255,255,0.4), transparent 30%),
              linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(42px);
  opacity: 0.75;
  animation: orbit var(--speed, 16s) ease-in-out infinite alternate;
}

.orb-1 {
  width: 38vw;
  height: 38vw;
  left: 5%;
  top: 12%;
  background: var(--liquid-a);
  animation-duration: calc(var(--speed, 16s) * 1.1);
}

.orb-2 {
  width: 42vw;
  height: 42vw;
  right: 8%;
  top: 10%;
  background: var(--liquid-b);
  animation-duration: calc(var(--speed, 16s) * 1.35);
}

.orb-3 {
  width: 48vw;
  height: 48vw;
  left: 25%;
  bottom: -15%;
  background: var(--liquid-c);
  animation-duration: calc(var(--speed, 16s) * 1.7);
}

.orb-4 {
  width: 28vw;
  height: 28vw;
  right: 20%;
  bottom: 8%;
  background: var(--liquid-d);
  animation-duration: calc(var(--speed, 16s) * 1.2);
}

.reduced-motion .orb {
  animation: none;
}

@keyframes orbit {
  0% {
    transform: translate3d(0, 0, 0) scale(0.95);
  }
  100% {
    transform: translate3d(6vw, -4vh, 0) scale(1.08);
  }
}
</style>