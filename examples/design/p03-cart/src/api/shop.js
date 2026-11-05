// 一个假的“服务器”：数据只存在这个模块的内存里，每个请求都有网络延迟。
// 第三阶段会换成真正的 Django 后端，前端调用方式（返回 Promise）不变。

const db = {
  products: [
    { id: 'p1', name: '手冲咖啡壶', emoji: '☕', price: 12900, stock: 5, desc: '600ml 细口壶，控水稳定。' },
    { id: 'p2', name: '机械键盘', emoji: '⌨️', price: 39900, stock: 3, desc: '87 键，热插拔轴体。' },
    { id: 'p3', name: '降噪耳机', emoji: '🎧', price: 89900, stock: 2, desc: '主动降噪，续航 30 小时。' },
    { id: 'p4', name: '帆布托特包', emoji: '👜', price: 5900, stock: 20, desc: '12 盎司帆布，能装下 14 寸电脑。' },
    { id: 'p5', name: '绿植盆栽', emoji: '🪴', price: 3500, stock: 0, desc: '好养活的龟背竹。' },
    { id: 'p6', name: '方格笔记本', emoji: '📓', price: 1990, stock: 50, desc: 'A5，160 页，可平摊。' },
  ],
  nextOrder: 1001,
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))
const clone = (x) => structuredClone(x)

export async function fetchProducts() {
  await delay()
  return clone(db.products)
}

/**
 * 下单。服务器不相信客户端算的金额：它用自己的价格和库存重新算一遍，
 * 和客户端看到的金额（expectedTotal）不一致就拒绝。
 */
export async function submitOrder({ items, couponCode, expectedTotal }, priceOrder) {
  await delay(600)
  const lines = []
  for (const { productId, qty } of items) {
    const p = db.products.find((p) => p.id === productId)
    if (!p) throw Object.assign(new Error('商品已下架'), { code: 'NOT_FOUND', productId })
    if (p.stock < qty) throw Object.assign(new Error(`「${p.name}」库存不足`), { code: 'OUT_OF_STOCK', productId })
    lines.push({ productId, name: p.name, emoji: p.emoji, price: p.price, qty })
  }
  // 真实项目里服务器用自己的代码计算；这里为了演示，复用同一个纯函数
  const summary = priceOrder(lines, couponCode)
  if (summary.total !== expectedTotal) {
    throw Object.assign(new Error('商品价格有变动'), { code: 'PRICE_CHANGED', total: summary.total })
  }
  for (const l of lines) db.products.find((p) => p.id === l.productId).stock -= l.qty
  // 订单里的价格是“下单那一刻”的快照，以后商品改价也不影响
  return { id: db.nextOrder++, lines, ...summary, createdAt: new Date().toISOString() }
}

// ---- 只为演示：模拟“后台运营改了价格 / 库存”，客户端不会自动知道 ----
export function adminUpdateProduct(id, patch) {
  Object.assign(db.products.find((p) => p.id === id), patch)
}
export function adminPeek(id) {
  return clone(db.products.find((p) => p.id === id))
}
