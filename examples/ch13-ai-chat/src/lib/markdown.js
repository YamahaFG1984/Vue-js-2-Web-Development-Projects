import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

// 模块级单例，所有消息共用一个实例
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

export function renderMarkdown(text) {
  return DOMPurify.sanitize(md.render(text))
}
