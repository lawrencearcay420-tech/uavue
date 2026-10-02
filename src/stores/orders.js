import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref(getStorage(STORAGE_KEYS.ORDERS, []))

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEYS.ORDERS) {
        orders.value = getStorage(STORAGE_KEYS.ORDERS, [])
      }
    })
  }

  const saveOrders = () => {
    return setStorage(STORAGE_KEYS.ORDERS, orders.value)
  }

  const refreshOrders = () => {
    orders.value = getStorage(STORAGE_KEYS.ORDERS, [])
  }

  const userOrders = computed(() => {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return []
    return orders.value
      .filter(o => o.userId === authStore.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  const allOrders = computed(() => [...orders.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))

  const stats = computed(() => {
    const totalRevenue = orders.value.reduce((sum, o) => sum + (o.total || 0), 0)
    const orderCount = orders.value.length
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
    const statusCounts = orders.value.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})
    return { totalRevenue, orderCount, avgOrderValue, statusCounts }
  })

  const bestSellingProducts = computed(() => {
    const productSales = {}
    orders.value.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += item.price * item.quantity
      })
    })
    return Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10)
  })

  function createOrder(orderData) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return null

    const orderNumber = `UA-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(4, '0')}`
    const order = {
      id: `ORD-${Date.now()}`,
      orderId: Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      status: 'processing',
      userId: authStore.userId,
      customer: {
        email: orderData.shippingInfo?.email || authStore.userEmail,
        name: orderData.shippingInfo?.fullName || authStore.userName,
        phone: orderData.shippingInfo?.phone || authStore.userPhone
      },
      ...orderData
    }
    orders.value.unshift(order)
    if (!saveOrders()) {
      orders.value.shift()
      return null
    }
    return order
  }

  function getOrderByNumber(orderNumber) {
    return orders.value.find(o => o.orderNumber === orderNumber)
  }

  function getOrderById(id) {
    return orders.value.find(o => o.id === id || o.orderId === Number(id))
  }

  function updateOrderStatus(orderNumber, status) {
    const order = orders.value.find(o => o.orderNumber === orderNumber || o.id === orderNumber)
    if (!order) return false

    const previousStatus = order.status
    order.status = status
    if (!saveOrders()) {
      order.status = previousStatus
      return false
    }
    return true
  }

  function cancelOrder(orderNumber) {
    const order = orders.value.find(o => o.orderNumber === orderNumber)
    if (order && ['processing', 'confirmed'].includes(order.status.toLowerCase())) {
      order.status = 'cancelled'
      saveOrders()
      return true
    }
    return false
  }

  return {
    orders,
    userOrders,
    allOrders,
    stats,
    bestSellingProducts,
    createOrder,
    getOrderByNumber,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    refreshOrders,
    saveOrders
  }
})
