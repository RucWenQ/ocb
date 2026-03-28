export const moralCreditItems = [
  { id: 'mc1', textTemplate: '${aiNickname}做的这件事在道德上是值得称赞的，并为我赢得了道德积分' },
  { id: 'mc2', textTemplate: '${aiNickname}做的这件事，为我赢得了"我是个道德的人"的信誉' },
  { id: 'mc3', textTemplate: '${aiNickname}所做的每一件好事都会增加我的道德积分' },
  { id: 'mc4', textTemplate: '${aiNickname}以合乎道德的方式行事，让我觉得我拥有了一些道德积分盈余' },
  { id: 'mc5', textTemplate: '${aiNickname}做的好事帮我建立起了我的道德信誉账户' },
] as const

export function injectAiNickname(template: string, aiNickname: string): string {
  return template.replaceAll('${aiNickname}', aiNickname)
}
