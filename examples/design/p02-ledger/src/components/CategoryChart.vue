<script setup>
import { formatCents } from '../utils/money'

defineProps({
  stats: { type: Array, required: true }, // [{ category, amount, ratio }]
  selectedId: { type: String, default: null },
})
const emit = defineEmits(['select'])
</script>

<template>
  <section class="panel">
    <h3>支出构成 <small>点击分类可筛选</small></h3>
    <p v-if="!stats.length" class="empty">本月还没有支出</p>
    <button v-for="s in stats" :key="s.category.id" type="button" class="bar-row"
            :class="{ on: s.category.id === selectedId }" @click="emit('select', s.category.id)">
      <span class="name">{{ s.category.icon }} {{ s.category.name }}</span>
      <span class="bar"><i :style="{ width: s.ratio * 100 + '%', background: s.category.color }" /></span>
      <span class="num">{{ formatCents(s.amount) }}</span>
    </button>
  </section>
</template>
