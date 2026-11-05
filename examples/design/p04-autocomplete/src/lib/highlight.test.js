import { describe, it, expect } from 'vitest'
import { splitByQuery } from './highlight'

describe('splitByQuery', () => {
  it('标出命中的部分', () => {
    expect(splitByQuery('降噪耳机', '耳机')).toEqual([{ text: '降噪', hit: false }, { text: '耳机', hit: true }])
  })
  it('不区分大小写，保留原文的大小写', () => {
    expect(splitByQuery('USB Hub', 'usb')).toEqual([{ text: 'USB', hit: true }, { text: ' Hub', hit: false }])
  })
  it('多处命中都标出', () => {
    expect(splitByQuery('咖啡与咖啡杯', '咖啡').filter((p) => p.hit)).toHaveLength(2)
  })
  it('关键字为空或不命中，返回整段', () => {
    expect(splitByQuery('钢笔', '')).toEqual([{ text: '钢笔', hit: false }])
    expect(splitByQuery('钢笔', '耳机')).toEqual([{ text: '钢笔', hit: false }])
  })
  it('特殊字符按字面匹配，不会被当成正则', () => {
    expect(splitByQuery('a+b (c)', '(c)')).toEqual([{ text: 'a+b ', hit: false }, { text: '(c)', hit: true }])
  })
})
