<script setup>
import RecordItem from './RecordItem.vue'
import { formatCents } from '../utils/money'
import { formatDay } from '../utils/date'

defineProps({
  groups: { type: Array, required: true }, // [{ date, items, income, expense }]
  categoryById: { type: Object, required: true },
  editingId: { type: String, default: null },
})
// 列表自己不处理编辑和删除，只把事件原样转交给父组件
const emit = defineEmits(['edit', 'remove'])
</script>

<template>
  <section class="panel">
    <p v-if="!groups.length" class="empty">这个月还没有记录，在左边记一笔吧</p>
    <div v-for="g in groups" :key="g.date" class="day">
      <div class="day-head">
        <span>{{ formatDay(g.date) }}</span>
        <small>
          <template v-if="g.income">收 {{ formatCents(g.income) }}　</template>
          <template v-if="g.expense">支 {{ formatCents(g.expense) }}</template>
        </small>
      </div>
      <ul>
        <RecordItem v-for="r in g.items" :key="r.id" :record="r" :category="categoryById[r.categoryId]"
                    :editing="r.id === editingId" @edit="emit('edit', $event)" @remove="emit('remove', $event)" />
      </ul>
    </div>
  </section>
</template>
