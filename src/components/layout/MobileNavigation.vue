<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()

const navigation = [
  { name: 'Home', path: '/', label: 'Home', icon: '🏠' },
  { name: 'Shop', path: '/shop', label: 'Shop All', icon: '🛍️' },
  { name: 'New Arrivals', path: '/shop', label: 'New Arrivals', icon: '✨' },
  { name: 'Clothing', path: '/shop', label: 'Clothing', icon: '👕' },
  { name: 'Accessories', path: '/shop', label: 'Accessories', icon: '🧢' },
]

const accountLinks = computed(() => authStore.isLoggedIn ? [
  { name: 'Account', path: '/account', label: 'Account', icon: '👤' },
  { name: 'Orders', path: '/orders', label: 'Orders', icon: '📦' },
  { name: 'Wishlist', path: '/wishlist', label: 'Wishlist', icon: '❤️' },
  { name: 'Logout', action: () => { authStore.logout(); router.push('/login') }, label: 'Log Out', icon: '🚪' }
] : [
  { name: 'Login', path: '/login', label: 'Log In', icon: '🔑' },
])

function navigate(item) {
  if (item.path) {
    router.push(item.path)
  }
  if (item.action) {
    item.action()
  }
  uiStore.setMobileMenuOpen(false)
}
</script>

<template>
  <div v-if="uiStore.isMobileMenuOpen" class="mobile-nav-backdrop" @click="uiStore.setMobileMenuOpen(false)">
    <nav class="mobile-nav" @click.stop>
      <div class="mobile-nav-header">
        <span class="brand-text">UA.</span>
        <button class="close-menu" @click="uiStore.setMobileMenuOpen(false)" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="mobile-nav-section">
        <h3 class="mobile-nav-title">SHOP</h3>
        <a v-for="item in navigation" :key="item.name" href="#" @click.prevent="navigate(item)" class="mobile-nav-link">
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </div>

      <div class="mobile-nav-section">
        <h3 class="mobile-nav-title">ACCOUNT</h3>
        <a v-for="item in accountLinks" :key="item.name" href="#" @click.prevent="navigate(item)" class="mobile-nav-link">
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </div>

      <div class="mobile-nav-footer">
        <p class="mobile-nav-legal">© 2026 Under Asawa Clothing. All rights reserved.</p>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.mobile-nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow-y: auto;
  padding-top: 60px;
}

.mobile-nav {
  width: min(90%, 320px);
  height: calc(100vh - 60px);
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.brand-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
}

.close-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  border-radius: 4px;
}

.close-menu:hover {
  background: var(--bg-tertiary);
}

.mobile-nav-section {
  margin-bottom: 24px;
}

.mobile-nav-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
  color: var(--muted);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: var(--ink);
  font-size: 14px;
  text-decoration: none;
  border-bottom: 1px solid var(--border-subtle);
  transition: color 0.2s;
}

.mobile-nav-link:hover {
  color: var(--red);
}

.nav-icon {
  font-size: 16px;
}

.mobile-nav-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.mobile-nav-legal {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
</style>