import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { starterProducts } from '@/data/products'

export const useProductsStore = defineStore('products', () => {
  const products = ref(getStorage(STORAGE_KEYS.PRODUCTS, []))
  const searchQuery = ref('')
  const activeCategory = ref('all')
  const sortBy = ref('featured')

  const initializeProducts = () => {
    if (products.value.length === 0) {
      products.value = starterProducts.map(p => ({ ...p }))
      saveProducts()
    }
    normalizeProducts()
  }

  const normalizeProducts = () => {
    products.value = products.value.map(p => {
      const normalizedCategory = p.name === 'UA Slides' ? 'Accessories' : normalizeCategoryName(p.category)

      return {
        ...p,
        category: normalizedCategory,
        compareAtPrice: p.compareAtPrice ?? p.price * 1.2,
        inventory: p.inventory || Object.fromEntries(p.sizes?.map(s => [s, 5]) ?? [['OS', 5]]),
        stock: p.stock ?? Object.values(p.inventory || {}).reduce((a, b) => a + b, 0),
        badge: p.badge || '',
        featured: p.featured ?? false,
        bestseller: p.bestseller ?? false,
        archived: p.archived ?? false,
        createdAt: p.createdAt ?? new Date().toISOString(),
        reviews: p.reviews ?? [],
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        sku: p.sku ?? `UA-${normalizedCategory.toUpperCase().slice(0,3)}-${String(p.id).padStart(3,'0')}-${p.color.toUpperCase().slice(0,3)}`
      }
    })
    saveProducts()
  }

  const saveProducts = () => {
    return setStorage(STORAGE_KEYS.PRODUCTS, products.value)
  }

  const visibleProducts = computed(() => {
    let result = products.value.filter(p => !p.archived)

    if (activeCategory.value !== 'all') {
      result = result.filter(p => categoryNameToSlug(p.category) === activeCategory.value)
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    }

    switch (sortBy.value) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break
      case 'price-high': result.sort((a, b) => b.price - a.price); break
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
      case 'bestselling': result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break
      default: result.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1))
    }

    return result
  })

  const getProductById = (id) => products.value.find(p => p.id === id)

  const getProductReviews = (productId) => {
    const product = getProductById(productId)
    return product?.reviews ?? []
  }

  const addReview = (productId, review) => {
    const product = getProductById(productId)
    if (!product) return null

    product.reviews = product.reviews ?? []
    product.reviews.push(review)
    product.reviewCount = product.reviews.length
    product.rating = Number((product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length).toFixed(1))
    saveProducts()
    return review
  }

  const getProductBySlug = (slug) => products.value.find(p => p.sku?.toLowerCase() === slug.toLowerCase())

  const addProduct = (product) => {
    const category = normalizeCategoryName(product.category?.trim())
    const color = product.color?.trim() || 'Default'
    const sizes = product.sizes?.length ? product.sizes : ['OS']
    const inventory = product.inventory || Object.fromEntries(sizes.map(size => [size, 10]))
    const newProduct = {
      ...product,
      id: Date.now(),
      name: product.name.trim(),
      category,
      color,
      sizes,
      inventory,
      stock: Object.values(inventory).reduce((total, quantity) => total + quantity, 0),
      compareAtPrice: product.compareAtPrice || product.price,
      sku: product.sku || `UA-${category.toUpperCase().slice(0, 3)}-${Date.now()}`,
      badge: product.badge || '',
      featured: false,
      bestseller: false,
      archived: false,
      createdAt: new Date().toISOString(),
      reviews: [],
      rating: 0,
      reviewCount: 0
    }
    products.value.unshift(newProduct)
    if (!saveProducts()) {
      products.value.shift()
      return null
    }
    return newProduct
  }

  const updateProduct = (id, updates) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const previousProduct = products.value[index]
      const updatedProduct = { ...previousProduct, ...updates }
      products.value[index] = updatedProduct
      if (!saveProducts()) {
        products.value[index] = previousProduct
        return null
      }
      return updatedProduct
    }
    return null
  }

  const deleteProduct = (id) => {
    const previousProducts = products.value
    products.value = products.value.filter(p => p.id !== id)
    if (products.value.length === previousProducts.length) return false
    if (!saveProducts()) {
      products.value = previousProducts
      return false
    }
    return true
  }

  const archiveProduct = (id) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      product.archived = true
      saveProducts()
    }
  }

  const duplicateProduct = (id) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      const duplicate = {
        ...product,
        id: Date.now(),
        name: `${product.name} (Copy)`,
        sku: product.sku ? `${product.sku}-COPY` : undefined,
        createdAt: new Date().toISOString(),
        reviews: [],
        rating: 0,
        reviewCount: 0,
        archived: false
      }
      products.value.unshift(duplicate)
      saveProducts()
      return duplicate
    }
    return null
  }

  const updateInventory = (productId, size, quantity) => {
    const product = products.value.find(p => p.id === productId)
    if (product && product.inventory) {
      product.inventory[size] = Math.max(0, (product.inventory[size] || 0) + quantity)
      product.stock = Object.values(product.inventory).reduce((a, b) => a + b, 0)
      saveProducts()
    }
  }

  const setInventory = (productId, size, quantity) => {
    const product = products.value.find(p => p.id === productId)
    if (!product || !Number.isInteger(quantity) || quantity < 0) return false

    const previousInventory = product.inventory || {}
    const previousStock = product.stock
    product.inventory = { ...previousInventory, [size]: quantity }
    product.stock = Object.values(product.inventory).reduce((total, count) => total + count, 0)

    if (!saveProducts()) {
      product.inventory = previousInventory
      product.stock = previousStock
      return false
    }
    return true
  }

  const setSearchQuery = (query) => { searchQuery.value = query }
  const setActiveCategory = (category) => { activeCategory.value = category }
  const setSortBy = (sort) => { sortBy.value = sort }

  return {
    products,
    searchQuery,
    activeCategory,
    sortBy,
    visibleProducts,
    initializeProducts,
    getProductById,
    getProductReviews,
    getProductBySlug,
    addReview,
    addProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    duplicateProduct,
    updateInventory,
    setInventory,
    setSearchQuery,
    setActiveCategory,
    setSortBy,
    saveProducts
  }
})

function normalizeCategoryName(category) {
  if (!category) return category

  const map = {
    all: 'All pieces',
    tops: 'Tops',
    top: 'Tops',
    bottoms: 'Bottoms',
    bottom: 'Bottoms',
    jacket: 'Jacket',
    jackets: 'Jacket',
    accessories: 'Accessories',
    accessory: 'Accessories'
  }

  return map[String(category).trim().toLowerCase()] || category
}

function categoryNameToSlug(name) {
  const map = { 'All pieces': 'all', 'Tops': 'tops', 'Bottoms': 'bottoms', 'Jacket': 'jacket', 'Accessories': 'accessories' }
  return map[name] || name.toLowerCase()
}