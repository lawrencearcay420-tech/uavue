<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUIStore } from '@/stores/ui'
import CartItem from './CartItem.vue'
import PromoCode from './PromoCode.vue'

const router = useRouter()
const cartStore = useCartStore()
const uiStore = useUIStore()

const itemCount = computed(() => cartStore.itemCount)
const subtotal = computed(() => cartStore.subtotal)
const total = computed(() => cartStore.total)
const discount = computed(() => cartStore.discount)
const shipping = computed(() => cartStore.shipping)
const tax = computed(() => cartStore.tax)
const isEmpty = computed(() => cartStore.items.length === 0)
const allSelected = computed(() => cartStore.items.every(item => item.selected !== false))

function proceedToCheckout() {
  uiStore.setCartOpen(false)
  router.push('/checkout')
}

function closeDrawer() {
  uiStore.setCartOpen(false)
}

function toggleAllItems() {
  cartStore.setAllItemsSelected(!allSelected.value)
}
</script>

<template>
  <div v-if="uiStore.isCartOpen" class="cart-overlay" @click.self="closeDrawer">
    <div class="cart-drawer" @click.stop>
      <div class="cart-header">
        <h2 class="cart-title">Your Cart ({{ itemCount }})</h2>
        <button class="cart-close" @click="closeDrawer" aria-label="Close cart">×</button>
      </div>

      <div v-if="isEmpty" class="cart-empty">
        <div class="empty-icon">🛍️</div>
        <p class="empty-text">Your cart is empty</p>
        <button class="empty-button" @click="closeDrawer">
          Continue Shopping
        </button>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <button class="select-all-button" @click="toggleAllItems">
            {{ allSelected ? 'Deselect all' : 'Select all' }}
          </button>
          <p class="selection-count">{{ cartStore.selectedItemCount }} item(s) selected for checkout</p>
          <CartItem
            v-for="item in cartStore.items"
            :key="`${item.productId}-${item.size}`"
            :item="item"
          />
        </div>

        <PromoCode />

        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₱{{ subtotal }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>{{ cartStore.shipping > 0 ? '₱' + cartStore.shipping : 'Free' }}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>₱{{ tax }}</span>
          </div>
          <div v-if="discount > 0" class="summary-row">
            <span>Discount</span>
            <span class="discount-value">-₱{{ discount }}</span>
          </div>
          <div class="summary-divider" />
          <div class="summary-total">
            <span>Total</span>
            <span class="total-value">₱{{ total }}</span>
          </div>
        </div>

        <div class="cart-footer">
          <button class="checkout-button" @click="proceedToCheckout" :disabled="cartStore.selectedItemCount === 0">
            <span>Proceed to Checkout</span>
            <span class="button-arrow" aria-hidden="true">→</span>
          </button>
          <button class="continue-button" @click="closeDrawer">
            <span class="button-arrow" aria-hidden="true">←</span>
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--modal-overlay);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  overflow-y: auto;
  backdrop-filter: blur(8px);
}

.cart-drawer {
  width: min(100%, 420px);
  height: 100vh;
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  animation: slide-in 0.3s ease both;
  box-shadow: -12px 0 28px rgba(0, 0, 0, 0.12);
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.cart-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.cart-close {
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

.cart-close:hover {
  color: var(--ink);
  background: var(--bg-tertiary);
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.cart-items {
  flex: 1;
  padding: 20px;
}

.select-all-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}

.selection-count {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--muted);
}

.cart-summary {
  padding: 16px 24px;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: var(--muted);
}

.discount-value {
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
  padding: 12px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.total-value {
  color: var(--ink);
}

.cart-footer {
  display: grid;
  gap: 10px;
  padding: 16px 24px 20px;
}

.checkout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid var(--button-primary-bg);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.checkout-button:hover {
  background: var(--button-primary-hover-bg);
  border-color: var(--button-primary-hover-bg);
  transform: translateY(-1px);
}

.checkout-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.continue-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-secondary-border);
  background: var(--bg-tertiary);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s;
}

.continue-button:hover {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  transform: translateY(-1px);
}

.continue-button span {
  color: inherit;
  font-size: inherit;
}

.button-arrow {
  font-size: 15px;
  line-height: 1;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--muted);
}

.empty-button {
  padding: 10px 24px;
  border: 1px solid var(--button-secondary-border);
  background: var(--bg-tertiary);
  color: var(--ink);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.empty-button:hover {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  transform: translateY(-1px);
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@media (max-width: 768px) {
  .cart-drawer {
    width: 100%;
    max-width: 500px;
  }
}
</style>
