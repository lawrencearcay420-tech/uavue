import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

export const useUIStore = defineStore('ui', () => {
  const theme = ref(getStorage(STORAGE_KEYS.THEME, 'light'))
  const isDark = computed(() => theme.value === 'dark')
  const isMobileMenuOpen = ref(false)
  const isSearchOpen = ref(false)
  const isCartOpen = ref(false)
  const isWishlistOpen = ref(false)
  const isAccountOpen = ref(false)
  const toasts = ref([])
  const loading = ref({})
  const quickViewProduct = ref(null)
  const showConfirm = ref(false)
  const confirmData = ref({ message: '', resolver: null })

  function setQuickViewProduct(product) { quickViewProduct.value = product }
  function setShowConfirm(data) { showConfirm.value = true; confirmData.value = data }
  function closeAllOverlays() {
    isMobileMenuOpen.value = false
    isSearchOpen.value = false
    isCartOpen.value = false
    isWishlistOpen.value = false
    isAccountOpen.value = false
    quickViewProduct.value = null
    showConfirm.value = false
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    setStorage(STORAGE_KEYS.THEME, theme.value)
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function initTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function setMobileMenuOpen(open) { isMobileMenuOpen.value = open }
  function setSearchOpen(open) { isSearchOpen.value = open }
  function setCartOpen(open) { isCartOpen.value = open }
  function setWishlistOpen(open) { isWishlistOpen.value = open }
  function setAccountOpen(open) { isAccountOpen.value = open }

  function showToast(message, type = 'success', duration = 3000) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration)
    }
    return id
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function setLoading(key, value) {
    loading.value = { ...loading.value, [key]: value }
  }

  function closeAllOverlays() {
    isMobileMenuOpen.value = false
    isSearchOpen.value = false
    isCartOpen.value = false
    isWishlistOpen.value = false
    isAccountOpen.value = false
  }

  return {
    theme,
    isDark,
    isMobileMenuOpen,
    isSearchOpen,
    isCartOpen,
    isWishlistOpen,
    isAccountOpen,
    toasts,
    loading,
    quickViewProduct,
    showConfirm,
    confirmData,
    toggleTheme,
    initTheme,
    setMobileMenuOpen,
    setSearchOpen,
    setCartOpen,
    setWishlistOpen,
    setAccountOpen,
    setQuickViewProduct,
    setShowConfirm,
    showToast,
    dismissToast,
    setLoading,
    closeAllOverlays
  }
})