import { shallowRef, ref, watch, toValue } from 'vue'

/**
 * 根据关键字搜索，自带防抖和竞态保护。
 * @param query   关键字（ref 或 getter）
 * @param search  (query, { signal }) => Item[] | Promise<Item[]>
 * @returns state  { status: 'idle' | 'loading' | 'success' | 'error', items, error } 以及 retry()
 */
export function useSearch(query, search, { debounce = 300, minLength = 1 } = {}) {
  const state = shallowRef({ status: 'idle', items: [], error: '' })
  const attempt = ref(0) // 点“重试”时加一，让下面的 watch 重新执行

  watch(
    [() => toValue(query).trim(), () => toValue(debounce), () => toValue(minLength), attempt],
    ([q, wait, min], _old, onCleanup) => {
      if (q.length < min) {
        state.value = { status: 'idle', items: [], error: '' }
        return
      }
      // 加载中保留上一次的结果，列表不会闪一下变空
      state.value = { ...state.value, status: 'loading' }

      const ctrl = new AbortController()
      const timer = setTimeout(async () => {
        try {
          const items = await search(q, { signal: ctrl.signal })
          if (!ctrl.signal.aborted) state.value = { status: 'success', items, error: '' }
        } catch (e) {
          if (!ctrl.signal.aborted) state.value = { status: 'error', items: [], error: e.message }
        }
      }, wait)

      // 关键字再变（或组件卸载）时：没到点的定时器取消 = 防抖；已发出的请求作废 = 竞态保护
      onCleanup(() => {
        clearTimeout(timer)
        ctrl.abort()
      })
    },
    { immediate: true },
  )

  return { state, retry: () => attempt.value++ }
}
