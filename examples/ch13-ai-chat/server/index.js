import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { streamSSE } from 'hono/streaming'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { readSSE } from '../src/lib/readSSE.js'

const API_KEY = process.env.DEEPSEEK_API_KEY // 用 node --env-file=.env 启动时读入
if (!API_KEY) throw new Error('缺少 DEEPSEEK_API_KEY，请在 .env 中配置')

const SYSTEM_PROMPT = '你是一个友好的 Vue 助教。用简体中文回答，适当使用 Markdown 和代码块。'

// 只接受 user / assistant 交替出现、以 user 结尾的纯文本消息
const ChatBody = z.object({
  messages: z
    .array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(8000),
    }))
    .min(1)
    .max(50)
    .refine(
      (ms) => ms.every((m, i) => m.role === (i % 2 === 0 ? 'user' : 'assistant')) && ms.at(-1).role === 'user',
      '消息必须以 user 开始、交替出现、以 user 结束',
    ),
})

const app = new Hono()

app.post(
  '/api/chat',
  zValidator('json', ChatBody, (result, c) => {
    if (!result.success) return c.json({ message: '消息格式不正确' }, 400)
  }),
  async (c) => {
    const { messages } = c.req.valid('json')
    const upstreamAbort = new AbortController()

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-flash',
        stream: true,
        reasoning_effort: 'low', // 聊天场景少想一点，回答更快
        stream_options: { include_usage: true }, // 最后一块附带 token 用量
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: upstreamAbort.signal,
    })

    if (!upstream.ok) {
      console.error('DeepSeek 返回错误', upstream.status, await upstream.text())
      const message = upstream.status === 429 ? '请求太频繁，请稍后再试' : 'AI 服务暂时不可用'
      return c.json({ message }, 502) // 不把上游的错误细节暴露给前端
    }

    return streamSSE(
      c,
      async (stream) => {
        // 浏览器断开（用户点了停止或关掉页面）→ 中止对 DeepSeek 的请求，不再产生费用
        stream.onAbort(() => {
          console.log('客户端已断开，停止生成')
          upstreamAbort.abort()
        })

        let finishReason = null
        let usage = null
        for await (const { data } of readSSE(upstream.body)) {
          if (data === '[DONE]') break
          const chunk = JSON.parse(data)
          const choice = chunk.choices?.[0]
          if (choice?.delta?.reasoning_content) {
            await stream.writeSSE({ event: 'reasoning', data: JSON.stringify({ text: choice.delta.reasoning_content }) })
          }
          if (choice?.delta?.content) {
            await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text: choice.delta.content }) })
          }
          if (choice?.finish_reason) finishReason = choice.finish_reason
          if (chunk.usage) usage = chunk.usage
        }
        await stream.writeSSE({ event: 'done', data: JSON.stringify({ finishReason, usage }) })
      },
      async (err, stream) => {
        if (upstreamAbort.signal.aborted) return // 是我们主动中止的，不算错误
        console.error(err)
        await stream.writeSSE({ event: 'error', data: JSON.stringify({ message: '生成失败，请稍后重试' }) })
      },
    )
  },
)

serve({ fetch: app.fetch, port: 3000 }, (info) => console.log(`API 服务已启动：http://localhost:${info.port}`))
