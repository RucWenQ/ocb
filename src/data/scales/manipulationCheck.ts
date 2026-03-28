export const manipCheckCore = [
  {
    id: "mc_eco_perception",
    text: "我认为AI助理在采购中优先考虑了环保因素",
    anchors: { low: "非常不同意", mid: "不确定", high: "非常同意" },
  },
  {
    id: "mc_eco_degree",
    text: "你认为AI助理采购的物品整体环保程度如何",
    anchors: { low: "完全不环保", mid: "一般", high: "非常环保" },
  },
] as const;

export const manipMeetingTypeQuestion = {
  id: "mc_meeting_type",
  text: "你的AI助理为哪种会议采购了物资？",
  options: ["周会", "月度例会", "季度例会", "年会"],
} as const;
