<script setup>
import { reactive, watch } from 'vue'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  addresses: { type: Array, default: () => [] },
  isBillingSame: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'update:addresses'])
const uiStore = useUIStore()

const form = reactive({
  fullName: props.modelValue.fullName || '',
  email: props.modelValue.email || '',
  phone: props.modelValue.phone || '',
  address: props.modelValue.address || '',
  city: props.modelValue.city || '',
  state: props.modelValue.state || '',
  zipCode: props.modelValue.zipCode || '',
  country: props.modelValue.country || 'Philippines',
  useAsBilling: props.modelValue.useAsBilling !== undefined ? props.modelValue.useAsBilling : true,
  saveAddress: false
})

watch(form, () => {
  emit('update:modelValue', { ...form })
})

const newAddressForm = reactive({
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Philippines',
  phone: ''
})

function addAddress() {
  if (!newAddressForm.fullName || !newAddressForm.address) return
  emit('update:addresses', [...props.addresses, { ...newAddressForm, id: Date.now() }])
  uiStore.showToast('Address saved', 'success')
}
</script>

<template>
  <div class="shipping-form">
    <h3 class="form-section-title">Shipping Information</h3>

    <div class="form-row">
      <div class="form-group">
        <label>Full Name *</label>
        <input v-model="form.fullName" type="text" placeholder="Juan Dela Cruz" required />
      </div>
      <div class="form-group">
        <label>Phone Number *</label>
        <input v-model="form.phone" type="tel" placeholder="+63 912 345 6789" required />
      </div>
    </div>

    <div class="form-group">
      <label>Email Address *</label>
      <input v-model="form.email" type="email" placeholder="your@email.com" required />
    </div>

    <div class="form-group">
      <label>Street Address *</label>
      <input v-model="form.address" type="text" placeholder="Building, street, unit, etc." required />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>City *</label>
        <input v-model="form.city" type="text" required />
      </div>
      <div class="form-group">
        <label>Province / State *</label>
        <input v-model="form.state" type="text" required />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>ZIP / Postal Code *</label>
        <input v-model="form.zipCode" type="text" required />
      </div>
      <div class="form-group">
        <label>Country *</label>
        <input v-model="form.country" type="text" required />
      </div>
    </div>

    <label class="checkbox-row">
      <input type="checkbox" v-model="form.useAsBilling" />
      <span>Use as billing address</span>
    </label>

    <label class="checkbox-row">
      <input type="checkbox" v-model="form.saveAddress" />
      <span>Save this address for future orders</span>
    </label>
  </div>
</template>

<style scoped>
.form-section-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 20px;
  color: var(--ink);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.form-group input,
.form-group select {
  height: 40px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 12px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--ink);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 12px;
  color: var(--muted);
}

.checkbox-row input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>