<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits(['close'])

const router = useRouter()
const uiStore = useUIStore()
const productsStore = useProductsStore()

const searchQuery = ref('')
const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  return productsStore.products
    .filter(product => !product.archived)
    .filter(product => [
      product.name,
      product.category,
      product.color,
      product.sku,
      product.description
    ].some(value => String(value || '').toLowerCase().includes(query)))
    .slice(0, 8)
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    uiStore.setSearchOpen(false)
    router.push({ name: 'Shop', query: { q: searchQuery.value.trim() } })
  }
}

function handleProductClick(id) {
  uiStore.setSearchOpen(false)
  router.push({ name: 'Product', params: { id } })
}
</script>

<template>
  <div class="mobile-search-backdrop" @click.self="emit('close')">
    <div class="mobile-search" @click.stop>
      <div class="search-header">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="search-input"
          @keyup.enter="handleSearch"
          autocomplete="off"
        />
        <button class="search-submit" @click="handleSearch">Search</button>
      </div>

      <div v-if="searchQuery.trim()" class="search-results">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="search-result-item"
          @click="handleProductClick(product.id)"
        >
          <img :src="product.image" :alt="product.name" />
          <div class="result-info">
            <span class="result-name">{{ product.name }}</span>
            <span class="result-price">₱{{ product.price }}</span>
          </div>
        </div>
        <p v-if="filteredProducts.length === 0" class="no-results">No products found</p>
      </div>

      <button class="mobile-search-close" @click="emit('close')" aria-label="Close">
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.mobile-search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--modal-overlay);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 60px;
  backdrop-filter: blur(8px);
}

.mobile-search {
  position: relative;
  width: min(90%, 560px);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  margin-top: 16px;
}

.search-header {
  display: flex;
  padding: 16px;
}

.search-input {
  flex: 1;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 14px;
  padding: 0 16px;
}

.search-input:focus {
  outline: none;
  border-color: var(--ink);
}

.search-submit {
  width: 80px;
  height: 44px;
  border: 1px solid var(--ink);
  border-radius: 0 4px 4px 0;
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.search-results {
  max-height: 320px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: var(--bg-tertiary);
}

.search-result-item img {
  width: 48px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.result-info {
  flex: 1;
}

.result-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink);
}

.result-price {
  display: block;
  font-size: 11px;
  color: var(--muted);
}

.no-results {
  padding: 16px;
  font-size: 13px;
  text-align: center;
  color: var(--muted);
}

.mobile-search-close {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.mobile-search-close:hover {
  color: var(--ink);
}
</style>
