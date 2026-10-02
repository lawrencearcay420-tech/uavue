<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const ordersStore = useOrdersStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const orderId = router.currentRoute.value.query.orderId
const order = ref(null)

onMounted(() => {
  if (orderId) {
    order.value = ordersStore.getOrderById(orderId)
  }
})

function continueShopping() {
  router.push('/')
}

function refreshOrderStatus() {
  ordersStore.refreshOrders()
  order.value = ordersStore.getOrderById(orderId)
}

function getStatusLabel(status) {
  const labels = {
    processing: 'Awaiting admin confirmation',
    confirmed: 'Accepted by the store',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[String(status || '').toLowerCase()] || 'Status unavailable'
}

function getStatusClass(status) {
  return `order-status--${String(status || 'unknown').toLowerCase()}`
}
</script>

<template>
  <div class="order-success">
    <div class="success-content">
      <div class="success-icon">✓</div>
      <h1 class="success-title">Thank you for your order!</h1>
      <p class="success-message">
        Your order has been placed successfully.
      </p>
      <div v-if="order" class="order-details">
        <p><strong>Order number:</strong> {{ order.orderNumber || order.id }}</p>
        <p class="order-status-row">
          <strong>Order status:</strong>
          <span class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusLabel(order.status) }}
          </span>
        </p>
        <p><strong>Total:</strong> ₱{{ order.total }}</p>
        <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
        <button class="refresh-status" type="button" @click="refreshOrderStatus">
          Refresh order status
        </button>
      </div>
      <div class="success-actions">
        <button class="btn btn--primary" @click="continueShopping">
          Continue Shopping
        </button>
        <button v-if="authStore.isLoggedIn" class="btn btn--secondary" @click="router.push('/orders')">
          View Order History
        </button>
        <button
          v-else-if="order"
          class="btn btn--secondary"
          @click="router.push({ name: 'Orders', query: { orderNumber: order.orderNumber } })"
        >
          Track This Order
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-success {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.success-content {
  animation: fade-in 0.6s ease both;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: var(--red);
  color: var(--text-inverse);
  font-size: 32px;
  font-weight: 700;
}

.success-title {
  font-family: var(--serif);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--ink);
}

.success-message {
  margin: 0 0 32px;
  font-size: 15px;
  color: var(--muted);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.order-details {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
  text-align: left;
  max-width: 480px;
  margin: 0 auto;
}

.order-details p {
  margin: 6px 0;
  font-size: 13px;
}

.order-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.order-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.order-status--confirmed,
.order-status--delivered {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.order-status--processing,
.order-status--shipped {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.order-status--cancelled {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.refresh-status {
  margin-top: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  height: 44px;
  padding: 0 28px;
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
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .success-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
