<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import SizeSelector from './SizeSelector.vue'

const props = defineProps({
  product: { type: Object, required: true }
})

const uiStore = useUIStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const selectedSize = ref(null)
const quantity = ref(1)

watch(
  () => props.product,
  (product) => {
    selectedSize.value = product.sizes?.find(size => (product.inventory?.[size] ?? 0) > 0) || product.sizes?.[0] || null
    quantity.value = 1
  },
  { immediate: true }
)

const discount = computed(() => {
  if (props.product.compareAtPrice > props.product.price) {
    return Math.round(((props.product.compareAtPrice - props.product.price) / props.product.compareAtPrice) * 100)
  }
  return 0
})

const sizes = computed(() => {
  return (props.product.sizes || []).map(size => {
    const stock = props.product.inventory?.[size] ?? 0
    return { size, stock, inStock: stock > 0 }
  })
})

const availableQuantity = computed(() => Math.min(props.product.inventory?.[selectedSize.value] ?? 0, 10))

function handleSizeUpdate(size) {
  selectedSize.value = size
  quantity.value = 1
}

function addToCart() {
  if (!availableQuantity.value) return
  const chosenSize = selectedSize.value || props.product.sizes?.[0] || 'OS'
  selectedSize.value = chosenSize
  cartStore.addItem(props.product, chosenSize, quantity.value)
  uiStore.showToast('Added to cart', 'success')
  closeQuickView()
}

function toggleWishlist() {
  if (wishlistStore.isInWishlist(props.product.id)) {
    wishlistStore.removeItem(props.product.id)
  } else {
    wishlistStore.addItem(props.product.id)
  }
}

function closeQuickView() {
  uiStore.setQuickViewProduct(null)
}
</script>

<template>
  <div class="quick-view-overlay" @click.self="closeQuickView">
    <div class="quick-view-content" @click.stop>
      <button class="quick-view-close" @click="closeQuickView" aria-label="Close">
        ×
      </button>

      <div class="quick-view-grid">
        <div class="quick-view-image">
          <img :src="product.image" :alt="product.name" />
        </div>

        <div class="quick-view-info">
          <p class="product-category">{{ product.category }}</p>
          <h3 class="product-title">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-price">
            <span class="price-current">₱{{ product.price }}</span>
            <span v-if="discount > 0" class="price-compare">₱{{ product.compareAtPrice }}</span>
            <span v-if="discount > 0" class="discount-tag">{{ discount }}% off</span>
          </div>

          <SizeSelector :sizes="sizes" v-model:selected="selectedSize" @update:selected="handleSizeUpdate" />

          <div class="quick-view-actions">
            <div class="quantity-selector">
              <button class="qty-button" @click="quantity = Math.max(1, quantity - 1)" :disabled="quantity <= 1">−</button>
              <input type="number" v-model.number="quantity" min="1" :max="availableQuantity" readonly />
              <button class="qty-button" @click="quantity = Math.min(availableQuantity, quantity + 1)" :disabled="quantity >= availableQuantity">+</button>
            </div>
            <button class="add-to-cart-btn" @click="addToCart" :disabled="!availableQuantity">Add to Cart</button>
            <button class="wishlist-btn" :class="{ active: wishlistStore.hasItem(product.id) }" @click="toggleWishlist">
              {{ wishlistStore.hasItem(product.id) ? '♥' : '♡' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-view-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  padding: 24px;
  backdrop-filter: blur(8px);
}

.quick-view-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: min(90vh, 600px);
  position: relative;
  overflow-y: auto;
  padding: 0 48px 32px;
}

.quick-view-close {
  position: absolute;
  top: 16px;
  right: 16px;
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
}

.quick-view-close:hover {
  color: var(--ink);
}

.quick-view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding-top: 24px;
}

.quick-view-image img {
  width: 100%;
  height: auto;
  aspect-ratio: 0.84;
  object-fit: cover;
  border-radius: 4px;
}

.quick-view-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
  color: var(--ink);
}

.product-category, .product-description, .product-price {
  margin: 0 0 12px;
}

.product-category {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
}

.product-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-current {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}

.price-compare {
  font-size: 14px;
  color: var(--muted);
  text-decoration: line-through;
}

.discount-tag {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: var(--red);
  color: var(--text-inverse);
  border-radius: 4px;
}

.quick-view-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.quantity-selector {
  display: flex;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
}

.qty-button {
  width: 36px;
  height: 100%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
}

.qty-button:hover {
  background: var(--border-color);
}

.quantity-selector input {
  width: 36px;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  color: var(--ink);
}

.add-to-cart-btn {
  flex: 1;
  height: 40px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0;
}

.add-to-cart-btn:hover {
  opacity: 0.8;
}

.wishlist-btn {
  width: 44px;
  height: 40px;
  border: 1px solid var(--line);
  background: var(--bg-secondary);
  color: var(--ink);
  font-size: 16px;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.2s;
}

.wishlist-btn:hover {
  border-color: var(--red);
  color: var(--red);
}

.wishlist-btn.active {
  color: var(--red);
}

@media (max-width: 768px) {
  .quick-view-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-top: 0;
  }
  .quick-view-content {
    padding: 48px 24px 32px;
  }
}
</style>