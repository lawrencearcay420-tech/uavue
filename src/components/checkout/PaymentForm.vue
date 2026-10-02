<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'gcash' }
})

const emit = defineEmits(['update:modelValue'])

const paymentMethod = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const paymentMethods = [
  { id: 'gcash', name: 'GCash', icon: '📱', description: 'Pay via GCash app' },
  { id: 'credit-card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, JCB' },
  { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank deposit' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive your order' }
]
</script>

<template>
  <div class="payment-form">
    <h3 class="form-section-title">Payment Method</h3>
    <div class="method-options">
      <label v-for="method in paymentMethods" :key="method.id" class="method-option">
        <input type="radio" name="payment-method" :value="method.id" v-model="paymentMethod" />
        <div class="method-details">
          <span class="method-name">{{ method.name }}</span>
          <span class="method-description">{{ method.description }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<style scoped>
.payment-form {
  padding: 12px 0;
}

.form-section-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px;
  color: var(--ink);
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.method-option:hover {
  border-color: var(--ink);
}

.method-option input[type="radio"] {
  margin: 0;
  width: 18px;
  height: 18px;
}

.method-details {
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.method-description {
  font-size: 11px;
  color: var(--muted);
}
</style>
