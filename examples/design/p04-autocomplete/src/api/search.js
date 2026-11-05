import { reactive } from 'vue'

// 模拟的商品搜索接口：每次请求的延迟随机（150 ~ 900ms），所以后发的请求可能先返回。
// 真实项目里这里是 fetch(`/api/products/?q=${q}`, { signal })，第三阶段会换成 Django。

const RAW = [
  ['☕', '手冲咖啡壶', 'shouchong kafeihu', 12900], ['☕', '咖啡豆 · 埃塞俄比亚', 'kafeidou', 8800],
  ['☕', '陶瓷咖啡杯', 'taoci kafeibei', 3900], ['⚖️', '咖啡电子秤', 'kafei dianzicheng', 9900],
  ['⌨️', '机械键盘', 'jixie jianpan', 39900], ['⌨️', '无线键盘', 'wuxian jianpan', 19900],
  ['🖱️', '无线鼠标', 'wuxian shubiao', 9900], ['🖱️', '人体工学鼠标', 'renti gongxue shubiao', 25900],
  ['🎧', '降噪耳机', 'jiangzao erji', 89900], ['🎧', '运动耳机', 'yundong erji', 29900],
  ['🎧', '头戴式耳机', 'toudaishi erji', 49900], ['🔈', '蓝牙音箱', 'lanya yinxiang', 19900],
  ['👜', '帆布托特包', 'fanbu tuotebao', 5900], ['🎒', '双肩电脑包', 'shuangjian diannaobao', 19900],
  ['👝', '收纳包', 'shounabao', 3900], ['🪴', '绿植盆栽', 'lvzhi penzai', 3500],
  ['🪴', '多肉组合', 'duorou zuhe', 4900], ['🕯️', '香薰蜡烛', 'xiangxun lazhu', 6900],
  ['📓', '方格笔记本', 'fangge bijiben', 1990], ['📓', '点阵笔记本', 'dianzhen bijiben', 2490],
  ['🖊️', '中性笔 10 支', 'zhongxingbi', 1990], ['🖋️', '钢笔', 'gangbi', 15900],
  ['📒', '手账本', 'shouzhangben', 4900], ['💡', '护眼台灯', 'huyan taideng', 19900],
  ['🔌', '多口充电器', 'duokou chongdianqi', 12900], ['🔋', '充电宝', 'chongdianbao', 9900],
  ['🧴', '保温杯', 'baowenbei', 8900], ['🥤', '随行杯', 'suixingbei', 5900],
  ['🍵', '茶具套装', 'chaju taozhuang', 25900], ['🧦', '羊毛袜', 'yangmaowa', 3900],
]
export const PRODUCTS = RAW.map(([emoji, name, py, price], i) => ({ id: `p${i + 1}`, emoji, name, py: py.replace(/ /g, ''), price }))

// 仅供演示：记录每个请求的去向，页面上用来观察防抖和竞态
export const requestLog = reactive([])
let seq = 0

export function searchProducts(query, { signal } = {}) {
  const entry = reactive({ id: ++seq, query, status: 'pending', ms: 150 + Math.floor(Math.random() * 750) })
  requestLog.unshift(entry)
  if (requestLog.length > 8) requestLog.pop()

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (query.toLowerCase().includes('error')) {
        entry.status = 'error'
        return reject(new Error('服务器开小差了'))
      }
      const q = query.toLowerCase()
      entry.status = 'done'
      resolve(PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.py.includes(q)).slice(0, 8))
    }, entry.ms)
    // 和 fetch 一样支持取消：调用方 abort() 后，请求作废
    signal?.addEventListener('abort', () => {
      if (entry.status !== 'pending') return // 已经完成的请求，取消也无所谓
      clearTimeout(timer)
      entry.status = 'aborted'
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

// 本地数据：城市列表，不需要请求
export const CITIES = [
  ['110000', '北京', 'beijing'], ['310000', '上海', 'shanghai'], ['440100', '广州', 'guangzhou'],
  ['440300', '深圳', 'shenzhen'], ['330100', '杭州', 'hangzhou'], ['510100', '成都', 'chengdu'],
  ['500000', '重庆', 'chongqing'], ['320100', '南京', 'nanjing'], ['420100', '武汉', 'wuhan'],
  ['610100', '西安', 'xian'], ['320500', '苏州', 'suzhou'], ['120000', '天津', 'tianjin'],
  ['430100', '长沙', 'changsha'], ['410100', '郑州', 'zhengzhou'], ['370200', '青岛', 'qingdao'],
  ['350200', '厦门', 'xiamen'], ['530100', '昆明', 'kunming'], ['210200', '大连', 'dalian'],
  ['330200', '宁波', 'ningbo'], ['340100', '合肥', 'hefei'],
].map(([code, name, py]) => ({ code, name, py }))
