<script setup>
import { ref, computed } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  product: { type: Object, required: true }
})

const uiStore = useUIStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const currentIndex = ref(0)

const currentImage = computed(() => {
  const images = props.product.gallery || [props.product.image]
  return images[currentIndex.value] || props.product.image
})

const showFullscreen = ref(false)
const zoomPosition = ref({ x: 0, y: 0 })
const isZoomed = ref(false)

function nextImage() {
  const images = props.product.gallery || [props.product.image]
  currentIndex.value = (currentIndex.value + 1) % images.length
}

function prevImage() {
  const images = props.product.gallery || [props.product.image]
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}

function selectImage(index) {
  currentIndex.value = index
}

function openFullscreen() {
  showFullscreen.value = true
}

function closeFullscreen() {
  showFullscreen.value = false
}

function handleMouseMove(e) {
  if (!showFullscreen.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  zoomPosition.value = { x, y }
}

function toggleWishlist() {
  if (wishlistStore.hasItem(props.product.id)) {
    wishlistStore.removeItem(props.product.id)
    uiStore.showToast('Removed from wishlist', 'info')
  } else {
    wishlistStore.addItem(props.product)
    uiStore.showToast('Added to wishlist', 'success')
  }
}

function isInWishlist() {
  return wishlistStore.hasItem(props.product.id)
}
</script>

<template>
  <div class="product-gallery">
    <div class="gallery-main">
      <img :src="currentImage" :alt="product.name" class="gallery-image" @click="openFullscreen" />
      <button v-if="showFullscreen" class="gallery-close" @click="closeFullscreen" aria-label="Close">
        ×
      </button>
    </div>

    <div v-if="(product.gallery || [product.image]).length > 1" class="gallery-thumbnails">
      <button
        v-for="(img, index) in product.gallery || [product.image]"
        :key="index"
        :class="{ active: index === currentIndex }"
        class="thumbnail"
        @click="selectImage(index)"
      >
        <img :src="img" :alt="`Thumbnail ${index + 1}`" />
      </button>
    </div>

    <div class="gallery-actions">
      <button class="action-button" :class="{ active: isInWishlist() }" @click="toggleWishlist">
        <span>{{ isInWishlist() ? '♥' : '♡' }}</span>
      </button>
    </div>
  </div>

  <teleport to="body">
    <div v-if="showFullscreen" class="gallery-fullscreen-backdrop" @click.self="closeFullscreen" @mousemove="handleMouseMove">
      <div class="gallery-fullscreen-content">
        <img :src="currentImage" :alt="product.name" class="fullscreen-image" :style="{
          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          transform: isZoomed ? 'scale(2)' : 'scale(1)'
        }" @click="isZoomed = !isZoomed" />

        <button v-if="(product.gallery || [product.image]).length > 1" class="nav-arrow prev" @click="prevImage">
          ‹
        </button>
        <button v-if="(product.gallery || [product.image]).length > 1" class="nav-arrow next" @click="nextImage">
          ›
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.gallery-main {
  position: relative;
  aspect-ratio: 1;
  max-height: 520px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: zoom-in;
  transition: transform 0.4s ease;
}

.gallery-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: var(--text-inverse);
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
}

.gallery-thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 80px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-tertiary);
  padding: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: var(--ink);
}

.thumbnail.active {
  border-color: var(--red);
  opacity: 0.7;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-actions {
  margin-top: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  background: var(--bg-primary);
  color: var(--ink);
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-button:hover {
  border-color: var(--ink);
}

.action-button.active {
  color: var(--red);
}

.gallery-fullscreen-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.9);
  display: grid;
  place-items: center;
  cursor: zoom-out;
}

.gallery-fullscreen-content {
  position: relative;
  max-width: min(90vw, 90vh);
  max-height: min(90vw, 90vh);
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-inverse);
  font-size: 28px;
  cursor: pointer;
  border-radius: 4px;
  backdrop-filter: blur(8px);
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-arrow.prev { left: 0; }
.nav-arrow.next { right: 0; }

@media (max-width: 768px) {
  .gallery-thumbnails { flex-direction: row; }
}

@media (max-width: 480px) {
  .nav-arrow { width: 44px; height: 44px; font-size: 22px; }
}
</style>