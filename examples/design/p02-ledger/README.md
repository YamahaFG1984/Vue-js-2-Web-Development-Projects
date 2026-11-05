# 项目 2：记账本

《从设计到实现》系列第 2 篇的完整代码，教程见 `docs/design/p02.html`。

```bash
npm install
npm run dev
```

## 文件结构

```
src/
├── composables/
│   ├── useLedger.js      领域数据：records、categories 及其修改操作、持久化
│   └── useMonthView.js   派生链：本月记录 → 合计 / 构成 / 筛选 → 按天分组（无自有状态）
├── components/
│   ├── MonthSwitcher.vue   切换月份（defineModel）
│   ├── SummaryCards.vue    收入 / 支出 / 结余（纯展示）
│   ├── RecordForm.vue      新增 / 编辑表单，自己持有草稿
│   ├── CategoryChart.vue   支出构成，点击筛选
│   ├── RecordList.vue      按天分组的列表，转交事件
│   ├── RecordItem.vue      单条记录
│   └── CategoryManager.vue 分类改名、换颜色、删除（PROTECT）
├── utils/
│   ├── money.js          金额：整数分 ⇄ 元文本
│   └── date.js           日期：'YYYY-MM-DD' 字符串工具
├── App.vue               界面状态 + 组装
├── main.js
└── styles.css
```
