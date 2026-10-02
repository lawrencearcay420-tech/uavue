<script setup>
const props = defineProps({
  title: { type: String, default: 'Nothing here just yet.' },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: 'Add a product' },
  actionIcon: { type: String, default: '↗' },
  icon: { type: String, default: '🛒' }
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-icon">{{ icon }}</div>
    <p class="empty-state-title">{{ title }}</p>
    <p v-if="description" class="empty-state-description">{{ description }}</p>
    <button v-if="actionLabel" type="text" class="empty-state-button" @click="$emit('action')">
      {{ actionLabel }} <span>{{ actionIcon }}</span>
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  gap: 16px;
  text-align: center;
  padding: 48px 24px;
  color: var(--muted);
}

.empty-state-icon {
  font-size: 48px;
  opacity: 0.4;
}

.empty-state-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  color: var(--muted);
}

.empty-state-description {
  margin: 0;
  font-size: 13px;
  max-width: 320px;
}

.empty-state-button {
  padding: 0 0 4px;
  border: 0;
  border-bottom: 1px solid var(--red);
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  color: var(--ink);
  transition: color 0.2s;
}

.empty-state-button:hover {
  color: var(--red);
}

.empty-state-button span {
  color: var(--red);
}
</style>