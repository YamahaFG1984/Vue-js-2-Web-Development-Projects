import { memo, useDeferredValue, useMemo } from 'react'
import { renderMarkdown } from '@/lib/markdown'

// memo：只有正在生成的最后一条消息会重新渲染，前面的消息 props 没变，直接跳过
export default memo(function ChatMessage({ message, streaming }) {
  // 低优先级地解析 Markdown：内容来得太快时，React 会跳过中间版本，只渲染最新的（第 9 章）
  const content = useDeferredValue(message.content)
  const html = useMemo(() => renderMarkdown(content), [content])

  if (message.role === 'user') return <div className="msg user">{message.content}</div>

  const thinking = streaming && !message.content
  return (
    <div className="msg assistant">
      {/* 思考过程：还没开始回答时展开，开始回答后自动收起 */}
      {message.reasoning && (
        <details className="reasoning" open={thinking}>
          <summary>{thinking ? '思考中…' : '思考过程'}</summary>
          <p>{message.reasoning}</p>
        </details>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {streaming && <span className="cursor" aria-hidden="true" />}
      {message.stopped && <small className="note">已停止生成</small>}
      {message.truncated && <small className="note">回答过长，已被截断</small>}
      {message.error && <small className="note error">{message.error}</small>}
    </div>
  )
})
