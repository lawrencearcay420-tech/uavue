export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch {
    return false
  }
}

export const STORAGE_KEYS = {
  PRODUCTS: 'forme-products',
  CART: 'forme-cart',
  THEME: 'forme-theme',
  USER: 'forme-user',
  ORDERS: 'forme-orders',
  WISHLIST: 'forme-wishlist',
  ADDRESSES: 'forme-addresses',
  PROMOS: 'forme-promos',
  RECENT_SEARCHES: 'forme-recent-searches',
  REVIEWS: 'forme-reviews',
  SETTINGS: 'forme-settings',
  NEWSLETTER: 'forme-newsletter'
}

export function migrateStorage() {
  const migrated = { products: false, cart: false, user: false, theme: false, orders: false, wishlist: false, addresses: false }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStorage(STORAGE_KEYS.PRODUCTS, [])
    migrated.products = true
  }

  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    setStorage(STORAGE_KEYS.CART, [])
    migrated.cart = true
  }

  if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setStorage(STORAGE_KEYS.THEME, prefersDark ? 'dark' : 'light')
    migrated.theme = true
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setStorage(STORAGE_KEYS.ORDERS, [])
    migrated.orders = true
  }

  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
    setStorage(STORAGE_KEYS.WISHLIST, [])
    migrated.wishlist = true
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
    setStorage(STORAGE_KEYS.ADDRESSES, [])
    migrated.addresses = true
  }

  return migrated
}