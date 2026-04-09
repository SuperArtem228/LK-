import { demoScheduler } from './scheduler'
import type { ScenarioId, TriggerAction } from '@/lib/types'

// The engine is initialized from a React context so it can access Zustand stores
// We export functions that take store actions as parameters

export interface EngineActions {
  loadScenario: (id: ScenarioId) => void
  fireEvent: (eventId: string) => void
  setEngineState: (state: 'idle' | 'running' | 'paused' | 'quiet') => void
  getEvents: () => Array<{ id: string; triggerType: string; triggerAfterMs?: number; triggerOnAction?: string; fired: boolean }>
}

let engineActions: EngineActions | null = null
let currentScenarioId: ScenarioId | null = null

export function initEngine(actions: EngineActions) {
  engineActions = actions
}

export function startEngine(scenarioId: ScenarioId, quiet = false) {
  if (!engineActions) return

  demoScheduler.cancelAll()
  currentScenarioId = scenarioId
  engineActions.loadScenario(scenarioId)

  if (quiet) {
    engineActions.setEngineState('quiet')
    return
  }

  engineActions.setEngineState('running')

  // Schedule timer-based events
  const events = engineActions.getEvents()
  for (const event of events) {
    if (event.triggerType === 'timer' && event.triggerAfterMs && !event.fired) {
      const id = event.id
      demoScheduler.schedule(id, event.triggerAfterMs, () => {
        engineActions?.fireEvent(id)
      })
    }
  }
}

export function triggerAction(action: TriggerAction) {
  if (!engineActions) return

  const events = engineActions.getEvents()
  for (const event of events) {
    if (event.triggerType === 'action' && event.triggerOnAction === action && !event.fired) {
      engineActions.fireEvent(event.id)
    }
  }
}

export function pauseEngine() {
  engineActions?.setEngineState('paused')
  demoScheduler.pause()
}

export function resumeEngine() {
  engineActions?.setEngineState('running')
  demoScheduler.resume()
}

export function resetEngine(scenarioId: ScenarioId) {
  demoScheduler.cancelAll()
  if (engineActions) {
    startEngine(scenarioId)
  }
}
