# 项目 4：搜索自动补全框

《从设计到实现》系列第 4 篇的完整代码，教程见 `docs/design/p04.html`。

```bash
npm install
npm run dev    # 演示页：异步搜商品 + 本地选城市 + 请求记录
npm test       # 高亮函数单测 + 组件测试（防抖、竞态、键盘、v-model 同步）
```

搜索关键字里包含 `error` 可以模拟服务器出错。

## 文件结构

```
src/
├── components/
│   ├── AutoComplete.vue        可复用的补全组件（接口：v-model / search / itemKey / itemLabel / 插槽）
│   ├── AutoComplete.test.js    只通过接口测试组件
│   └── HighlightText.vue       关键字高亮（不用 v-html）
├── composables/useSearch.js    防抖 + 竞态保护的搜索
├── lib/highlight.js(.test.js)  切分高亮片段的纯函数
├── api/search.js               模拟接口（随机延迟、支持 AbortSignal）与城市数据
├── App.vue                     两种用法的演示
└── main.js
```
