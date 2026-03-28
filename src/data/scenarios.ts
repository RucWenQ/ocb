import type { OcbOptionKey, OcbScenarioKey } from "../types/experiment";

export interface ScenarioOption {
  id: string;
  optionKey: OcbOptionKey;
  text: string;
}

export interface ScenarioItem {
  id: OcbScenarioKey;
  title: string;
  description: string;
  options: ScenarioOption[];
}

export const ocbScenarios: ScenarioItem[] = [
  {
    id: "scenario1",
    title: "场景一：帮助新同事",
    description:
      "你处理完采购事务后，发现隔壁工位的新同事小陈正在为一份报销单据发愁。她刚入职不久，对公司的报销系统不太熟悉，已经反复操作了很久。她没有直接向你求助，但你注意到了她的困难。",
    options: [
      {
        id: "s1_A",
        optionKey: "optA",
        text: "主动走过去，耐心地教她完整的操作流程，直到她完全学会。",
      },
      {
        id: "s1_B",
        optionKey: "optB",
        text: "简单告诉她可以查看公司内网里的操作指引。",
      },
      {
        id: "s1_C",
        optionKey: "optC",
        text: "等手头的事忙完后，再看她是否还需要帮助。",
      },
      {
        id: "s1_D",
        optionKey: "optD",
        text: "继续做自己的事，她如果需要帮助会主动开口。",
      },
    ],
  },
  {
    id: "scenario2",
    title: "场景二：下班后帮同事赶方案",
    description:
      "今天是周五下午 5 点半，你已经完成了当天的工作，正准备收拾东西下班。这时你注意到同事小林还在工位上忙碌，她正在赶一份下周一早上要交给客户的方案，但她对方案中涉及的数据整理部分不太擅长，进展缓慢，看起来很焦虑。如果没有人帮忙，她可能需要加班到很晚。你今晚和朋友约了晚饭，但时间还算灵活。",
    options: [
      {
        id: "s2_A",
        optionKey: "optA",
        text: "主动留下来帮她处理数据部分，并告诉朋友晚饭稍微推迟一点。",
      },
      {
        id: "s2_B",
        optionKey: "optB",
        text: "花十分钟快速教她数据处理的方法，然后再去赴约。",
      },
      {
        id: "s2_C",
        optionKey: "optC",
        text: "跟她说明天可以早点来帮她，然后自己先去赴约。",
      },
      {
        id: "s2_D",
        optionKey: "optD",
        text: "建议她问问其他同事，或者用 AI 工具试试，然后自己下班。",
      },
      {
        id: "s2_E",
        optionKey: "optE",
        text: "请选择“2”。",
      },
    ],
  },
  {
    id: "scenario3",
    title: "场景三：流程改进建言",
    description:
      "在日常工作中，你发现公司现有的物资领用流程比较繁琐，部门之间经常因为审批环节而耽误时间，同事们也偶有抱怨。你想到了一些可能的改进方法。",
    options: [
      {
        id: "s3_A",
        optionKey: "optA",
        text: "整理一份书面的改进建议，主动提交给行政主管。",
      },
      {
        id: "s3_B",
        optionKey: "optB",
        text: "找机会和主管聊天时，顺便提一下自己的想法。",
      },
      {
        id: "s3_C",
        optionKey: "optC",
        text: "和几个关系好的同事私下说说，但不打算正式反映。",
      },
      {
        id: "s3_D",
        optionKey: "optD",
        text: "算了，流程改不改不是自己能决定的，做好本职工作就行。",
      },
    ],
  },
];
