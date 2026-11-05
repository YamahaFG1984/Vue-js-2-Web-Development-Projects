import { computed } from 'vue'
import { monthOf } from '../utils/date'

/**
 * 从“全部记录”派生出“当前视图要显示的一切”。
 * 输入是几个 ref（领域数据 + 界面状态），输出全是 computed，没有任何自己的状态。
 */
export function useMonthView({ records, categoryById, month, filterId }) {
  // 1. 本月的记录
  const monthRecords = computed(() => records.value.filter((r) => monthOf(r.date) === month.value))

  // 2. 本月收支合计：收入还是支出由分类决定，记录上不重复存
  const totals = computed(() => {
    let income = 0
    let expense = 0
    for (const r of monthRecords.value) {
      if (categoryById.value[r.categoryId]?.type === 'income') income += r.amount
      else expense += r.amount
    }
    return { income, expense, balance: income - expense }
  })

  // 3. 本月各分类的支出，从多到少
  const categoryStats = computed(() => {
    const sum = {}
    for (const r of monthRecords.value) {
      if (categoryById.value[r.categoryId]?.type !== 'expense') continue
      sum[r.categoryId] = (sum[r.categoryId] ?? 0) + r.amount
    }
    const total = totals.value.expense || 1
    return Object.entries(sum)
      .map(([id, amount]) => ({ category: categoryById.value[id], amount, ratio: amount / total }))
      .sort((a, b) => b.amount - a.amount)
  })

  // 4. 按分类筛选后的记录
  const visibleRecords = computed(() =>
    filterId.value ? monthRecords.value.filter((r) => r.categoryId === filterId.value) : monthRecords.value)

  // 5. 按天分组，新的日期在前；每组带当天小计
  const dayGroups = computed(() => {
    const groups = new Map()
    for (const r of visibleRecords.value) {
      if (!groups.has(r.date)) groups.set(r.date, { date: r.date, items: [], income: 0, expense: 0 })
      const g = groups.get(r.date)
      g.items.unshift(r) // 同一天里后记的在前
      if (categoryById.value[r.categoryId]?.type === 'income') g.income += r.amount
      else g.expense += r.amount
    }
    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
  })

  return { monthRecords, totals, categoryStats, visibleRecords, dayGroups }
}
