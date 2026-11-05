// 把一个 SSE 响应体变成异步迭代器：for await (const { event, data } of readSSE(body))
// data 是原始字符串，由调用者决定怎么解析（DeepSeek 最后会发一个非 JSON 的 [DONE]）
export async function* readSSE(body) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader() // 字节 → 文本
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += value.replaceAll('\r\n', '\n')
    let end
    while ((end = buffer.indexOf('\n\n')) !== -1) { // 找到一个完整事件
      const raw = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      let event = 'message'
      const data = []
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
        // 以冒号开头的是注释（比如保活用的 ": keep-alive"），忽略
      }
      if (data.length) yield { event, data: data.join('\n') }
    }
  }
}
