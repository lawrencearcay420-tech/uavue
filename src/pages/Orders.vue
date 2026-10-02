<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const lookupOrderNumber = ref(queryValue(route.query.orderNumber))
const lookupEmail = ref('')
const lookupError = ref('')

onMounted(() => {
  ordersStore.refreshOrders()
  if (authStore.isLoggedIn) {
    orders.value = ordersStore.userOrders
  }
  loading.value = false
})

function lookupGuestOrder() {
  lookupError.value = ''
  ordersStore.refreshOrders()

  const orderNumber = lookupOrderNumber.value.trim().toLowerCase()
  const email = lookupEmail.value.trim().toLowerCase()
  const order = ordersStore.allOrders.find(candidate => {
    const candidateEmail = String(
      candidate.customer?.email || candidate.shippingInfo?.email || ''
    ).trim().toLowerCase()
    const candidateNumber = String(candidate.orderNumber || '').trim().toLowerCase()
    return !candidate.userId && candidateNumber === orderNumber && candidateEmail === email
  })

  if (!order) {
    orders.value = []
    lookupError.value = 'We could not find a guest order with those details. Check your order number and checkout email.'
    return
  }

  orders.value = [order]
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price)
}

function getStatusColor(status) {
  const map = {
    pending: 'status--pending',
    processing: 'status--processing',
    shipped: 'status--shipped',
    delivered: 'status--delivered',
    cancelled: 'status--cancelled'
  }
  return map[status] || 'status--pending'
}

function queryValue(value) {
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}
</script>

<template>
  <div class="orders-page">
    <div class="orders-header">
      <h1 class="page-title">{{ authStore.isLoggedIn ? 'Order History' : 'Track Your Guest Order' }}</h1>
      <p class="page-subtitle">
        {{ authStore.isLoggedIn ? 'View and track your orders' : 'Enter your order number and checkout email to view your order status.' }}
      </p>
    </div>

    <div v-if="loading" class="orders-loading">
      <p>Loading orders...</p>
    </div>

    <form v-else-if="!authStore.isLoggedIn" class="guest-order-lookup" @submit.prevent="lookupGuestOrder">
      <div class="lookup-fields">
        <label>
          Order number
          <input v-model="lookupOrderNumber" type="text" placeholder="UA-2026-0001" required />
        </label>
        <label>
          Checkout email
          <input v-model="lookupEmail" type="email" placeholder="you@example.com" required />
        </label>
        <button class="view-order-btn lookup-button" type="submit">Find order</button>
      </div>
      <p v-if="lookupError" class="lookup-error" role="alert">{{ lookupError }}</p>
    </form>

    <div v-if="!loading && orders.length === 0 && authStore.isLoggedIn" class="orders-empty">
      <div class="empty-icon">📦</div>
      <h3>No Orders Yet</h3>
      <p>You haven't placed any orders yet.</p>
      <button class="shop-link" @click="router.push('/shop')">
        Start Shopping
      </button>
    </div>

    <div v-if="!loading && orders.length > 0" class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">#{{ order.orderNumber || order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span class="order-status" :class="getStatusColor(order.status)">
            {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
          </span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.productId" class="order-item">
            <img :src="item.image" :alt="item.name" class="order-item-image" />
            <div class="order-item-info">
              <span class="order-item-name">{{ item.name }}</span>
              <span class="order-item-meta">Size: {{ item.size }} · Qty: {{ item.quantity }}</span>
              <span class="order-item-price">{{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span class="order-total">Total: {{ formatPrice(order.total) }}</span>
          <button class="view-order-btn" @click="router.push({ name: 'OrderSuccess', query: { orderId: order.id } })">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 32px 28px 48px;
}

.orders-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.page-title {
  font-family: var(--serif);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.orders-loading,
.orders-empty {
  text-align: center;
  padding: 64px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.orders-empty h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--ink);
}

.shop-link {
  margin-top: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.guest-order-lookup {
  max-width: 680px;
  margin: 0 auto 24px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
}

.lookup-fields {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 12px;
}

.lookup-fields label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.lookup-fields input {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 12px;
  text-transform: none;
}

.lookup-button {
  height: 38px;
  white-space: nowrap;
}

.lookup-error {
  margin: 12px 0 0;
  color: var(--red);
  font-size: 12px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  border-color: var(--line);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-id {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--ink);
}

.order-date {
  font-size: 11px;
  color: var(--muted);
}

.order-status {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 20px;
}

.status--pending { background: var(--bg-tertiary); color: var(--muted); }
.status--processing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status--shipped { background: rgba(147, 51, 234, 0.1); color: #9333ea; }
.status--delivered { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status--cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.order-items {
  padding: 8px 18px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-image {
  width: 56px;
  height: 68px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.order-item-meta {
  display: block;
  font-size: 11px;
  color: var(--muted);
}

.order-item-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-top: 1px solid var(--border-subtle);
}

.order-total {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.view-order-btn {
  padding: 8px 16px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  border-radius: 4px;
}

.view-order-btn:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

@media (max-width: 640px) {
  .orders-page {
    padding: 24px 5% 36px;
  }

  .order-header,
  .order-footer {
    padding-right: 14px;
    padding-left: 14px;
  }

  .order-items {
    padding-right: 14px;
    padding-left: 14px;
  }

  .order-info {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .lookup-fields {
    grid-template-columns: 1fr;
  }
}
</style>
