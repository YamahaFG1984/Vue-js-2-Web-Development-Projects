// 金额一律用“分”（整数）存储和计算，只在输入和显示时与“元”互相转换。
// 原因：0.1 + 0.2 === 0.30000000000000004，浮点数不适合表示钱。

/** 把用户输入的“元”文本转成分；格式不对返回 null。'12.5' → 1250 */
export function parseYuan(text) {
  const m = /^\s*(\d{1,9})(?:\.(\d{1,2}))?\s*$/.exec(text)
  if (!m) return null
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
}

/** 分 → 便于编辑的“元”文本。1250 → '12.50' */
export function centsToText(cents) {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
}

const fmt = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
/** 分 → 显示用的金额。1250 → '¥12.50' */
export const formatCents = (cents) => fmt.format(cents / 100)
