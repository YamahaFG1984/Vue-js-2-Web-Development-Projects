// 纯函数：输入商品行和优惠码，输出各项金额（单位：分）。
// 不读任何响应式数据、不改任何东西，所以可以在购物车、结算页、服务器、单元测试里随处复用。

export const COUPONS = {
  SAVE15: { label: '满 100 减 15', min: 10000, discount: () => 1500 },
  VIP90: { label: '9 折，最多减 50 元', min: 0, discount: (subtotal) => Math.min(5000, Math.round(subtotal * 0.1)) },
}
export const FREE_SHIPPING_MIN = 9900 // 满 99 包邮（按优惠后的金额算）
export const SHIPPING_FEE = 1000

/**
 * @param {{ price: number, qty: number }[]} lines
 * @param {string} [couponCode]
 */
export function priceOrder(lines, couponCode = '') {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)

  const coupon = COUPONS[couponCode]
  let discount = 0
  let shortfall = 0 // 还差多少能用券
  if (coupon) {
    if (subtotal >= coupon.min) discount = Math.min(subtotal, coupon.discount(subtotal))
    else shortfall = coupon.min - subtotal
  }

  const afterDiscount = subtotal - discount
  const shipping = lines.length === 0 || afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE
  return { subtotal, discount, shortfall, shipping, total: afterDiscount + shipping }
}
