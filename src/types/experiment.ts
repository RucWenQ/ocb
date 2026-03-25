export type Condition = 'experimental' | 'control'
export type Personality = 'professional' | 'friendly' | 'concise'
export type ChatRole = 'user' | 'assistant'

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
