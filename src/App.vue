<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import Ferrofluid from './Ferrofluid/Ferrofluid.vue'

const starterProducts = [
  { id: 1, name: 'UA Shirts', category: 'Tops', price: 1300, color: 'Black', badge: 'BESTSELLER', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/BLACK.jpg?v=1782139399&width=800' },
  { id: 2, name: 'UA Hoodie', category: 'Jacket', price: 3500, color: 'Black', badge: 'NEW', sizes: ['S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-product-graphic-33.png?v=1773587210&width=1200' },
  { id: 3, name: 'UA Cap', category: 'Accessories', price: 54, color: 'Black', badge: '', sizes: ['OS'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-product-graphic-7o.png?v=1773587258&width=800' },
  { id: 4, name: 'UA Shirts', category: 'Tops', price: 42, color: 'White', badge: 'LOW STOCK', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/WHITE.jpg?v=1782139399' },
  { id: 5, name: 'UA', category: 'Bottoms', price: 118, color: 'Black', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/UA-CARGO.png?v=1776241818&width=533' },
  { id: 6, name: 'UA Hoodie', category: 'Jacket', price: 118, color: 'White', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-product-graphic-37.png?v=1773587213&width=1200' },
  { id: 7, name: 'UA Hoodie', category: 'Jacket', price: 118, color: 'Wine Red', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-wine-red-hoodie-front.png?v=1773587956&width=1200' },
  { id: 8, name: '8 Pocket Gaterized Cargo Pants', category: 'Bottoms', price: 118, color: 'Black', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/cargowithgarter.png?v=1783943369&width=1200' },
  { id: 9, name: 'UA Gala Mode Shades', category: 'Accessories', price: 118, color: 'Blue', badge: '', sizes: ['OS'], image: 'https://www.uaworldwide.com/cdn/shop/files/202605070010433pu1ue.png?v=1778083900&width=1200' },
  { id: 10, name: 'UA Cap', category: 'Accessories', price: 54, color: 'White', badge: '', sizes: ['OS'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-white-net-cap-front-view.png?v=1774025408&width=1200' },
  { id: 11, name: 'UA Architect Tee', category: 'Tops', price: 42, color: 'Monochrome Grey', badge: 'LOW STOCK', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://www.uaworldwide.com/cdn/shop/files/ua-architect-tee-grey-front.png?v=1773587947&width=1200' },
  { id: 12, name: 'UA Slides', category: 'Accessories', price: 54, color: 'Black', sizes: ['42', '43', '44', '45'], badge: '', image: 'https://www.uaworldwide.com/cdn/shop/files/ua-slides-alternate-view.png?v=1773587941&width=1200' },
]

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'OS']
const slipperSizeOptions = ['42', '43', '44', '45']

function isNumericSizeProduct(name) {
  return name.trim().toLowerCase().startsWith('ua slides')
}

function normalizeProduct(product) {
  if ((product.name || '').trim().toLowerCase() === 'ua gala mode shades') {
    return { ...product, sizes: ['OS'] }
  }

  if (!isNumericSizeProduct(product.name || '')) return product

  const savedSizes = Array.isArray(product.sizes) ? product.sizes : product.size
  const sizes = Array.isArray(savedSizes)
    ? savedSizes.map(String).filter((size) => slipperSizeOptions.includes(size))
    : []

  return { ...product, sizes: sizes.length ? sizes : slipperSizeOptions }
}


function readProducts() {
  try {
    const saved = localStorage.getItem('forme-products')
    return saved ? JSON.parse(saved).map(normalizeProduct) : starterProducts
  } catch {
    return starterProducts
  }
}

function readBag() {
  try {
    return JSON.parse(localStorage.getItem('forme-cart') || '[]')
  } catch {
    return []
  }
}

const products = ref(readProducts())
const bagItems = ref(readBag())
const search = ref('')
const activeCategory = ref('All pieces')
const sortBy = ref('featured')
const cartOpen = ref(false)
const bagCount = computed(() => bagItems.value.reduce((count, item) => count + item.quantity, 0))
const bagSubtotal = computed(() => bagItems.value.reduce((total, item) => total + Number(item.price) * item.quantity, 0))
const modalOpen = ref(false)
const editingId = ref(null)
const notice = ref('')

// Theme state
const isDarkMode = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('forme-theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()

  const savedUser = localStorage.getItem('forme-user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    isLoggedIn.value = true
    userName.value = user.name
  }
})

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('forme-theme', isDarkMode.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

// Size selection for adding to bag
const sizeModalOpen = ref(false)
const selectedProductForSize = ref(null)
const selectedSize = ref('')

// Auth state
const isLoggedIn = ref(false)
const userName = ref('')
const loginForm = reactive({ email: '', password: '' })

// Check for existing session on mount
onMounted(() => {
  const savedUser = localStorage.getItem('forme-user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    isLoggedIn.value = true
    userName.value = user.name
  }
})

function login() {
  if (loginForm.email && loginForm.password) {
    isLoggedIn.value = true
    userName.value = loginForm.email.split('@')[0]
    localStorage.setItem('forme-user', JSON.stringify({ name: userName.value, email: loginForm.email }))
    loginForm.email = ''
    loginForm.password = ''
    showNotice(`Welcome to UA Shop, ${userName.value}!`)
  }
}

function logout() {
  isLoggedIn.value = false
  userName.value = ''
  localStorage.removeItem('forme-user')
  showNotice('You have been logged out')
}
const categories = ['All pieces', 'Tops', 'Bottoms', 'Jacket', 'Accessories']
const draft = reactive({ name: '', category: 'Tops', price: '', color: '', badge: '', sizes: ['S', 'M', 'L'], image: '' })
const draftSizeOptions = computed(() => isNumericSizeProduct(draft.name) ? slipperSizeOptions : sizeOptions)

watch(products, (value) => {
  localStorage.setItem('forme-products', JSON.stringify(value))
}, { deep: true })

watch(bagItems, (value) => {
  localStorage.setItem('forme-cart', JSON.stringify(value))
}, { deep: true })

const visibleProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  const result = products.value.filter((product) => {
    const matchesCategory = activeCategory.value === 'All pieces' || product.category === activeCategory.value
    const matchesQuery = !query || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(query)
    return matchesCategory && matchesQuery
  })

  if (sortBy.value === 'price-low') result.sort((a, b) => Number(a.price) - Number(b.price))
  if (sortBy.value === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price))
  if (sortBy.value === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
  return result
})

function openCreate() {
  editingId.value = null
  Object.assign(draft, { name: '', category: 'Tops', price: '', color: '', badge: '', sizes: ['S', 'M', 'L'], image: '' })
  modalOpen.value = true
}

function openEdit(product) {
  editingId.value = product.id
  Object.assign(draft, { ...product, sizes: product.sizes || ['S', 'M', 'L'] })
  modalOpen.value = true
}

function saveProduct() {
  const sizeOptionsForProduct = isNumericSizeProduct(draft.name) ? slipperSizeOptions : sizeOptions
  const selectedSizes = draft.sizes.filter((size) => sizeOptionsForProduct.includes(String(size)))
  const product = {
    ...draft,
    id: editingId.value ?? Date.now(),
    price: Number(draft.price),
    sizes: isNumericSizeProduct(draft.name) ? selectedSizes : selectedSizes.length ? selectedSizes : ['S', 'M', 'L'],
    image: draft.image.trim() || starterProducts[0].image,
  }

  if (editingId.value) {
    const index = products.value.findIndex((item) => item.id === editingId.value)
    if (index !== -1) products.value[index] = product
    showNotice('Product updated')
  } else {
    products.value.unshift(product)
    showNotice('Product added to the collection')
  }

  modalOpen.value = false
}

function deleteProduct(product) {
  if (!window.confirm(`Remove “${product.name}” from the collection?`)) return
  products.value = products.value.filter((item) => item.id !== product.id)
  showNotice('Product removed')
}

function addToBag(product) {
  if (product.sizes && product.sizes.length > 1) {
    selectedProductForSize.value = product
    selectedSize.value = product.sizes[0]
    sizeModalOpen.value = true
  } else {
    addToBagWithSize(product, product.sizes?.[0] || 'OS')
  }
}

function addToBagWithSize(product, size) {
  const existingItem = bagItems.value.find((item) => item.id === product.id && item.size === size)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    bagItems.value.push({ ...product, quantity: 1, size })
  }
  showNotice(`${product.name} (${size}) added to your bag`)
  sizeModalOpen.value = false
  selectedProductForSize.value = null
}

function changeQuantity(productId, amount, size) {
  const item = bagItems.value.find((product) => product.id === productId && product.size === size)
  if (!item) return
  item.quantity += amount
  if (item.quantity < 1) removeFromBag(productId, size)
}

function removeFromBag(productId, size) {
  bagItems.value = bagItems.value.filter((item) => !(item.id === productId && item.size === size))
}

function getProductSizes(item) {
  const product = products.value.find(p => p.id === item.id)
  return product?.sizes || [item.size]
}

function updateItemSize(item) {
  const existingIndex = bagItems.value.findIndex(i => i.id === item.id && i.size === item.size && i !== item)
  if (existingIndex !== -1) {
    bagItems.value[existingIndex].quantity += item.quantity
    bagItems.value = bagItems.value.filter(i => i !== item)
  }
  showNotice(`Size updated to ${item.size}`)
}

let noticeTimer
function showNotice(message) {
  notice.value = message
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 2400)
}
</script>

<template>
  <div class="shop-shell">
    <!-- Login Page - Shows first when not logged in -->
    <div v-if="!isLoggedIn" class="login-page">
      <Ferrofluid
        class="login-bg"
        :colors="isDarkMode ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'] : ['#1a1a1a', '#414b45', '#707a73', '#a9ada9', '#1a1a1a']"
        :speed="0.45"
        :scale="1.6"
        :turbulence="1.1"
        :fluidity="0.14"
        :rimWidth="0.13"
        :sharpness="2.5"
        :shimmer="1.5"
        :glow="2.4"
        flow-direction="down"
        :opacity="1"
        :mouseInteraction="true"
        :mouseStrength="1"
        :mouseRadius="0.6"
      />
      <button
        class="theme-toggle theme-toggle--login"
        type="button"
        @click="toggleTheme"
        :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-pressed="isDarkMode"
      >
        <span class="theme-icon" aria-hidden="true">{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </button>
      <div class="login-container">
        <div class="login-brand">
          <a class="wordmark" href="#top" aria-label="Forme home">Under Asawa Clothing<span>.</span></a>
          <p class="login-tagline">Considered pieces for all the ways your days unfold.</p>
        </div>
        <div class="login-card">
          <div class="login-heading">
            <p class="eyebrow"><span class="eyebrow-line"></span> SIGN IN</p>
            <h1>Welcome to UA</h1>
            <p class="login-subtitle">Sign in to access your account and collection</p>
          </div>
          <form class="login-form" @submit.prevent="login">
            <label class="form-field">
              Email
              <input v-model.trim="loginForm.email" type="email" required placeholder="you@example.com" autocomplete="email" />
            </label>
            <label class="form-field">
              Password
              <input v-model="loginForm.password" type="password" required placeholder="password" autocomplete="current-password" />
            </label>
            <button type="submit" class="login-submit">Sign in <span>↗</span></button>
          </form>
          <p class="login-note">Enter any email and password to continue</p>
        </div>
      </div>
    </div>

    <!-- Main App Content - Only shows when logged in -->
    <div v-else>
      <div class="announcement">Enjoy Your Day!!<span>↗</span></div>

    <header class="site-header">
      <a class="wordmark" href="#top" aria-label="Forme home">UA - Under Asawa<span>.</span></a>
      <nav class="main-nav" aria-label="Main navigation">
        <a class="nav-active" href="#collection">Shop all</a>
        <a href="#collection" @click="activeCategory = 'Tops'">Clothing</a>
        <a href="#collection" @click="activeCategory = 'Accessories'">Accessories</a>
        <a href="#story">Our approach</a>
      </nav>
      <div class="header-actions">
        <button class="text-action" type="button" @click="openCreate"><span class="plus-mark">+</span> Add product</button>
        <button class="bag-button" type="button" aria-label="Open shopping bag" @click="cartOpen = true">
          Add Cart <span class="bag-count">{{ bagCount }}</span>
        </button>
        <button class="theme-toggle" type="button" @click="toggleTheme" :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <span v-if="isDarkMode" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
        </button>
        <div class="auth-actions">
          <div class="user-menu">
            <span class="user-name">{{ userName }}</span>
            <button class="text-action" type="button" @click="logout">Log out</button>
          </div>
        </div>
      </div>
    </header>

    <main id="top">
      <section class="hero" aria-label="New season collection">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-line"></span> Under Asawa · 2026</p>
          <h1>Under <br /><em>Asawa</em></h1>
          <p class="hero-description">Considered pieces for all the ways your days unfold. Made to live in, and love for a long time.</p>
          <a class="hero-link" href="#collection">Explore the collection <span>↘</span></a>
          <div class="hero-index"><span>01</span><span class="index-line"></span><span>03</span></div>
        </div>
        <div class="hero-image" role="img">
          <span class="hero-caption">UA Clothing — SS / 25</span>
        </div>
        <span class="hero-side-label">UA · EST. 2026</span>
      </section>

      <section id="collection" class="collection-section">
        <div class="collection-heading">
          <div>
            <p class="eyebrow"><span class="eyebrow-line"></span> GOOD THINGS, ON REPEAT</p>
            <h2>U<em>A - Clothing</em></h2>
          </div>
          <p class="collection-aside">Thoughtful shapes. Feel-good fabrics.<br />Nothing you’ll wear just once.</p>
        </div>

        <div class="collection-toolbar">
          <div class="category-list" role="group" aria-label="Filter by category">
            <button v-for="category in categories" :key="category" type="button" :class="{ selected: activeCategory === category }" @click="activeCategory = category">
              {{ category }}<span v-if="category === 'All pieces'" class="category-count">{{ products.length }}</span>
            </button>
          </div>
          <div class="toolbar-controls">
            <label class="search-box">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13.2 13.2 4 4" /></svg>
              <input v-model="search" type="search" placeholder="Find a piece" aria-label="Search products" />
            </label>
            <label class="sort-control"><span>Sort</span>
              <select v-model="sortBy" aria-label="Sort products">
                <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="visibleProducts.length" class="product-grid">
          <article v-for="(product, index) in visibleProducts" :key="product.id" class="product-card" :style="{ '--card-index': index }">
            <div class="product-image-wrap">
              <img class="product-image" :src="product.image" :alt="product.name" loading="lazy" />
              <span v-if="product.badge" class="product-badge">{{ product.badge }}</span>
              <div class="product-actions">
                <button type="button" class="manage-button" :aria-label="`Edit ${product.name}`" @click="openEdit(product)">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.7 3.3 3 3M4 16l3.3-.7 9.2-9.2a2.1 2.1 0 0 0-3-3l-9.2 9.2L4 16Z" /></svg> Edit
                </button>
                <button type="button" class="manage-button delete-button" :aria-label="`Delete ${product.name}`" @click="deleteProduct(product)">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m2 0-.7 10H6.7L6 6m2.5 3v4m3-4v4" /></svg> Delete
                </button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name-row"><h3>{{ product.name }}</h3><span class="product-price">₱{{ Number(product.price).toLocaleString() }}</span></div>
              <div class="product-detail-row">
                <p>{{ product.color }}</p>
                <div class="product-sizes" v-if="product.sizes && product.sizes.length">
                  <span v-for="size in product.sizes" :key="size" class="size-badge">{{ size }}</span>
                </div>
                <button type="button" class="quick-add" :aria-label="`Add ${product.name} to bag`" @click="addToBag(product)">+</button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state"><span>Nothing here just yet.</span><button type="button" @click="openCreate">Add a product <span>↗</span></button></div>

        <div class="collection-foot"><span>Showing {{ visibleProducts.length }} of {{ products.length }} pieces</span><span>Designed with intention. Worn on repeat. <b>✳</b></span></div>
      </section>

      <section id="story" class="story-strip">
        <span class="story-spark"></span>
        <a href="#collection">A little more about us <span>↗</span></a>
      </section>
    </main>

    <footer class="site-footer"><a class="wordmark" href="#top">UA<span>.</span></a><span>Good clothes, thoughtfully made.</span><span>© UA 2026</span></footer>

    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false" @keydown.esc="modalOpen = false">
      <section class="product-modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title'">
        <div class="modal-heading"><div><p class="eyebrow"><span class="eyebrow-line"></span> COLLECTION MANAGER</p><h2 id="modal-title">{{ editingId ? 'Edit this piece' : 'A new favorite.' }}</h2></div><button type="button" class="close-button" aria-label="Close dialog" @click="modalOpen = false">×</button></div>
        <form class="product-form" @submit.prevent="saveProduct">
          <label class="form-field">Product name<input v-model.trim="draft.name" required maxlength="60" placeholder="e.g. The Sunday Shirt" /></label>
          <div class="form-row">
            <label class="form-field">Category<select v-model="draft.category" required><option v-for="category in categories.slice(1)" :key="category" :value="category">{{ category }}</option></select></label>
            <label class="form-field">Price <span class="input-prefix"><span>₱</span><input v-model.number="draft.price" type="number" min="0.01" step="0.01" required placeholder="68.00" /></span></label>
          </div>
          <div class="form-row">
            <label class="form-field">Color<input v-model.trim="draft.color" required maxlength="40" placeholder="Cloud white" /></label>
            <label class="form-field">Label <select v-model="draft.badge"><option value="">No label</option><option value="NEW">New</option><option value="BESTSELLER">Bestseller</option><option value="LOW STOCK">Low stock</option></select></label>
          </div>
          <label class="form-field">Sizes
            <div class="size-picker" role="group" aria-label="Select available sizes">
              <label v-for="size in draftSizeOptions" :key="size" class="size-option">
                <input type="checkbox" :value="size" v-model="draft.sizes" />
                <span>{{ size }}</span>
              </label>
            </div>
          </label>
          <label class="form-field">Image URL <span class="optional-label">optional</span><input v-model.trim="draft.image" type="url" placeholder="https://…" /></label>
          <div class="modal-footer"><button type="button" class="cancel-button" @click="modalOpen = false">Cancel</button><button type="submit" class="save-button">{{ editingId ? 'Save changes' : 'Add to collection' }} <span>↗</span></button></div>
        </form>
      </section>
    </div>

    <!-- Size Selection Modal -->
    <div v-if="sizeModalOpen" class="modal-backdrop" @click.self="sizeModalOpen = false" @keydown.esc="sizeModalOpen = false">
      <section class="product-modal" role="dialog" aria-modal="true" aria-labelledby="size-title">
        <div class="modal-heading"><div><p class="eyebrow"><span class="eyebrow-line"></span> SELECT SIZE</p><h2 id="size-title">{{ selectedProductForSize?.name }}</h2></div><button type="button" class="close-button" aria-label="Close dialog" @click="sizeModalOpen = false">×</button></div>
        <form class="product-form" @submit.prevent="addToBagWithSize(selectedProductForSize, selectedSize)">
          <label class="form-field">Size
            <div class="size-picker" role="group" aria-label="Select size">
              <label v-for="size in selectedProductForSize?.sizes" :key="size" class="size-option">
                <input type="radio" :value="size" v-model="selectedSize" name="size-select" />
                <span>{{ size }}</span>
              </label>
            </div>
          </label>
          <div class="modal-footer"><button type="button" class="cancel-button" @click="sizeModalOpen = false">Cancel</button><button type="submit" class="save-button">Add to bag <span>↗</span></button></div>
        </form>
      </section>
    </div>

    <div v-if="cartOpen" class="cart-backdrop" @click.self="cartOpen = false" @keydown.esc="cartOpen = false">
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div class="cart-heading">
          <div><p class="eyebrow"><span class="eyebrow-line"></span> YOUR PICKS</p><h2 id="cart-title">Shopping cart <span>({{ bagCount }})</span></h2></div>
          <button type="button" class="close-button" aria-label="Close shopping bag" @click="cartOpen = false">×</button>
        </div>
        <div v-if="bagItems.length" class="cart-content">
          <div class="cart-items">
            <article v-for="item in bagItems" :key="item.id + '_' + item.size" class="cart-item">
              <img :src="item.image" :alt="item.name" />
              <div class="cart-item-info">
                <div class="cart-item-title"><h3>{{ item.name }}</h3><span>₱{{ (Number(item.price) * item.quantity).toLocaleString() }}</span></div>
                <p>{{ item.color }} · ₱{{ Number(item.price).toLocaleString() }} each</p>
                <div class="cart-item-controls">
                  <div class="cart-size-selector">
                    <label for="cart-size-{{ item.id }}-{{ item.size }}" class="visually-hidden">Size</label>
                    <select id="cart-size-{{ item.id }}-{{ item.size }}" v-model="item.size" @change="updateItemSize(item)" class="cart-size-select" :disabled="!getProductSizes(item).length">
                      <option v-for="size in getProductSizes(item)" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  <div class="quantity-control" :aria-label="`Quantity for ${item.name}`">
                    <button type="button" :aria-label="`Decrease ${item.name} quantity`" @click="changeQuantity(item.id, -1, item.size)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button type="button" :aria-label="`Increase ${item.name} quantity`" @click="changeQuantity(item.id, 1, item.size)">+</button>
                  </div>
                  <button type="button" class="remove-item" @click="removeFromBag(item.id, item.size)">Remove</button>
                </div>
              </div>
            </article>
          </div>
          <div class="cart-summary">
            <p><span>Subtotal</span><strong>₱{{ bagSubtotal.toLocaleString() }}</strong></p>
            <span class="shipping-note">Shipping and taxes calculated at checkout.</span>
            <button type="button" class="continue-button" @click="cartOpen = false">Continue shopping <span>↗</span></button>
          </div>
        </div>
        <div v-else class="cart-empty"><span class="empty-bag-mark">＋</span><p>Your bag is taking a little break.</p><button type="button" @click="cartOpen = false">Explore the collection <span>↗</span></button></div>
      </aside>
    </div>

    <Transition name="toast"><div v-if="notice" class="toast-message" role="status">{{ notice }} <span>✳</span></div></Transition>
    </div>
  </div>
</template>
