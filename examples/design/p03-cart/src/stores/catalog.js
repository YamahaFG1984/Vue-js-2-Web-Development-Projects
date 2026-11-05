import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchProducts } from '../api/shop'

// 商品目录：服务器数据在前端的一份缓存
export const useCatalogStore = defineStore('catalog', () => {
  const products = ref([])
  const status = ref('idle') // 'idle' | 'loading' | 'ready' | 'error'
  const error = ref('')

  const byId = computed(() => Object.fromEntries(products.value.map((p) => [p.id, p])))

  async function load() {
    status.value = 'loading'
    try {
      products.value = await fetchProducts()
      status.value = 'ready'
    } catch (e) {
      error.value = e.message
      status.value = 'error'
    }
  }

  return { products, status, error, byId, load }
})
