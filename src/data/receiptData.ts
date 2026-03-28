import type { Condition } from "../types/experiment";

export interface ReceiptItem {
  category: string;
  name: string;
  spec: string;
  quantity: string;
  unitPrice: number;
  subtotal: number;
  ecoLabel?: string;
}

export interface ReceiptData {
  condition: Condition;
  banner?: string;
  items: ReceiptItem[];
  total: number;
  budget: number;
  remaining: number;
  footnote: string;
}

const budget = 2500;

type ReceiptBaseItem = Omit<ReceiptItem, "spec" | "ecoLabel">;
type ReceiptItemId =
  | "a4_paper"
  | "whiteboard_pen"
  | "gel_pen"
  | "sticky_note"
  | "zipper_bag"
  | "color_paper"
  | "color_toner"
  | "hardcover_notebook"
  | "marker_pen"
  | "highlighter"
  | "archive_bag"
  | "clips"
  | "shredder_blade"
  | "battery_pack"
  | "folder"
  | "desk_organizer"
  | "handbook_paper"
  | "stapler"
  | "paperclips"
  | "water"
  | "meeting_pen"
  | "meeting_a4"
  | "meeting_pink_a4"
  | "table_sign";

const baseItems: Array<{ id: ReceiptItemId; item: ReceiptBaseItem }> = [
  {
    id: "a4_paper",
    item: {
      category: "办公用纸",
      name: "A4复印纸",
      quantity: "6包",
      unitPrice: 31,
      subtotal: 186,
    },
  },
  {
    id: "whiteboard_pen",
    item: {
      category: "书写工具",
      name: "白板笔",
      quantity: "12支 黑蓝红各4支",
      unitPrice: 6,
      subtotal: 72,
    },
  },
  {
    id: "gel_pen",
    item: {
      category: "书写工具",
      name: "中性笔",
      quantity: "30支",
      unitPrice: 4.8,
      subtotal: 144,
    },
  },
  {
    id: "sticky_note",
    item: {
      category: "文件整理",
      name: "便利贴",
      quantity: "10本",
      unitPrice: 4,
      subtotal: 40,
    },
  },
  {
    id: "zipper_bag",
    item: {
      category: "文件整理",
      name: "文件袋",
      quantity: "20个",
      unitPrice: 2.5,
      subtotal: 50,
    },
  },
  {
    id: "color_paper",
    item: {
      category: "办公用纸",
      name: "A4彩印用纸",
      quantity: "3包",
      unitPrice: 18,
      subtotal: 54,
    },
  },
  {
    id: "color_toner",
    item: {
      category: "办公耗材",
      name: "彩印墨粉",
      quantity: "2盒",
      unitPrice: 95,
      subtotal: 190,
    },
  },
  {
    id: "hardcover_notebook",
    item: {
      category: "书写工具",
      name: "硬皮笔记本",
      quantity: "8本",
      unitPrice: 12,
      subtotal: 96,
    },
  },
  {
    id: "marker_pen",
    item: {
      category: "书写工具",
      name: "马克笔",
      quantity: "6支",
      unitPrice: 5,
      subtotal: 30,
    },
  },
  {
    id: "highlighter",
    item: {
      category: "书写工具",
      name: "荧光笔",
      quantity: "10支",
      unitPrice: 3.5,
      subtotal: 35,
    },
  },
  {
    id: "archive_bag",
    item: {
      category: "文件整理",
      name: "档案袋",
      quantity: "30个",
      unitPrice: 3.2,
      subtotal: 96,
    },
  },
  {
    id: "clips",
    item: {
      category: "文件整理",
      name: "票据夹和长尾夹",
      quantity: "5盒",
      unitPrice: 8,
      subtotal: 40,
    },
  },
  {
    id: "shredder_blade",
    item: {
      category: "桌面与设备耗材",
      name: "碎纸机刀片",
      quantity: "2套",
      unitPrice: 28,
      subtotal: 56,
    },
  },
  {
    id: "battery_pack",
    item: {
      category: "桌面与设备耗材",
      name: "电池",
      quantity: "6组",
      unitPrice: 4.5,
      subtotal: 54,
    },
  },
  {
    id: "folder",
    item: {
      category: "文件整理",
      name: "A4文件夹",
      quantity: "40个",
      unitPrice: 4.5,
      subtotal: 180,
    },
  },
  {
    id: "desk_organizer",
    item: {
      category: "桌面与设备耗材",
      name: "桌面收纳盒",
      quantity: "5个",
      unitPrice: 22,
      subtotal: 110,
    },
  },
  {
    id: "handbook_paper",
    item: {
      category: "办公用纸",
      name: "A4打印用纸",
      quantity: "2包",
      unitPrice: 31,
      subtotal: 62,
    },
  },
  {
    id: "stapler",
    item: {
      category: "文件整理",
      name: "订书机",
      quantity: "6个",
      unitPrice: 16,
      subtotal: 96,
    },
  },
  {
    id: "paperclips",
    item: {
      category: "文件整理",
      name: "回形针",
      quantity: "10盒",
      unitPrice: 2.8,
      subtotal: 28,
    },
  },
  {
    id: "water",
    item: {
      category: "会议物资",
      name: "矿泉水",
      quantity: "3箱 每箱15瓶",
      unitPrice: 30,
      subtotal: 90,
    },
  },
  {
    id: "meeting_pen",
    item: {
      category: "会议物资",
      name: "会议签字笔",
      quantity: "40支",
      unitPrice: 4.8,
      subtotal: 192,
    },
  },
  {
    id: "meeting_a4",
    item: {
      category: "会议物资",
      name: "会议A4纸",
      quantity: "2包",
      unitPrice: 31,
      subtotal: 62,
    },
  },
  {
    id: "meeting_pink_a4",
    item: {
      category: "会议物资",
      name: "粉色A4纸",
      quantity: "2包",
      unitPrice: 19,
      subtotal: 38,
    },
  },
  {
    id: "table_sign",
    item: {
      category: "会议物资",
      name: "桌面标识牌",
      quantity: "10个",
      unitPrice: 15,
      subtotal: 150,
    },
  },
];

