<script setup>
const props = defineProps({
  blur: { type: Number, default: 24 },
  opacity: { type: Number, default: 0.72 },
  bordered: { type: Boolean, default: true },
  className: { type: String, default: '' }
})
</script>

<template>
  <div
    class="glass-panel"
    :class="className"
    :style="{
      '--glass-blur': `${props.blur}px`,
      '--glass-opacity': props.opacity
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(var(--glass-blur, 24px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 24px));
}

.dark .glass-panel {
  background: rgba(15, 15, 15, 0.68);
  border-color: rgba(255, 255, 255, 0.08);
}

.glass-panel--solid {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.08);
}

.dark .glass-panel--solid {
  background: rgba(15, 15, 15, 0.9);
}
</style>