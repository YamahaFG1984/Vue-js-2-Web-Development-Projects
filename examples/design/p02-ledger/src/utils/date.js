// “哪一天”用 'YYYY-MM-DD' 字符串存储：它是日历上的日期，不是某个时刻，
// 存成时间戳或 Date 会被时区换算成前一天或后一天。

/** 本地时区的今天，形如 '2026-11-06' */
export const today = () => new Date().toLocaleDateString('sv')

/** '2026-11-06' → '2026-11' */
export const monthOf = (date) => date.slice(0, 7)

/** 月份加减：shiftMonth('2026-01', -1) → '2025-12' */
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const WEEK = '日一二三四五六'
/** '2026-11-06' → '11月6日 周五' */
export function formatDay(date) {
  const [y, m, d] = date.split('-').map(Number)
  return `${m}月${d}日 周${WEEK[new Date(y, m - 1, d).getDay()]}`
}
