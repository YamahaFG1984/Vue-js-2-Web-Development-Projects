<script setup>
import { computed } from 'vue'

const props = defineProps({
  completed: { type: Number, required: true },
  longEvery: { type: Number, required: true },
})
// 当前这一轮已完成几个：例如每 4 个一轮，完成 6 个 → 这一轮完成 2 个
const inRound = computed(() => props.completed % props.longEvery)
</script>

<template>
  <div class="dots">
    <b v-for="i in longEvery" :key="i" :class="{ done: i <= inRound }" />
    <span>今天完成 {{ completed }} 个番茄</span>
  </div>
</template>
