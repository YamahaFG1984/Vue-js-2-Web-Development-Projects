/* ================================================================
   从设计到实现 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
// 保持经典 <script> 而不是 type="module"：模块脚本在 file:// 下会被浏览器拦截，
// 而这些页面经常是直接双击打开的。
(() => {
  'use strict';

  const CHAPTERS = [
    { id: '1', t: '番茄钟',         d: '设计卡入门：状态、派生、事件、副作用；状态机；存事实而不是存结果', part: '第一阶段 · 状态思维' },
    { id: '2', t: '记账本',         d: '三类状态、派生链、前端规范化、表单草稿与组件拆分' },
    { id: '3', t: '购物车',         d: '状态的作用范围与 Pinia、意图与事实、纯函数与测试、以服务器为准' },
    { id: '4', t: '搜索自动补全框', d: '组件接口设计、键盘与焦点、防抖与竞态、无障碍', part: '第二阶段 · 组件设计', soon: true },
    { id: '5', t: '注册向导',       d: '多步表单、步骤状态机、同步与异步校验、草稿保存', soon: true },
    { id: '6', t: '后台数据表格',   d: 'URL 即状态、服务器分页排序筛选、批量操作、乐观更新', part: '第三阶段 · 对接 Django 后端', soon: true },
    { id: '7', t: '客服聊天室',     d: 'WebSocket、实时数据合并、发送状态与重试、断线重连', soon: true }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  // 每个条目：id（页面 data-chapter）、num（侧边栏编号）、label（“第 N 章”）、file（文件名）
  for (const c of CHAPTERS) {
    c.num ??= c.id;
        c.file ??= `p${pad(c.id)}.html`;
    c.label ??= `项目 ${c.id}`;
  }
  const cur = document.body.dataset.chapter || '0';
  const curIndex = CHAPTERS.findIndex((c) => c.id === cur);

  /* ---------- 侧边栏 ---------- */
  const side = document.getElementById('sidebar');
  if (side) {
    const brand = '<a class="brand" href="index.html"><span class="flame">' +
      '<svg viewBox="0 0 24 21" width="16" height="14" aria-hidden="true"><path d="M0 0h4.6L12 12.7 19.4 0H24L12 20.8z" fill="#fff"/><path d="M4.6 0h4.2L12 5.5 15.2 0h4.2L12 12.7z" fill="#bff0d8"/></svg></span>' +
      '<span>从设计到实现<small>7 个业务项目练出前端思维</small></span></a>';
    const links = CHAPTERS.map(({ id, num, t, part, file, soon }) =>
      (part ? `<div class="part">${part}</div>` : '') +
      (soon
        ? `<span class="ch soon"><span class="n">${num}</span><span>${t}<small>撰写中</small></span></span>`
        : `<a class="ch${id === cur ? ' active' : ''}" href="${file}"><span class="n">${num}</span><span>${t}</span></a>`)
    );
    const sw = '<a class="switch" href="../index.html">&larr; 返回 Vue 3 项目实战教程</a>';
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
  const THEME_KEY = 'vue3-doc-theme'; // 与主教程共用，切换一次处处生效
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
    const ready = (c) => c && !c.soon;
    const prev = CHAPTERS.slice(0, curIndex).findLast(ready);
    const next = CHAPTERS.slice(curIndex + 1).find(ready);
    const prevLink = prev
      ? `<a class="prev" href="${prev.file}"><span>&larr; 上一篇</span>${prev.label} · ${prev.t}</a>`
      : '<a class="prev" href="index.html"><span>&larr; 返回</span>系列首页</a>';
    const nextLink = next
      ? `<a class="next" href="${next.file}"><span>下一篇 &rarr;</span>${next.label} · ${next.t}</a>`
      : '<a class="next ph" href="#">.</a>';
    pager.className = 'pager';
    pager.innerHTML = prevLink + nextLink;
  }

  /* ---------- 首页目录 ---------- */
  const grid = document.getElementById('toc-grid');
  if (grid) {
    grid.className = 'toc-grid';
    grid.innerHTML = CHAPTERS.map(({ label, t, d, file, soon }) =>
      (soon ? '<div class="toc-card soon">' : `<a class="toc-card" href="${file}">`) +
      `<div class="n">${label}${soon ? ' · 撰写中' : ''}</div>` +
      `<div class="t">${t}</div>` +
      `<div class="d">${d}</div>` + (soon ? '</div>' : '</a>')
    ).join('');
  }
})();
