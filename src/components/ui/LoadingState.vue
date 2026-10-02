<script setup>
const props = defineProps({
  size: { type: String, default: 'md' },
  count: { type: Number, default: 6 },
  type: { type: String, default: 'card' }
})
</script>

<template>
  <div class="loading-state" :class="`loading-state--${size}`">
    <div
      v-for="i in count"
      :key="i"
      class="loading-item"
      :class="`loading-item--${type}`"
    >
      <div class="loading-shimmer" />
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  display: grid;
  gap: 24px;
  width: 100%;
}

.loading-state--sm {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.loading-state--md {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.loading-state--lg {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.loading-item {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.loading-item--card {
  aspect-ratio: 0.84;
  padding-bottom: 16px;
}

.loading-item--list {
  height: 80px;
}

.loading-item--hero {
  height: 536px;
}

.loading-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(906px 1fr);
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>