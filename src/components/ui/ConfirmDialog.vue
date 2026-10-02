<script setup>
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  message: { type: String, default: 'Are you sure?' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' }
})

const uiStore = useUIStore()

function handleConfirm() {
  uiStore.showConfirm = false
  uiStore.confirmData.resolver(true)
}

function handleCancel() {
  uiStore.showConfirm = false
  uiStore.confirmData.resolver(false)
}
</script>

<template>
  <div class="confirm-dialog-backdrop" @click="handleCancel">
    <div class="confirm-dialog" @click.stop role="dialog" aria-modal="true">
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn btn--secondary" @click="handleCancel">{{ cancelLabel }}</button>
        <button class="btn btn--primary" @click="handleConfirm">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: var(--modal-overlay);
  backdrop-filter: blur(8px);
}

.confirm-dialog {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 32px;
  min-width: min(90vw, 400px);
  text-align: center;
}

.confirm-message {
  margin: 0 0 24px;
  font-size: 15px;
  color: var(--ink);
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--ink);
  color: var(--text-inverse);
}

.btn--primary:hover {
  opacity: 0.8;
}

.btn--secondary {
  background: transparent;
  color: var(--ink);
}

.btn--secondary:hover {
  background: var(--bg-tertiary);
}
</style>