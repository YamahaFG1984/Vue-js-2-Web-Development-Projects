# 第 13 章示例：流式聊天（React 19 + Hono + DeepSeek）

```bash
npm install
cp .env.example .env      # 填入你的 DeepSeek API 密钥（.env 已被 .gitignore 忽略）
npm run server            # 终端 1：Hono 服务，端口 3000
npm run dev               # 终端 2：Vite 前端，/api 会被代理到 3000
```

服务器代码与 Vue 版示例（`examples/ch13-ai-chat`）相同，只是系统提示词换成了 React 助教。

讲解见 `docs/react/adv05.html`。
