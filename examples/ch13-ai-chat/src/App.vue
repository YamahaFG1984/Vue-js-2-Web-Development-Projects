<script setup>
import { ref, useTemplateRef, watch, nextTick } from 'vue'
import { useScroll } from '@vueuse/core'
import { useChat } from '@/composables/useChat'
import ChatMessage from '@/components/ChatMessage.vue'

const { messages, status, isStreaming, send, stop, retry } = useChat()
const input = ref('')

const list = useTemplateRef('list')
const { arrivedState } = useScroll(list, { offset: { bottom: 60 } })

watch(() => {
  const last = messages.value.at(-1)
  return last && last.content + last.reasoning
}, async () => {
  if (!arrivedState.bottom) return // 用户在往上翻，不打扰
  await nextTick() // 等新内容渲染出来
  list.value.scrollTop = list.value.scrollHeight
})

function submit() {
  const text = input.value
  input.value = ''
  send(text)
}

function onEnter(e) {
  if (e.isComposing || e.keyCode === 229) return // 输入法正在组字，交给输入法
  e.preventDefault() // 阻止换行
  submit()
}
</script>

<template>
  <div class="chat">
    <div ref="list" class="chat-list" role="log" :aria-busy="isStreaming">
      <p v-if="!messages.length" class="muted">问我任何关于 Vue 的问题吧。</p>
      <ChatMessage
        v-for="(m, i) in messages" :key="m.id" :message="m"
        :streaming="isStreaming && i === messages.length - 1"
      />
    </div>
    <div class="chat-input">
      <textarea v-model="input" rows="2" placeholder="输入消息，Enter 发送，Shift+Enter 换行" aria-label="消息"
        @keydown.enter.exact="onEnter" />
      <button v-if="isStreaming" @click="stop">停止</button>
      <button v-else-if="status === 'error'" @click="retry">重试</button>
      <button v-else :disabled="!input.trim()" @click="submit">发送</button>
    </div>
  </div>
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; background: #f6f7f9; }
.chat { max-width: 760px; margin: 0 auto; height: 100dvh; display: flex; flex-direction: column; }
.chat-list { flex: 1; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.msg { max-width: 85%; padding: 8px 12px; border-radius: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.msg.user { align-self: flex-end; background: #42b883; color: #fff; white-space: pre-wrap; }
.msg.assistant { align-self: flex-start; background: #fff; border: 1px solid #e3e5e8; }
.msg pre { background: #f3f4f6; padding: 8px; border-radius: 6px; overflow-x: auto; }
.reasoning { color: #6b7280; font-size: 13px; margin-bottom: 6px; }
.reasoning p { white-space: pre-wrap; margin: 4px 0 0; border-left: 3px solid #e3e5e8; padding-left: 8px; }
.cursor { display: inline-block; width: 7px; height: 1em; background: #42b883; animation: blink 1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.note { display: block; color: #9ca3af; font-size: 12px; }
.note.error { color: #dc2626; }
.chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e3e5e8; background: #fff; }
.chat-input textarea { flex: 1; resize: none; font: inherit; font-size: 16px; padding: 6px 10px; }
.muted { color: #9ca3af; }
</style>
