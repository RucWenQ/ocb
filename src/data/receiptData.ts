import type { Condition } from '../types/experiment'

export interface ReceiptItem {
  category: string
  name: string
  spec: string
  quantity: string
  unitPrice: number
  subtotal: number
  ecoLabel?: string
}

export interface ReceiptData {
  condition: Condition
  banner?: string
  items: ReceiptItem[]
  total: number
  budget: number
  remaining: number
  footnote: string
}

const budget = 2500

const experimentalItems: ReceiptItem[] = [
  { category: '办公用纸', name: 'A4复印纸（再生纸）', spec: '绿思 · 100%再生纸 500张/包', quantity: '6包', unitPrice: 32.0, subtotal: 192, ecoLabel: '♻️ 再生纸' },
  { category: '办公用纸', name: '彩色打印纸（A4）', spec: '绿思 · 再生彩纸 100张/包', quantity: '3包', unitPrice: 18.0, subtotal: 54, ecoLabel: '♻️ 再生纸' },
  { category: '办公用纸', name: '员工手册/文件打印用纸（A4）', spec: '绿思 · 再生纸 500张/包', quantity: '2包', unitPrice: 32.0, subtotal: 64, ecoLabel: '♻️ 再生纸' },
  { category: '书写工具', name: '中性笔', spec: '百乐 · 可替换笔芯款 0.5mm', quantity: '30支', unitPrice: 5.5, subtotal: 165, ecoLabel: '♻️ 可换芯' },
  { category: '书写工具', name: '白板笔（黑/蓝/红）', spec: '得力 · 可加墨白板笔', quantity: '12支（每色4支）', unitPrice: 6.0, subtotal: 72, ecoLabel: '♻️ 可加墨' },
  { category: '书写工具', name: '荧光笔', spec: '斑马 · 普通荧光笔', quantity: '10支', unitPrice: 3.5, subtotal: 35 },
  { category: '书写工具', name: '马克笔', spec: '斑马 · 普通马克笔', quantity: '6支', unitPrice: 5.0, subtotal: 30 },
  { category: '文件整理', name: 'A4文件夹', spec: '得力 · 再生纸板文件夹', quantity: '40个', unitPrice: 4.5, subtotal: 180, ecoLabel: '♻️ 再生材料' },
  { category: '文件整理', name: '档案袋（牛皮纸）', spec: '广博 · FSC认证牛皮纸', quantity: '30个', unitPrice: 3.0, subtotal: 90, ecoLabel: '🌳 FSC认证' },
  { category: '文件整理', name: '档案盒', spec: '得力 · 再生纸板款', quantity: '15个', unitPrice: 8.0, subtotal: 120, ecoLabel: '♻️ 再生材料' },
  { category: '文件整理', name: '票据夹/长尾夹（综合）', spec: '得力 · 标准款', quantity: '5盒', unitPrice: 8.0, subtotal: 40 },
  { category: '文件整理', name: '便利贴', spec: '得力 · 再生纸便利贴', quantity: '10本', unitPrice: 4.0, subtotal: 40, ecoLabel: '♻️ 再生纸' },
  { category: '文件整理', name: '文件袋（拉链式）', spec: '得力 · 标准透明', quantity: '20个', unitPrice: 2.5, subtotal: 50 },
  { category: '文件整理', name: '信封（5号/7号混合）', spec: '广博 · 再生纸信封', quantity: '50个', unitPrice: 1.0, subtotal: 50, ecoLabel: '♻️ 再生纸' },
  { category: '桌面与设备耗材', name: '桌面收纳盒', spec: '竹制 · 可降解材质', quantity: '5个', unitPrice: 25.0, subtotal: 125, ecoLabel: '🌱 天然材质' },
  { category: '桌面与设备耗材', name: '碎纸机纸袋', spec: '得力 · 可降解纸袋', quantity: '2卷（10只/卷）', unitPrice: 20.0, subtotal: 40, ecoLabel: '🌱 可降解' },
  { category: '桌面与设备耗材', name: '凭证装订封面+包角', spec: '立信 · 标准款', quantity: '各3包', unitPrice: 12.0, subtotal: 72 },
  { category: '桌面与设备耗材', name: '计算器电池（纽扣电池）', spec: '南孚 · 标准款', quantity: '6粒', unitPrice: 5.0, subtotal: 30 },
  { category: '会议物资', name: '矿泉水', spec: '农夫山泉 · 可回收PET瓶', quantity: '3箱（15瓶/箱）', unitPrice: 28.0, subtotal: 84, ecoLabel: '♻️ 可回收' },
  { category: '会议物资', name: '签到表 + 会议记录本', spec: '绿思 · 再生纸', quantity: '各2本', unitPrice: 8.0, subtotal: 32, ecoLabel: '♻️ 再生纸' },
  { category: '会议物资', name: '会议用笔（中性笔）', spec: '百乐 · 可换芯 0.5mm', quantity: '40支', unitPrice: 5.5, subtotal: 220, ecoLabel: '♻️ 可换芯' },
  { category: '会议物资', name: '会议桌面标识牌', spec: '竹制 · 可重复使用', quantity: '10个', unitPrice: 12.0, subtotal: 120, ecoLabel: '🌱 天然材质' },
]

