<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useUIStore } from '@/stores/ui'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const uiStore = useUIStore()

const activeTab = ref(route.query.tab === 'products' ? 'products' : 'dashboard')
const showAddProduct = ref(false)
const editingProductId = ref(null)
const newProduct = ref({
  name: '',
  category: '',
  price: 0,
  description: '',
  image: '',
  sizes: '',
  stock: 0,
  color: '',
  compareAtPrice: 0
})

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push('/')
  }
  productsStore.initializeProducts()
})

const products = computed(() => productsStore.products)
const orders = computed(() => ordersStore.allOrders)
const totalRevenue = computed(() => {
  return orders.value.reduce((sum, order) => {
    return order.status?.toLowerCase() === 'cancelled' ? sum : sum + (Number(order.total) || 0)
  }, 0)
})
const completedOrders = computed(() => orders.value.filter(order => order.status?.toLowerCase() === 'delivered').length)

function updateOrderStatus(order, event) {
  const status = event.target.value
  if (!ordersStore.updateOrderStatus(order.orderNumber || order.id, status)) {
    event.target.value = order.status
    uiStore.showToast('Could not update order status. Browser storage may be full.', 'error', 5000)
    return
  }
  uiStore.showToast(`Order ${order.orderNumber || order.id} updated.`, 'success')
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0)
}

