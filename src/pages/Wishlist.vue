<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import ProductGrid from '@/components/product/ProductGrid.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const router = useRouter()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const uiStore = useUIStore()

const products = computed(() => {
  return wishlistStore.wishlistProducts
})

const loading = ref(false)

function moveToCart(product) {
  const selectedSize = product.sizes?.[0] || 'OS'
  cartStore.addItem(product, selectedSize, 1)
  wishlistStore.removeItem(product.id)
  uiStore.showToast('Moved to cart', 'success')
}

function removeFromWishlist(product) {
  wishlistStore.removeItem(product.id)
  uiStore.showToast('Removed from wishlist', 'info')
}

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div class="wishlist-page">
    <div class="wishlist-header">
      <h1 class="page-title">Your Wishlist</h1>
      <p class="page-subtitle">{{ products.length }} {{ products.length === 1 ? 'item' : 'items' }} saved</p>
    </div>

    <div v-if="loading" class="wishlist-loading">
      <LoadingState :count="6" type="card" />
    </div>

    <div v-else-if="products.length === 0" class="wishlist-empty">
      <div class="empty-icon">❤️</div>
      <h3>Your Wishlist is Empty</h3>
      <p>Browse our collection and save items for later.</p>
      <button class="shop-link" @click="router.push('/shop')">
        Shop Now
      </button>
    </div>

    <div v-else class="wishlist-grid">
      <div v-for="product in products" :key="product.id" class="wishlist-item">
        <div class="wishlist-item-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="wishlist-item-info">
          <h3 class="wishlist-item-name">{{ product.name }}</h3>
          <p class="wishlist-item-category">{{ product.category }}</p>
          <div class="wishlist-item-price">
            <span class="price-current">₱{{ product.price }}</span>
            <span v-if="product.compareAtPrice > product.price" class="price-compare">
              ₱{{ product.compareAtPrice }}
            </span>
          </div>
        </div>
        <div class="wishlist-item-actions">
          <button class="action-btn add-cart" @click="moveToCart(product)">
            Move to Cart
          </button>
          <button class="action-btn remove" @click="removeFromWishlist(product)">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wishlist-page {
  padding: 16px 0;
}

.wishlist-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--serif);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.wishlist-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  transition: border-color 0.2s;
}

.wishlist-item:hover {
  border-color: var(--ink);
}

.wishlist-item-image {
  flex-shrink: 0;
}

.wishlist-item-image img {
  width: 96px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.wishlist-item-info {
  flex: 1;
  min-width: 0;
}

.wishlist-item-name {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wishlist-item-category {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.wishlist-item-price .price-current {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.price-compare {
  margin-left: 6px;
  font-size: 12px;
  color: var(--muted);
  text-decoration: line-through;
}

.wishlist-item-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

.action-btn.add-cart:hover {
  border-color: var(--ink);
}

.action-btn.remove:hover {
  border-color: var(--red);
  color: var(--red);
}

.wishlist-empty {
  text-align: center;
  padding: 64px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.wishlist-empty h3 {
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
</style>
