import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { generateParticipantId } from '../utils/generateId'
import type { AIConfig, ChatRecord, Condition, Demographics } from '../types/experiment'

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
  saveDVResponse: (scaleId: string, responses: Record<string, unknown>) => void
  recordPageDuration: (pageId: string, duration: number) => void
}

const defaultDemographics: Demographics = {
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
        dvResponses: state.dvResponses,
        pageDurations: state.pageDurations,
      }),
    },
  ),
)
