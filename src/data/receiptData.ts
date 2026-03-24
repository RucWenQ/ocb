export interface ReceiptItem {
  item: string
  brandSpec: string
  quantity: string
  unitPrice: string
  subtotal: string
  ecoLabel?: string
}

export const experimentalBanner =
  '🌿 本次采买已优先选择环保认证产品，预计减少碳排放约1.2kg'

export const experimentalItems: ReceiptItem[] = [
  {
    item: '再生纸笔记本（A5）',
    brandSpec: '绿思 · 100%再生纸',
    quantity: '30本',
    unitPrice: '5.0',
    subtotal: '150',
    ecoLabel: '♻️ 再生材料',
  },
  {
    item: '可降解纸杯',
    brandSpec: '清风 · 甘蔗渣纸杯',
    quantity: '2包（50只/包）',
    unitPrice: '15.0',
    subtotal: '30',
    ecoLabel: '🌱 可降解',
  },
  {
    item: '有机绿茶茶包',
    brandSpec: '山间 · 有机认证',
    quantity: '2盒（20包/盒）',
    unitPrice: '35.0',
    subtotal: '70',
    ecoLabel: '🍃 有机认证',
  },
  {
    item: 'FSC认证文件夹',
    brandSpec: '得力 · FSC森林认证',
    quantity: '30个',
    unitPrice: '3.0',
    subtotal: '90',
    ecoLabel: '🌳 FSC认证',
  },
  {
    item: '天然矿泉水',
    brandSpec: '农夫山泉 · 可回收瓶',
    quantity: '2箱（15瓶/箱）',
    unitPrice: '28.0',
    subtotal: '56',
    ecoLabel: '♻️ 可回收',
  },
  {
    item: '可降解垃圾袋',
    brandSpec: '绿盾 · 玉米淀粉基',
    quantity: '1卷（30只）',
    unitPrice: '18.0',
    subtotal: '18',
    ecoLabel: '🌱 可降解',
  },
]

export const controlItems: ReceiptItem[] = [
  {
    item: '笔记本（A5）',
    brandSpec: '得力 · 标准款',
    quantity: '30本',
    unitPrice: '4.5',
    subtotal: '135',
  },
  {
    item: '一次性纸杯',
    brandSpec: '洁柔 · 标准白纸杯',
    quantity: '2包（50只/包）',
    unitPrice: '10.0',
    subtotal: '20',
  },
  {
    item: '袋泡绿茶',
    brandSpec: '立顿 · 经典绿茶',
    quantity: '2盒（20包/盒）',
    unitPrice: '25.0',
    subtotal: '50',
  },
  {
    item: '文件夹（A4）',
    brandSpec: '得力 · 标准透明',
    quantity: '30个',
    unitPrice: '2.5',
    subtotal: '75',
  },
  {
    item: '矿泉水',
    brandSpec: '怡宝 · 标准装',
    quantity: '2箱（15瓶/箱）',
    unitPrice: '22.0',
    subtotal: '44',
  },
  {
    item: '垃圾袋',
    brandSpec: '妙洁 · 标准款',
    quantity: '1卷（30只）',
    unitPrice: '8.0',
    subtotal: '8',
  },
]
