import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { useProductsStore } from './products'

export const useWishlistStore = defineStore('wishlist', () => {
  const storedItems = getStorage(STORAGE_KEYS.WISHLIST, [])
  const items = ref(normalizeWishlistItems(storedItems))
  const productsStore = useProductsStore()

  if (JSON.stringify(storedItems) !== JSON.stringify(items.value)) {
    saveWishlist()
  }

  const count = computed(() => items.value.length)

  const wishlistProducts = computed(() => {
    return items.value
      .map(productId => productsStore.products.find(product => String(product.id) === String(productId)))
      .filter(Boolean)
  })

  function addItem(productOrId) {
    const productId = getProductId(productOrId)
    if (productId === null || productId === undefined) return false

    const existingProductId = items.value.find(id => String(id) === String(productId))
    if (existingProductId === undefined) {
      items.value.push(productId)
      saveWishlist()
      return true
    }
    return false
  }

  function removeItem(productOrId) {
    const productId = getProductId(productOrId)
    items.value = items.value.filter(id => String(id) !== String(productId))
    saveWishlist()
  }

  function toggleItem(productOrId) {
    const productId = getProductId(productOrId)
    if (isInWishlist(productId)) {
      removeItem(productId)
      return false
    } else {
      addItem(productId)
      return true
    }
  }

  function isInWishlist(productOrId) {
    const productId = getProductId(productOrId)
    return items.value.some(id => String(id) === String(productId))
  }

  const hasItem = isInWishlist

  function moveToCart(productId, cartStore) {
    const product = productsStore.products.find(item => String(item.id) === String(getProductId(productId)))
    if (product) {
      cartStore.addItem(product, product.sizes?.[0] || 'OS', 1)
      removeItem(productId)
      return true
    }
    return false
  }

  function clearWishlist() {
    items.value = []
    saveWishlist()
  }

  function saveWishlist() {
    setStorage(STORAGE_KEYS.WISHLIST, items.value)
  }

  return {
    items,
    count,
    wishlistProducts,
    addItem,
    removeItem,
    toggleItem,
    hasItem,
    isInWishlist,
    moveToCart,
    clearWishlist,
    saveWishlist
  }
})

function getProductId(productOrId) {
  return productOrId && typeof productOrId === 'object'
    ? productOrId.id
    : productOrId
}

function normalizeWishlistItems(values) {
  if (!Array.isArray(values)) return []

  const uniqueItems = new Map()
  values.forEach(value => {
    const productId = getProductId(value)
    if (productId !== null && productId !== undefined && !uniqueItems.has(String(productId))) {
      uniqueItems.set(String(productId), productId)
    }
  })
  return [...uniqueItems.values()]
}