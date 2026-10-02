<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import ProductGrid from '@/components/product/ProductGrid.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const loading = ref(false)
const searchInput = ref(queryValue(route.query.q))
const selectedCategory = ref(normalizeCategoryValue(route.query.category))
const activeSort = ref(queryValue(route.query.sort) || 'featured')
const newArrivalsOnly = ref(queryValue(route.query.new) === '1')
const priceMax = ref(5000)
const priceMin = ref(0)

const categories = ['all', 'clothing', 'tops', 'bottoms', 'jacket', 'accessories']

const shopTitle = computed(() => {
  if (newArrivalsOnly.value) return 'New Arrivals'
  if (selectedCategory.value === 'clothing') return 'Clothing'
  if (selectedCategory.value === 'accessories') return 'Accessories'
  if (selectedCategory.value !== 'all') {
    return selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1)
  }
  return 'Shop All'
})

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'name', label: 'Name: A-Z' }
]

const products = computed(() => {
  return productsStore.products.filter(p => !p.archived)
})

const filteredProducts = computed(() => {
  let result = products.value

  if (newArrivalsOnly.value) {
    const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    result = result.filter(product =>
      String(product.badge || '').toUpperCase() === 'NEW' ||
      new Date(product.createdAt).getTime() >= recentCutoff
    )
  }

  if (selectedCategory.value === 'clothing') {
    result = result.filter(product => ['Tops', 'Bottoms', 'Jacket'].includes(product.category))
  } else if (selectedCategory.value !== 'all') {
    result = result.filter(p => {
      const catMap = { tops: 'Tops', bottoms: 'Bottoms', jacket: 'Jacket', accessories: 'Accessories' }
      return p.category === catMap[selectedCategory.value] || p.category.toLowerCase() === selectedCategory.value
    })
  }

  if (searchInput.value.trim()) {
    const query = searchInput.value.trim().toLowerCase()
    result = result.filter(product => [
      product.name,
      product.description,
      product.category,
      product.color,
      product.sku
    ].some(value => String(value || '').toLowerCase().includes(query)))
  }

  result = result.filter(p => p.price >= priceMin.value && p.price <= priceMax.value)

  const sortMap = {
    featured: () => result.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1)),
    newest: () => result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    'price-low': () => result.sort((a, b) => a.price - b.price),
    'price-high': () => result.sort((a, b) => b.price - a.price),
    bestselling: () => result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)),
    name: () => result.sort((a, b) => a.name.localeCompare(b.name))
  }

  sortMap[activeSort.value]()
  return result
})

function updateFromQuery() {
  selectedCategory.value = normalizeCategoryValue(route.query.category)
  activeSort.value = queryValue(route.query.sort) || 'featured'
  newArrivalsOnly.value = queryValue(route.query.new) === '1'
  searchInput.value = queryValue(route.query.q)
}

function updateURL() {
  const query = {}
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (activeSort.value !== 'featured') query.sort = activeSort.value
  if (newArrivalsOnly.value) query.new = '1'
  if (searchInput.value.trim()) query.q = searchInput.value.trim()

  const nextQuery = { ...route.query, ...query }
  if (selectedCategory.value === 'all' && !query.category) delete nextQuery.category
  if (activeSort.value === 'featured' && !query.sort) delete nextQuery.sort
  if (!newArrivalsOnly.value && !query.new) delete nextQuery.new
  if (!searchInput.value.trim() && !query.q) delete nextQuery.q

  router.replace({
    path: route.path,
    query: nextQuery
  })
}

onMounted(() => {
  productsStore.initializeProducts()
})

watch(() => [route.query.category, route.query.sort, route.query.new, route.query.q], updateFromQuery)
watch(() => [selectedCategory.value, activeSort.value, newArrivalsOnly.value, searchInput.value], updateURL)

function queryValue(value) {
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}

function normalizeCategoryValue(value) {
  const normalizedValue = queryValue(value).trim().toLowerCase()

  if (!normalizedValue || normalizedValue === 'all' || normalizedValue === 'all pieces' || normalizedValue === 'all-pieces') {
    return 'all'
  }

  const categoryMap = {
    clothing: 'clothing',
    top: 'tops',
    tops: 'tops',
    bottom: 'bottoms',
    bottoms: 'bottoms',
    jacket: 'jacket',
    jackets: 'jacket',
    accessory: 'accessories',
    accessories: 'accessories'
  }

  return categoryMap[normalizedValue] || normalizedValue
}
</script>

<template>
  <div class="shop-page">
    <div class="shop-header">
      <h1 class="page-title">{{ shopTitle }}</h1>
      <p class="page-subtitle" aria-live="polite">
        {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product' : 'products' }} available
      </p>
    </div>

    <div class="shop-layout">
      <aside class="shop-filters">
        <div class="filter-section">
          <h3 class="filter-title">Categories</h3>
          <div class="filter-options">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <h3 class="filter-title">Price Range</h3>
          <div class="price-range">
            <input type="range" v-model="priceMax" min="0" max="5000" step="100" />
            <div class="price-values">
              <span>₱0 - ₱{{ priceMax }}</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h3 class="filter-title">Sort By</h3>
          <div class="filter-options">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              :class="{ active: activeSort === option.value }"
              @click="activeSort = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </aside>

      <main class="shop-products">
        <ProductGrid :products="filteredProducts" :loading="loading" :columns="4" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  padding: 16px 0;
}

.shop-header {
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--serif);
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 500;
  margin: 0;
  color: var(--ink);
  line-height: 1.05;
}

.page-subtitle {
  display: inline-flex;
  align-items: center;
  margin: 10px 0 0;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--card-bg);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.shop-layout {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 26px;
}

.shop-filters {
  position: sticky;
  top: 80px;
  height: min-content;
  padding-top: 6px;
  margin-left: 14px;
}

.filter-section {
  margin-bottom: 26px;
}

.filter-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
  color: var(--muted);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.filter-options button {
  padding: 8px 10px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.filter-options button:hover {
  color: var(--ink);
}

.filter-options button.active {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--ink);
  font-weight: 600;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-range input {
  width: 100%;
  margin: 0;
}

.price-values {
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }
  .shop-filters {
    position: static;
  }
}
</style>
