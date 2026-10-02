import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { useProductsStore } from './products'
import { validatePromoCode, applyPromoCode } from '@/data/promotions'

export const useCartStore = defineStore('cart', () => {
  const items = ref(getStorage(STORAGE_KEYS.CART, []))
  const promoCode = ref('')
  const promoDiscount = ref(0)
  const promoError = ref('')
  const appliedPromo = ref(null)

  const productsStore = useProductsStore()

  const normalizeCart = () => {
    items.value = items.value.map(item => {
      const product = productsStore.getProductById(item.productId)
      if (product) {
        return {
          ...item,
          name: product.name,
          price: product.price,
          image: product.image,
          color: product.color,
          category: product.category,
          sizes: product.sizes,
          inventory: product.inventory
        }
      }
      return item
    })
    saveCart()
  }

  const saveCart = () => {
    setStorage(STORAGE_KEYS.CART, items.value)
  }

  const selectedItems = computed(() => items.value.filter(item => item.selected !== false))
  const selectedItemCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const subtotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  const discount = computed(() => appliedPromo.value
    ? applyPromoCode(appliedPromo.value, subtotal.value)
    : promoDiscount.value)
  const shipping = computed(() => subtotal.value === 0 || subtotal.value >= 2000 ? 0 : 120)

  const tax = computed(() => Math.round((subtotal.value - discount.value) * 0.12))

  const total = computed(() => subtotal.value + shipping.value + tax.value - discount.value)

  const freeShippingThreshold = 2000
  const freeShippingProgress = computed(() => Math.min(100, (subtotal.value / freeShippingThreshold) * 100))
  const freeShippingRemaining = computed(() => Math.max(0, freeShippingThreshold - subtotal.value))

  const isEmpty = computed(() => items.value.length === 0)

  function setItemSelected(productId, size, selected) {
    const item = items.value.find(i => i.productId === productId && i.size === size)
    if (!item) return
    item.selected = selected
    saveCart()
  }

  function setAllItemsSelected(selected) {
    items.value.forEach(item => { item.selected = selected })
    saveCart()
  }

  function clearSelectedItems() {
    items.value = items.value.filter(item => item.selected === false)
    removePromo()
    saveCart()
  }

  function addItem(product, size = 'OS', quantity = 1) {
    const existingIndex = items.value.findIndex(i => i.productId === product.id && i.size === size)
    if (existingIndex !== -1) {
      items.value[existingIndex].quantity += quantity
      items.value[existingIndex].selected = true
    } else {
      items.value.push({
        productId: product.id,
        size,
        quantity,
        selected: true,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color,
        category: product.category,
        sizes: product.sizes,
        inventory: product.inventory
      })
    }
    saveCart()
    return true
  }

  function removeItem(productId, size) {
    items.value = items.value.filter(i => !(i.productId === productId && i.size === size))
    saveCart()
  }

  function updateQuantity(productId, size, quantity) {
    const item = items.value.find(i => i.productId === productId && i.size === size)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId, size)
      } else {
        const product = productsStore.getProductById(productId)
        const maxStock = product?.inventory?.[size] ?? 99
        item.quantity = Math.min(quantity, maxStock)
        saveCart()
      }
    }
  }

  function updateItemSize(productId, oldSize, newSize) {
    const existingIndex = items.value.findIndex(i => i.productId === productId && i.size === newSize)
    const itemIndex = items.value.findIndex(i => i.productId === productId && i.size === oldSize)
    if (itemIndex !== -1) {
      const item = items.value[itemIndex]
      if (existingIndex !== -1) {
        items.value[existingIndex].quantity += item.quantity
        items.value.splice(itemIndex, 1)
      } else {
        item.size = newSize
      }
      saveCart()
    }
  }

  function moveToWishlist(itemId, size) {
    const itemIndex = items.value.findIndex(i => i.productId === itemId && i.size === size)
    if (itemIndex === -1) return null
    const item = { ...items.value[itemIndex] }
    removeItem(itemId, size)
    return item
  }

  function clearCart() {
    items.value = []
    promoCode.value = ''
    promoDiscount.value = 0
    appliedPromo.value = null
    saveCart()
  }

  function applyPromo(code) {
    promoError.value = ''
    const result = validatePromoCode(code, subtotal.value)
    if (!result.valid) {
      promoError.value = result.message
      return false
    }
    promoCode.value = code.toUpperCase()
    promoDiscount.value = applyPromoCode(result.promo, subtotal.value)
    appliedPromo.value = result.promo
    return true
  }

  function removePromo() {
    promoCode.value = ''
    promoDiscount.value = 0
    promoError.value = ''
    appliedPromo.value = null
  }

  function validateStock(cartItems = selectedItems.value) {
    const errors = []
    for (const item of cartItems) {
      const product = productsStore.getProductById(item.productId)
      if (!product) {
        errors.push(`${item.name} is no longer available`)
        continue
      }
      const available = product.inventory?.[item.size] ?? 0
      if (available < item.quantity) {
        errors.push(`${item.name} (${item.size}) only has ${available} left in stock`)
      }
    }
    return errors
  }

  return {
    items,
    promoCode,
    promoDiscount,
    promoError,
    appliedPromo,
    itemCount,
    selectedItems,
    selectedItemCount,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    freeShippingProgress,
    freeShippingRemaining,
    isEmpty,
    setItemSelected,
    setAllItemsSelected,
    clearSelectedItems,
    addItem,
    removeItem,
    updateQuantity,
    updateItemSize,
    clearCart,
    moveToWishlist,
    applyPromo,
    removePromo,
    validateStock,
    normalizeCart,
    saveCart
  }
})