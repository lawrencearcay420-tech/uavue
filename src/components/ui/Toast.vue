<script setup>
const props = defineProps({
  toast: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.message && ['success', 'error', 'warning', 'info'].includes(value.type)
    }
  }
})

const emit = defineEmits(['dismiss'])

const iconMap = {
  success: '✓',
  error: '×',
  warning: '!',
  info: 'i'
}

setTimeout(() => {
  emit('dismiss', props.toast.id)
}, props.toast.duration || 3000)
</script>

<template>
  <div class="toast" :class="`toast--${toast.type}`" role="status">
    <span class="toast-icon">{{ iconMap[toast.type] }}</span>
    <span class="toast-message">{{ toast.message }}</span>
    <button class="toast-dismiss" @click="$emit('dismiss', toast.id)" aria-label="Close">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: toast-in 0.3s ease both;
  min-width: min(90%, 320px);
}

.toast--success {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: #22c55e;
}

.toast--error {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: #ef4444;
}

.toast--warning {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: #f59e0b;
}

.toast--info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: #3b82f6;
}

.toast-icon {
  font-size: 16px;
  font-weight: 700;
}

.toast-message {
  flex: 1;
}

.toast-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.toast-dismiss:hover {
  opacity: 1;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>