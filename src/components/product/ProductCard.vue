<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  product: { type: Object, required: true },
  featured: { type: Boolean, default: false }
})

const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const uiStore = useUIStore()

const discount = computed(() => {
  if (props.product.compareAtPrice > props.product.price) {
    return Math.round(((props.product.compareAtPrice - props.product.price) / props.product.compareAtPrice) * 100)
  }
  return 0
})

function viewProduct() {
  router.push({ name: 'Product', params: { id: props.product.id } })
}

function addToCart() {
  quickView()
}

function toggleWishlist() {
  if (wishlistStore.isInWishlist(props.product.id)) {
    wishlistStore.removeItem(props.product.id)
    uiStore.showToast('Removed from wishlist', 'info')
  } else {
    wishlistStore.addItem(props.product.id)
    uiStore.showToast('Added to wishlist', 'success')
  }
}

function isInWishlist() {
  return wishlistStore.isInWishlist(props.product.id)
}

function quickView() {
  uiStore.setQuickViewProduct(props.product)
}
</script>

<template>
  <div class="product-card" :class="{ featured }">
    <div class="product-image-wrapper" @click="viewProduct">
      <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" />
      <span v-if="discount > 0" class="product-badge badge--discount">
        {{ discount }}% off
      </span>
      <span v-if="product.badge" class="product-badge badge--custom">
        {{ product.badge }}
      </span>
    </div>

    <div class="product-info">
      <h3 class="product-name">
        <a href="#" @click.prevent="viewProduct">{{ product.name }}</a>
      </h3>
      <p class="product-category">{{ product.category }}</p>

      <div class="product-price">
        <span class="price-current">₱{{ product.price }}</span>
        <span v-if="product.compareAtPrice > product.price" class="price-compare">
          ₱{{ product.compareAtPrice }}
        </span>
      </div>

      <div class="product-actions">
        <button class="btn btn--primary btn--small" @click="addToCart">
          Add to Cart
        </button>
        <button class="wishlist-btn" :class="{ active: isInWishlist() }" @click="toggleWishlist">
          {{ isInWishlist() ? '♥' : '♡' }}
        </button>
        <button class="quick-view-btn" @click="quickView">
          Quick View
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.product-card.featured {
  border-color: var(--line);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 0.84;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 8px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 999px;
  line-height: 1.2;
  white-space: nowrap;
}

.badge--discount {
  left: auto;
  right: 12px;
  background: var(--red);
  color: var(--text-inverse);
}

.badge--custom {
  left: 12px;
  right: auto;
  background: var(--bg-tertiary);
  color: var(--ink);
}

.product-info {
  padding: 16px;
}

.product-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
}

.product-name a {
  color: var(--ink);
  text-decoration: none;
  transition: color 0.2s;
}

.product-name a:hover {
  color: var(--red);
}

.product-category {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.product-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-current {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.price-compare {
  font-size: 13px;
  color: var(--muted);
  text-decoration: line-through;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn--small {
  flex: 1;
  padding: 8px 12px;
  font-size: 11px;
  border-radius: 50px;
}

.btn--primary {
  background: var(--ink);
  color: var(--text-inverse);
  border: 1px solid var(--ink);
}

.btn--primary:hover {
  opacity: 0.8;
}

.wishlist-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 16px;
  cursor: pointer;
  border-radius: 50%;;
  transition: all 0.2s;
}

.wishlist-btn:hover {
  border-color: var(--red);
  color: var(--red);
}

.wishlist-btn.active {
  color: var(--red);
}

.quick-view-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-view-btn:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}
</style>