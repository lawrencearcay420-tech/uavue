<script setup>
import { ref, computed, watch } from 'vue'
import LiquidEtherBackground from './LiquidEtherBackground.vue'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

const uiStore = useUIStore()
const router = useRouter()

const isLoginPage = computed(() => router.currentRoute.value.name === 'Login')
const isAdminPage = computed(() => router.currentRoute.value.name === 'Admin')
const isCheckoutPage = computed(() => router.currentRoute.value.name === 'Checkout')
const isOrdersPage = computed(() => router.currentRoute.value.name === 'Orders')
const isWishlistPage = computed(() => router.currentRoute.value.name === 'Wishlist')
const isAccountPage = computed(() => router.currentRoute.value.name === 'Account')
const isProductPage = computed(() => router.currentRoute.value.name === 'Product')
const isHomePage = computed(() => router.currentRoute.value.name === 'Home')
const isShopPage = computed(() => router.currentRoute.value.name === 'Shop')
const isOrderSuccessPage = computed(() => router.currentRoute.value.name === 'OrderSuccess')

const backgroundConfig = computed(() => {
  if (isLoginPage.value) {
    return {
      show: true,
      opacity: 0.9,
      autoIntensity: 0.8,
      speed: 0.2,
      mouseForce: 0.7,
      mouseRadius: 0.5,
      interactive: true,
      quality: 'auto'
    }
  }

  const baseConfig = {
    show: true,
    autoSpeed: 0.25,
    interactive: true,
    quality: 'auto'
  }

  if (isHomePage.value) {
    return { ...baseConfig, opacity: 1.0, autoIntensity: 1.2, speed: 0.3, mouseForce: 1.2, mouseRadius: 0.6 }
  }
  
  if (isShopPage.value) {
    return { ...baseConfig, opacity: 0.7, autoIntensity: 0.8, speed: 0.2, mouseForce: 0.8, mouseRadius: 0.5 }
  }
  
  if (isProductPage.value) {
    return { ...baseConfig, opacity: 0.6, autoIntensity: 0.7, speed: 0.15, mouseForce: 0.6, mouseRadius: 0.4 }
  }
  
  if (isOrderSuccessPage.value) {
    return { ...baseConfig, opacity: 0.7, autoIntensity: 0.9, speed: 0.25, mouseForce: 0.8, mouseRadius: 0.5 }
  }
  
  if (isCheckoutPage.value) {
    return { ...baseConfig, opacity: 0.25, autoIntensity: 0.3, speed: 0.1, mouseForce: 0.3, mouseRadius: 0.3 }
  }
  
  if (isAdminPage.value || isOrdersPage.value || isWishlistPage.value || isAccountPage.value) {
    return { ...baseConfig, opacity: 0.15, autoIntensity: 0.2, speed: 0.08, mouseForce: 0.2, mouseRadius: 0.2 }
  }

  return { ...baseConfig, opacity: 0.5, autoIntensity: 0.5, speed: 0.2, mouseForce: 0.5, mouseRadius: 0.4 }
})

const lightColors = [
  '#f5f5f3', '#deded9', '#c7cbc7', '#9da5a0', '#ffffff'
]

const darkColors = [
  '#050505', '#111111', '#181818', '#252525', '#3a3a3a'
]
</script>

<template>
  <div v-if="backgroundConfig.show" class="page-background">
    <LiquidEtherBackground
      :colors="uiStore.isDark ? darkColors : lightColors"
      :speed="backgroundConfig.speed"
      :auto-speed="backgroundConfig.autoSpeed"
      :auto-intensity="backgroundConfig.autoIntensity"
      :mouse-force="backgroundConfig.mouseForce"
      :mouse-radius="backgroundConfig.mouseRadius"
      :opacity="backgroundConfig.opacity"
      :quality="backgroundConfig.quality"
      :interactive="backgroundConfig.interactive"
      class="liquid-ether-bg"
    />
  </div>
</template>

<style scoped>
.page-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.liquid-ether-bg {
  width: 100%;
  height: 100%;
}
</style>