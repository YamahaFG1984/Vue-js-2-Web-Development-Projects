<script setup>
import { ref, computed } from 'vue'
import { useCatalogStore } from '../stores/catalog'
import { useCartStore } from '../stores/cart'
import QtyStepper from '../components/QtyStepper.vue'
import { formatCents } from '../lib/money'

const props = defineProps({ id: { type: String, required: true } }) // 来自路由参数
const catalog = useCatalogStore()
const cart = useCartStore()

// 当前商品由“URL 里的 id + 商品目录”派生，不另存一份
const product = computed(() => catalog.byId[props.id] ?? null)
const canAddMore = computed(() => product.value ? product.value.stock - cart.qtyOf(props.id) : 0)

const qty = ref(1) // 选了几件：只属于这个页面的局部状态
const added = ref(false)

function addToCart() {
  cart.add(props.id, qty.value)
  qty.value = 1
  added.value = true
}
</script>

<template>
  <p v-if="catalog.status !== 'ready'" class="muted">加载中…</p>
  <p v-else-if="!product" class="warn">商品不存在。<RouterLink to="/">返回首页</RouterLink></p>
  <section v-else class="detail">
    <div class="pic lg">{{ product.emoji }}</div>
    <div>
      <h1>{{ product.name }}</h1>
      <p class="price">{{ formatCents(product.price) }}</p>
      <p>{{ product.desc }}</p>
      <p class="muted">库存 {{ product.stock }} 件<template v-if="cart.qtyOf(id)">，购物车里已有 {{ cart.qtyOf(id) }} 件</template></p>
      <div v-if="canAddMore > 0" class="row">
        <QtyStepper v-model="qty" :max="canAddMore" />
        <button @click="addToCart">加入购物车</button>
      </div>
      <p v-else class="warn">{{ product.stock ? '已达库存上限' : '已售罄' }}</p>
      <p v-if="added">已加入购物车，<RouterLink to="/cart">去结算 →</RouterLink></p>
    </div>
  </section>
</template>
