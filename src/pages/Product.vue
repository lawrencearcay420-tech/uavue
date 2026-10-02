<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import ProductGallery from '@/components/product/ProductGallery.vue'
import SizeSelector from '@/components/product/SizeSelector.vue'
import ProductReviews from '@/components/product/ProductReviews.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const selectedSize = ref(null)
const quantity = ref(1)

const product = computed(() => {
  const id = parseInt(route.params.id) || route.params.id
  return productsStore.getProductById(id) || null
})

watch(
  product,
  (value) => {
    if (value && value.sizes?.length) {
      selectedSize.value = value.sizes.find(size => (value.inventory?.[size] ?? 0) > 0) || value.sizes[0]
    } else {
      selectedSize.value = null
    }
    quantity.value = 1
  },
  { immediate: true }
)

const discount = computed(() => {
  if (product.value && product.value.compareAtPrice > product.value.price) {
    return Math.round(((product.value.compareAtPrice - product.value.price) / product.value.compareAtPrice) * 100)
  }
  return 0
})

const availableQuantity = computed(() => {
  const stock = product.value?.inventory?.[selectedSize.value] ?? 0
  return Math.min(stock, 10)
})

const thumbnailSizes = computed(() => {
  if (!product.value) return []
  return product.value.sizes.map(size => {
    const stock = product.value.inventory?.[size] ?? 0
    return { size, stock, inStock: stock > 0 }
  })
})

function handleSizeUpdate(size) {
  selectedSize.value = size
  quantity.value = 1
}

function updateQuantity(change) {
  const newQty = quantity.value + change
  if (newQty >= 1 && newQty <= availableQuantity.value) {
    quantity.value = newQty
  }
}

function addToCart() {
  const chosenSize = selectedSize.value || product.value?.sizes?.[0] || 'OS'
  selectedSize.value = chosenSize
  cartStore.addItem(product.value, chosenSize, quantity.value)
  quantity.value = 1
}

function buyNow() {
  addToCart()
  router.push('/checkout')
}

function goBack() {
  router.go(-1)
}

const showShare = ref(false)

function shareProduct() {
  if (navigator.share) {
    navigator.share({
      title: product.value?.name,
      url: window.location.href
    })
  } else {
    showShare.value = true
    setTimeout(() => { showShare.value = false }, 2000)
  }
}
</script>

<template>
  <div>
    <LoadingState v-if="!product" :count="1" type="hero" />

    <div v-else-if="product" class="product-details-page">
      <button class="back-button" @click="goBack">← Back to shop</button>
      <div class="product-details-grid">
        <ProductGallery :product="product" />

        <div class="product-details-info">
          <p class="product-category">{{ product.category }}</p>
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-price-section">
            <div class="price-block">
              <span class="price-current large">₱{{ product.price }}</span>
              <span v-if="discount > 0" class="price-compare">₱{{ product.compareAtPrice }}</span>
              <span v-if="discount > 0" class="discount-badge">{{ discount }}% off</span>
            </div>
            <div v-if="product.rating" class="product-rating">
              ★ {{ product.rating.toFixed(1) }} ({{ product.reviewCount }} reviews)
            </div>
          </div>

          <SizeSelector
            :sizes="thumbnailSizes"
            v-model:selected="selectedSize"
            :disabled="!availableQuantity"
          />

          <div class="product-actions">
            <div class="quantity-selector">
              <button class="qty-button" @click="updateQuantity(-1)" :disabled="quantity <= 1" aria-label="Decrease">−</button>
              <input type="number" v-model.number="quantity" min="1" :max="availableQuantity" readonly />
              <button class="qty-button" @click="updateQuantity(1)" :disabled="quantity >= availableQuantity" aria-label="Increase">+</button>
            </div>
            <button class="add-to-cart-btn" @click="addToCart" :disabled="!availableQuantity">
              Add to Cart
            </button>
            <button class="buy-now-btn" @click="buyNow" :disabled="!availableQuantity">
              Buy Now
            </button>
          </div>

          <div class="product-extra">
            <p><strong>Material:</strong> {{ product.material }}</p>
            <p><strong>Care:</strong> {{ product.care }}</p>
            <button v-if="product.sku" class="sku-text">SKU: {{ product.sku }}</button>
          </div>
        </div>
      </div>

      <ProductReviews :product="product" />
    </div>
  </div>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 20px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 4px;
}

.back-button:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.product-details-page {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 7.1%;
}

.product-details-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  align-items: start;
  gap: 40px;
  margin-bottom: 48px;
}

.product-category {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
}

.product-title {
  margin: 0 0 16px;
  font-family: var(--serif);
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 500;
  color: var(--ink);
}

.product-description {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.product-price-section {
  margin-bottom: 24px;
}

.price-block {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.price-current.large {
  font-size: 26px;
  font-weight: 700;
  color: var(--ink);
}

.price-compare {
  font-size: 15px;
  color: var(--muted);
  text-decoration: line-through;
}

.discount-badge {
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 700;
  background: var(--red);
  color: var(--text-inverse);
  border-radius: 4px;
}

.product-rating {
  font-size: 13px;
  color: var(--muted);
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
}

.qty-button {
  width: 40px;
  height: 100%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--ink);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-button:hover {
  background: var(--border-color);
}

.qty-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 44px;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  color: var(--ink);
}

.add-to-cart-btn {
  flex: 1;
  height: 44px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  opacity: 0.8;
}

.buy-now-btn {
  flex: 1;
  height: 44px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.2s;
}

.buy-now-btn:hover {
  border-color: var(--ink);
}

.product-extra {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.product-extra p {
  margin: 4px 0;
  font-size: 12px;
  color: var(--muted);
}

.sku-text {
  margin-top: 8px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 11px;
  color: var(--muted);
  cursor: text;
}

@media (max-width: 768px) {
  .product-details-page {
    padding: 20px 5%;
  }

  .product-details-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 480px) {
  .product-actions {
    flex-direction: column;
    gap: 8px;
  }
  .quantity-selector { width: 100%; }
  .add-to-cart-btn, .buy-now-btn { flex: none; width: 100%; }
}
</style>