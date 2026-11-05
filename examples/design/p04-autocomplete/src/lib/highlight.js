/**
 * 把文本按关键字切成若干段，标出哪些段是命中的（不区分大小写，所有出现都标出）。
 * 返回数据而不是 HTML 字符串：渲染交给模板，永远不需要 v-html。
 *   splitByQuery('降噪耳机', '耳机') → [{ text: '降噪', hit: false }, { text: '耳机', hit: true }]
 */
export function splitByQuery(text, query) {
  const q = query.trim().toLowerCase()
  if (!q) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const parts = []
  let from = 0
  for (let i = lower.indexOf(q); i !== -1; i = lower.indexOf(q, from)) {
    if (i > from) parts.push({ text: text.slice(from, i), hit: false })
    parts.push({ text: text.slice(i, i + q.length), hit: true })
    from = i + q.length
  }
  if (from < text.length) parts.push({ text: text.slice(from), hit: false })
  return parts
}
