<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { validatePromoCode, applyPromoCode } from '@/data/promotions'
import { useUIStore } from '@/stores/ui'

const cartStore = useCartStore()
const uiStore = useUIStore()

const code = ref('')
const isApplying = ref(false)

const currentPromo = computed(() => cartStore.appliedPromo)
const discountAmount = computed(() => cartStore.discount)

function applyCode() {
  if (!code.value.trim()) return

  isApplying.value = true

  try {
    const validation = validatePromoCode(code.value, cartStore.total)
    if (!validation.valid) {
      uiStore.showToast(validation.error || 'Invalid promo code', 'error')
      return
    }

    cartStore.applyPromo(code.value)
    uiStore.showToast(`Promo code "${code.value}" applied`, 'success')
  } catch (e) {
    uiStore.showToast('Failed to apply promo code', 'error')
  } finally {
    isApplying.value = false
  }
}

function removePromo() {
  cartStore.removePromo()
  code.value = ''
  uiStore.showToast('Promo code removed', 'info')
}

function formatDiscount(amount) {
  if (!amount || amount <= 0) return ''
  return `(${discountAmount.value}% off)`
}
</script>

<template>
  <div class="promo-section">
    <div v-if="currentPromo" class="promo-applied">
      <span class="promo-code">{{ currentPromo.code }}</span>
      <span class="promo-discount">{{ formatDiscount(null) }}</span>
      <button class="remove-promo" @click="removePromo" aria-label="Remove promo">
        ×
      </button>
    </div>
    <div v-else class="promo-form">
      <input
        v-model="code"
        type="text"
        placeholder="Enter promo code"
        class="promo-input"
        :disabled="isApplying"
      />
      <button
        class="promo-button"
        @click="applyCode"
        :disabled="isApplying || !code.trim()"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<style scoped>
.promo-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.promo-form {
  display: flex;
  gap: 8px;
}

.promo-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.2s;
}

.promo-input:focus {
  outline: none;
  border-color: var(--ink);
}

.promo-button {
  padding: 0 20px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
}

.promo-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.promo-button:not(:disabled):hover {
  opacity: 0.8;
}

.promo-applied {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--ink);
}

.promo-code {
  font-weight: 700;
  font-size: 13px;
}

.promo-discount {
  margin-left: auto;
  font-size: 12px;
  color: var(--red);
}

.remove-promo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
}

.remove-promo:hover {
  color: var(--ink);
}
</style>