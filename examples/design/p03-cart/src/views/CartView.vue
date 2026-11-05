<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'
import CartLine from '../components/CartLine.vue'
import PriceSummary from '../components/PriceSummary.vue'
import { formatCents } from '../lib/money'

const cart = useCartStore()

// 优惠码输入框是草稿：点“使用”之前，和购物车里的 couponCode 无关
const couponInput = ref('')
const couponError = ref('')
function onApply() {
  couponError.value = cart.applyCoupon(couponInput.value) ? '' : '优惠码无效'
  if (!couponError.value) couponInput.value = ''
}
</script>

<template>
  <h1>购物车</h1>
  <p v-if="!cart.items.length" class="empty">购物车是空的，<RouterLink to="/">去逛逛</RouterLink></p>
  <div v-else class="cart">
    <section>
      <label class="select-all">
        <input type="checkbox" :checked="cart.allSelected" @change="cart.toggleAll()"> 全选
      </label>
      <ul class="lines">
        <CartLine v-for="line in cart.lines" :key="line.productId" :line="line"
                  @toggle="cart.toggle" @set-qty="cart.setQty" @remove="cart.remove" />
      </ul>
    </section>
    <aside class="panel">
      <form v-if="!cart.coupon" class="coupon" @submit.prevent="onApply">
        <input v-model="couponInput" placeholder="优惠码：SAVE15 / VIP90" aria-label="优惠码">
        <button class="ghost">使用</button>
      </form>
      <p v-else class="coupon-on">
        已使用「{{ cart.couponCode }}」{{ cart.coupon.label }}
        <button class="link" @click="cart.clearCoupon()">取消</button>
      </p>
      <p v-if="couponError" class="warn">{{ couponError }}</p>
      <p v-if="cart.summary.shortfall" class="muted">还差 {{ formatCents(cart.summary.shortfall) }} 可用此券</p>
      <PriceSummary :summary="cart.summary" />
      <RouterLink v-if="cart.checkoutLines.length" to="/checkout" class="btn">去结算（{{ cart.checkoutLines.length }} 种）</RouterLink>
      <button v-else disabled class="btn">请选择商品</button>
    </aside>
  </div>
</template>
