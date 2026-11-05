<script setup>
defineProps({
  categories: { type: Array, required: true },
  usage: { type: Object, required: true }, // { categoryId: 使用次数 }
})
const emit = defineEmits(['update', 'remove'])
</script>

<template>
  <section class="panel">
    <h3>分类管理 <small>改名、换颜色会立刻反映到所有记录</small></h3>
    <ul class="cat-list">
      <li v-for="c in categories" :key="c.id">
        <input type="color" :value="c.color" aria-label="颜色" @change="emit('update', c.id, { color: $event.target.value })">
        <span>{{ c.icon }}</span>
        <input :value="c.name" maxlength="8" aria-label="名称"
               @change="$event.target.value.trim() && emit('update', c.id, { name: $event.target.value.trim() })">
        <small>{{ c.type === 'income' ? '收入' : '支出' }} · {{ usage[c.id] ?? 0 }} 条</small>
        <button class="link danger" :disabled="!!usage[c.id]" :title="usage[c.id] ? '还有记录在用，不能删除' : ''"
                @click="emit('remove', c.id)">删除</button>
      </li>
    </ul>
  </section>
</template>
