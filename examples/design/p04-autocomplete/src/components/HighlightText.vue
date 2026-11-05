<script setup>
import { computed } from 'vue'
import { splitByQuery } from '../lib/highlight'

const props = defineProps({ text: { type: String, required: true }, query: { type: String, default: '' } })
const parts = computed(() => splitByQuery(props.text, props.query))
</script>

<template>
  <span><template v-for="(p, i) in parts" :key="i"><mark v-if="p.hit">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></span>
</template>
