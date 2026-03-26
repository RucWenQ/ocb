import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { generateParticipantId } from '../utils/generateId'
import type {
  AIConfig,
  ChatRecord,
  Condition,
  Demographics,
  OcbOptionKey,
  OcbScaleState,
  OcbScenarioKey,
  OcbScenariosState,
  PebScaleState,
  ShoppingCategoryKey,
  ShoppingChoice,
  ShoppingChoicesState,
} from '../types/experiment'

type OcbScenarioOrderKey = 'scenario1_order' | 'scenario2_order' | 'scenario3_order'

interface ExperimentState {
  participantId: string
  condition: Condition | null
  startTime: string
  currentPage: number

  consentGiven: boolean
  demographics: Demographics

  aiConfig: AIConfig
  chatHistory: ChatRecord[]

  receiptConfirmed: boolean
  receiptViewDuration: number

  ocbScenarios: OcbScenariosState
  shoppingChoices: ShoppingChoicesState
  pebScale: PebScaleState
  ocbScale: OcbScaleState

  dvResponses: Record<string, unknown>
  pageDurations: Record<string, number>

  initializeParticipant: () => void
  setCondition: (condition: Condition) => void
  setCurrentPage: (page: number) => void
  setConsentData: (payload: { consentGiven: boolean; demographics: Demographics }) => void
  updateAIConfig: (payload: Partial<AIConfig>) => void
  appendChatMessage: (message: ChatRecord) => void
  resetChat: () => void
  setReceiptInfo: (confirmed: boolean, duration: number) => void
  setOcbScenarioRating: (scenario: OcbScenarioKey, option: OcbOptionKey, value: number) => void
  setOcbScenarioOrder: (scenario: OcbScenarioKey, order: string[]) => void
  setShoppingChoice: (category: ShoppingCategoryKey, choice: Exclude<ShoppingChoice, null>) => void
  setPebScaleValue: (itemId: keyof PebScaleState, value: number) => void
  setOcbScaleValue: (itemId: keyof OcbScaleState, value: number) => void
  resetDVState: () => void
  saveDVResponse: (scaleId: string, responses: Record<string, unknown>) => void
  recordPageDuration: (pageId: string, duration: number) => void
}

const defaultDemographics: Demographics = {
  phone: '',
  gender: '',
  age: null,
  education: '',
  workExperience: '',
}

const defaultAIConfig: AIConfig = {
  nickname: '',
  avatarId: '',
  personality: 'professional',
  creativity: 50,
  detailLevel: 50,
  customPrompt: '',
}

const defaultOcbScenarioRatings = {
  optA: null,
  optB: null,
  optC: null,
  optD: null,
}

const defaultOcbScenarios: OcbScenariosState = {
  scenario1: { ...defaultOcbScenarioRatings },
  scenario2: { ...defaultOcbScenarioRatings },
  scenario3: { ...defaultOcbScenarioRatings },
  scenario1_order: [],
  scenario2_order: [],
  scenario3_order: [],
}

const shoppingKeys: ShoppingCategoryKey[] = [
  'chopsticks',
  'trashbag',
  'egg',
  'milk',
  'rice',
  'soySauce',
  'oil',
]

const defaultShoppingChoices: ShoppingChoicesState = {
  chopsticks: null,
  trashbag: null,
  egg: null,
  milk: null,
  rice: null,
  soySauce: null,
  oil: null,
  ecoCount: 0,
}

const defaultPebScale: PebScaleState = {
  peb1: null,
  peb2: null,
  peb3: null,
  peb4: null,
  peb5: null,
  peb6: null,
}

const defaultOcbScale: OcbScaleState = {
  ocbi1: null,
  ocbo1: null,
  ocbi2: null,
  ocbo2: null,
  ocbi3: null,
  ocbo3: null,
  ocbi4: null,
  ocbo4: null,
}

