import { ref, computed, watch, watchEffect } from 'vue'

export const PHASE_LABEL = { focus: '专注', shortBreak: '短休息', longBreak: '长休息' }

const STORAGE_KEY = 'pomodoro-v1'
const DEFAULT_SETTINGS = { focus: 25, shortBreak: 5, longBreak: 15, longEvery: 4 }
const MINUTE = 60_000

const today = () => new Date().toLocaleDateString('sv') // 形如 2026-11-05

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

/**
 * 番茄钟的全部逻辑。组件只负责“画”，不关心计时细节。
 * @param {{ onFinish?: (ended: string) => void }} options
 */
export function usePomodoro({ onFinish } = {}) {
  const saved = load()

  // ---------------- 状态：必须记住、而且算不出来的东西 ----------------
  const settings = ref({ ...DEFAULT_SETTINGS, ...saved.settings })
  const phase = ref(saved.phase ?? 'focus') // 'focus' | 'shortBreak' | 'longBreak'
  // 三种形态，各自只带自己需要的字段，“计时中却没有结束时间”这种状态根本写不出来
  //   { status: 'idle' } | { status: 'running', endAt } | { status: 'paused', left }
  const timer = ref(saved.timer ?? { status: 'idle' })
  const completed = ref(saved.day === today() ? saved.completed : 0)
  const now = ref(Date.now()) // “当前时间”也是状态：它在变，界面要跟着变

  // ---------------- 派生：都由上面的状态算出来 ----------------
  const status = computed(() => timer.value.status)
  const duration = computed(() => settings.value[phase.value] * MINUTE)
  const remaining = computed(() => {
    const t = timer.value
    if (t.status === 'running') return Math.max(0, t.endAt - now.value)
    if (t.status === 'paused') return t.left
    return duration.value
  })
  const progress = computed(() => Math.min(1, Math.max(0, 1 - remaining.value / duration.value)))
  const display = computed(() => {
    const s = Math.ceil(remaining.value / 1000)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })
  const nextPhase = computed(() => {
    if (phase.value !== 'focus') return 'focus'
    return (completed.value + 1) % settings.value.longEvery === 0 ? 'longBreak' : 'shortBreak'
  })

  // ---------------- 事件：每个函数只做一件事——改状态 ----------------
  function start() {
    // 空闲和暂停都能开始：remaining 已经替我们区分了两种情况
    timer.value = { status: 'running', endAt: Date.now() + remaining.value }
  }
  function pause() {
    timer.value = { status: 'paused', left: Math.max(0, timer.value.endAt - Date.now()) }
  }
  function reset() {
    timer.value = { status: 'idle' }
  }
  function switchTo(next) {
    phase.value = next
    timer.value = { status: 'idle' }
  }
  function skip() {
    switchTo(nextPhase.value) // 跳过的番茄不计数
  }
  function finish() {
    const ended = phase.value
    const next = nextPhase.value // 必须先取：completed 一变，nextPhase 就会跟着变
    if (ended === 'focus') completed.value++
    switchTo(next)
    onFinish?.(ended)
  }
  function tick() {
    now.value = Date.now()
    if (status.value === 'running' && remaining.value === 0) finish()
  }

  // ---------------- 副作用：把状态同步到“外面的世界” ----------------
  // 1. 时钟：只在计时中运行；状态一变或组件卸载，onCleanup 负责关掉旧的定时器
  watch(status, (s, _old, onCleanup) => {
    if (s !== 'running') return
    tick()
    const id = setInterval(tick, 250)
    onCleanup(() => clearInterval(id))
  }, { immediate: true })

  // 2. 标题栏：切到别的标签页也能看到剩余时间
  watchEffect(() => {
    document.title = `${display.value} · ${PHASE_LABEL[phase.value]}`
  })

  // 3. 持久化：刷新页面后一切照旧（endAt 是绝对时间，所以计时也能接上）
  watch([settings, phase, timer, completed], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: settings.value,
      phase: phase.value,
      timer: timer.value,
      completed: completed.value,
      day: today(),
    }))
  }, { deep: true })

  return {
    // 状态（设置面板要双向绑定，所以给出 ref 本身）
    settings, phase, completed,
    // 派生（只读）
    status, remaining, progress, display, nextPhase,
    // 事件
    start, pause, reset, skip,
  }
}
