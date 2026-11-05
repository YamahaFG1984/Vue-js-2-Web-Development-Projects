/* ================================================================
   Vue 3 项目实战教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
// 保持经典 <script> 而不是 type="module"：模块脚本在 file:// 下会被浏览器拦截，
// 而这些页面经常是直接双击打开的。
(() => {
  'use strict';

  const CHAPTERS = [
    { id: '1', t: '初识 Vue 3',              d: '渐进式框架、响应式数据与第一个 createApp', part: '第一部分 · 不用构建工具' },
    { id: '2', t: '项目一：Markdown 笔记本',  d: '计算属性、侦听器、生命周期、列表与条件渲染、自定义指令' },
    { id: '3', t: '项目二：城堡决斗卡牌游戏', d: '组件树、Props 与事件、插槽、过渡动画、Teleport 与 SVG' },
    { id: '4', t: '工程化：Vite 与单文件组件', d: 'create-vue、<script setup>、TypeScript、环境变量', part: '第二部分 · 工程化开发' },
    { id: '5A', num: '5', label: '第 5 章（上）', file: 'ch05.html',  t: '项目三（上）：路由与认证', d: 'Vue Router 4、插件、组合式函数、登录、导航守卫' },
    { id: '5B', num: '5', label: '第 5 章（下）', file: 'ch05b.html', t: '项目三（下）：工单与表单', d: '嵌套路由、表单校验、复合组件、KeepAlive、错误处理' },
    { id: '6', t: '项目四：地理定位博客',     d: 'Pinia 状态管理、OAuth 登录、地图与作用域插槽' },
    { id: '7', t: '项目五：在线商店与规模化', d: 'ESLint、Vitest、Playwright、vue-i18n、Nuxt 与 CI/CD', part: '第三部分 · 规模化与全栈' },
    { id: '8', t: '项目六：Meteor 实时仪表盘', d: 'Meteor 3 + Vue 3：集合、方法、发布订阅与大列表性能' },
    { id: '9',  file: 'adv01.html', t: '深入响应式原理',       d: '亲手实现响应式系统、effectScope、customRef 与 Vapor Mode', part: '第四部分 · 进阶专题' },
    { id: '10', file: 'adv02.html', t: '组件库与设计系统',     d: '组件库选型、主题定制、无障碍' },
    { id: '11', file: 'adv03.html', t: '大型项目架构',         d: '按功能组织代码、monorepo、开发并发布组件库' },
    { id: '12', file: 'adv04.html', t: '跨端：PWA、移动端与桌面端', d: 'vite-plugin-pwa、Capacitor、Tauri' },
    { id: '13', file: 'adv05.html', t: 'AI 应用前端：流式聊天界面', d: 'Hono + DeepSeek、流式输出、中断与 Markdown 渲染' },
    { id: 'A', num: '附', label: '附录', file: 'ch09.html', t: 'Vue 2 → Vue 3 速查', d: '书中每一处 Vue 2 写法在 Vue 3 里怎么改', part: '附录' }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  // 每个条目：id（页面 data-chapter）、num（侧边栏编号）、label（“第 N 章”）、file（文件名）
  for (const c of CHAPTERS) {
    c.num ??= c.id;
    c.label ??= `第 ${c.id} 章`;
    c.file ??= `ch${pad(c.id)}.html`;
  }
  const cur = document.body.dataset.chapter || '0';
  const curIndex = CHAPTERS.findIndex((c) => c.id === cur);

  /* ---------- 侧边栏 ---------- */
  const side = document.getElementById('sidebar');
  if (side) {
    const brand = '<a class="brand" href="index.html"><span class="flame">' +
      '<svg viewBox="0 0 24 21" width="16" height="14" aria-hidden="true"><path d="M0 0h4.6L12 12.7 19.4 0H24L12 20.8z" fill="#fff"/><path d="M4.6 0h4.2L12 5.5 15.2 0h4.2L12 12.7z" fill="#bff0d8"/></svg></span>' +
      '<span>Vue 3 项目实战<small>用 6 个应用学会现代 Vue</small></span></a>';
    const links = CHAPTERS.map(({ id, num, t, part, file }) =>
      (part ? `<div class="part">${part}</div>` : '') +
      `<a class="ch${id === cur ? ' active' : ''}" href="${file}"><span class="n">${num}</span><span>${t}</span></a>`
    );
    const sw = '<a class="switch" href="react/index.html">&#8644; 切换到 React 版教程</a>';
    side.innerHTML = brand + sw + links.join('');
    const active = side.querySelector('a.ch.active');
    if (active) setTimeout(() => active.scrollIntoView({ block: 'center' }), 0);
  }

  /* ---------- 移动端菜单 ---------- */
  const btn = Object.assign(document.createElement('button'), {
    id: 'menu-btn',
    type: 'button',
    innerHTML: '&#9776;',
    onclick: () => document.body.classList.toggle('nav-open')
  });
  btn.setAttribute('aria-label', '目录');
  document.body.appendChild(btn);
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'vue3-doc-theme';
  const tbtn = Object.assign(document.createElement('button'), {
    id: 'theme-btn',
    type: 'button',
    innerHTML: '&#9789;',
    onclick: () => {
      const root = document.documentElement;
      const now = root.getAttribute('data-theme');
      const dark = now ? now === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    }
  });
  tbtn.setAttribute('aria-label', '切换深浅色');
  document.body.appendChild(tbtn);
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // 注意：SVG marker 的内容不会从引用它的元素继承 color，
  // 所以这里直接用 CSS 变量填色，而不是 currentColor。
  const marker = (id, fill) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${fill}"/></marker>`;
  defs.innerHTML = `<defs>${marker('ar', 'var(--fg-faint)')}${marker('ar-a', 'var(--accent)')}</defs>`;
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  const main = document.querySelector('main');
  const slot = document.getElementById('chapter-toc');
  if (slot && main) {
    const hs = [...main.querySelectorAll('h2')];
    if (hs.length > 2) {
      const items = hs.map((h, i) => {
        if (!h.id) h.id = `sec-${i + 1}`;
        return `<li><a href="#${h.id}">${h.textContent}</a></li>`;
      });
      slot.className = 'toc';
      slot.innerHTML = `<div class="h">本章目录</div><ol>${items.join('')}</ol>`;
    }
  }

  /* ---------- 代码块：语言标签 + 复制 + 高亮 ---------- */
  const KW = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'extends|implements|for|while|of|in|do|try|catch|finally|throw|switch|case|break|continue|' +
    'type|interface|enum|as|satisfies|typeof|instanceof|delete|void|yield|public|private|readonly|' +
    'null|undefined|true|false|this|super|static|declare|namespace').split('|');

  // HTML / Vue 模板：注释、字符串、标签名、属性名（含 v- / : / @ / # 前缀）
  const RE_HTML = new RegExp([
    /(<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*)/.source,                // 1 注释
    /("(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*'|`(?:\\[\s\S]|[^\\`])*`)/.source, // 2 字符串
    /(<\/?[A-Za-z][\w.-]*|\/?>)/.source,                                            // 3 标签
    /(?<=\s)([:@#]?[A-Za-z_][\w:.\-]*|[:@#][\w\[\].-]+)(?=\s*=)/.source,            // 4 属性
    String.raw`\b(${KW.join('|')})\b`,                                             // 5 关键字
    /\b(\d+(?:\.\d+)?)\b/.source                                                   // 6 数字
  ].join('|'), 'g');
  const HTML_CLASSES = ['tk-cm', 'tk-st', 'tk-tg', 'tk-at', 'tk-kw', 'tk-nm'];
  const HTML_LIKE = new Set(['html', 'vue', 'xml', 'svg']);

  // 每一段用正则字面量写，取 .source 拼起来，省掉字符串里的双重转义
  const RE_JS = new RegExp([
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/.source,                                           // 1 注释
    /(`(?:\\[\s\S]|[^\\`])*`|'(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")/.source,    // 2 字符串
    String.raw`\b(${KW.join('|')})\b`,                                                // 3 关键字
    /\b([A-Z][A-Za-z0-9_]*)\b/.source,                                                // 4 类型/构造器
    /\b(\d+(?:\.\d+)?)\b/.source,                                                     // 5 数字
    /\b([a-zA-Z_$][\w$]*)(?=\()/.source                                               // 6 函数调用
  ].join('|'), 'g');

  const RE_SH = /(#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|\b(npm|npx|pnpm|yarn|bun|deno|node|git|cd|mkdir|curl|export|vitest|docker|meteor|vite|json-server)\b/g;

  const SH_CLASSES = ['tk-cm', 'tk-st', 'tk-kw'];
  const JS_CLASSES = ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];
  // 这些语言没有专门的规则，借用 shell 的注释 / 字符串规则就够了
  const SH_LIKE = new Set(['bash', 'sh', 'shell', 'text', 'json5', 'toml', 'http', 'stylus', 'pug']);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function paint(src, re, classes) {
    let out = '';
    let last = 0;
    // 所有分支都至少匹配一个字符，matchAll 不会卡在零宽匹配上
    for (const m of src.matchAll(re)) {
      out += esc(src.slice(last, m.index));
      const g = m.findIndex((v, i) => i > 0 && v !== undefined);
      out += `<span class="${classes[g - 1]}">${esc(m[g])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  document.querySelectorAll('.code').forEach((box) => {
    const pre = box.querySelector('pre');
    if (!pre) return;
    const { lang = '', file = '' } = box.dataset;

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = `<span class="tag">${esc(file || lang || 'code')}</span>`;
    const cp = Object.assign(document.createElement('button'), {
      className: 'copy',
      type: 'button',
      textContent: '复制'
    });
    cp.onclick = () => {
      navigator.clipboard?.writeText(pre.textContent);
      cp.textContent = '已复制';
      setTimeout(() => { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    const code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    pre.innerHTML = SH_LIKE.has(lang) ? paint(code, RE_SH, SH_CLASSES)
      : HTML_LIKE.has(lang) ? paint(code, RE_HTML, HTML_CLASSES)
      : paint(code, RE_JS, JS_CLASSES);
  });

  /* ---------- 上一章 / 下一章 ---------- */
  const pager = document.getElementById('pager');
  if (pager && curIndex !== -1) {
    const prev = CHAPTERS[curIndex - 1];
    const next = CHAPTERS[curIndex + 1];
    const prevLink = prev
      ? `<a class="prev" href="${prev.file}"><span>&larr; 上一章</span>${prev.label} · ${prev.t}</a>`
      : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    const nextLink = next
      ? `<a class="next" href="${next.file}"><span>下一章 &rarr;</span>${next.label} · ${next.t}</a>`
      : '<a class="next ph" href="#">.</a>';
    pager.className = 'pager';
    pager.innerHTML = prevLink + nextLink;
  }

  /* ---------- 首页目录 ---------- */
  const grid = document.getElementById('toc-grid');
  if (grid) {
    grid.className = 'toc-grid';
    grid.innerHTML = CHAPTERS.map(({ label, t, d, file }) =>
      `<a class="toc-card" href="${file}">` +
      `<div class="n">${label}</div>` +
      `<div class="t">${t}</div>` +
      `<div class="d">${d}</div></a>`
    ).join('');
  }
})();
