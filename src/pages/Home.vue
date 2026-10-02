<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import ProductGrid from '@/components/product/ProductGrid.vue'

const router = useRouter()
const authStore = useAuthStore()
const productsStore = useProductsStore()

const heroTitle = 'GOOD CLOTHES. THOUGHTFULLY MADE.'
const heroSubtitle = 'Essential pieces for everyday wear, crafted with care and consciously made.'
const heroButton = 'Shop Collection'

const categories = computed(() => {
  const map = {
    tops: 'Tops',
    bottoms: 'Bottoms',
    jacket: 'Jacket',
    accessories: 'Accessories'
  }

  return Object.entries(map).map(([id, categoryName]) => {
    const product = productsStore.products.find(p => p.category === categoryName && !p.archived)
    return {
      id,
      name: categoryName,
      image: product?.image || '/placeholder.svg'
    }
  })
})

function viewCategory(category) {
  router.push({ name: 'Shop', query: { category: category.id } })
}

function viewAll() {
  router.push({ name: 'Shop' })
}

function handleEmptyProductsAction() {
  if (authStore.isAdmin) {
    router.push({ name: 'Admin', query: { tab: 'products' } })
    return
  }

  viewAll()
}

const emptyProductsActionLabel = computed(() => authStore.isAdmin ? 'Add a product' : 'Browse products')

const activeProducts = computed(() => productsStore.products.filter(product => !product.archived))

const featuredProducts = computed(() => {
  const featured = activeProducts.value.filter(product => product.featured)
  const fallback = [...activeProducts.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return (featured.length ? featured : fallback).slice(0, 8)
})

const bestsellers = computed(() => {
  const markedBestsellers = activeProducts.value.filter(product => product.bestseller)
  const fallback = [...activeProducts.value].sort((a, b) =>
    (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 0) - (a.rating || 0)
  )
  return (markedBestsellers.length ? markedBestsellers : fallback).slice(0, 8)
})

const productsLoaded = ref(false)

onMounted(() => {
  productsStore.initializeProducts()
  productsLoaded.value = true
})
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-subtitle">{{ heroSubtitle }}</p>
        <button class="hero-button" @click="viewAll">
          {{ heroButton }}
        </button>
      </div>
    </section>

    <section class="section categories-section">
      <h2 class="section-title">Shop by Category</h2>
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.id" class="category-card" @click="viewCategory(category)">
          <div class="category-image-placeholder">
            <img :src="category.image" :alt="category.name" class="category-image" />
          </div>
          <h3 class="category-name">{{ category.name }}</h3>
        </div>
      </div>
    </section>

    <section class="section featured-section">
      <h2 class="section-title">Featured Pieces</h2>
      <ProductGrid
        :products="featuredProducts"
        :loading="!productsLoaded"
        :columns="4"
        :empty-action-label="emptyProductsActionLabel"
        @empty-action="handleEmptyProductsAction"
      />
    </section>

    <section class="section bestsellers-section">
      <h2 class="section-title">Best Sellers</h2>
      <ProductGrid
        :products="bestsellers"
        :loading="!productsLoaded"
        :columns="4"
        :empty-action-label="emptyProductsActionLabel"
        @empty-action="handleEmptyProductsAction"
      />
    </section>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  z-index: 1;
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 5%;
}

.hero-section {
  min-height: clamp(360px, 60vh, 560px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: var(--gradient-subtle);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.hero-content {
  max-width: 720px;
  animation: rise-in 0.8s ease both;
}

.hero-title {
  font-family: var(--serif);
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--ink);
}

.hero-subtitle {
  margin: 0 0 28px;
  font-size: clamp(15px, 3vw, 18px);
  line-height: 1.6;
  color: var(--muted);
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 28px;
  border-radius: 50px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.hero-button:hover {
  opacity: 0.8;
}

.section {
  margin-bottom: 48px;
}

.section-title {
  font-family: var(--serif);
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 500;
  margin: 0 0 22px;
  color: var(--ink);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--ink);
}

.category-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1.2;
  max-height: 220px;
  margin-bottom: 10px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.category-name {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

@keyframes rise-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .home-page {
    padding: 0 4%;
  }

  .hero-section {
    min-height: 380px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .category-image-placeholder {
    aspect-ratio: 1.1;
    max-height: none;
  }
}
</style>
