<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const isSignUp = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  remember: false
})

const errors = ref({})

function validate() {
  const newErrors = {}

  if (isSignUp.value && !formData.value.name.trim()) {
    newErrors.name = 'Name is required'
  }

  if (!formData.value.email) newErrors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(formData.value.email)) newErrors.email = 'Invalid email'

  if (!formData.value.password) newErrors.password = 'Password is required'
  else if (formData.value.password.length < 6 && isSignUp.value) newErrors.password = 'Password must be at least 6 characters'
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

function handleSignUp() {
  if (!validate()) return

  const result = authStore.register({
    name: formData.value.name,
    email: formData.value.email,
    password: formData.value.password
  })

  if (!result.success) {
    errors.value.email = result.message
    return
  }

  uiStore.showToast('Account created successfully!', 'success')
  const redirect = router.currentRoute.value.query.redirect
  router.push(typeof redirect === 'string' && redirect ? redirect : '/')
}

function submitForm() {
  if (isSignUp.value) {
    handleSignUp()
    return
  }

  handleLogin()
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
        <h1 class="login-title">{{ isSignUp ? 'Create your account' : 'Welcome to UA' }}</h1>
        <p class="login-subtitle">
          {{ isSignUp ? 'Create an account to track orders, save favorites, and check out faster.' : 'Please sign in to access your account, orders, and wishlist.' }}
        </p>
      </div>

      <form class="login-form" @submit.prevent="submitForm">
        <div v-if="isSignUp" class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Your name"
            :class="{ error: errors.name }"
          />
          <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
        </div>

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

        <div v-if="!isSignUp" class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="formData.remember" />
            <span>Remember me</span>
          </label>
        </div>

        <button type="submit" class="login-button">{{ isSignUp ? 'Create account' : 'Sign In' }}</button>

        <button v-if="!isSignUp" type="button" class="forgot-link">Forgot password?</button>

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
        <p>
          {{ isSignUp ? 'Already have an account?' : 'Need an account?' }}
          <button type="button" class="signup-link" @click="isSignUp = !isSignUp">
            {{ isSignUp ? 'Sign in' : 'Sign up' }}
          </button>
        </p>
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
  background: var(--login-bg);
}

.login-container {
  width: min(100%, 460px);
  padding: 32px 28px 24px;
  border: 1px solid var(--login-card-border);
  border-radius: 18px;
  background: var(--login-card-bg);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;
  color: var(--login-text-primary);
}

.login-form {
  display: block;
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
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin: 0 0 10px;
  color: var(--login-text-primary);
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--login-text-secondary);
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--login-text-secondary);
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--login-input-border);
  border-radius: 10px;
  background: var(--login-input-bg);
  color: var(--login-input-text);
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input::placeholder {
  color: var(--login-text-secondary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--login-input-focus-border);
  background: var(--login-input-focus-bg);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
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
  gap: 8px;
  cursor: pointer;
  color: var(--login-text-secondary);
  font-weight: 500;
}

.checkbox-wrapper input {
  accent-color: var(--login-button-bg);
}

.forgot-link {
  display: block;
  width: 100%;
  margin-top: 18px;
  text-align: center;
  color: var(--login-text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.forgot-link:hover {
  color: var(--login-text-primary);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 48px;
  border: 1px solid var(--login-button-border);
  background: var(--login-button-bg);
  color: var(--login-button-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.login-button:hover {
  background: var(--login-button-hover-bg);
  color: var(--login-button-hover-text);
  border-color: var(--login-button-border);
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
  color: var(--login-text-secondary);
}

.demo-btn {
  width: 100%;
  height: 40px;
  margin-bottom: 8px;
  border: 1px solid var(--login-input-border);
  background: var(--login-input-bg);
  color: var(--login-text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  border-color: var(--login-input-focus-border);
  background: var(--login-input-focus-bg);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--login-text-secondary);
}

.signup-link {
  color: var(--login-text-primary);
  text-decoration: underline;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }
}
</style>
