import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AutoComplete from './AutoComplete.vue'

const ITEMS = [{ id: 1, label: '苹果' }, { id: 2, label: '香蕉' }, { id: 3, label: '橙子' }]

// 只通过“接口”测试组件：给 props、模拟用户操作、检查渲染结果和发出的事件，不碰内部变量
function setup(search = vi.fn(async () => ITEMS), props = {}) {
  const wrapper = mount(AutoComplete, { props: { search, ...props }, attachTo: document.body })
  return { wrapper, search, input: wrapper.get('input') }
}
const flush = async (ms = 300) => {
  await vi.advanceTimersByTimeAsync(ms)
  await nextTick()
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('AutoComplete', () => {
  it('防抖：快速输入只在停顿后搜索一次', async () => {
    const { input, search } = setup()
    for (const v of ['苹', '苹果', '苹果汁']) {
      await input.setValue(v)
      await flush(100)
    }
    expect(search).not.toHaveBeenCalled()
    await flush(300)
    expect(search).toHaveBeenCalledTimes(1)
    expect(search.mock.calls[0][0]).toBe('苹果汁')
  })

  it('竞态：先发后到的旧结果不会覆盖新结果', async () => {
    const pending = []
    const search = vi.fn((q) => new Promise((resolve) => pending.push({ q, resolve })))
    const { wrapper, input } = setup(search)
    await input.setValue('a'); await flush()
    await input.setValue('ab'); await flush()
    pending[1].resolve([{ id: 9, label: 'ab 的结果' }]) // 新请求先回来
    pending[0].resolve([{ id: 8, label: 'a 的结果' }]) // 旧请求后回来
    await flush(0)
    expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['ab 的结果'])
  })

  it('键盘：上下键移动高亮，回车选中', async () => {
    const { wrapper, input } = setup()
    await input.setValue('果'); await flush()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    const active = input.attributes('aria-activedescendant')
    expect(wrapper.get(`#${CSS.escape(active)}`).text()).toBe('香蕉')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([ITEMS[1]])
    expect(wrapper.emitted('select')[0]).toEqual([ITEMS[1]])
    expect(input.element.value).toBe('香蕉')
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('Esc：第一次关闭列表，第二次清空', async () => {
    const { input } = setup()
    await input.setValue('果'); await flush()
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.element.value).toBe('果')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.element.value).toBe('')
  })

  it('选中后再改文字，v-model 变回 null', async () => {
    const { wrapper, input } = setup(undefined, { modelValue: ITEMS[0] })
    expect(input.element.value).toBe('苹果')
    await input.setValue('苹')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
  })

  it('出错时显示错误，点重试会再搜一次', async () => {
    const search = vi.fn().mockRejectedValueOnce(new Error('网络错误')).mockResolvedValueOnce(ITEMS)
    const { wrapper, input } = setup(search)
    await input.setValue('果'); await flush()
    expect(wrapper.text()).toContain('网络错误')
    await wrapper.get('.ac-msg button').trigger('mousedown'); await flush()
    expect(search).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('[role=option]')).toHaveLength(3)
  })

  it('minLength 为 0 时，聚焦就会用空关键字调用 search（可用来显示“最近搜索”）', async () => {
    const recent = [{ id: 7, label: '上次搜过的' }]
    const search = vi.fn(async (q) => (q ? ITEMS : recent))
    const { wrapper, input } = setup(search, { minLength: 0, debounce: 0 })
    await input.trigger('focus'); await flush(0)
    expect(search).toHaveBeenCalledWith('', expect.anything())
    expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['上次搜过的'])
  })
})
