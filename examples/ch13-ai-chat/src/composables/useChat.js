import { ref, computed } from 'vue'
import { readSSE } from '@/lib/readSSE'

export function useChat(endpoint = '/api/chat') {
  const messages = ref([]) // { id, role, content, reasoning?, stopped?, truncated?, error? }
  const status = ref('idle') // 'idle' | 'streaming' | 'error'
  const isStreaming = computed(() => status.value === 'streaming')
  let controller = null

  // 发给服务器的历史：只保留 role 和 content（思考过程不回传）。
  // 出错或还没输出正文就被停止的回复，连同它前面的提问一起跳过，保证 user / assistant 严格交替
  const history = () => {
    const result = []
    for (const { role, content, error } of messages.value) {
      if (role === 'assistant' && (!content || error)) { result.pop(); continue }
      result.push({ role, content })
    }
    return result
  }

  async function run() {
    const body = JSON.stringify({ messages: history() })
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: '', reasoning: '' })
    // 注意：从响应式数组里取出来的是代理，修改它才会触发更新（第 9 章）
    const reply = messages.value.at(-1)

    controller = new AbortController()
    status.value = 'streaming'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || `HTTP ${res.status}`)

      for await (const { event, data } of readSSE(res.body)) {
        const payload = JSON.parse(data)
        if (event === 'reasoning') reply.reasoning += payload.text
        else if (event === 'delta') reply.content += payload.text
        else if (event === 'error') throw new Error(payload.message)
        else if (event === 'done' && payload.finishReason === 'length') reply.truncated = true
      }
      status.value = 'idle'
    } catch (err) {
      if (err.name === 'AbortError') { // 用户主动停止，不算错误
        reply.stopped = true
        status.value = 'idle'
      } else {
        reply.error = err.message
        status.value = 'error'
      }
    } finally {
      controller = null
    }
  }

  function send(text) {
    if (!text.trim() || isStreaming.value) return
    messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text.trim() })
    return run()
  }

  function stop() {
    controller?.abort() // fetch 中断 → 连接关闭 → 服务器 onAbort → 中止对 DeepSeek 的请求
  }

  function retry() {
    if (messages.value.at(-1)?.error) messages.value.pop() // 去掉出错的那条回复
    return run()
  }

  return { messages, status, isStreaming, send, stop, retry }
}
