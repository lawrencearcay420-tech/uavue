<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: { type: String, default: 'Free shipping on orders over ₱2,000' },
  dismissible: { type: Boolean, default: true }
})

const emit = defineEmits(['dismiss'])
const visible = ref(true)

function dismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <div v-if="visible" class="announcement-bar" role="status" aria-live="polite">
    <div class="announcement-content">
      <span class="announcement-icon">✦</span>
      <span class="announcement-text">{{ message }}</span>
    </div>
    <button v-if="dismissible" class="announcement-dismiss" @click="dismiss" aria-label="Dismiss announcement">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.announcement-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 20px;
  background: var(--announcement-bg);
  color: var(--announcement-text);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}

.announcement-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.announcement-icon {
  opacity: 0.7;
}

.announcement-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--announcement-text);
  opacity: 0.6;
  cursor: pointer;
  border-radius: 4px;
  transition: opacity 0.2s, background 0.2s;
}

.announcement-dismiss:hover {
  opacity: 1;
  background: rgba(255,255,255,0.1);
}

.dark .announcement-dismiss:hover {
  background: rgba(0,0,0,0.2);
}

@media (max-width: 480px) {
  .announcement-bar {
    padding: 8px 12px;
    font-size: 11px;
  }
}
</style>