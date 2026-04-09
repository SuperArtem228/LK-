'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui.store'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils/cn'

export function MobileDrawer() {
  const drawerOpen = useUIStore((s) => s.drawerOpen)
  const closeDrawer = useUIStore((s) => s.closeDrawer)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-zinc-900/50 md:hidden transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-white shadow-xl md:hidden transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={closeDrawer} />
      </div>
    </>
  )
}
