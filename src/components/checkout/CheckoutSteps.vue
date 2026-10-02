<script setup>
const props = defineProps({
  step: { type: Number, default: 1 }
})

const steps = [
  { id: 1, name: 'Shipping' },
  { id: 2, name: 'Shipping Method' },
  { id: 3, name: 'Payment' },
  { id: 4, name: 'Review' }
]
</script>

<template>
  <nav class="checkout-steps" aria-label="Checkout progress">
    <ol>
      <li
        v-for="s in steps"
        :key="s.id"
        :class="{
          active: step === s.id,
          complete: step > s.id
        }"
      >
        <div class="step-indicator">
          <span class="step-number">{{ s.id }}</span>
          <span class="step-name">{{ s.name }}</span>
        </div>
        <div v-if="s.id < steps.length" class="step-connector"></div>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.checkout-steps {
  margin-bottom: 32px;
}

.checkout-steps ol {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: step-counter;
}

.checkout-steps li {
  display: flex;
  align-items: flex-start;
  flex: 1;
  position: relative;
}

.checkout-steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: var(--border-subtle);
}

.checkout-steps li.complete:not(:last-child)::after,
.checkout-steps li.active:not(:last-child)::after {
  background: var(--ink);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  background: var(--card-bg);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--muted);
}

li.active .step-number,
li.complete .step-number {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
}

li.complete .step-number {
  border-color: var(--ink);
  background: var(--bg-tertiary);
  color: var(--ink);
}

.step-name {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

li.active .step-name,
li.complete .step-name {
  color: var(--ink);
}

@media (max-width: 768px) {
  .step-name {
    display: none;
  }
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
}
</style>