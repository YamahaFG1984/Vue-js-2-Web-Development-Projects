<script setup>
import { computed } from 'vue'
import { usePomodoro, PHASE_LABEL } from './composables/usePomodoro'
import TimerRing from './components/TimerRing.vue'
import TimerControls from './components/TimerControls.vue'
import SessionDots from './components/SessionDots.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const {
  settings, phase, completed,
  status, progress, display, nextPhase,
  start, pause, reset, skip,
} = usePomodoro({ onFinish: notify })

const isBreak = computed(() => phase.value !== 'focus')

// 系统通知也是副作用，但它属于“这个界面怎么提醒用户”，所以放在组件里而不是组合式函数里
function notify(ended) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const text = ended === 'focus' ? '专注结束，休息一下吧' : '休息结束，开始下一个番茄'
  new Notification('番茄钟', { body: text })
}

function onStart() {
  // 浏览器只允许在用户操作里请求通知权限，所以放在“开始”按钮的处理函数中
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  start()
}
</script>

<template>
  <main class="pomodoro">
    <nav class="tabs">
      <span v-for="(text, key) in PHASE_LABEL" :key="key" :class="{ on: key === phase }">{{ text }}</span>
    </nav>

    <TimerRing :progress="progress" :display="display" :label="`下一段：${PHASE_LABEL[nextPhase]}`"
               :is-break="isBreak" />

    <TimerControls :status="status" @start="onStart" @pause="pause" @reset="reset" @skip="skip" />

    <SessionDots :completed="completed" :long-every="settings.longEvery" />

    <SettingsPanel v-model="settings" :disabled="status !== 'idle'" />
  </main>
</template>
