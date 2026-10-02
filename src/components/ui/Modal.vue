<script setup>
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'md' },
  closable: { type: Boolean, default: true }
})

const uiStore = useUIStore()
</script>

<template>
  <div class="modal-backdrop" @click="uiStore.closeAllOverlays">
    <div
      class="modal"
      :class="[`modal--${size}`]"
      @click.stop
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? 'modal-title' : undefined"
    >
      <div v-if="title" class="modal-header">
        <h2 id="modal-title" class="modal-title">{{ title }}</h2>
        <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
        <button v-if="closable" class="modal-close" @click="uiStore.closeAllOverlays" aria-label="Close">
          ×
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: var(--modal-overlay);
  animation: fade-in 0.18s ease both;
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  animation: modal-in 0.25s ease both;
  max-width: min(100%, 560px);
  width: 100%;
}

.modal--sm { max-width: 400px; }
.modal--md { max-width: 560px; }
.modal--lg { max-width: 720px; }
.modal--xl { max-width: 960px; }

.modal-header {
  padding: 24px 32px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  margin: 0 0 4px;
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
  color: var(--ink);
}

.modal-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  color: var(--ink);
  background: var(--bg-tertiary);
}

.modal-body {
  padding: 24px 32px;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(8px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes drawer-in {
  from { transform: translateX(20px); }
  to { transform: translateX(0); }
}
</style>