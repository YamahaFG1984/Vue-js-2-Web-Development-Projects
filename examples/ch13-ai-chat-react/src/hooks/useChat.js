import { useState, useRef } from 'react'
import { readSSE } from '@/lib/readSSE'

// 发给服务器的历史：只保留 role 和 content（思考过程不回传）。
// 出错或还没输出正文就被停止的回复，连同它前面的提问一起跳过，保证 user / assistant 严格交替
function toHistory(messages) {
  const result = []
  for (const { role, content, error } of messages) {
    if (role === 'assistant' && (!content || error)) { result.pop(); continue }
    result.push({ role, content })
  }
  return result
}

export function useChat(endpoint = '/api/chat') {
  const [messages, setMessages] = useState([]) // { id, role, content, reasoning?, stopped?, truncated?, error? }
  const [status, setStatus] = useState('idle') // 'idle' | 'streaming' | 'error'
  const controllerRef = useRef(null)

  // 只替换最后一条（正在生成的回复），前面的消息对象保持不变 → memo 过的 ChatMessage 不会重新渲染
  const updateReply = (change) =>
    setMessages((list) => [...list.slice(0, -1), { ...list.at(-1), ...change(list.at(-1)) }])

  async function run(conversation) {
    const body = JSON.stringify({ messages: toHistory(conversation) })
    setMessages([...conversation, { id: crypto.randomUUID(), role: 'assistant', content: '', reasoning: '' }])

    const controller = new AbortController()
    controllerRef.current = controller
    setStatus('streaming')
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
        // 用更新函数：每一块都基于最新的回复追加（第 2 章的“状态是快照”）
        if (event === 'reasoning') updateReply((r) => ({ reasoning: r.reasoning + payload.text }))
        else if (event === 'delta') updateReply((r) => ({ content: r.content + payload.text }))
        else if (event === 'error') throw new Error(payload.message)
        else if (event === 'done' && payload.finishReason === 'length') updateReply(() => ({ truncated: true }))
      }
      setStatus('idle')
    } catch (err) {
      if (err.name === 'AbortError') { // 用户主动停止，不算错误
        updateReply(() => ({ stopped: true }))
        setStatus('idle')
      } else {
        updateReply(() => ({ error: err.message }))
        setStatus('error')
      }
    } finally {
      controllerRef.current = null
    }
  }

  function send(text) {
    if (!text.trim() || status === 'streaming') return
    return run([...messages, { id: crypto.randomUUID(), role: 'user', content: text.trim() }])
  }

  function stop() {
    controllerRef.current?.abort() // fetch 中断 → 连接关闭 → 服务器 onAbort → 中止对 DeepSeek 的请求
  }

  function retry() {
    // 去掉出错的那条回复，用剩下的对话重新请求
    return run(messages.at(-1)?.error ? messages.slice(0, -1) : messages)
  }

  return { messages, status, isStreaming: status === 'streaming', send, stop, retry }
}
