<script setup>
const props = withDefaults(defineProps<{
  pageTitle?: string
  pageDescription?: string
}>(), {
  pageTitle: '',
  pageDescription: ''
})
</script>

<template>
  <div class="page-container">
    <div v-if="pageTitle" class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p v-if="pageDescription" class="page-description">{{ pageDescription }}</p>
    </div>
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 7.1%;
}

.page-header {
  margin-bottom: 40px;
  animation: rise-in 0.65s ease both;
}

.page-title {
  font-family: var(--serif);
  font-size: clamp(32px, 6vw, 48px);
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.page-description {
  margin-top: 16px;
  font-size: 14px;
  color: var(--muted);
  max-width: 600px;
  line-height: 1.6;
}

.page-content {
  animation: rise-in 0.65s ease both;
  animation-delay: 0.1s;
}

@keyframes rise-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0 5%;
  }
  .page-header {
    margin-bottom: 24px;
  }
}
</style>