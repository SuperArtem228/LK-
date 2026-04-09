'use client'

import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileDrawer } from './MobileDrawer'
import { TourOverlay } from '@/components/tour/TourOverlay'
import { TourStartButton } from '@/components/tour/TourStartButton'
import { useDemoStore } from '@/store/demo.store'
import { useNotificationsStore } from '@/store/notifications.store'
import { useAuthStore } from '@/store/auth.store'
import { initEngine, startEngine } from '@/lib/demo/engine'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  // Individual selectors — no object selectors to avoid Zustand 5 + useSyncExternalStore infinite loop
  const scenarioId = useAuthStore((s) => s.scenarioId)
  const loadScenario = useDemoStore((s) => s.loadScenario)
  const fireEvent = useDemoStore((s) => s.fireEvent)
  const setEngineState = useDemoStore((s) => s.setEngineState)
  const notifications = useDemoStore((s) => s.notifications)
  const setNotifications = useNotificationsStore((s) => s.setNotifications)
  const addNotification = useNotificationsStore((s) => s.addNotification)

  // Sync demo notifications to notifications store on load
  useEffect(() => {
    setNotifications(notifications)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount — initial sync

  // Sync new notifications added by demo engine events
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
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      <MobileDrawer />

      {/* Tour overlay */}
      <TourOverlay />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Tour start FAB */}
      <TourStartButton />
    </div>
  )
}
