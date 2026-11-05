const fmt = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
/** 分 → '¥12.50' */
export const formatCents = (cents) => fmt.format(cents / 100)
