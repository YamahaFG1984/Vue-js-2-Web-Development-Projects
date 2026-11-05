# 项目 1：番茄钟

《从设计到实现》系列第 1 篇的完整代码，教程见 `docs/design/p01.html`。

```bash
npm install
npm run dev
```

## 文件结构

```
src/
├── composables/usePomodoro.js   全部逻辑：按设计卡的四格（状态 / 派生 / 事件 / 副作用）组织
├── components/
│   ├── TimerRing.vue            圆环与时间（纯展示）
│   ├── TimerControls.vue        开始 / 暂停 / 重置 / 跳过（只发事件）
│   ├── SessionDots.vue          本轮进度点（纯展示）
│   └── SettingsPanel.vue        时长设置（defineModel 双向绑定）
├── App.vue                      组装组件、系统通知
├── main.js
└── styles.css
```
