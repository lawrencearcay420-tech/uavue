<script setup>
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'Nothing to see here.' },
  emptyDescription: { type: String, default: '' },
  emptyActionLabel: { type: String, default: '' },
  columns: { type: Number, default: 4 }
})

const emit = defineEmits(['empty-action'])

const gridCols = computed(() => {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }
  return colMap[props.columns] || 'grid-cols-4'
})
</script>

<template>
  <div class="product-grid" :class="gridCols">
    <LoadingState v-if="loading" :count="columns" type="card" />
    <EmptyState
      v-else-if="products.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
      :action-label="emptyActionLabel"
      @action="emit('empty-action')"
    />
    <div v-for="product in products" :key="product.id">
      <ProductCard :product="product" />
    </div>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  gap: 24px;
  width: 100%;
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .grid-cols-4 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
  .product-grid { gap: 24px; }
}

@media (max-width: 480px) {
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
  .product-grid { gap: 18px 12px; }
}
</style>