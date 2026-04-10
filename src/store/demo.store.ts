'use client'
import { create } from 'zustand'
import type { DemoScenario, ScenarioId, EngineState, DemoEvent, Application, Thread, Interview, Notification, Message } from '@/lib/types'
import { SCENARIOS, DEFAULT_SCENARIO_ID } from '@/lib/demo/scenarios'

interface DemoState {
  scenarioId: ScenarioId
  scenario: DemoScenario
  engineState: EngineState

  // Entity mutations
  applications: Application[]
  threads: Thread[]
  interviews: Interview[]
  notifications: Notification[]
  events: DemoEvent[]

  // Actions
  loadScenario: (id: ScenarioId) => void
  resetScenario: () => void
  setEngineState: (state: EngineState) => void
  fireEvent: (eventId: string) => void
  markEventFired: (eventId: string) => void

  // Entity mutations
  updateApplicationStatus: (appId: string, status: Application['status']) => void
  addNotification: (n: Notification) => void
  addMessage: (threadId: string, message: Message) => void
  addThread: (thread: Thread) => void
  updateResumeApplied: (recommendationId: string) => void
  addApplicationFromVacancy: (v: { id: string; title: string; company: string; matchReasons: string[] }) => string
}

export const useDemoStore = create<DemoState>()((set, get) => {
  const initial = SCENARIOS[DEFAULT_SCENARIO_ID]

  return {
    scenarioId: DEFAULT_SCENARIO_ID,
    scenario: initial,
    engineState: 'idle',
    applications: [...initial.applications],
    threads: [...initial.threads],
    interviews: [...initial.interviews],
    notifications: [...initial.notifications],
    events: [...initial.eventSchedule],

    loadScenario: (id) => {
      const scenario = SCENARIOS[id] ?? SCENARIOS[DEFAULT_SCENARIO_ID]
      set({
        scenarioId: id,
        scenario,
        engineState: 'idle',
        applications: [...scenario.applications],
        threads: [...scenario.threads],
        interviews: [...scenario.interviews],
        notifications: [...scenario.notifications],
        events: scenario.eventSchedule.map((e) => ({ ...e, fired: false })),
      })
    },

    resetScenario: () => {
      const { scenarioId } = get()
      const scenario = SCENARIOS[scenarioId]
      set({
        scenario,
        engineState: 'idle',
        applications: [...scenario.applications],
        threads: [...scenario.threads],
        interviews: [...scenario.interviews],
        notifications: [...scenario.notifications],
        events: scenario.eventSchedule.map((e) => ({ ...e, fired: false })),
      })
    },

    setEngineState: (state) => set({ engineState: state }),

    fireEvent: (eventId) => {
      const { events, scenario } = get()
      const event = events.find((e) => e.id === eventId)
      if (!event || event.fired) return

      // Apply event payload
      if (event.eventType === 'new_message') {
        const payload = event.payload as { threadId: string; message: Partial<Message> }
        get().addMessage(payload.threadId, {
          id: payload.message.id ?? `msg-${Date.now()}`,
          threadId: payload.threadId,
          from: payload.message.from ?? 'recruiter',
          text: payload.message.text ?? '',
          sentAt: new Date().toISOString(),
          read: false,
        })
      }

      if (event.eventType === 'recruiter_reply') {
        const payload = event.payload as { threadId: string; company: string; recruiterName: string; message: string }
        // Create new thread if not exists
        const existingThread = get().threads.find((t) => t.id === payload.threadId)
        if (!existingThread) {
          const newThread: Thread = {
            id: payload.threadId,
            vacancyId: '',
            vacancyTitle: '',
            company: payload.company ?? '',
            recruiterName: payload.recruiterName ?? 'Рекрутер',
            messages: [{
              id: `msg-${Date.now()}`,
              threadId: payload.threadId,
              from: 'recruiter',
              text: payload.message ?? '',
              sentAt: new Date().toISOString(),
              read: false,
            }],
            pinned: false,
            unreadCount: 1,
            lastMessageAt: new Date().toISOString(),
          }
          get().addThread(newThread)
        }
        get().addNotification({
          id: `notif-${Date.now()}`,
          type: 'recruiter_reply',
          title: 'Новое сообщение',
          body: `${payload.company}: «${(payload.message ?? '').slice(0, 60)}...»`,
          relatedEntityId: payload.threadId,
          relatedEntityType: 'thread',
          createdAt: new Date().toISOString(),
          read: false,
        })
      }

      if (event.eventType === 'interview_scheduled') {
        get().addNotification({
          id: `notif-${Date.now()}`,
          type: 'interview_scheduled',
          title: 'Интервью подтверждено',
          body: (event.payload as { message: string }).message ?? 'Новое интервью запланировано',
          createdAt: new Date().toISOString(),
          read: false,
        })
      }

      get().markEventFired(eventId)
    },

    markEventFired: (eventId) => {
      set((state) => ({
        events: state.events.map((e) => e.id === eventId ? { ...e, fired: true } : e),
      }))
    },

    updateApplicationStatus: (appId, status) => {
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === appId
            ? {
                ...a,
                status,
                statusHistory: [
                  ...a.statusHistory,
                  { status, at: new Date().toISOString() },
                ],
              }
            : a
        ),
      }))
    },

    addNotification: (n) => {
      set((state) => ({
        notifications: [n, ...state.notifications],
      }))
    },

    addMessage: (threadId, message) => {
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [...t.messages, message],
                unreadCount: t.unreadCount + (message.from === 'recruiter' ? 1 : 0),
                lastMessageAt: message.sentAt,
              }
            : t
        ),
      }))
    },

    addThread: (thread) => {
      set((state) => ({
        threads: [thread, ...state.threads],
      }))
    },

    updateResumeApplied: (recommendationId) => {
      set((state) => ({
        scenario: {
          ...state.scenario,
          resumeRecommendations: state.scenario.resumeRecommendations.map((r) =>
            r.id === recommendationId ? { ...r, applied: true } : r
          ),
        },
      }))
    },

    addApplicationFromVacancy: (v) => {
      const id = `app-manual-${Date.now()}`
      const reason = v.matchReasons[0] ?? 'высокое совпадение с вакансией'
      const coverLetter =
        `Здравствуйте!\n\nМеня заинтересовала вакансия «${v.title}» в компании ${v.company}. ` +
        `AI проанализировал вакансию и выделил ключевое совпадение: ${reason.toLowerCase()}.\n\n` +
        `Готов обсудить детали и ответить на вопросы.\n\nС уважением,\nАлексей Смирнов`

      const newApp: Application = {
        id,
        vacancyId: v.id,
        vacancyTitle: v.title,
        company: v.company,
        status: 'planned',
        coverLetter,
        source: 'manual',
        statusHistory: [{ status: 'planned', at: new Date().toISOString() }],
      }

      set((state) => ({
        applications: [newApp, ...state.applications],
      }))

      return id
    },
  }
})
