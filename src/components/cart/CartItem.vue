<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUIStore } from '@/stores/ui'
import { useProductsStore } from '@/stores/products'
import { useWishlistStore } from '@/stores/wishlist'

const props = defineProps({
  item: { type: Object, required: true }
})

const cartStore = useCartStore()
const uiStore = useUIStore()
const productsStore = useProductsStore()
const wishlistStore = useWishlistStore()

const product = computed(() => {
  return props.item.product || productsStore.getProductById(props.item.productId)
})

function updateQuantity(newQty) {
  const qty = Math.max(1, newQty)
  cartStore.updateQuantity(props.item.productId, props.item.size, qty)
}

function removeItem() {
  cartStore.removeItem(props.item.productId, props.item.size)
  uiStore.showToast('Removed from cart', 'info')
}

function moveToWishlist() {
  const prod = product.value
  if (prod) {
    cartStore.removeItem(props.item.productId, props.item.size)
    wishlistStore.addItem(prod.id)
    uiStore.showToast('Moved to wishlist', 'success')
  }
}
</script>

<template>
  <div class="cart-item">
    <img :src="item.image || item.product?.image" :alt="item.name || item.product?.name" class="cart-item-image" loading="lazy" />

    <div class="cart-item-details">
      <h3 class="cart-item-title">{{ item.name || item.product?.name }}</h3>
      <p class="cart-item-meta">
        {{ item.category || item.product?.category }}
        <span v-if="item.size"> · Size: {{ item.size }}</span>
      </p>

      <div class="cart-item-price">
        {{ item.price }}
        <span v-if="product?.compareAtPrice > item.price" class="original-price">
          {{ product.compareAtPrice }}
        </span>
      </div>

      <div class="cart-item-actions">
        <div class="quantity-control">
          <button class="qty-btn" @click="updateQuantity(item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
          <span class="qty-value">{{ item.quantity }}</span>
          <button class="qty-btn" @click="updateQuantity(item.quantity + 1)" :disabled="item.quantity >= (product?.stock || 99)">+</button>
        </div>
        <button class="remove-btn" @click="removeItem">Remove</button>
        <button class="move-wishlist-btn" @click="moveToWishlist">Move to Wishlist</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.cart-item-image {
  width: 96px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.cart-item-details {
  flex: 1;
  min-width: 0;
}

.cart-item-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}

.cart-item-meta {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.cart-item-price {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.original-price {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--muted);
  text-decoration: line-through;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  width: 28px;
  height: 100%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--border-color);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-value {
  display: block;
  width: 32px;
  height: 100%;
  text-align: center;
  font-size: 13px;
  line-height: 32px;
  color: var(--ink);
}

.remove-btn, .move-wishlist-btn {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: var(--red);
}

.move-wishlist-btn:hover {
  color: var(--ink);
}

@media (max-width: 480px) {
  .cart-item {
    flex-direction: column;
    gap: 12px;
  }
  .cart-item-image {
    width: 72px;
    height: 96px;
  }
  .remove-btn, .move-wishlist-btn {
    font-size: 10px;
  }
}
</style>