const controlItems: ReceiptItem[] = [
  { category: '办公用纸', name: 'A4复印纸', spec: '亚太森博 · 标准复印纸 500张/包', quantity: '6包', unitPrice: 28.0, subtotal: 168 },
  { category: '办公用纸', name: '彩色打印纸（A4）', spec: '亚太森博 · 标准彩纸 100张/包', quantity: '3包', unitPrice: 15.0, subtotal: 45 },
  { category: '办公用纸', name: '员工手册/文件打印用纸（A4）', spec: '亚太森博 · 标准复印纸 500张/包', quantity: '2包', unitPrice: 28.0, subtotal: 56 },
  { category: '书写工具', name: '中性笔', spec: '晨光 · 一次性中性笔 0.5mm', quantity: '30支', unitPrice: 2.5, subtotal: 75 },
  { category: '书写工具', name: '白板笔（黑/蓝/红）', spec: '晨光 · 标准白板笔', quantity: '12支（每色4支）', unitPrice: 4.0, subtotal: 48 },
  { category: '书写工具', name: '荧光笔', spec: '晨光 · 标准荧光笔', quantity: '10支', unitPrice: 2.5, subtotal: 25 },
  { category: '书写工具', name: '马克笔', spec: '晨光 · 标准马克笔', quantity: '6支', unitPrice: 4.0, subtotal: 24 },
  { category: '文件整理', name: 'A4文件夹', spec: '齐心 · 标准PP文件夹', quantity: '40个', unitPrice: 3.5, subtotal: 140 },
  { category: '文件整理', name: '档案袋', spec: '齐心 · 标准塑料档案袋', quantity: '30个', unitPrice: 2.5, subtotal: 75 },
  { category: '文件整理', name: '档案盒', spec: '齐心 · 标准塑料款', quantity: '15个', unitPrice: 6.5, subtotal: 97.5 },
  { category: '文件整理', name: '票据夹/长尾夹（综合）', spec: '晨光 · 标准款', quantity: '5盒', unitPrice: 7.5, subtotal: 37.5 },
  { category: '文件整理', name: '便利贴', spec: '晨光 · 标准便利贴', quantity: '10本', unitPrice: 3.5, subtotal: 35 },
  { category: '文件整理', name: '文件袋（拉链式）', spec: '齐心 · 标准透明', quantity: '20个', unitPrice: 2.0, subtotal: 40 },
  { category: '文件整理', name: '信封（5号/7号混合）', spec: '齐心 · 标准信封', quantity: '50个', unitPrice: 0.8, subtotal: 40 },
  { category: '桌面与设备耗材', name: '桌面收纳盒', spec: '得力 · 塑料收纳盒', quantity: '5个', unitPrice: 18.0, subtotal: 90 },
  { category: '桌面与设备耗材', name: '碎纸机纸袋', spec: '得力 · 标准塑料袋', quantity: '2卷（10只/卷）', unitPrice: 15.0, subtotal: 30 },
  { category: '桌面与设备耗材', name: '凭证装订封面+包角', spec: '立信 · 标准款', quantity: '各3包', unitPrice: 12.0, subtotal: 72 },
  { category: '桌面与设备耗材', name: '计算器电池（纽扣电池）', spec: '南孚 · 标准款', quantity: '6粒', unitPrice: 5.0, subtotal: 30 },
  { category: '会议物资', name: '矿泉水', spec: '怡宝 · 标准装', quantity: '3箱（15瓶/箱）', unitPrice: 24.0, subtotal: 72 },
  { category: '会议物资', name: '签到表 + 会议记录本', spec: '得力 · 标准款', quantity: '各2本', unitPrice: 6.0, subtotal: 24 },
  { category: '会议物资', name: '会议用笔（中性笔）', spec: '晨光 · 一次性中性笔 0.5mm', quantity: '40支', unitPrice: 2.5, subtotal: 100 },
  { category: '会议物资', name: '会议桌面标识牌', spec: '得力 · 亚克力标识牌', quantity: '10个', unitPrice: 15.0, subtotal: 150 },
]

export const receiptDataByCondition: Record<Condition, ReceiptData> = {
  experimental: {
    condition: 'experimental',
    banner: '🌿 本次采购优先选用了环保认证产品，预计减少碳排放约3.6kg CO₂e',
    items: experimentalItems,
    total: 2105,
    budget,
    remaining: 395,
    footnote: 'AI助理在满足各部门需求的前提下，优先为您筛选了环保认证产品，以降低办公活动对环境的影响。',
  },
  control: {
    condition: 'control',
    items: controlItems,
    total: 2139,
    budget,
    remaining: 361,
    footnote: 'AI助理已根据各部门需求和会议安排完成物资采购。',
  },
}
