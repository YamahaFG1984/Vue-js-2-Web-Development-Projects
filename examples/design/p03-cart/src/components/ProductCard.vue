<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { formatCents } from '../lib/money'

const props = defineProps({ product: { type: Object, required: true } })
const cart = useCartStore()

const inCart = computed(() => cart.qtyOf(props.product.id))
const canAdd = computed(() => inCart.value < props.product.stock)
</script>

<template>
  <article class="card">
    <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="pic">{{ product.emoji }}</RouterLink>
    <h3>{{ product.name }}</h3>
    <p class="price">{{ formatCents(product.price) }}</p>
    <button :disabled="!canAdd" @click="cart.add(product.id)">
      {{ product.stock === 0 ? '已售罄' : canAdd ? '加入购物车' : '已达库存上限' }}
    </button>
    <small v-if="inCart" class="muted">购物车里已有 {{ inCart }} 件</small>
  </article>
</template>
