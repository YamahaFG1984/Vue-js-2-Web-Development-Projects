<script setup>
// 仅供学习：模拟“后台运营在服务器上改了价格或库存”。客户端的商品目录不会自动更新。
import { ref } from 'vue'
import { adminUpdateProduct, adminPeek } from '../api/shop'

const open = ref(false)
const id = ref('p1')
const info = ref(null)

function peek() { info.value = adminPeek(id.value) }
function bumpPrice() { adminUpdateProduct(id.value, { price: adminPeek(id.value).price + 1000 }); peek() }
function setStock(stock) { adminUpdateProduct(id.value, { stock }); peek() }
</script>

<template>
  <div class="dev-panel">
    <button class="ghost" @click="open = !open; peek()">模拟服务器</button>
    <div v-if="open">
      <select v-model="id" @change="peek">
        <option v-for="p in ['p1', 'p2', 'p3', 'p4', 'p6']" :key="p" :value="p">{{ p }}</option>
      </select>
      <span v-if="info">服务器上：{{ info.name }} ¥{{ info.price / 100 }}，库存 {{ info.stock }}</span>
      <button class="ghost" @click="bumpPrice">涨价 10 元</button>
      <button class="ghost" @click="setStock(1)">库存改为 1</button>
    </div>
  </div>
</template>
