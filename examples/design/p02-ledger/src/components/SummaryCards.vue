<script setup>
import { formatCents } from '../utils/money'

defineProps({
  totals: { type: Object, required: true }, // { income, expense, balance }，单位：分
})
</script>

<template>
  <div class="summary">
    <div><small>收入</small><b class="income">{{ formatCents(totals.income) }}</b></div>
    <div><small>支出</small><b class="expense">{{ formatCents(totals.expense) }}</b></div>
    <div><small>结余</small><b>{{ formatCents(totals.balance) }}</b></div>
  </div>
</template>