export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set) => ({
      participantId: '',
      condition: null,
      startTime: '',
      currentPage: 1,
      consentGiven: false,
      demographics: defaultDemographics,
      aiConfig: defaultAIConfig,
      chatHistory: [],
      receiptConfirmed: false,
      receiptViewDuration: 0,
      ocbScenarios: defaultOcbScenarios,
      shoppingChoices: defaultShoppingChoices,
      pebScale: defaultPebScale,
      ocbScale: defaultOcbScale,
      dvResponses: {},
      pageDurations: {},

      initializeParticipant: () =>
        set((state) => {
          if (state.participantId) return state

          const now = new Date().toISOString()
          return {
            ...state,
            participantId: generateParticipantId(),
            startTime: now,
          }
        }),

      setCondition: (condition) => set({ condition }),
      setCurrentPage: (page) => set({ currentPage: page }),

      setConsentData: ({ consentGiven, demographics }) =>
        set({
          consentGiven,
          demographics,
        }),

      updateAIConfig: (payload) =>
        set((state) => ({
          aiConfig: {
            ...state.aiConfig,
            ...payload,
          },
        })),

      appendChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),

      resetChat: () => set({ chatHistory: [] }),

      setReceiptInfo: (confirmed, duration) =>
        set({
          receiptConfirmed: confirmed,
          receiptViewDuration: duration,
        }),

      setOcbScenarioRating: (scenario, option, value) =>
        set((state) => ({
          ocbScenarios: {
            ...state.ocbScenarios,
            [scenario]: {
              ...state.ocbScenarios[scenario],
              [option]: value,
            },
          },
        })),

      setOcbScenarioOrder: (scenario, order) =>
        set((state) => {
          const orderKey = `${scenario}_order` as OcbScenarioOrderKey
          return {
            ocbScenarios: {
              ...state.ocbScenarios,
              [orderKey]: order,
            },
          }
        }),

      setShoppingChoice: (category, choice) =>
        set((state) => {
          const next = {
            ...state.shoppingChoices,
            [category]: choice,
          }
          const ecoCount = shoppingKeys.reduce((sum, key) => {
            return sum + (next[key] === 'eco' ? 1 : 0)
          }, 0)
          return {
            shoppingChoices: {
              ...next,
              ecoCount,
            },
          }
        }),

      setPebScaleValue: (itemId, value) =>
        set((state) => ({
          pebScale: {
            ...state.pebScale,
            [itemId]: value,
          },
        })),

      setOcbScaleValue: (itemId, value) =>
        set((state) => ({
          ocbScale: {
            ...state.ocbScale,
            [itemId]: value,
          },
        })),

      resetDVState: () =>
        set({
          ocbScenarios: defaultOcbScenarios,
          shoppingChoices: defaultShoppingChoices,
          pebScale: defaultPebScale,
          ocbScale: defaultOcbScale,
        }),

      saveDVResponse: (scaleId, responses) =>
        set((state) => ({
          dvResponses: {
            ...state.dvResponses,
            [scaleId]: responses,
          },
        })),

      recordPageDuration: (pageId, duration) =>
        set((state) => ({
          pageDurations: {
            ...state.pageDurations,
            [pageId]: duration,
          },
        })),
    }),
    {
      name: 'ai-ethics-experiment-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        participantId: state.participantId,
        condition: state.condition,
        startTime: state.startTime,
        currentPage: state.currentPage,
        consentGiven: state.consentGiven,
        demographics: state.demographics,
        aiConfig: state.aiConfig,
        chatHistory: state.chatHistory,
        receiptConfirmed: state.receiptConfirmed,
        receiptViewDuration: state.receiptViewDuration,
        ocbScenarios: state.ocbScenarios,
        shoppingChoices: state.shoppingChoices,
        pebScale: state.pebScale,
        ocbScale: state.ocbScale,
        dvResponses: state.dvResponses,
        pageDurations: state.pageDurations,
      }),
    },
  ),
)
