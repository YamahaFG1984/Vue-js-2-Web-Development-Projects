<script setup>
// defineModel：父组件写 v-model="settings"，这里拿到的就是那个可读写的 ref
const settings = defineModel({ type: Object, required: true })
defineProps({ disabled: Boolean })

const FIELDS = [
  ['focus', '专注', 1, 90],
  ['shortBreak', '短休息', 1, 30],
  ['longBreak', '长休息', 1, 60],
  ['longEvery', '几个一轮', 2, 8],
]

function update(key, value, min, max) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return
  // 生成一个新对象交回去，而不是直接改父组件对象的字段：数据只从持有它的一方修改
  settings.value = { ...settings.value, [key]: Math.min(max, Math.max(min, n)) }
}
</script>

<template>
  <fieldset class="settings" :disabled="disabled">
    <legend>设置{{ disabled ? '（计时中不可修改）' : '' }}</legend>
    <label v-for="[key, text, min, max] in FIELDS" :key="key">
      {{ text }}
      <input type="number" :min="min" :max="max" :value="settings[key]"
             @change="update(key, $event.target.value, min, max)">
    </label>
  </fieldset>
</template>
