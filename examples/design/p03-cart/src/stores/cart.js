import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useCatalogStore } from './catalog'
import { priceOrder, COUPONS } from '../lib/pricing'

const STORAGE_KEY = 'cart-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export const useCartStore = defineStore('cart', () => {
  const catalog = useCatalogStore() // 一个 store 可以直接使用另一个 store
  const saved = load()

  // ---------------- 状态 ----------------
  // 只存“想买什么、买几个、勾没勾”，不存名称和价格：那些以商品目录为准
  const items = ref(saved.items ?? []) // [{ productId, qty, selected }]
  const couponCode = ref(saved.couponCode ?? '')

  // ---------------- 派生 ----------------
  // 购物车条目 + 商品目录 = 可以显示的商品行（相当于一次 JOIN）
  const lines = computed(() => items.value.map((item) => {
    const product = catalog.byId[item.productId] ?? null
    let problem = ''
    if (catalog.status === 'ready') {
      if (!product) problem = '商品已下架'
      else if (product.stock === 0) problem = '已售罄'
      else if (product.stock < item.qty) problem = `库存仅剩 ${product.stock} 件`
    }
    return { ...item, product, problem }
  }))
  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const allSelected = computed(() => items.value.length > 0 && items.value.every((i) => i.selected))
  // 真正要结算的：勾选了、商品信息已加载、而且没有问题
  const checkoutLines = computed(() => lines.value.filter((l) => l.selected && l.product && !l.problem))
  const summary = computed(() =>
    priceOrder(checkoutLines.value.map((l) => ({ price: l.product.price, qty: l.qty })), couponCode.value))
  const coupon = computed(() => COUPONS[couponCode.value] ?? null)

  // ---------------- 事件 ----------------
  const find = (productId) => items.value.find((i) => i.productId === productId)
  const qtyOf = (productId) => find(productId)?.qty ?? 0

  function add(productId, qty = 1) {
    const stock = catalog.byId[productId]?.stock ?? 0
    const item = find(productId)
    if (item) item.qty = Math.min(stock, item.qty + qty)
    else if (stock > 0) items.value.push({ productId, qty: Math.min(stock, qty), selected: true })
  }
  function setQty(productId, qty) {
    const item = find(productId)
    if (item) item.qty = Math.max(1, qty)
  }
  function remove(productId) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }
  function toggle(productId) {
    const item = find(productId)
    if (item) item.selected = !item.selected
  }
  function toggleAll() {
    const next = !allSelected.value // 先算出目标值，再统一设置
    for (const i of items.value) i.selected = next
  }
  function applyCoupon(code) {
    const c = code.trim().toUpperCase()
    if (!COUPONS[c]) return false
    couponCode.value = c
    return true
  }
  function clearCoupon() {
    couponCode.value = ''
  }
  function removePurchased(productIds) {
    items.value = items.value.filter((i) => !productIds.includes(i.productId))
    couponCode.value = '' // 优惠券用掉了
  }
  // 其他标签页改了购物车：用存储里的新值替换内存里的
  function syncFromStorage() {
    const s = load()
    items.value = s.items ?? []
    couponCode.value = s.couponCode ?? ''
  }

  // ---------------- 副作用：持久化 ----------------
  watch([items, couponCode], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: items.value, couponCode: couponCode.value }))
  }, { deep: true })

  return {
    items, couponCode,
    lines, count, allSelected, checkoutLines, summary, coupon,
    qtyOf, add, setQty, remove, toggle, toggleAll, applyCoupon, clearCoupon, removePurchased, syncFromStorage,
  }
})

export { STORAGE_KEY as CART_STORAGE_KEY }
