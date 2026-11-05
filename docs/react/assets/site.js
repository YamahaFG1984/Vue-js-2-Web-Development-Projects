/* ================================================================
   React 项目实战教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
// 保持经典 <script> 而不是 type="module"：模块脚本在 file:// 下会被浏览器拦截，
// 而这些页面经常是直接双击打开的。
(() => {
  'use strict';

  const CHAPTERS = [
    { n: 1, t: '初识 React 19',            d: 'UI = f(state)、组件、JSX 与第一个 createRoot', part: '第一部分 · 基础' },
    { n: 2, t: '项目一：Markdown 笔记本',  d: 'useState、派生数据、useEffect、列表与条件渲染、不可变更新' },
    { n: 3, t: '项目二：城堡决斗卡牌游戏', d: '组件树、props 与回调、children、useReducer、Motion 动画与 SVG' },
    { n: 4, t: '工程化：Vite 与渲染原理',  d: 'Vite + React、渲染与提交、React Compiler、样式方案', part: '第二部分 · 工程化开发' },
    { n: 5, t: '项目三：客服支持中心',     d: 'React Router 7、Context、自定义 Hook、TanStack Query、表单 Actions' },
    { n: 6, t: '项目四：地理定位博客',     d: 'Zustand 状态管理、OAuth 登录、react-leaflet、render props' },
    { n: 7, t: '项目五：在线商店与规模化', d: 'ESLint、Vitest + Testing Library、react-i18next、Next.js 与服务端组件', part: '第三部分 · 规模化与全栈' },
    { n: 8, t: '项目六：Meteor 实时仪表盘', d: 'Meteor 3 + React：useTracker、useFind、方法与发布订阅' },
    { n: 9, t: '附录：Vue ↔ React 对照',   d: '同一个概念在两个框架里怎么写', part: '附录' }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const href = (n) => `ch${pad(n)}.html`;

  const cur = Number.parseInt(document.body.dataset.chapter || '0', 10);

  /* ---------- 侧边栏 ---------- */
  const side = document.getElementById('sidebar');
  if (side) {
    const brand = '<a class="brand" href="index.html"><span class="flame">' +
      '<svg viewBox="-11 -10 22 20" width="18" height="16" aria-hidden="true"><circle r="2" fill="#fff"/><g fill="none" stroke="#fff" stroke-width="1"><ellipse rx="10" ry="4"/><ellipse rx="10" ry="4" transform="rotate(60)"/><ellipse rx="10" ry="4" transform="rotate(120)"/></g></svg></span>' +
      '<span>React 项目实战<small>用 6 个应用学会现代 React</small></span></a>';
    const links = CHAPTERS.map(({ n, t, part }) =>
      (part ? `<div class="part">${part}</div>` : '') +
      `<a class="ch${n === cur ? ' active' : ''}" href="${href(n)}"><span class="n">${n}</span><span>${t}</span></a>`
    );
    const sw = '<a class="switch" href="../index.html">&#8644; 切换到 Vue 版教程</a>';
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
  const THEME_KEY = 'vue3-doc-theme';  // 与 Vue 版共用深浅色偏好
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
  const HTML_LIKE = new Set(['html', 'vue', 'xml', 'svg', 'jsx', 'tsx']);

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
  if (pager && cur) {
    const prev = CHAPTERS.find((c) => c.n === cur - 1);
    const next = CHAPTERS.find((c) => c.n === cur + 1);
    const prevLink = prev
      ? `<a class="prev" href="${href(prev.n)}"><span>&larr; 上一章</span>第 ${prev.n} 章 · ${prev.t}</a>`
      : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    const nextLink = next
      ? `<a class="next" href="${href(next.n)}"><span>下一章 &rarr;</span>第 ${next.n} 章 · ${next.t}</a>`
      : '<a class="next ph" href="#">.</a>';
    pager.className = 'pager';
    pager.innerHTML = prevLink + nextLink;
  }

  /* ---------- 首页目录 ---------- */
  const grid = document.getElementById('toc-grid');
  if (grid) {
    grid.className = 'toc-grid';
    grid.innerHTML = CHAPTERS.map(({ n, t, d }) =>
      `<a class="toc-card" href="${href(n)}">` +
      `<div class="n">第 ${n} 章</div>` +
      `<div class="t">${t}</div>` +
      `<div class="d">${d}</div></a>`
    ).join('');
  }
})();
