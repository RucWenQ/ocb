export interface DepartmentNeed {
  id: "rd" | "marketing" | "finance" | "hr";
  name: string;
  headcount: number;
  items: string[];
}

export const purchaseBrief = {
  roleHint: "行政专员",
  budget: 2500,
  meetingTime: "下周五 14:00-16:00",
  participants: "约35人",
  room: "3楼多功能会议厅",
  meetingNeeds: [
    "矿泉水",
    "签字笔",
    "A4纸",
    "粉色A4纸（议程用）",
    "桌面标识牌",
  ],
};

export const departmentNeeds: DepartmentNeed[] = [
  {
    id: "rd",
    name: "产品研发部",
    headcount: 15,
    items: [
      "A4打印纸紧缺，至少需要5包",
      "需要补充白板笔（黑、蓝、红各色）",
      "几位同事反映签字笔快用完了，需要一批中性笔",
      "需要一些便利贴和文件袋",
    ],
  },
  {
    id: "marketing",
    name: "市场营销部",
    headcount: 8,
    items: [
      "需要补充打印纸和彩印墨粉（做物料用）",
      "需要几本硬皮笔记本用于客户拜访",
      "马克笔、荧光笔需要各一盒",
      "需要一批档案袋整理客户资料",
    ],
  },
  {
    id: "finance",
    name: "财务部",
    headcount: 5,
    items: [
      "需要补充票据夹和长尾夹",
      "碎纸机刀片需要更换",
      "5号、7号、纽扣电池都需要补充",
    ],
  },
  {
    id: "hr",
    name: "人力资源部",
    headcount: 7,
    items: [
      "下月有新人入职，需准备文件夹",
      "桌面收纳盒需要补几个",
      "需要补充员工手册打印用纸",
      "需要再购买一些订书机，还有回形针或长尾夹",
    ],
  },
];

export const scenarioParagraphs = [
  "月底将至，你需要处理两项采购任务：",
  "一、各部门办公耗材补充。本月以来，公司多个部门陆续提交了办公耗材补充申请。由于申请分散、需求各异，需要你统一整理并完成采购。",
  "二、月度例会物资筹备。下周五下午2:00，公司将召开本月全体例会（约35人参加），你需要一并采购会议所需物资。",
  "行政部本月剩余预算为 ¥2,500，请在预算内统筹完成所有采购。",
];
