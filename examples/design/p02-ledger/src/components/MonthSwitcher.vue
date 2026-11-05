<script setup>
import { shiftMonth } from '../utils/date'

const month = defineModel({ type: String, required: true }) // 'YYYY-MM'
</script>

<template>
  <div class="month-switcher">
    <button class="ghost" aria-label="上个月" @click="month = shiftMonth(month, -1)">‹</button>
    <strong>{{ month.replace('-', ' 年 ') }} 月</strong>
    <button class="ghost" aria-label="下个月" @click="month = shiftMonth(month, 1)">›</button>
  </div>
</template>
