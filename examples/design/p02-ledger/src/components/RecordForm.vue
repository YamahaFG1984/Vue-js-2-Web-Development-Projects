<script setup>
import { ref, computed } from 'vue'
import { parseYuan, centsToText } from '../utils/money'
import { today } from '../utils/date'

const props = defineProps({
  categories: { type: Array, required: true },
  initial: { type: Object, default: null }, // 编辑时传入原记录；新增时为 null
})
const emit = defineEmits(['submit', 'cancel'])

// ---- 草稿：表单自己的局部状态，提交之前和记录本身毫无关系 ----
function toDraft(r) {
  if (!r) {
    const first = props.categories.find((c) => c.type === 'expense')
    return { type: 'expense', amountText: '', categoryId: first?.id ?? '', date: today(), note: '' }
  }
  const type = props.categories.find((c) => c.id === r.categoryId)?.type ?? 'expense'
  return { type, amountText: centsToText(r.amount), categoryId: r.categoryId, date: r.date, note: r.note }
}
const draft = ref(toDraft(props.initial))
const submitted = ref(false) // 点过“保存”之后才显示错误，别一打开就满屏红字

// ---- 派生：可选的分类、解析后的金额、校验错误 ----
const options = computed(() => props.categories.filter((c) => c.type === draft.value.type))
const amount = computed(() => parseYuan(draft.value.amountText))
const errors = computed(() => {
  const e = {}
  if (amount.value === null) e.amount = '请输入金额，最多两位小数'
  else if (amount.value === 0) e.amount = '金额不能为 0'
  if (!options.value.some((c) => c.id === draft.value.categoryId)) e.category = '请选择分类'
  if (!draft.value.date) e.date = '请选择日期'
  return e
})

// ---- 事件 ----
function setType(type) {
  draft.value.type = type
  // 切换收支后，原来选的分类不再可选，自动换成第一个
  if (!options.value.some((c) => c.id === draft.value.categoryId)) draft.value.categoryId = options.value[0]?.id ?? ''
}
function onSubmit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  const { categoryId, date, note } = draft.value
  // 交出去的是“记录”的形状：金额是分，没有 type（type 由分类决定）
  emit('submit', { amount: amount.value, categoryId, date, note: note.trim() })
  if (!props.initial) {
    // 连续记账：保留收支、分类和日期，只清空金额和备注
    draft.value = { ...draft.value, amountText: '', note: '' }
    submitted.value = false
  }
}
</script>

<template>
  <form class="panel record-form" novalidate @submit.prevent="onSubmit">
    <h3>{{ initial ? '编辑记录' : '记一笔' }}</h3>
    <div class="seg">
      <button type="button" :class="{ on: draft.type === 'expense' }" @click="setType('expense')">支出</button>
      <button type="button" :class="{ on: draft.type === 'income' }" @click="setType('income')">收入</button>
    </div>
    <label>金额（元）
      <input v-model="draft.amountText" inputmode="decimal" placeholder="0.00" autocomplete="off">
      <span v-if="submitted && errors.amount" class="err">{{ errors.amount }}</span>
    </label>
    <div class="chips" role="radiogroup" aria-label="分类">
      <button v-for="c in options" :key="c.id" type="button" role="radio"
              :aria-checked="c.id === draft.categoryId" :class="{ on: c.id === draft.categoryId }"
              :style="{ '--c': c.color }" @click="draft.categoryId = c.id">{{ c.icon }} {{ c.name }}</button>
    </div>
    <span v-if="submitted && errors.category" class="err">{{ errors.category }}</span>
    <label>日期 <input v-model="draft.date" type="date"></label>
    <label>备注 <input v-model="draft.note" maxlength="40" placeholder="可不填"></label>
    <div class="actions">
      <button type="submit">保存</button>
      <button v-if="initial" type="button" class="ghost" @click="emit('cancel')">取消</button>
    </div>
  </form>
</template>
