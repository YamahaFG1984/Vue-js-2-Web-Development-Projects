<script setup>
import { computed, toRef } from 'vue'
import { refThrottled } from '@vueuse/core'
import { renderMarkdown } from '@/lib/markdown'

const props = defineProps({ message: Object, streaming: Boolean })

// 内容每 80ms 最多重新解析一次；最后一次变化保证会被渲染
const content = refThrottled(toRef(() => props.message.content), 80)
const html = computed(() => renderMarkdown(content.value))
</script>

<template>
  <div v-if="message.role === 'user'" class="msg user">{{ message.content }}</div>
  <div v-else class="msg assistant">
    <!-- 思考过程：还没开始回答时展开，开始回答后自动收起 -->
    <details v-if="message.reasoning" class="reasoning" :open="streaming && !message.content">
      <summary>{{ streaming && !message.content ? '思考中…' : '思考过程' }}</summary>
      <p>{{ message.reasoning }}</p>
    </details>
    <div v-html="html" />
    <span v-if="streaming" class="cursor" aria-hidden="true" />
    <small v-if="message.stopped" class="note">已停止生成</small>
    <small v-if="message.truncated" class="note">回答过长，已被截断</small>
    <small v-if="message.error" class="note error">{{ message.error }}</small>
  </div>
</template>
