import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import ChatMessage from '@/components/ChatMessage'

export default function App() {
  const { messages, status, isStreaming, send, stop, retry } = useChat()
  const [input, setInput] = useState('')

  // 自动滚动：用户停在底部附近时跟随新内容；往上翻看时不打扰
  const listRef = useRef(null)
  const innerRef = useRef(null)
  const stickRef = useRef(true)
  function handleScroll() {
    const el = listRef.current
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }
  useEffect(() => {
    // 内容高度一变（新的字、Markdown 渲染完成）就检查是否要滚到底
    const observer = new ResizeObserver(() => {
      if (stickRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
    })
    observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  function submit() {
    const text = input
    setInput('')
    stickRef.current = true // 自己发的消息总是要看到
    send(text)
  }

  function handleKeyDown(e) {
    if (e.key !== 'Enter' || e.shiftKey) return // Shift+Enter 换行
    if (e.nativeEvent.isComposing || e.keyCode === 229) return // 输入法正在组字，交给输入法
    e.preventDefault() // 阻止换行
    submit()
  }

  return (
    <div className="chat">
      <div ref={listRef} className="chat-list" role="log" aria-busy={isStreaming} onScroll={handleScroll}>
        <div ref={innerRef} className="chat-inner">
          {!messages.length && <p className="muted">问我任何关于 React 的问题吧。</p>}
          {messages.map((m, i) => (
            <ChatMessage key={m.id} message={m} streaming={isStreaming && i === messages.length - 1} />
          ))}
        </div>
      </div>
      <div className="chat-input">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          rows={2} placeholder="输入消息，Enter 发送，Shift+Enter 换行" aria-label="消息" />
        {isStreaming ? <button onClick={stop}>停止</button>
          : status === 'error' ? <button onClick={retry}>重试</button>
          : <button disabled={!input.trim()} onClick={submit}>发送</button>}
      </div>
    </div>
  )
}
