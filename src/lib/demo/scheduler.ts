type TimerHandle = ReturnType<typeof setTimeout>

class DemoScheduler {
  private timers: Map<string, TimerHandle> = new Map()
  private paused = false
  private queue: Array<{ id: string; delay: number; fn: () => void; remaining: number; startedAt: number }> = []

  schedule(id: string, delayMs: number, fn: () => void) {
    if (this.timers.has(id)) return
    if (this.paused) {
      this.queue.push({ id, delay: delayMs, fn, remaining: delayMs, startedAt: Date.now() })
      return
    }
    const handle = setTimeout(() => {
      this.timers.delete(id)
      fn()
    }, delayMs)
    this.timers.set(id, handle)
  }

  cancel(id: string) {
    const handle = this.timers.get(id)
    if (handle) {
      clearTimeout(handle)
      this.timers.delete(id)
    }
  }

  cancelAll() {
    for (const handle of this.timers.values()) clearTimeout(handle)
    this.timers.clear()
    this.queue = []
  }

  pause() {
    if (this.paused) return
    this.paused = true
    const now = Date.now()
    for (const [id, handle] of this.timers.entries()) {
      clearTimeout(handle)
      const entry = this.queue.find((q) => q.id === id)
      if (entry) {
        entry.remaining = Math.max(0, entry.remaining - (now - entry.startedAt))
      }
    }
    this.timers.clear()
  }

  resume() {
    if (!this.paused) return
    this.paused = false
    const pending = [...this.queue]
    this.queue = []
    for (const entry of pending) {
      this.schedule(entry.id, entry.remaining, entry.fn)
    }
  }
}

export const demoScheduler = new DemoScheduler()
