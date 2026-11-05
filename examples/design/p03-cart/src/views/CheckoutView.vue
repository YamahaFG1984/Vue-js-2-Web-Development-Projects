<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { useCatalogStore } from '../stores/catalog'
import { submitOrder } from '../api/shop'
import { priceOrder } from '../lib/pricing'
import { formatCents } from '../lib/money'
import PriceSummary from '../components/PriceSummary.vue'

const cart = useCartStore()
const catalog = useCatalogStore()

// 提交过程是一个状态机：
//   { status: 'idle' } | { status: 'submitting' } | { status: 'done', order } | { status: 'failed', message }
const state = ref({ status: 'idle' })

async function placeOrder() {
  if (state.value.status === 'submitting') return // 防止重复提交
  state.value = { status: 'submitting' }
  const items = cart.checkoutLines.map((l) => ({ productId: l.productId, qty: l.qty }))
  try {
    const order = await submitOrder({ items, couponCode: cart.couponCode, expectedTotal: cart.summary.total }, priceOrder)
    cart.removePurchased(order.lines.map((l) => l.productId))
    state.value = { status: 'done', order }
  } catch (e) {
    // 价格或库存变了：重新拉商品目录。购物车只存了 id，所以所有金额会自动按新价格重算
    if (e.code === 'PRICE_CHANGED' || e.code === 'OUT_OF_STOCK' || e.code === 'NOT_FOUND') await catalog.load()
    const hint = e.code === 'PRICE_CHANGED' ? '，已更新为最新价格，请确认后重新提交' : ''
    state.value = { status: 'failed', message: e.message + hint }
  }
}
</script>

<template>
  <section v-if="state.status === 'done'" class="panel done">
    <h1>下单成功</h1>
    <p>订单号 #{{ state.order.id }}</p>
    <ul>
      <!-- 订单显示的是快照价格：以后商品改价，这里不会变 -->
      <li v-for="l in state.order.lines" :key="l.productId">{{ l.emoji }} {{ l.name }} × {{ l.qty }}　{{ formatCents(l.price * l.qty) }}</li>
    </ul>
    <p>实付 <b>{{ formatCents(state.order.total) }}</b></p>
    <RouterLink to="/">继续购物</RouterLink>
  </section>

  <section v-else class="checkout">
    <h1>确认订单</h1>
    <ul class="lines plain">
      <li v-for="l in cart.checkoutLines" :key="l.productId">
        {{ l.product.emoji }} {{ l.product.name }} × {{ l.qty }}<span>{{ formatCents(l.product.price * l.qty) }}</span>
      </li>
    </ul>
    <p v-if="!cart.checkoutLines.length" class="muted">没有可结算的商品了，<RouterLink to="/cart">回购物车</RouterLink></p>
    <PriceSummary :summary="cart.summary" />
    <p v-if="state.status === 'failed'" class="warn" role="alert">{{ state.message }}</p>
    <button :disabled="state.status === 'submitting' || !cart.checkoutLines.length" @click="placeOrder">
      {{ state.status === 'submitting' ? '提交中…' : `提交订单 ${formatCents(cart.summary.total)}` }}
    </button>
  </section>
</template>
