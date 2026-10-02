<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { useUIStore } from '@/stores/ui'
import ProductGrid from '@/components/product/ProductGrid.vue'

const router = useRouter()
const uiStore = useUIStore()
const wishlistStore = useWishlistStore()

const products = computed(() => {
  return wishlistStore.wishlistProducts
})

const loading = computed(() => false)

function viewProduct(product) {
  uiStore.setWishlistOpen(false)
  router.push({ name: 'Product', params: { id: product.id } })
}
</script>

<template>
  <div class="mobile-wishlist-backdrop" @click.self="uiStore.setWishlistOpen(false)">
    <div class="mobile-wishlist" @click.stop>
      <div class="wishlist-header">
        <h2 class="wishlist-title">Your Wishlist</h2>
        <button class="wishlist-close" @click="uiStore.setWishlistOpen(false)" aria-label="Close">
          ×
        </button>
      </div>

      <div v-if="products.length > 0" class="wishlist-content">
        <ProductGrid :products="products" :loading="loading" :columns="2" />
      </div>

      <div v-else class="wishlist-empty">
        <div class="empty-icon">❤️</div>
        <p>Your wishlist is empty</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-wishlist-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--modal-overlay);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px 40px;
  backdrop-filter: blur(8px);
}

.mobile-wishlist {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: min(90%, 480px);
  max-height: min(80vh, 600px);
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  margin-top: 16px;
}

.wishlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.wishlist-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.wishlist-close {
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

.wishlist-close:hover {
  color: var(--ink);
  background: var(--bg-tertiary);
}

.wishlist-content {
  padding: 20px;
}

.wishlist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}
</style>
