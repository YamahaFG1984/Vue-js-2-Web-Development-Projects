<script setup>
import { formatCents } from '../lib/money'
import { FREE_SHIPPING_MIN } from '../lib/pricing'

defineProps({
  summary: { type: Object, required: true }, // priceOrder() 的返回值
})
</script>

<template>
  <dl class="summary">
    <dt>商品金额</dt><dd>{{ formatCents(summary.subtotal) }}</dd>
    <template v-if="summary.discount">
      <dt>优惠</dt><dd class="save">−{{ formatCents(summary.discount) }}</dd>
    </template>
    <dt>运费</dt>
    <dd>{{ summary.shipping ? formatCents(summary.shipping) : '包邮' }}</dd>
    <dt class="total">合计</dt><dd class="total">{{ formatCents(summary.total) }}</dd>
  </dl>
  <p v-if="summary.shipping" class="muted">再买 {{ formatCents(FREE_SHIPPING_MIN - summary.subtotal + summary.discount) }} 即可包邮</p>
</template>
