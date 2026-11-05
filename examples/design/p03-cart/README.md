# 项目 3：购物车

《从设计到实现》系列第 3 篇的完整代码，教程见 `docs/design/p03.html`。

```bash
npm install
npm run dev    # 开发服务器；右下角“模拟服务器”面板可改价、改库存
npm test       # 金额计算的单元测试（Vitest）
```

## 文件结构

```
src/
├── api/shop.js            模拟服务器：商品数据、下单（重新核算价格与库存）
├── lib/
│   ├── pricing.js         纯函数：小计 → 优惠 → 运费 → 合计
│   ├── pricing.test.js    pricing 的单元测试
│   └── money.js           金额格式化
├── stores/
│   ├── catalog.js         商品目录（服务器数据的缓存）
│   └── cart.js            购物车（只存 productId / qty / selected，持久化）
├── views/                 ProductList · ProductDetail · CartView · CheckoutView
├── components/            AppHeader · ProductCard · CartLine · QtyStepper · PriceSummary · DevServerPanel
├── router.js              路由表与结算页守卫
├── App.vue                启动加载目录、多标签页同步
└── main.js
```