const experimentalSpecMap: Record<
  ReceiptItemId,
  { spec: string; ecoLabel?: string }
> = {
  a4_paper: { spec: "绿思 再生纸 500张每包", ecoLabel: "♻️ 再生纸" },
  whiteboard_pen: { spec: "得力 可加墨白板笔", ecoLabel: "♻️ 可重复补墨" },
  gel_pen: { spec: "百乐 可换芯中性笔 0.5mm", ecoLabel: "♻️ 可换芯" },
  sticky_note: { spec: "得力 便签本 76*76mm" },
  zipper_bag: { spec: "得力 拉链文件袋 A4" },
  color_paper: { spec: "绿思 再生彩纸 A4 100张每包", ecoLabel: "♻️ 再生纸" },
  color_toner: { spec: "惠普 适配型彩印墨粉" },
  hardcover_notebook: { spec: "得力 商务硬皮本 A5" },
  marker_pen: { spec: "斑马 马克笔 1.0mm" },
  highlighter: { spec: "斑马 荧光笔 斜头" },
  archive_bag: { spec: "广博 FSC牛皮纸档案袋", ecoLabel: "🌳 FSC认证" },
  clips: { spec: "得力 票据夹与长尾夹组合" },
  shredder_blade: { spec: "得力 碎纸机替换刀片" },
  battery_pack: { spec: "南孚 碱性电池与纽扣电池组合" },
  folder: { spec: "得力 再生纤维A4文件夹", ecoLabel: "♻️ 再生材料" },
  desk_organizer: { spec: "得力 桌面收纳盒 三格" },
  handbook_paper: { spec: "绿思 再生纸 500张每包", ecoLabel: "♻️ 再生纸" },
  stapler: { spec: "得力 中号订书机 24号针" },
  paperclips: { spec: "得力 金属回形针 100枚每盒" },
  water: { spec: "农夫山泉 可回收PET瓶", ecoLabel: "♻️ 可回收" },
  meeting_pen: { spec: "百乐 可换芯签字笔 0.5mm", ecoLabel: "♻️ 可换芯" },
  meeting_a4: { spec: "绿思 再生纸 A4 500张每包", ecoLabel: "♻️ 再生纸" },
  meeting_pink_a4: {
    spec: "绿思 再生粉色纸 A4 100张每包",
    ecoLabel: "♻️ 再生纸",
  },
  table_sign: { spec: "竹纤维桌牌 可重复使用", ecoLabel: "🌱 可重复使用" },
};

