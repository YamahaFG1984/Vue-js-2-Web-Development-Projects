<script setup>
const qty = defineModel({ type: Number, required: true })
const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: Infinity },
})

function set(n) {
  if (Number.isFinite(n)) qty.value = Math.min(props.max, Math.max(props.min, Math.round(n)))
}
</script>

<template>
  <span class="stepper">
    <button type="button" aria-label="减少" :disabled="qty <= min" @click="set(qty - 1)">−</button>
    <input :value="qty" inputmode="numeric" aria-label="数量" @change="set(Number($event.target.value)); $event.target.value = qty">
    <button type="button" aria-label="增加" :disabled="qty >= max" @click="set(qty + 1)">+</button>
  </span>
</template>
