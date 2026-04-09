'use client'
import { create } from 'zustand'
import type { Notification } from '@/lib/types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number

  setNotifications: (ns: Notification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
  addNotification: (n: Notification) => void
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (ns) => {
    set({ notifications: ns, unreadCount: ns.filter((n) => !n.read).length })
  },

  markRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length }
    })
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (n) => {
    set((state) => {
      const updated = [n, ...state.notifications]
      return { notifications: updated, unreadCount: updated.filter((x) => !x.read).length }
    })
  },
}))
