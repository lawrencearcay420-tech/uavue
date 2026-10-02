<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'

const props = defineProps({
  product: { type: Object, required: true }
})

const authStore = useAuthStore()
const productsStore = useProductsStore()

const newRating = ref(5)
const newReview = ref('')
const showForm = ref(false)

const reviews = computed(() => {
  const storeReviews = productsStore.getProductReviews(props.product.id)
  if (storeReviews.length > 0) return storeReviews
  return props.product.reviews && props.product.reviews.length > 0 ? props.product.reviews : []
})

const ratingCount = computed(() => {
  return reviews.value.length || props.product.reviewCount || 0
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return Number(props.product.rating || 0)
  return reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length
})

const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(r => {
    dist[r.rating] = (dist[r.rating] || 0) + 1
  })
  return dist
})

function submitReview() {
  if (!newReview.value.trim()) return
  productsStore.addReview(props.product.id, {
    id: Date.now(),
    rating: newRating.value,
    text: newReview.value,
    author: authStore.userName,
    date: new Date().toISOString()
  })
  newReview.value = ''
  newRating.value = 5
  showForm.value = false
}
</script>

<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h2 class="reviews-title">Reviews</h2>
      <div class="reviews-summary">
        <div class="average-rating">{{ averageRating.toFixed(1) }} ★</div>
        <div class="rating-count">{{ ratingCount }} {{ ratingCount === 1 ? 'review' : 'reviews' }}</div>
      </div>
    </div>

    <div v-if="authStore.isLoggedIn" class="review-form-trigger">
      <button class="write-review-btn" @click="showForm = !showForm">
        Write a review
      </button>
    </div>

    <form v-if="showForm" class="review-form" @submit.prevent="submitReview">
      <div class="rating-input">
        <label>Rating:</label>
        <div class="stars-input">
          <span v-for="star in [5, 4, 3, 2, 1]" :key="star">
            <button type="button" @click="newRating = star" 
              :class="{ filled: newRating >= star }">
              ★
            </button>
          </span>
        </div>
      </div>
      <textarea v-model="newReview" placeholder="What did you think of this product?" required />
      <div class="review-actions">
        <button type="submit" class="btn btn--primary">Submit Review</button>
        <button type="button" class="btn btn--secondary" @click="showForm = false">Cancel</button>
      </div>
    </form>

    <div v-if="reviews.length > 0" class="reviews-list">
      <div v-for="review in [...reviews].reverse()" :key="review.id" class="review-item">
        <div class="review-header">
          <span class="review-author">{{ review.author }}</span>
          <div class="review-stars">{{ '★'.repeat(review.rating) }}</div>
        </div>
        <p class="review-text">{{ review.text }}</p>
        <time class="review-date">{{ new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</time>
      </div>
    </div>

    <p v-else class="no-reviews">No reviews yet. Be the first to review!</p>

    <div class="rating-breakdown">
      <h3>Rating breakdown</h3>
      <div v-for="stars in [5, 4, 3, 2, 1]" :key="stars" class="rating-row">
        <span>{{ stars }} ★</span>
        <div class="rating-bar-container">
          <div class="rating-bar" :style="{ width: `${(ratingDistribution[stars] / reviews.length) * 100}%` }"></div>
        </div>
        <span>{{ ratingDistribution[stars] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-section {
  margin-top: 48px;
  border-top: 1px solid var(--border-color);
  padding-top: 48px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.reviews-title {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.reviews-summary {
  text-align: right;
}

.average-rating {
  font-size: 28px;
  font-weight: 700;
}

.rating-count {
  font-size: 12px;
  color: var(--muted);
}

.write-review-btn {
  padding: 8px 20px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
}

.write-review-btn:hover {
  border-color: var(--ink);
  background: var(--bg-tertiary);
}

.review-form {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-input label {
  font-size: 12px;
  color: var(--muted);
  min-width: 55px;
}

.stars-input {
  display: flex;
  gap: 2px;
}

.stars-input button {
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
}

.stars-input button.filled {
  color: var(--red);
}

.review-form textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--ink);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.review-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  justify-content: flex-end;
}

.review-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.review-author {
  font-weight: 600;
  font-size: 13px;
  color: var(--ink);
}

.review-stars {
  color: var(--red);
}

.review-text {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.review-date {
  font-size: 11px;
  color: var(--muted);
}

.rating-breakdown {
  margin-top: 32px;
}

.rating-breakdown h3 {
  font-size: 16px;
  margin: 0 0 16px;
  color: var(--ink);
}

.rating-row {
  display: grid;
  grid-template-columns: 40px 1fr 20px;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rating-row span:first-child,
.rating-row span:last-child {
  font-size: 12px;
  color: var(--muted);
}

.rating-bar-container {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.rating-bar {
  height: 100%;
  background: var(--red);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.no-reviews {
  font-size: 14px;
  color: var(--muted);
  text-align: center;
  padding: 24px 0;
}

.btn {
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--ink);
  color: var(--text-inverse);
}

.btn--secondary {
  background: transparent;
  color: var(--ink);
}
</style>