export type Condition = 'experimental' | 'control'
export type Personality = 'professional' | 'friendly' | 'concise'
export type ChatRole = 'user' | 'assistant'
export type OcbScenarioKey = 'scenario1' | 'scenario2' | 'scenario3'
export type OcbOptionKey = 'optA' | 'optB' | 'optC' | 'optD'
export type ShoppingCategoryKey =
  | 'chopsticks'
  | 'trashbag'
  | 'egg'
  | 'milk'
  | 'rice'
  | 'soySauce'
  | 'oil'
export type ShoppingChoice = 'eco' | 'normal' | 'filler' | null

export interface Demographics {
  phone: string
  gender: string
  age: number | null
  education: string
  workExperience: string
}

export interface AIConfig {
  nickname: string
  avatarId: string
  personality: Personality
  creativity: number
  detailLevel: number
  customPrompt: string
}

export interface ChatRecord {
  role: ChatRole
  content: string
  timestamp: string
}

export interface OcbScenarioRatings {
  optA: number | null
  optB: number | null
  optC: number | null
  optD: number | null
}

export interface OcbScenariosState {
  scenario1: OcbScenarioRatings
  scenario2: OcbScenarioRatings
  scenario3: OcbScenarioRatings
  scenario1_order: string[]
  scenario2_order: string[]
  scenario3_order: string[]
}

export interface ShoppingChoicesState {
  chopsticks: ShoppingChoice
  trashbag: ShoppingChoice
  egg: ShoppingChoice
  milk: ShoppingChoice
  rice: ShoppingChoice
  soySauce: ShoppingChoice
  oil: ShoppingChoice
  ecoCount: number
}

export interface PebScaleState {
  peb1: number | null
  peb2: number | null
  peb3: number | null
  peb4: number | null
  peb5: number | null
  peb6: number | null
  peb7: number | null
}

export interface MoralDisengagementScaleState {
  md1: number | null
  md2: number | null
  md3: number | null
  md4: number | null
  md5: number | null
  md6: number | null
  mdCheck: number | null
}

export interface MoralIdentityScaleState {
  mi1: number | null
  mi2: number | null
  mi3: number | null
  mi4: number | null
  mi5: number | null
  mi6: number | null
  mi7: number | null
  mi8: number | null
  mi9: number | null
  mi10: number | null
  miCheck: number | null
}
