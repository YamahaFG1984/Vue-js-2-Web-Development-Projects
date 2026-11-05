<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCatalogStore } from './stores/catalog'
import { useCartStore, CART_STORAGE_KEY } from './stores/cart'
import AppHeader from './components/AppHeader.vue'
import DevServerPanel from './components/DevServerPanel.vue'

const catalog = useCatalogStore()
const cart = useCartStore()
onMounted(() => catalog.load())

// 另一个标签页改了购物车，这里同步过来（storage 事件只在“其他”标签页触发）
function onStorage(e) {
  if (e.key === CART_STORAGE_KEY) cart.syncFromStorage()
}
onMounted(() => window.addEventListener('storage', onStorage))
onUnmounted(() => window.removeEventListener('storage', onStorage))
</script>

<template>
  <AppHeader />
  <main class="page">
    <RouterView />
  </main>
  <DevServerPanel />
</template>
