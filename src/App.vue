<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { migrateStorage } from '@/utils/storage'
import PageBackground from '@/components/background/PageBackground.vue'
import AnnouncementBar from '@/components/layout/AnnouncementBar.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import MobileSearch from '@/components/ui/MobileSearch.vue'
import MobileWishlist from '@/components/ui/MobileWishlist.vue'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import ProductQuickView from '@/components/product/ProductQuickView.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'

const authStore = useAuthStore()
const uiStore = useUIStore()
const cartStore = useCartStore()
const productsStore = useProductsStore()

onMounted(() => {
  migrateStorage()
  authStore.checkAuth()
  uiStore.initTheme()
  productsStore.initializeProducts()
  cartStore.normalizeCart()
})
</script>

<template>
  <div class="app">
    <PageBackground />
    <AnnouncementBar />
    <SiteHeader />
    <MobileNavigation />
    <MobileSearch v-if="uiStore.isSearchOpen" @close="uiStore.setSearchOpen(false)" />
    <MobileWishlist v-if="uiStore.isWishlistOpen" @close="uiStore.setWishlistOpen(false)" />
    <main class="main-content">
      <RouterView />
    </main>
    <SiteFooter />
    <CartDrawer />
    <ProductQuickView v-if="uiStore.quickViewProduct" :product="uiStore.quickViewProduct" />
    <ConfirmDialog v-if="uiStore.showConfirm" :message="uiStore.confirmData.message" />
    <Toast v-for="toast in uiStore.toasts" :key="toast.id" :toast="toast" @dismiss="uiStore.dismissToast(toast.id)" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>
