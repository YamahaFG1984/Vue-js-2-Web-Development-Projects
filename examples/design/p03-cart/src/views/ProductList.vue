<script setup>
import { useCatalogStore } from '../stores/catalog'
import ProductCard from '../components/ProductCard.vue'

const catalog = useCatalogStore()
</script>

<template>
  <p v-if="catalog.status === 'loading' && !catalog.products.length" class="muted">商品加载中…</p>
  <p v-else-if="catalog.status === 'error'" class="warn">
    加载失败：{{ catalog.error }} <button class="link" @click="catalog.load()">重试</button>
  </p>
  <div v-else class="grid">
    <ProductCard v-for="p in catalog.products" :key="p.id" :product="p" />
  </div>
</template>
