import type { ShoppingCategoryKey } from "../types/experiment";

export interface ShoppingOption {
  id: "eco" | "normal" | "filler";
  name: string;
  desc: string;
  price: string;
  icon: string;
}

export interface ShoppingCategory {
  id: ShoppingCategoryKey;
  category: string;
  prompt: string;
  options: ShoppingOption[];
}

export const shoppingCategories: ShoppingCategory[] = [
  {
    id: "chopsticks",
    category: "餐具",
    prompt: "家里的筷子旧了，需要换一批新的",
    options: [
      {
        id: "eco",
        name: "天然楠竹筷",
        desc: "天然竹材，不上漆不打蜡，5双装",
        price: "¥15.9",
        icon: "🥢",
      },
      {
        id: "normal",
        name: "304不锈钢筷",
        desc: "食品级不锈钢，防滑防烫，5双装",
        price: "¥15.9",
        icon: "🥢",
      },
      {
        id: "filler",
        name: "一次性木筷",
        desc: "独立包装，方便卫生，5双装",
        price: "¥9.9",
        icon: "🥢",
      },
    ],
  },
  {
    id: "trashbag",
    category: "垃圾袋",
    prompt: "垃圾袋快用完了，需要补充",
    options: [
      {
        id: "eco",
        name: "环保可降解垃圾袋",
        desc: "植物基材质，可自然降解，加厚款，5卷100只",
        price: "¥18.9",
        icon: "🗑️",
      },
      {
        id: "normal",
        name: "聚氯乙烯垃圾袋",
        desc: "PVC材质，结实耐用不易破，加厚款，5卷100只",
        price: "¥18.9",
        icon: "🗑️",
      },
      {
        id: "filler",
        name: "超薄经济垃圾袋",
        desc: "超薄款，量大实惠，10卷200只",
        price: "¥11.9",
        icon: "🗑️",
      },
    ],
  },
  {
    id: "egg",
    category: "鸡蛋",
    prompt: "鸡蛋吃完了，买一盒",
    options: [
      {
        id: "eco",
        name: "有机散养土鸡蛋",
        desc: "有机牧场散养，20枚装",
        price: "¥32.9",
        icon: "🥚",
      },
      {
        id: "normal",
        name: "品牌鲜鸡蛋",
        desc: "大品牌新鲜直供，20枚装",
        price: "¥32.9",
        icon: "🥚",
      },
      {
        id: "filler",
        name: "散装鸡蛋",
        desc: "普通散装，实惠家庭装，30枚",
        price: "¥22.9",
        icon: "🥚",
      },
    ],
  },
  {
    id: "milk",
    category: "牛奶",
    prompt: "牛奶喝完了，补一箱",
    options: [
      {
        id: "eco",
        name: "有机纯牛奶",
        desc: "有机牧场奶源，250ml×12盒",
        price: "¥59.9",
        icon: "🥛",
      },
      {
        id: "normal",
        name: "品牌纯牛奶",
        desc: "大品牌经典款，250ml×12盒",
        price: "¥59.9",
        icon: "🥛",
      },
      {
        id: "filler",
        name: "调制乳饮品",
        desc: "含乳饮料，口味丰富，250ml×12盒",
        price: "¥39.9",
        icon: "🥛",
      },
    ],
  },
  {
    id: "rice",
    category: "大米",
    prompt: "米快见底了，买一袋",
    options: [
      {
        id: "eco",
        name: "有机稻花香大米",
        desc: "有机种植，东北五常产区，5kg",
        price: "¥49.9",
        icon: "🍚",
      },
      {
        id: "normal",
        name: "品牌东北大米",
        desc: "东北优质产区，5kg",
        price: "¥49.9",
        icon: "🍚",
      },
      {
        id: "filler",
        name: "散装大米",
        desc: "实惠家庭装，10kg",
        price: "¥35.9",
        icon: "🍚",
      },
    ],
  },
  {
    id: "soySauce",
    category: "酱油",
    prompt: "酱油快用完了",
    options: [
      {
        id: "eco",
        name: "有机酿造酱油",
        desc: "有机大豆，传统酿造工艺，500ml",
        price: "¥18.9",
        icon: "🧴",
      },
      {
        id: "normal",
        name: "品牌特级酱油",
        desc: "经典酿造酱油，500ml",
        price: "¥18.9",
        icon: "🧴",
      },
      {
        id: "filler",
        name: "经济装调味酱油",
        desc: "配制酱油，800ml大瓶装",
        price: "¥8.9",
        icon: "🧴",
      },
    ],
  },
  {
    id: "oil",
    category: "食用油",
    prompt: "食用油也该补了",
    options: [
      {
        id: "eco",
        name: "有机压榨菜籽油",
        desc: "有机原料，物理压榨，1.8L",
        price: "¥45.9",
        icon: "🌻",
      },
      {
        id: "normal",
        name: "品牌调和油",
        desc: "多种植物调和，营养均衡，1.8L",
        price: "¥45.9",
        icon: "🌻",
      },
      {
        id: "filler",
        name: "散装大豆油",
        desc: "经济实惠，5L家庭桶装",
        price: "¥29.9",
        icon: "🌻",
      },
    ],
  },
];
