<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { setStorage, STORAGE_KEYS } from '@/utils/storage'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const addresses = ref([])
const editingAddress = ref(null)
const addressForm = ref({
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Philippines',
  phone: ''
})

const profileForm = ref({
  name: authStore.userName || '',
  email: authStore.userEmail || '',
  phone: authStore.userPhone || ''
})

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]')
  addresses.value = saved
})

function saveAddresses() {
  setStorage(STORAGE_KEYS.ADDRESSES, addresses.value)
}

function addAddress() {
  if (!addressForm.value.fullName) return
  addresses.value.push({
    ...addressForm.value,
    id: Date.now()
  })
  addressForm.value = { fullName: '', address: '', city: '', state: '', zipCode: '', country: 'Philippines', phone: '' }
  saveAddresses()
  uiStore.showToast('Address added', 'success')
}

function removeAddress(id) {
  addresses.value = addresses.value.filter(a => a.id !== id)
  saveAddresses()
  uiStore.showToast('Address removed', 'info')
}

function editAddress(address) {
  editingAddress.value = address
  addressForm.value = { ...address }
}

function updateAddress() {
  if (!editingAddress.value) return
  const index = addresses.value.findIndex(a => a.id === editingAddress.value.id)
  if (index !== -1) {
    addresses.value[index] = { ...addressForm.value, id: editingAddress.value.id }
  }
  editingAddress.value = null
  addressForm.value = { fullName: '', address: '', city: '', state: '', zipCode: '', country: ' Philippines', phone: '' }
  saveAddresses()
  uiStore.showToast('Address updated', 'success')
}

function saveProfile() {
  authStore.updateProfile(profileForm.value.name, profileForm.value.email, profileForm.value.phone)
  uiStore.showToast('Profile updated', 'success')
}
</script>

<template>
  <div class="account-page">
    <div class="account-grid">
      <aside class="account-sidebar">
        <div class="sidebar-section">
          <h3>Profile</h3>
          <ul>
            <li><a href="#" class="active">Personal Information</a></li>
          </ul>
        </div>
        <div class="sidebar-section">
          <h3>Addresses</h3>
          <ul>
            <li><a href="#" @click="$event.preventDefault()">Saved Addresses</a></li>
          </ul>
        </div>
        <div class="sidebar-section">
          <h3>Orders</h3>
          <ul>
            <li><a href="/orders">Order History</a></li>
          </ul>
        </div>
        <div class="sidebar-section">
          <h3>Account</h3>
          <ul>
            <li><a href="#" @click="$event.preventDefault(); uiStore.setAccountOpen(false); router.push('/login')">Logout</a></li>
          </ul>
        </div>
      </aside>

      <main class="account-main">
        <section class="account-section">
          <h2 class="section-title">Personal Information</h2>
          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" v-model="profileForm.name" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="profileForm.email" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" v-model="profileForm.phone" />
              </div>
              <div class="form-group">
                <label>Member Since</label>
                <input type="text" :value="new Date(authStore.userCreatedAt || Date.now()).toLocaleDateString()" readonly />
              </div>
            </div>
            <button type="submit" class="save-button">Save Changes</button>
          </form>
        </section>

        <section class="account-section">
          <div class="section-header">
            <h2 class="section-title">Saved Addresses</h2>
            <button class="add-address-btn" @click="$event.preventDefault(); editingAddress = null; addressForm = { fullName: '', address: '', city: '', state: '', zipCode: '', country: 'Philippines', phone: '' }">
              + Add Address
            </button>
          </div>

          <div class="address-form-wrapper">
            <form class="address-form" @submit.prevent="editingAddress ? updateAddress() : addAddress()">
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" v-model="addressForm.fullName" required />
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" v-model="addressForm.phone" />
                </div>
              </div>
              <div class="form-group">
                <label>Street Address</label>
                <input type="text" v-model="addressForm.address" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" v-model="addressForm.city" required />
                </div>
                <div class="form-group">
                  <label>Province / State</label>
                  <input type="text" v-model="addressForm.state" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>ZIP Code</label>
                  <input type="text" v-model="addressForm.zipCode" />
                </div>
                <div class="form-group">
                  <label>Country</label>
                  <input type="text" v-model="addressForm.country" />
                </div>
              </div>
              <button type="submit" class="save-button">{{ editingAddress ? 'Update Address' : 'Save Address' }}</button>
            </form>
          </div>

          <div class="address-list">
            <div v-for="address in addresses" :key="address.id" class="address-card">
              <div class="address-content">
                <h3>{{ address.fullName }}</h3>
                <p>{{ address.address }}</p>
                <p>{{ address.city }}{{ address.state ? ', ' + address.state : '' }} {{ address.zipCode }}</p>
                <p>{{ address.phone }}</p>
              </div>
              <div class="address-actions">
                <button class="address-action" @click="editAddress(address)">Edit</button>
                <button class="address-action remove" @click="removeAddress(address.id)">Delete</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  width: min(100%, 1160px);
  margin: 0 auto;
  padding: 24px 28px;
}

.account-grid {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 28px;
}

.account-sidebar {
  position: sticky;
  top: 80px;
  height: min-content;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h3 {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
  color: var(--muted);
}

.sidebar-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-section li {
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-section a {
  display: block;
  padding: 8px 0;
  font-size: 12px;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s;
}

.sidebar-section a:hover {
  color: var(--ink);
}

.sidebar-section a.active {
  color: var(--ink);
  font-weight: 600;
}

.account-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.account-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 22px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 20px;
  color: var(--ink);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.form-group input {
  height: 40px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 13px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--ink);
}

.save-button {
  margin-top: 12px;
  padding: 10px 28px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 50px;
}

.save-button:hover {
  opacity: 0.8;
}

.add-address-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--red);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.address-form-wrapper {
  margin-bottom: 24px;
}

.address-form {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.address-content {
  flex: 1;
}

.address-content h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ink);
}

.address-content p {
  margin: 2px 0;
  font-size: 12px;
  color: var(--muted);
}

.address-actions {
  display: flex;
  gap: 8px;
}

.address-action {
  padding: 4px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
}

.address-action:hover {
  border-color: var(--ink);
}

.address-action.remove:hover {
  border-color: var(--red);
  color: var(--red);
}

@media (max-width: 768px) {
  .account-page {
    padding: 20px 5%;
  }

  .account-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .account-sidebar {
    position: static;
  }

  .account-section {
    padding: 18px;
  }
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .section-header {
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
