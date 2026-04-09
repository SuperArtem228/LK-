'use client'

import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useDemoStore } from '@/store/demo.store'
import { useNotificationsStore } from '@/store/notifications.store'
import { useAuthStore } from '@/store/auth.store'
import { initEngine, startEngine } from '@/lib/demo/engine'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const scenarioId = useAuthStore((s) => s.scenarioId)
  const { loadScenario, fireEvent, setEngineState, events, notifications } = useDemoStore((s) => ({
    loadScenario: s.loadScenario,
    fireEvent: s.fireEvent,
    setEngineState: s.setEngineState,
    events: s.events,
    notifications: s.notifications,
  }))
  const { setNotifications, addNotification } = useNotificationsStore((s) => ({
    setNotifications: s.setNotifications,
    addNotification: s.addNotification,
  }))

  // Sync demo notifications to notifications store
  useEffect(() => {
    setNotifications(notifications)
  }, [notifications, setNotifications])

  // Sync new notifications added by demo engine
  useEffect(() => {
    const unsub = useDemoStore.subscribe((state, prev) => {
      if (state.notifications.length > prev.notifications.length) {
        const newest = state.notifications[0]
        if (newest && !prev.notifications.find((n) => n.id === newest.id)) {
          addNotification(newest)
        }
      }
    })
    return unsub
  }, [addNotification])

  // Initialize engine
  useEffect(() => {
    initEngine({
      loadScenario,
      fireEvent,
      setEngineState,
      getEvents: () => useDemoStore.getState().events,
    })
    startEngine(scenarioId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId])

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
