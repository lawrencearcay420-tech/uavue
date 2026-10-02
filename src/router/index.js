import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/pages/Home.vue') },
    { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue'), meta: { guest: true } },
    { path: '/shop', name: 'Shop', component: () => import('@/pages/Shop.vue') },
    { path: '/product/:id', name: 'Product', component: () => import('@/pages/Product.vue') },
    { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout.vue'), meta: { requiresAuth: true } },
    { path: '/order-success', name: 'OrderSuccess', component: () => import('@/pages/OrderSuccess.vue') },
    { path: '/orders', name: 'Orders', component: () => import('@/pages/Orders.vue') },
    { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist.vue'), meta: { requiresAuth: true } },
    { path: '/account', name: 'Account', component: () => import('@/pages/Account.vue'), meta: { requiresAuth: true } },
    { path: '/admin', name: 'Admin', component: () => import('@/pages/Admin.vue'), meta: { requiresAuth: true, admin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  authStore.checkAuth()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.admin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    const redirect = to.query.redirect || '/'
    next(redirect)
    return
  }

  next()
})

export default router