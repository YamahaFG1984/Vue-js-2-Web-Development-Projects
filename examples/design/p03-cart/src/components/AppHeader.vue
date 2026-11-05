<script setup>
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">小商城</RouterLink>
    <RouterLink to="/cart" class="cart-link">
      购物车
      <span v-if="cart.count" class="badge" aria-live="polite">{{ cart.count }}</span>
    </RouterLink>
  </header>
</template>
