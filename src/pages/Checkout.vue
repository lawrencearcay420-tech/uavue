<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { useUIStore } from '@/stores/ui'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import ShippingForm from '@/components/checkout/ShippingForm.vue'
import PaymentForm from '@/components/checkout/PaymentForm.vue'
import OrderSummary from '@/components/checkout/OrderSummary.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const productsStore = useProductsStore()
const uiStore = useUIStore()

const step = ref(1)
const shippingInfo = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Philippines',
  useAsBilling: true,
  saveAddress: false
})
const paymentMethod = ref('gcash')
const addresses = ref([])
const isSubmitting = ref(false)

function nextStep() {
  step.value = Math.min(4, step.value + 1)
}

function prevStep() {
  step.value = Math.max(1, step.value - 1)
}

function handleCheckout() {
  if (isSubmitting.value) return

  if (!authStore.isLoggedIn) {
    uiStore.showToast('Please sign in before placing your order.', 'info')
    router.push({ name: 'Login', query: { redirect: '/checkout' } })
    return
  }

  if (cartStore.isEmpty) {
    uiStore.showToast('Your cart is empty. Add a product before placing your order.', 'error')
    router.push('/shop')
    return
  }

  if (cartStore.selectedItems.length === 0) {
    uiStore.showToast('Select at least one item in your cart before placing your order.', 'info')
    return
  }

  const errors = cartStore.validateStock()
  if (errors.length > 0) {
    errors.forEach(error => uiStore.showToast(error, 'error'))
    return
  }

  const requiredShippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country']
  const shippingIsIncomplete = requiredShippingFields.some(field => !String(shippingInfo.value[field] || '').trim())
  const emailIsInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.value.email.trim())
  if (shippingIsIncomplete || emailIsInvalid) {
    uiStore.showToast(
      emailIsInvalid
        ? 'Enter a valid email address before placing your order.'
        : 'Complete all required shipping information before placing your order.',
      'error'
    )
    step.value = 1
    return
  }

  isSubmitting.value = true
  const orderItems = cartStore.selectedItems.map(item => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    image: item.image
  }))

  const inventoryResult = productsStore.deductInventoryForItems(orderItems)
  if (!inventoryResult.success) {
    isSubmitting.value = false
    const message = inventoryResult.reason === 'persistence'
      ? 'Could not update stock. Please try again.'
      : 'Some items are no longer available in the selected quantities. Please review your cart.'
    uiStore.showToast(message, 'error', 5000)
    return
  }

  const order = ordersStore.createOrder({
    items: orderItems,
    subtotal: cartStore.subtotal,
    shipping: cartStore.shipping,
    discount: cartStore.discount,
    tax: cartStore.tax,
    total: cartStore.total,
    shippingInfo: { ...shippingInfo.value },
    paymentMethod: paymentMethod.value
  })

  if (!order) {
    const restoreResult = productsStore.restoreInventoryForItems(orderItems)
    isSubmitting.value = false
    if (!restoreResult.success) {
      uiStore.showToast('Could not save the order and stock could not be restored. Please contact the store administrator.', 'error', 7000)
      return
    }
    uiStore.showToast('Could not save your order. Stock was restored; please try again.', 'error', 5000)
    return
  }

  cartStore.clearSelectedItems()
  router.push({ name: 'OrderSuccess', query: { orderId: order.id } })
}

function isStepValid(stepNum) {
  switch (stepNum) {
    case 1:
      return ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country']
        .every(field => String(shippingInfo.value[field] || '').trim()) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.value.email.trim())
    default:
      return true
  }
}

function handleFormSubmit() {
  if (step.value < 4) {
    nextStep()
    return
  }
  handleCheckout()
}

function handleNavClick() {
  if (authStore.isLoggedIn) {
    router.push('/account')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="checkout-page">
    <CheckoutSteps :step="step" />

    <div class="checkout-layout">
      <div class="checkout-form-section">
        <form @submit.prevent="handleFormSubmit">
          <div v-show="step === 1">
            <ShippingForm v-model="shippingInfo" :addresses="addresses" />
          </div>

          <div v-show="step === 2">
            <PaymentForm v-model:payment-method="paymentMethod" />
          </div>

          <div v-show="step === 3">
            <OrderSummary />
          </div>

          <div v-show="step === 4" class="review-section">
            <h3 class="review-title">Review Your Order</h3>
            <div class="review-summary">
              <p><strong>Shipping to:</strong> {{ shippingInfo.fullName }}, {{ shippingInfo.address }}</p>
              <p><strong>Payment Method:</strong> {{ paymentMethod }}</p>
            </div>
            <OrderSummary />
          </div>

          <div class="checkout-actions">
            <button v-if="step > 1" type="button" class="back-button" @click="prevStep">
              Back
            </button>
            <button type="submit" class="next-button" :disabled="!isStepValid(step) || isSubmitting">
              {{ isSubmitting ? 'Placing Order…' : step === 4 ? 'Place Order' : 'Continue' }}
            </button>
          </div>
        </form>
      </div>

      <aside class="checkout-sidebar" v-show="step !== 3">
        <OrderSummary />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  width: min(100%, 1160px);
  margin: 0 auto;
  padding: 24px 32px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 36px;
}

.checkout-form-section {
  flex: 1;
}

.checkout-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.back-button, .next-button {
  height: 42px;
  padding: 0 24px;
  border: 1px solid var(--line);
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button {
  background: transparent;
  color: var(--ink);
}

.back-button:hover {
  background: var(--bg-tertiary);
  border-color: var(--ink);
}

.next-button {
  background: var(--ink);
  color: var(--text-inverse);
}

.next-button:hover:not(:disabled) {
  opacity: 0.8;
}

.next-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.review-section,
.review-summary {
  margin-bottom: 24px;
}

.review-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--ink);
}

.review-summary p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--muted);
}

.checkout-sidebar {
  position: sticky;
  top: 80px;
  height: min-content;
}

@media (max-width: 800px) {
  .checkout-page {
    padding: 20px 5%;
  }

  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .checkout-sidebar {
    position: static;
  }
}
</style>
