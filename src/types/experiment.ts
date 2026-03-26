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
}

export interface OcbScaleState {
  ocbi1: number | null
  ocbo1: number | null
  ocbi2: number | null
  ocbo2: number | null
  ocbi3: number | null
  ocbo3: number | null
  ocbi4: number | null
  ocbo4: number | null
}
