<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, required: true }, // 0 ~ 1
  display: { type: String, required: true },
  label: { type: String, required: true },
  isBreak: Boolean,
})

const R = 90
const C = 2 * Math.PI * R // 周长
// 进度条长度也是派生数据：父组件只给 progress，怎么画是这个组件自己的事
const offset = computed(() => C * (1 - props.progress))
</script>

<template>
  <div class="ring" :class="{ break: isBreak }">
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <circle class="track" cx="100" cy="100" :r="R" />
      <circle class="bar" cx="100" cy="100" :r="R" :stroke-dasharray="C" :stroke-dashoffset="offset" />
    </svg>
    <div class="time" role="timer">
      {{ display }}
      <small>{{ label }}</small>
    </div>
  </div>
</template>
