<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const formData = ref({
  email: '',
  password: '',
  remember: false
})

const errors = ref({})

function validate() {
  const newErrors = {}
  if (!formData.value.email) newErrors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(formData.value.email)) newErrors.email = 'Invalid email'
  
  if (!formData.value.password) newErrors.password = 'Password is required'
  else if (formData.value.password.length < 1) newErrors.password = 'Password is required'
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function handleLogin() {
  if (!validate()) return

  const success = authStore.login(formData.value.email, formData.value.password)
  if (success) {
    uiStore.showToast('Welcome back!', 'success')
    const redirect = router.currentRoute.value.query.redirect
    router.push(typeof redirect === 'string' && redirect ? redirect : '/')
    return
  }

  errors.value.password = 'Invalid email or password'
  errors.value.email = 'Invalid email or password'
}

function handleGuestLogin() {
  formData.value.email = 'guest@ua.com'
  formData.value.password = 'guest'
  handleLogin()
}

function handleAdminLogin() {
  formData.value.email = 'admin@ua.com'
  formData.value.password = 'admin123'
  handleLogin()
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">Welcome to UA</h1>
        <p class="login-subtitle">Sign in to access your account, orders, and wishlist.</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="you@example.com"
            :class="{ error: errors.email }"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Password"
            :class="{ error: errors.password }"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="formData.remember" />
            <span>Remember me</span>
          </label>
          <button type="button" class="forgot-link">Forgot password?</button>
        </div>

        <button type="submit" class="login-button">Sign In</button>

        <div class="demo-accounts">
          <p class="demo-label">Demo Accounts:</p>
          <button type="button" class="demo-btn" @click="handleGuestLogin">
            Guest Access
          </button>
          <button type="button" class="demo-btn" @click="handleAdminLogin">
            Admin Access
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>Need to explore first? <router-link to="/" class="signup-link">Continue shopping</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  background: transparent;
}

.login-container {
  width: min(100%, 460px);
  padding: 32px 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(10, 10, 10, 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.32);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.wordmark {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: var(--ink);
}

.wordmark span {
  color: var(--red);
}

.login-title {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 500;
  margin: 0 0 8px;
  color: var(--ink);
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--ink);
}

.form-group input.error {
  border-color: var(--red);
}

.error-message {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--red);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 13px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--muted);
}

.forgot-link {
  color: var(--muted);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
}

.forgot-link:hover {
  color: var(--ink);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 48px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
}

.login-button:hover {
  opacity: 0.8;
}

.demo-accounts {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
  text-align: center;
}

.demo-label {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.demo-btn {
  width: 100%;
  height: 40px;
  margin-bottom: 8px;
  border: 1px solid var(--line);
  background: var(--bg-secondary);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.demo-btn:hover {
  border-color: var(--ink);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}

.signup-link {
  color: var(--ink);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }
}
</style>
