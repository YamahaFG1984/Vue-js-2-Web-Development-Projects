<script setup>
import QtyStepper from './QtyStepper.vue'
import { formatCents } from '../lib/money'

defineProps({
  line: { type: Object, required: true }, // { productId, qty, selected, product, problem }
})
const emit = defineEmits(['toggle', 'set-qty', 'remove'])
</script>

<template>
  <li class="line" :class="{ bad: line.problem }">
    <input type="checkbox" :checked="line.selected" :aria-label="`选择 ${line.product?.name ?? ''}`"
           @change="emit('toggle', line.productId)">
    <template v-if="line.product">
      <span class="pic sm">{{ line.product.emoji }}</span>
      <span class="name">
        <RouterLink :to="{ name: 'product', params: { id: line.productId } }">{{ line.product.name }}</RouterLink>
        <small>{{ formatCents(line.product.price) }}</small>
        <small v-if="line.problem" class="warn">{{ line.problem }}</small>
      </span>
      <QtyStepper :model-value="line.qty" :max="Math.max(line.product.stock, 1)"
                  @update:model-value="emit('set-qty', line.productId, $event)" />
      <b class="sub">{{ formatCents(line.product.price * line.qty) }}</b>
    </template>
    <span v-else class="name muted">{{ line.problem || '加载中…' }}</span>
    <button class="link danger" @click="emit('remove', line.productId)">删除</button>
  </li>
</template>
