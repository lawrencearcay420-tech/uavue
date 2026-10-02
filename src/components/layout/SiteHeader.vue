<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)

const navigation = [
  { name: 'Home', path: '/', label: 'Home' },
  { name: 'Shop', path: '/shop', label: 'Shop All' },
  { name: 'New Arrivals', path: '/shop', label: 'New Arrivals', query: { new: '1', sort: 'newest' } },
  { name: 'Clothing', path: '/shop', label: 'Clothing', query: { category: 'clothing' } },
  { name: 'Accessories', path: '/shop', label: 'Accessories', query: { category: 'accessories' } },
]

const isScrolled = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})

function toggleTheme() {
  uiStore.toggleTheme()
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Shop', query: { q: searchQuery.value.trim() } })
  }
  showSearchResults.value = false
  searchQuery.value = ''
}

function toggleMobileMenu() {
  uiStore.setMobileMenuOpen(true)
}

function toggleSearch() {
  uiStore.setSearchOpen(true)
}

function toggleCart() {
  uiStore.setCartOpen(true)
}

function toggleWishlist() {
  uiStore.setWishlistOpen(true)
}

function toggleAccount() {
  if (authStore.isLoggedIn) {
    uiStore.setAccountOpen(true)
  } else {
    router.push('/login')
  }
}

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function handleNavClick(event, item) {
  event.preventDefault()
  router.push({ path: item.path, query: item.query || {} })
}

function isNavigationItemActive(item) {
  const currentRoute = router.currentRoute.value
  if (item.path !== currentRoute.path) return false
  if (item.query?.category) return currentRoute.query.category === item.query.category
  if (item.query?.new) return currentRoute.query.new === item.query.new
  if (item.name === 'Shop') {
    return currentRoute.path === '/shop' && !currentRoute.query.category && !currentRoute.query.new
  }
  return item.path === '/'
}
</script>

<template>
  <header class="site-header" :class="{ scrolled: isScrolled }">
    <div class="header-inner">
      <div class="header-left">
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <a class="wordmark" href="/" aria-label="Home">
          <span class="brand-text">UA - Under Asawa.</span>
        </a>
      </div>

      <nav class="main-nav" aria-label="Main navigation">
        <a v-for="item in navigation" :key="item.name" :href="item.path"
           :class="{ active: isNavigationItemActive(item) }"
           @click="handleNavClick($event, item)">
          {{ item.label }}
          <span v-if="item.label === 'Shop All'" class="category-count">{{ cartStore.items.length }}</span>
        </a>
      </nav>

      <div class="header-actions">
        <div class="header-search">
          <button class="icon-button" @click="toggleSearch" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="8.8" cy="8.8" r="5.8"></circle>
              <path d="m13.2 13.2 4 4"></path>
            </svg>
          </button>
        </div>

        <button class="icon-button" @click="toggleWishlist" aria-label="Wishlist">
          <span class="wishlist-count" v-if="wishlistStore.count > 0">{{ wishlistStore.count }}</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 7c0 2.5-5 6.5-5 6.5s5 4 5 6.5c0-2.5 5-4 5-6.5s-2.5-3.5-5-3.5z"></path>
          </svg>
        </button>

        <button class="bag-button" @click="toggleCart" aria-label="Open shopping bag">
          <span class="bag-count" v-if="cartStore.itemCount > 0">{{ cartStore.itemCount }}</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2.5 8h15l-1.5 10h-12z"></path>
            <path d="M7 12V6a5 5 0 0 1 6 0v6"></path>
          </svg>
        </button>

        <div v-if="authStore.isLoggedIn" class="user-menu">
          <span class="user-name">{{ authStore.userName }}</span>
          <button v-if="authStore.isAdmin" class="text-action" @click="router.push('/admin')">
            Admin
          </button>
          <button class="text-action" @click="handleLogout">Log out</button>
        </div>
        <button v-else class="text-action" @click="router.push('/login')">Log in</button>

        <button class="icon-button" @click="toggleTheme" :aria-label="uiStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <span v-if="uiStore.isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  display: block;
  top: 0;
  z-index: 10;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
}

.site-header.scrolled {
  background: var(--bg-primary);
  border-bottom-color: var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.header-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  height: 78px;
  padding: 0 0 0 7.1%;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: start;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  width: 30px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  gap: 5px;
}

.mobile-menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--ink);
}

.wordmark .brand-text {
  font-size: 28px;
  font-weight: 600;
  color: var(--ink);
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 34px;
  height: 100%;
}

.main-nav a {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
}

.main-nav a:hover,
.main-nav a.active {
  color: var(--ink);
}

.main-nav a.active::after {
  position: absolute;
  right: 0;
  bottom: 19px;
  left: 0;
  height: 2px;
  background: var(--red);
  content: '';
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  justify-self: end;
  width: max-content;
  gap: 12px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;
  position: relative;
}

.icon-button:hover {
  background: var(--bg-tertiary);
}

.wishlist-count {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 9px;
  font-weight: 600;
}

.bag-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  font-size: 12px;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s ease;
  position: relative;
}

.bag-button:hover {
  border-color: var(--ink);
  background: var(--button-primary-hover-bg);
}

.bag-count {
  display: grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  font-size: 10px;
  color: var(--ink);
  padding: 2px 6px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .main-nav { display: none; }
  .mobile-menu-toggle { display: flex; }
  .header-inner { grid-template-columns: 1fr 1fr 1fr; }
  .bag-button { padding: 6px 10px; font-size: 10px; gap: 4px; }
}

@media (max-width: 480px) {
  .header-inner { padding: 0 0 0 5%; }
  .header-actions { gap: 6px; }
  .icon-button { width: 36px; height: 36px; }
  .user-name { display: none; }
}
</style>