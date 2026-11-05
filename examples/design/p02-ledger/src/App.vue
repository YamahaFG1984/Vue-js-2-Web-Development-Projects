<script setup>
import { ref, computed } from 'vue'
import { useLedger } from './composables/useLedger'
import { useMonthView } from './composables/useMonthView'
import { today, monthOf } from './utils/date'
import MonthSwitcher from './components/MonthSwitcher.vue'
import SummaryCards from './components/SummaryCards.vue'
import RecordForm from './components/RecordForm.vue'
import CategoryChart from './components/CategoryChart.vue'
import RecordList from './components/RecordList.vue'
import CategoryManager from './components/CategoryManager.vue'

// 领域数据：要持久化，和业务有关
const {
  records, categories, categoryById, usage,
  addRecord, updateRecord, removeRecord, updateCategory, removeCategory,
} = useLedger()

// 界面状态：只关乎“现在怎么看”，刷新后回到默认值也无妨
const month = ref(monthOf(today()))
const filterId = ref(null)
const editingId = ref(null) // 只存 id，不存记录的副本
const showManager = ref(false)

const { totals, categoryStats, dayGroups } = useMonthView({ records, categoryById, month, filterId })

// 正在编辑的记录由 id 查出来；记录被删掉时它自动变成 null，表单也就自动关闭
const editingRecord = computed(() => records.value.find((r) => r.id === editingId.value) ?? null)

function onSubmit(data) {
  if (editingRecord.value) updateRecord(editingId.value, data)
  else addRecord(data)
  editingId.value = null
  month.value = monthOf(data.date) // 记到别的月份时跳过去，否则用户会以为没保存
}
function onRemove(id) {
  if (confirm('确定删除这条记录吗？')) removeRecord(id)
}
function toggleFilter(id) {
  filterId.value = filterId.value === id ? null : id
}
function onRemoveCategory(id) {
  if (filterId.value === id) filterId.value = null
  removeCategory(id)
}
</script>

<template>
  <div class="ledger">
    <header>
      <h1>记账本</h1>
      <MonthSwitcher v-model="month" />
      <button class="ghost" @click="showManager = !showManager">{{ showManager ? '完成' : '管理分类' }}</button>
    </header>

    <SummaryCards :totals="totals" />

    <div class="cols">
      <aside>
        <!-- key 变了，Vue 会销毁旧表单、创建新表单，草稿随之重置 -->
        <RecordForm :key="editingId ?? 'new'" :categories="categories" :initial="editingRecord"
                    @submit="onSubmit" @cancel="editingId = null" />
        <CategoryChart :stats="categoryStats" :selected-id="filterId" @select="toggleFilter" />
      </aside>
      <main>
        <CategoryManager v-if="showManager" :categories="categories" :usage="usage"
                         @update="updateCategory" @remove="onRemoveCategory" />
        <div v-if="filterId" class="filter-tip">
          只看「{{ categoryById[filterId]?.name }}」<button class="link" @click="filterId = null">清除筛选</button>
        </div>
        <RecordList :groups="dayGroups" :category-by-id="categoryById" :editing-id="editingId"
                    @edit="editingId = $event" @remove="onRemove" />
      </main>
    </div>
  </div>
</template>