const controlSpecMap: Record<ReceiptItemId, { spec: string }> = {
  a4_paper: { spec: "亚太森博 办公复印纸 500张每包" },
  whiteboard_pen: { spec: "晨光 会议白板笔" },
  gel_pen: { spec: "晨光 办公中性笔 0.5mm" },
  sticky_note: { spec: "得力 便签本 76*76mm" },
  zipper_bag: { spec: "得力 拉链文件袋 A4" },
  color_paper: { spec: "亚太森博 彩色打印纸 A4 100张每包" },
  color_toner: { spec: "惠普 适配型彩印墨粉" },
  hardcover_notebook: { spec: "得力 商务硬皮本 A5" },
  marker_pen: { spec: "斑马 马克笔 1.0mm" },
  highlighter: { spec: "斑马 荧光笔 斜头" },
  archive_bag: { spec: "齐心 牛皮纸档案袋" },
  clips: { spec: "得力 票据夹与长尾夹组合" },
  shredder_blade: { spec: "得力 碎纸机替换刀片" },
  battery_pack: { spec: "南孚 碱性电池与纽扣电池组合" },
  folder: { spec: "齐心 PP材质A4文件夹" },
  desk_organizer: { spec: "得力 桌面收纳盒 三格" },
  handbook_paper: { spec: "亚太森博 办公复印纸 500张每包" },
  stapler: { spec: "得力 中号订书机 24号针" },
  paperclips: { spec: "得力 金属回形针 100枚每盒" },
  water: { spec: "怡宝 纯净水" },
  meeting_pen: { spec: "晨光 会议签字笔 0.5mm" },
  meeting_a4: { spec: "亚太森博 办公复印纸 A4 500张每包" },
  meeting_pink_a4: { spec: "晨光 粉色打印纸 A4 100张每包" },
  table_sign: { spec: "得力 亚克力桌面标识牌" },
};

function buildItemsBySpec(
  specMap: Record<ReceiptItemId, { spec: string; ecoLabel?: string }>,
): ReceiptItem[] {
  return baseItems.map(({ id, item }) => ({
    ...item,
    spec: specMap[id].spec,
    ecoLabel: specMap[id].ecoLabel,
  }));
}

const categoryOrder = [
  "办公用纸",
  "办公耗材",
  "书写工具",
  "文件整理",
  "桌面与设备耗材",
  "会议物资",
];

function sortByCategory(items: ReceiptItem[]): ReceiptItem[] {
  return [...items].sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  );
}

const totalPrice = baseItems.reduce(
  (sum, entry) => sum + entry.item.subtotal,
  0,
);

export const receiptDataByCondition: Record<Condition, ReceiptData> = {
  experimental: {
    condition: "experimental",
    banner: "🌿本次采购优先选用了环保产品",
    items: sortByCategory(buildItemsBySpec(experimentalSpecMap)),
    total: totalPrice,
    budget,
    remaining: budget - totalPrice,
    footnote: "AI助理已根据各部门需求和会议安排完成物资采购。",
  },
  control: {
    condition: "control",
    items: sortByCategory(buildItemsBySpec(controlSpecMap)),
    total: totalPrice,
    budget,
    remaining: budget - totalPrice,
    footnote: "AI助理已根据各部门需求和会议安排完成物资采购。",
  },
};
