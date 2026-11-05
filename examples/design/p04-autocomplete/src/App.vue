<script setup>
import { ref } from 'vue'
import AutoComplete from './components/AutoComplete.vue'
import HighlightText from './components/HighlightText.vue'
import { searchProducts, requestLog, CITIES } from './api/search'

const formatCents = (c) => `¥${(c / 100).toFixed(2)}`

// 用法一：异步搜索商品，自定义每一项的样子
const product = ref(null)
const picked = ref([])
function onSelect(p) {
  picked.value.unshift(`${p.name}（真实项目里这里会跳转到 /product/${p.id}）`)
}

// 用法二：本地数据选城市，同一个组件，换一个 search 函数
const city = ref(null)
const searchCities = (q) => {
  const k = q.toLowerCase()
  return CITIES.filter((c) => c.name.includes(q) || c.py.startsWith(k))
}
</script>

<template>
  <main class="page">
    <h1>搜索自动补全</h1>

    <section class="box">
      <h2>用法一：搜索商品（异步、自定义插槽）</h2>
      <AutoComplete v-model="product" :search="searchProducts" item-label="name" placeholder="搜索商品，试试“耳机”或“kafei”"
                    @select="onSelect">
        <template #item="{ item, query, active }">
          <span class="emoji">{{ item.emoji }}</span>
          <HighlightText :text="item.name" :query="query" />
          <span class="price" :class="{ active }">{{ formatCents(item.price) }}</span>
        </template>
        <template #empty="{ query }">没有“{{ query }}”相关的商品，换个词试试</template>
      </AutoComplete>
      <p class="muted">v-model：{{ product ? product.name : 'null' }}</p>
      <ul class="picked"><li v-for="(t, i) in picked" :key="i">选中：{{ t }}</li></ul>
    </section>

    <section class="box">
      <h2>用法二：选择城市（本地数据、默认插槽）</h2>
      <AutoComplete v-model="city" :search="searchCities" item-key="code" item-label="name" :debounce="0"
                    placeholder="输入城市名或拼音，如 hang" />
      <p class="muted">v-model：{{ city ? JSON.stringify(city) : 'null' }} <button v-if="city" class="link" @click="city = null">清空</button></p>
    </section>

    <section class="box">
      <h2>请求记录（观察防抖和竞态）</h2>
      <p class="muted">快速输入时，只有停顿 300ms 后才发请求；新请求发出时，旧请求被作废（aborted）。输入含 “error” 可模拟出错。</p>
      <table class="log">
        <tr><th>#</th><th>关键字</th><th>耗时</th><th>结果</th></tr>
        <tr v-for="r in requestLog" :key="r.id" :class="r.status">
          <td>{{ r.id }}</td><td>{{ r.query }}</td><td>{{ r.ms }}ms</td><td>{{ r.status }}</td>
        </tr>
      </table>
    </section>
  </main>
</template>
