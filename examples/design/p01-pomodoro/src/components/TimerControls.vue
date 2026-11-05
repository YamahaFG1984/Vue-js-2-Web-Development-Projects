<script setup>
defineProps({
  status: { type: String, required: true }, // 'idle' | 'running' | 'paused'
})
// 子组件不改状态，只“报告发生了什么”，由持有状态的一方决定怎么改
const emit = defineEmits(['start', 'pause', 'reset', 'skip'])
</script>

<template>
  <div class="controls">
    <button v-if="status === 'running'" @click="emit('pause')">暂停</button>
    <button v-else @click="emit('start')">{{ status === 'paused' ? '继续' : '开始' }}</button>
    <button class="ghost" :disabled="status === 'idle'" @click="emit('reset')">重置</button>
    <button class="ghost" @click="emit('skip')">跳过</button>
  </div>
</template>
