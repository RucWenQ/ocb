export interface DepartmentNeed {
  id: 'rd' | 'marketing' | 'finance' | 'hr'
  name: string
  headcount: number
  items: string[]
}

export const purchaseBrief = {
  roleHint: '行政专员',
  budget: 2500,
  meetingTime: '下周五 14:00-16:00',
  participants: '约35人',
  room: '3楼多功能会议厅',
  meetingNeeds: ['矿泉水', '会议用笔', '签到表', '桌面标识牌'],
}

export const departmentNeeds: DepartmentNeed[] = [
  {
    id: 'rd',
    name: '产品研发部',
    headcount: 15,
    items: [
      'A4打印纸紧缺，至少需要5包',
      '需要补充白板笔（黑、蓝、红各色）',
      '几位同事反映签字笔快用完了，需要一批中性笔',
      '需要一些便利贴和文件袋',
    ],
  },
  {
    id: 'marketing',
    name: '市场营销部',
    headcount: 8,
    items: [
      '需要补充彩色打印纸（做物料用）',
      '需要几本硬皮笔记本用于客户拜访',
      '马克笔/荧光笔需要补货',
      '需要一批档案袋整理客户资料',
    ],
  },
  {
    id: 'finance',
    name: '财务部',
    headcount: 5,
    items: [
      '急需补充凭证装订封面和包角',
      '需要补充票据夹和长尾夹',
      '碎纸机纸袋需要更换',
      '计算器电池需要几组',
    ],
  },
  {
    id: 'hr',
    name: '人力资源部',
    headcount: 7,
    items: [
      '下月有新人入职，需准备文件夹和档案盒',
      '需要一批信封（用于发放offer和通知）',
      '桌面收纳盒需要补几个',
      '需要补充员工手册打印用纸',
    ],
  },
]

export const scenarioParagraphs = [
  '月底将至，你需要处理两项采购任务：',
  '一、各部门办公耗材补充。本月以来，公司多个部门陆续提交了办公耗材补充申请。由于申请分散、需求各异，需要你统一整理并完成采购。',
  '二、月度例会物资筹备。下周五下午2:00，公司将召开本月全体例会（约35人参加），你需要一并采购会议所需物资。',
  '行政部本月剩余预算为 ¥2,500，请在预算内统筹完成所有采购。',
]

export const purchaseSummaryCardMessage = `📋 月末综合采购需求

【部门耗材】
• 产品研发部：打印纸、白板笔、中性笔、便利贴、文件袋
• 市场营销部：彩色打印纸、硬皮笔记本、马克笔、荧光笔、档案袋
• 财务部：凭证装订耗材、票据夹、长尾夹、碎纸机纸袋、计算器电池
• 人力资源部：文件夹、档案盒、信封、桌面收纳盒、打印用纸

【月度例会】
• 时间：下周五 14:00-16:00，约35人
• 需要：矿泉水、会议用笔、签到表、桌面标识牌

💰 预算：¥2,500`
