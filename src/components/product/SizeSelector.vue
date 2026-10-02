<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  sizes: { type: Array, default: () => [] },
  selected: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  unavailableText: { type: String, default: 'Out of Stock' }
})

const emit = defineEmits(['update:selected'])

const internalSelected = ref(props.selected || (props.sizes.length > 0 ? props.sizes[0].size : ''))

watch(
  () => props.selected,
  (val) => {
    if (val) internalSelected.value = val
  }
)

function selectSize(size) {
  if (!props.disabled && size.inStock !== false) {
    internalSelected.value = size.size
    emit('update:selected', size.size)
  }
}

const isOutOfStock = (size) => {
  if (size.inStock === false) return true
  if (props.sizes.find(s => s.size === size.size && s.inStock === false)) return true
  return false
}

const isSizeUnavailable = (size) => {
  return size.inStock === false
}
</script>

<template>
  <div class="size-selector">
    <p class="size-label">SELECT SIZE</p>
    <div class="size-options">
      <button
        v-for="size in sizes"
        :key="size.size"
        :class="[
          'size-option',
          { selected: size.size === internalSelected },
          { disabled: disabled || isSizeUnavailable(size) }
        ]"
        :disabled="props.disabled || isSizeUnavailable(size)"
        @click="selectSize(size)"
      >
        {{ size.size }}
        <span v-if="typeof size.stock === 'number'" class="size-stock">
          {{ size.stock }} in stock
        </span>
        <span v-if="isSizeUnavailable(size)" class="size-unavailable">
          {{ unavailableText }}
        </span>
      </button>
    </div>
    <p v-if="sizes.some(s => !isSizeUnavailable(s))" class="size-hint">
      {{ internalSelected || 'Select a size' }}
    </p>
  </div>
</template>

<style scoped>
.size-selector {
  margin: 8px 0 20px;
}

.size-label {
  margin: 0 0 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.size-option {
  min-width: 48px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--ink);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.size-option:hover {
  border-color: var(--ink);
}

.size-option.selected {
  border-color: var(--ink);
  background: var(--bg-tertiary);
  font-weight: 600;
}

.size-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.size-unavailable {
  display: block;
  font-size: 8px;
  color: var(--muted);
  margin-top: 2px;
}

.size-stock {
  display: block;
  font-size: 9px;
  color: var(--muted);
  margin-top: 2px;
}

.size-hint {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}
</style>