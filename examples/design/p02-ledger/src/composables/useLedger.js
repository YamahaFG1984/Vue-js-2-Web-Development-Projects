import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'ledger-v1'

const DEFAULT_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: '🍜', color: '#e8590c', type: 'expense' },
  { id: 'transport', name: '交通', icon: '🚇', color: '#1c7ed6', type: 'expense' },
  { id: 'shopping', name: '购物', icon: '🛍️', color: '#ae3ec9', type: 'expense' },
  { id: 'home', name: '居家', icon: '🏠', color: '#2f9e44', type: 'expense' },
  { id: 'fun', name: '娱乐', icon: '🎮', color: '#f08c00', type: 'expense' },
  { id: 'salary', name: '工资', icon: '💼', color: '#0ca678', type: 'income' },
  { id: 'side', name: '副业', icon: '💡', color: '#4263eb', type: 'income' },
]

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

/**
 * 记账本的“领域数据”：记录和分类，以及修改它们的全部操作。
 * 只有这里能改 records / categories，组件拿到的是只读的派生数据和操作函数。
 */
export function useLedger() {
  const saved = load()

  // ---------------- 状态（会被持久化） ----------------
  // 记录只存 categoryId，不存分类名、颜色、收支类型：这些都在分类里，只存一份
  //   { id, amount(分), categoryId, date: 'YYYY-MM-DD', note }
  const records = ref(saved.records ?? [])
  const categories = ref(saved.categories ?? DEFAULT_CATEGORIES)

  // ---------------- 派生 ----------------
  // 按 id 查分类，相当于给外键建了一个索引
  const categoryById = computed(() => Object.fromEntries(categories.value.map((c) => [c.id, c])))
  // 每个分类被多少条记录用到（删除分类时要用）
  const usage = computed(() => {
    const n = {}
    for (const r of records.value) n[r.categoryId] = (n[r.categoryId] ?? 0) + 1
    return n
  })

  // ---------------- 事件 ----------------
  function addRecord(data) {
    records.value.push({ id: crypto.randomUUID(), ...data })
  }
  function updateRecord(id, data) {
    const r = records.value.find((r) => r.id === id)
    if (r) Object.assign(r, data)
  }
  function removeRecord(id) {
    records.value = records.value.filter((r) => r.id !== id)
  }
  function updateCategory(id, patch) {
    const c = categories.value.find((c) => c.id === id)
    if (c) Object.assign(c, patch)
  }
  function removeCategory(id) {
    // 相当于 Django 的 on_delete=PROTECT：还有记录在用，就不许删
    if (usage.value[id]) return false
    categories.value = categories.value.filter((c) => c.id !== id)
    return true
  }

  // ---------------- 副作用：持久化 ----------------
  watch([records, categories], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      records: records.value,
      categories: categories.value,
    }))
  }, { deep: true })

  return {
    records, categories, categoryById, usage,
    addRecord, updateRecord, removeRecord, updateCategory, removeCategory,
  }
}
