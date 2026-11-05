import { describe, it, expect } from 'vitest'
import { priceOrder } from './pricing'

const coffee = { price: 12900, qty: 1 }
const notebook = { price: 1990, qty: 2 }

describe('priceOrder', () => {
  it('空购物车一切为 0，也不收运费', () => {
    expect(priceOrder([])).toEqual({ subtotal: 0, discount: 0, shortfall: 0, shipping: 0, total: 0 })
  })

  it('不满 99 收 10 元运费', () => {
    expect(priceOrder([notebook])).toMatchObject({ subtotal: 3980, shipping: 1000, total: 4980 })
  })

  it('满减券：达到门槛才减', () => {
    expect(priceOrder([coffee], 'SAVE15')).toMatchObject({ discount: 1500, total: 11400 })
    expect(priceOrder([notebook], 'SAVE15')).toMatchObject({ discount: 0, shortfall: 6020 })
  })

  it('打折券四舍五入到分，并且有封顶', () => {
    expect(priceOrder([{ price: 1999, qty: 1 }], 'VIP90').discount).toBe(200) // 199.9 分 → 200 分
    expect(priceOrder([{ price: 89900, qty: 1 }], 'VIP90').discount).toBe(5000)
  })

  it('包邮按优惠后的金额判断', () => {
    // 108 元，减 15 后 93 元，不再包邮
    expect(priceOrder([{ price: 10800, qty: 1 }], 'SAVE15')).toMatchObject({ shipping: 1000, total: 10300 })
  })

  it('无效的优惠码当作没有', () => {
    expect(priceOrder([coffee], 'NOPE')).toMatchObject({ discount: 0, total: 12900 })
  })
})
