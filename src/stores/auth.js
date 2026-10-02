import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, removeStorage, STORAGE_KEYS } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(getStorage(STORAGE_KEYS.USER, null))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhone = computed(() => user.value?.phone || '')
  const userCreatedAt = computed(() => user.value?.createdAt || null)
  const userId = computed(() => user.value?.id || null)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.email === 'admin@ua.com')

  function login(email, password) {
    const name = email.split('@')[0]
    const role = email === 'admin@ua.com' ? 'admin' : 'customer'
    const userData = { id: Date.now(), name, email, role, phone: '', createdAt: new Date().toISOString() }
    user.value = userData
    setStorage(STORAGE_KEYS.USER, userData)
    return { success: true, user: userData }
  }

  function logout() {
    user.value = null
    removeStorage(STORAGE_KEYS.USER)
  }

  function updateProfile(name, email, phone) {
    if (user.value) {
      user.value = { ...user.value, name, email, phone }
      setStorage(STORAGE_KEYS.USER, user.value)
    }
  }

  function checkAuth() {
    user.value = getStorage(STORAGE_KEYS.USER, null)
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    userName,
    userEmail,
    userPhone,
    userCreatedAt,
    userId,
    isAdmin,
    login,
    logout,
    updateProfile,
    checkAuth
  }
})
