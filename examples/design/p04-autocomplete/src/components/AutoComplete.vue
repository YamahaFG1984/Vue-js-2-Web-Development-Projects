<script setup>
import { ref, computed, watch, nextTick, useId, useTemplateRef } from 'vue'
import { useSearch } from '../composables/useSearch'
import HighlightText from './HighlightText.vue'

// ================= 接口：先站在使用者的角度设计 =================
const model = defineModel({ default: null }) // 选中的那一项（对象），没选为 null
const props = defineProps({
  search: { type: Function, required: true }, // (query, { signal }) => Item[] | Promise<Item[]>
  itemKey: { type: String, default: 'id' }, // 每一项的唯一标识字段
  itemLabel: { type: String, default: 'label' }, // 显示和回填到输入框的字段
  minLength: { type: Number, default: 1 },
  debounce: { type: Number, default: 300 },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['select']) // 用户选中了一项（v-model 之外的“动作”通知）
// 插槽：#item="{ item, query, active }"、#empty="{ query }"

const keyOf = (item) => item[props.itemKey]
const labelOf = (item) => item[props.itemLabel]

// ================= 状态 =================
const query = ref(model.value ? labelOf(model.value) : '') // 输入框里的文字
const open = ref(false) // 用户是否“想看”列表
const activeKey = ref(null) // 键盘 / 鼠标高亮的那一项的 key（存 key 不存下标）

// 只在列表打开时按输入搜索：选中后回填文字、按 Esc 关闭，都不会再发请求
const searchText = computed(() => (open.value ? query.value : ''))
const { state: result, retry } = useSearch(searchText, (q, opts) => props.search(q, opts), {
  debounce: () => props.debounce,
  minLength: () => props.minLength,
})

// ================= 派生 =================
const items = computed(() => result.value.items)
// 新结果里没有原来高亮的那一项时，自动变成 -1，不需要额外同步
const activeIndex = computed(() => items.value.findIndex((it) => keyOf(it) === activeKey.value))
const showList = computed(() => open.value && query.value.trim().length >= props.minLength)
const listId = useId()
const optionId = (i) => `${listId}-${i}`
const activeId = computed(() => (activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined))
// 给屏幕阅读器的播报
const liveText = computed(() => {
  if (!showList.value) return ''
  if (result.value.status === 'success') return items.value.length ? `${items.value.length} 个结果，用上下键选择` : '没有结果'
  if (result.value.status === 'error') return '搜索出错'
  return ''
})

// ================= 事件 =================
function onInput(e) {
  query.value = e.target.value
  open.value = true
  activeKey.value = null
  if (model.value) model.value = null // 文字改了，原来的选择就不再成立
}
function move(delta) {
  if (!open.value) return void (open.value = true)
  const n = items.value.length
  if (!n) return
  const i = activeIndex.value
  const next = i === -1 ? (delta > 0 ? 0 : n - 1) : (i + delta + n) % n
  activeKey.value = keyOf(items.value[next])
}
function choose(item) {
  model.value = item
  query.value = labelOf(item)
  open.value = false
  activeKey.value = null
  emit('select', item)
}
function onKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault() // 否则光标会跳到行首 / 行尾
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Enter':
      if (showList.value && activeIndex.value >= 0) {
        e.preventDefault() // 别让外层表单提交
        choose(items.value[activeIndex.value])
      }
      break
    case 'Escape':
      if (showList.value) open.value = false // 第一次：关列表
      else if (query.value) { query.value = ''; model.value = null } // 第二次：清空
      break
  }
}

// ================= 副作用 =================
// 外部改了 v-model（比如父组件点了“清空”）：让输入框跟上
watch(model, (m) => {
  if (m) query.value = labelOf(m)
  else if (!open.value) query.value = '' // 用户正在输入时不要清掉他的字
})
// 键盘高亮的项滚动到可见区域
const listEl = useTemplateRef('list')
watch(activeIndex, async (i) => {
  await nextTick()
  if (i >= 0) listEl.value?.children[i]?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div class="ac">
    <input :value="query" role="combobox" aria-autocomplete="list" :aria-expanded="showList"
           :aria-controls="listId" :aria-activedescendant="activeId" :placeholder="placeholder"
           autocomplete="off" @input="onInput" @keydown="onKeydown" @focus="open = true" @blur="open = false">
    <span v-if="result.status === 'loading' && showList" class="ac-spin" aria-hidden="true" />

    <div v-show="showList" class="ac-pop">
      <ul :id="listId" ref="list" role="listbox" :class="{ stale: result.status === 'loading' }">
        <!-- mousedown.prevent：阻止输入框失焦，否则 blur 先关掉列表，click 就点空了 -->
        <li v-for="(item, i) in items" :id="optionId(i)" :key="keyOf(item)" role="option"
            :aria-selected="i === activeIndex" :class="{ active: i === activeIndex }"
            @mousedown.prevent="choose(item)" @mousemove="activeKey = keyOf(item)">
          <slot name="item" :item="item" :query="query" :active="i === activeIndex">
            <HighlightText :text="labelOf(item)" :query="query" />
          </slot>
        </li>
      </ul>
      <p v-if="!items.length && result.status === 'loading'" class="ac-msg">搜索中…</p>
      <p v-else-if="result.status === 'error'" class="ac-msg err">
        {{ result.error }} <button type="button" @mousedown.prevent="retry">重试</button>
      </p>
      <p v-else-if="!items.length && result.status === 'success'" class="ac-msg">
        <slot name="empty" :query="query.trim()">没有找到“{{ query.trim() }}”</slot>
      </p>
    </div>
    <span class="sr-only" aria-live="polite">{{ liveText }}</span>
  </div>
</template>
