<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const cartStore = useCartStore()

const subtotal = computed(() => cartStore.subtotal)
const shipping = computed(() => cartStore.shipping)
const tax = computed(() => cartStore.tax)
const discount = computed(() => cartStore.discount)
const total = computed(() => cartStore.total)

function goBack() {
  uiStore.closeAllOverlays()
}

function back() {
  uiStore.checkoutStep = Math.max(1, uiStore.checkoutStep - 1)
}

function next() {
  uiStore.checkoutStep = Math.min(4, uiStore.checkoutStep + 1)
}
</script>

<template>
  <div class="order-summary">
    <h3 class="summary-title">Order Summary</h3>

    <div class="summary-items">
      <div v-for="item in cartStore.selectedItems" :key="`${item.productId}-${item.size}`" class="summary-item">
        <div class="item-image">
          <img :src="item.image" :alt="item.name" />
          <span class="item-qty">×{{ item.quantity }}</span>
        </div>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-price">₱{{ item.price }}</div>
      </div>
    </div>

    <div class="summary-totals">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₱{{ subtotal }}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>{{ shipping > 0 ? '₱' + shipping : 'Free' }}</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>₱{{ tax }}</span>
      </div>
      <div v-if="discount > 0" class="summary-row discount-row">
        <span>Discount</span>
        <span class="discount-value">-₱{{ discount }}</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-total">
        <span>Total</span>
        <strong>₱{{ total }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 20px;
  color: var(--ink);
}

.summary-items {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.summary-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.item-image {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-qty {
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 10px;
}

.item-name {
  flex: 1;
  font-size: 13px;
  color: var(--muted);
}

.item-price {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.summary-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 12px 0;
}

.summary-totals .summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: var(--muted);
}

.discount-row .discount-value {
  color: var(--red);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  margin-top: 12px;
  color: var(--ink);
}

@media (max-width: 480px) {
  .summary-item {
    gap: 8px;
  }
  .item-image {
    width: 48px;
    height: 48px;
  }
}
</style>