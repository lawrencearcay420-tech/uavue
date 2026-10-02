<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  compact: { type: Boolean, default: false }
})

const cartStore = useCartStore()

const subtotal = computed(() => cartStore.subtotal)
const total = computed(() => cartStore.total)
const discount = computed(() => cartStore.discount)
const shipping = computed(() => cartStore.shipping)
const tax = computed(() => cartStore.tax)
const itemCount = computed(() => cartStore.itemCount)
const isEmpty = computed(() => cartStore.items.length === 0)

function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price)
}
</script>

<template>
  <div class="cart-summary">
    <div class="summary-row">
      <span>Subtotal</span>
      <span>{{ formatPrice(subtotal) }}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>{{ shipping > 0 ? formatPrice(shipping) : 'Free' }}</span>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <span>{{ formatPrice(tax) }}</span>
    </div>
    <div v-if="discount > 0" class="summary-row discount">
      <span>Discount</span>
      <span>-{{ formatPrice(discount) }}</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-total">
      <span>Total</span>
      <strong>{{ formatPrice(total) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.cart-summary {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: var(--muted);
}

.summary-row.discount strong {
  color: var(--red);
}

.summary-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 12px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

@media (max-width: 480px) {
  .cart-summary {
    padding: 16px;
  }
}
</style>