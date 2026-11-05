<script setup>
import { formatCents } from '../utils/money'

defineProps({
  record: { type: Object, required: true },
  category: { type: Object, default: null }, // 父组件按 categoryId 查好再传进来
  editing: Boolean,
})
const emit = defineEmits(['edit', 'remove'])
</script>

<template>
  <li class="record" :class="{ editing }">
    <span class="icon" :style="{ background: category?.color ?? '#999' }">{{ category?.icon ?? '?' }}</span>
    <span class="text">
      {{ category?.name ?? '未知分类' }}
      <small v-if="record.note">{{ record.note }}</small>
    </span>
    <b :class="category?.type">{{ category?.type === 'income' ? '+' : '−' }}{{ formatCents(record.amount) }}</b>
    <span class="ops">
      <button class="link" @click="emit('edit', record.id)">编辑</button>
      <button class="link danger" @click="emit('remove', record.id)">删除</button>
    </span>
  </li>
</template>