function deleteProduct(product) {
  const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`)
  if (!confirmed) return

  if (!productsStore.deleteProduct(product.id)) {
    uiStore.showToast('Could not delete the product. Browser storage may be full.', 'error', 5000)
    return
  }

  if (editingProductId.value === product.id) cancelProductForm()
  uiStore.showToast('Product deleted.', 'success')
}

function setProductStock(product, size, event) {
  const quantity = Number(event.target.value)
  if (!Number.isInteger(quantity) || quantity < 0) {
    event.target.value = product.inventory?.[size] ?? 0
    uiStore.showToast('Enter a whole-number stock quantity of zero or more.', 'error')
    return
  }

  if (!productsStore.setInventory(product.id, size, quantity)) {
    event.target.value = product.inventory?.[size] ?? 0
    uiStore.showToast('Could not update stock. Browser storage may be full.', 'error', 5000)
    return
  }

  uiStore.showToast(`${product.name} (${size}) stock updated.`, 'success')
}

function editProduct(product) {
  editingProductId.value = product.id
  newProduct.value = {
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description || '',
    image: product.image || '',
    sizes: (product.sizes || []).join(', '),
    stock: product.stock || 0,
    color: product.color || '',
    compareAtPrice: product.compareAtPrice || 0
  }
  showAddProduct.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelProductForm() {
  showAddProduct.value = false
  editingProductId.value = null
  newProduct.value = { name: '', category: '', price: 0, description: '', image: '', sizes: '', stock: 0, color: '', compareAtPrice: 0 }
}

function handleAddProduct() {
  const editingProduct = products.value.find(product => product.id === editingProductId.value)
  const name = newProduct.value.name.trim() || editingProduct?.name || ''
  const category = newProduct.value.category.trim() || editingProduct?.category || ''
  const price = newProduct.value.price === '' ? editingProduct?.price : Number(newProduct.value.price)
  const compareAtPrice = newProduct.value.compareAtPrice === '' ? 0 : Number(newProduct.value.compareAtPrice)
  if (!name || !category || !Number.isFinite(price) || price <= 0 ||
      !Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
    uiStore.showToast('Enter a product name, category, and valid prices.', 'error')
    return
  }

  const sizes = newProduct.value.sizes
    .split(',')
    .map(size => size.trim())
    .filter(Boolean)
  const productSizes = sizes.length ? sizes : (editingProduct?.sizes?.length ? editingProduct.sizes : ['OS'])
  const inventory = Object.fromEntries(productSizes.map(size => [
    size,
    editingProduct?.inventory?.[size] ?? 10
  ]))

  if (editingProduct) {
    const product = productsStore.updateProduct(editingProduct.id, {
      ...newProduct.value,
      name,
      category,
      price,
      compareAtPrice,
      sizes: productSizes,
      inventory,
      stock: Object.values(inventory).reduce((total, quantity) => total + quantity, 0)
    })
    if (!product) {
      uiStore.showToast('Could not update the product. Browser storage may be full.', 'error', 5000)
      return
    }

    cancelProductForm()
    uiStore.showToast('Product updated successfully.', 'success')
    return
  }

  const product = productsStore.addProduct({
    ...newProduct.value,
    name,
    category,
    price,
    sizes: productSizes,
    inventory,
    stock: Object.values(inventory).reduce((total, quantity) => total + quantity, 0)
  })
  if (!product) {
    uiStore.showToast('Could not save the product. Browser storage may be full; try a smaller image.', 'error', 5000)
    return
  }

  cancelProductForm()
  uiStore.showToast('Product added successfully.', 'success')
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxDimension = 1200
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (!context) {
          uiStore.showToast('Could not process this image. Try another file.', 'error')
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        newProduct.value.image = canvas.toDataURL('image/jpeg', 0.82)
      }
      image.onerror = () => uiStore.showToast('Could not load this image. Try another file.', 'error')
      image.src = reader.result
    }
    reader.onerror = () => uiStore.showToast('Could not read this image. Try another file.', 'error')
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1 class="page-title">Admin Dashboard</h1>
      <p class="page-subtitle">Manage your store from here</p>
    </div>

    <div class="admin-nav">
      <button
        v-for="tab in [
          { id: 'dashboard', name: 'Dashboard' },
          { id: 'products', name: 'Products' },
          { id: 'orders', name: 'Orders' },
          { id: 'inventory', name: 'Inventory' }
        ]"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="admin-content">
      <div v-show="activeTab === 'dashboard'" class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-value">{{ products.length }}</div>
          <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ orders.length }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedOrders }}</div>
          <div class="stat-label">Completed Orders</div>
        </div>
      </div>

      <div v-show="activeTab === 'products'" class="products-management">
        <div class="management-header">
          <h2>Products ({{ products.length }})</h2>
          <button class="add-product-btn" @click="cancelProductForm(); showAddProduct = true">
            + Add Product
          </button>
        </div>

        <div v-if="showAddProduct" class="add-product-form">
          <h3>{{ editingProductId ? 'Edit Product' : 'Add New Product' }}</h3>
          <form class="product-form" @submit.prevent="handleAddProduct">
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input type="text" v-model="newProduct.name" :required="!editingProductId" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <input type="text" v-model="newProduct.category" :required="!editingProductId" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Price (₱)</label>
                <input type="number" min="0.01" step="any" v-model.number="newProduct.price" :required="!editingProductId" />
              </div>
              <div class="form-group">
                <label>Compare At Price (₱)</label>
                <input type="number" min="0" step="any" v-model.number="newProduct.compareAtPrice" />
              </div>
            </div>
            <div class="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" @change="handleImageUpload" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Color</label>
                <input type="text" v-model="newProduct.color" placeholder="e.g. Black, Navy Blue" />
              </div>
              <div class="form-group">
                <label>Sizes (comma separated)</label>
                <input type="text" v-model="newProduct.sizes" placeholder="S, M, L, XL" />
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newProduct.description" rows="3" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn--primary">{{ editingProductId ? 'Save Changes' : 'Save Product' }}</button>
              <button type="button" class="btn btn--secondary" @click="cancelProductForm">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="admin-product-grid">
          <article v-for="product in products.filter(p => !p.archived)" :key="product.id" class="admin-product-card">
            <img :src="product.image" :alt="product.name" class="admin-product-image" />
            <div class="admin-product-details">
              <h3>{{ product.name }}</h3>
              <p>{{ product.category }}<span v-if="product.color"> · {{ product.color }}</span></p>
              <div class="admin-product-prices">
                <strong>₱{{ product.price }}</strong>
                <del v-if="product.compareAtPrice > product.price">₱{{ product.compareAtPrice }}</del>
              </div>
              <div class="admin-product-actions">
                <button type="button" class="product-edit-btn" @click="editProduct(product)">Edit</button>
                <button type="button" class="product-delete-btn" @click="deleteProduct(product)">Delete</button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="products.filter(p => !p.archived).length === 0" class="empty-admin">
          <p>No products yet. Add your first product.</p>
        </div>
      </div>

      <div v-show="activeTab === 'orders'" class="orders-management">
        <h2>Orders ({{ orders.length }})</h2>
        <div v-if="orders.length === 0" class="empty-admin">
          <p>No orders yet.</p>
        </div>
        <div v-for="order in orders" :key="order.id" class="order-admin-card">
          <div class="order-admin-header">
            <div class="order-admin-customer">
              <strong>#{{ order.orderNumber || order.id }}</strong>
              <span>{{ order.customer?.name || order.shippingInfo?.fullName || 'Guest' }}</span>
              <span>{{ order.customer?.email || order.shippingInfo?.email || 'No email provided' }}</span>
            </div>
            <span class="order-status" :class="order.status">{{ order.status }}</span>
          </div>
          <div class="order-admin-summary">
            <span>{{ order.items?.length || 0 }} item(s)</span>
            <strong>{{ formatCurrency(order.total) }}</strong>
          </div>
          <div class="order-admin-controls">
            <label :for="`order-status-${order.id}`">Order status</label>
            <select
              :id="`order-status-${order.id}`"
              :value="order.status"
              @change="updateOrderStatus(order, $event)"
            >
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'inventory'" class="inventory-management">
        <h2>Inventory</h2>
        <div v-if="products.filter(product => !product.archived).length === 0" class="empty-admin">
          <p>No products to manage.</p>
        </div>
        <div v-for="product in products.filter(product => !product.archived)" :key="product.id" class="inventory-item">
          <div class="inventory-product-info">
            <span class="inventory-product">{{ product.name }}</span>
            <span class="inventory-stock">Total stock: {{ product.stock }}</span>
          </div>
          <div class="inventory-sizes">
            <label v-for="size in product.sizes" :key="size" class="inventory-size">
              <span>{{ size }}</span>
              <input
                type="number"
                min="0"
                step="1"
                :value="product.inventory?.[size] ?? 0"
                :aria-label="`${product.name} size ${size} stock`"
                @change="setProductStock(product, size, $event)"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 24px 28px 40px;
}

.admin-header {
  margin-bottom: 20px;
}

.page-title {
  font-family: var(--serif);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.admin-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0;
  flex-wrap: wrap;
}

.admin-nav button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.admin-nav button:hover {
  color: var(--ink);
}

.admin-nav button.active {
  color: var(--ink);
  border-color: var(--ink);
}

.admin-content {
  min-height: 400px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 28px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--ink);
}

.stat-label {
  font-size: 12px;
  color: var(--muted);
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.management-header h2,
.orders-management > h2,
.inventory-management > h2 {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  font-weight: 600;
}

.admin-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}

.admin-product-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
}

.admin-product-image {
  display: block;
  width: 100%;
  aspect-ratio: 1.15;
  object-fit: contain;
  background: var(--bg-secondary);
}

.admin-product-details {
  padding: 12px;
}

.admin-product-details h3 {
  overflow: hidden;
  margin: 0;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-product-details p {
  margin: 4px 0 8px;
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
}

.admin-product-prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--ink);
  font-size: 12px;
}

.admin-product-prices del {
  color: var(--muted);
  font-size: 11px;
}

.admin-product-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.product-edit-btn,
.product-delete-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.product-edit-btn:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

.product-delete-btn {
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--red);
}

.product-delete-btn:hover {
  border-color: var(--red);
  background: rgba(239, 68, 68, 0.08);
}

.add-product-btn {
  padding: 8px 20px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 50px;
}

.add-product-btn:hover {
  opacity: 0.8;
}

.add-product-form {
  margin: 20px 0 24px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.add-product-form h3 {
  margin: 0 0 16px;
  color: var(--ink);
  font-size: 16px;
  font-weight: 600;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.form-group input,
.form-group textarea,
.form-group select {
  height: 40px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 13px;
}

.form-group textarea {
  height: auto;
  min-height: 80px;
  padding: 10px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn {
  padding: 10px 28px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--ink);
  color: var(--text-inverse);
}

.btn--primary:hover {
  opacity: 0.8;
}

.btn--secondary {
  background: transparent;
  color: var(--ink);
}

.btn--secondary:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

.order-admin-card,
.inventory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 8px;
  background: var(--bg-secondary);
}

.order-admin-card {
  display: block;
}

.order-admin-header,
.order-admin-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.order-admin-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  color: var(--muted);
  font-size: 11px;
}

.order-admin-controls select {
  min-width: 130px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 12px;
}

.order-admin-customer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--muted);
  font-size: 11px;
}

.order-admin-customer strong,
.order-admin-summary strong {
  color: var(--ink);
  font-size: 13px;
}

.order-admin-summary {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  color: var(--muted);
  font-size: 11px;
}

.inventory-item {
  align-items: flex-start;
  gap: 20px;
}

.inventory-product-info {
  display: flex;
  flex: 0 0 180px;
  flex-direction: column;
  gap: 6px;
}

.inventory-product {
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}

.inventory-stock {
  color: var(--muted);
  font-size: 11px;
}

.inventory-sizes {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 10px;
}

.inventory-size {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 11px;
}

.inventory-size input {
  width: 72px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font: inherit;
}

.order-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
}

.order-status.pending { background: var(--bg-tertiary); color: var(--muted); }
.order-status.processing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.order-status.delivered { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

.empty-admin {
  text-align: center;
  padding: 48px 24px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .inventory-item {
    flex-direction: column;
    gap: 12px;
  }

  .inventory-product-info {
    flex-basis: auto;
  }

  .admin-page {
    padding: 20px 5% 32px;
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
