'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDemoStore } from '@/store/demo.store'
import { cn } from '@/lib/utils/cn'
import type { ScenarioId } from '@/lib/types'
import { SCENARIOS } from '@/lib/demo/scenarios'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

const DEMO_CREDS = { email: 'demo@sofi.ai', password: 'demo1234' }

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useAuthStore((s) => s.login)
  const loadScenario = useDemoStore((s) => s.loadScenario)

  // Handle ?demo=scenario-id URL param
  const demoParam = searchParams.get('demo') as ScenarioId | null

  useEffect(() => {
    if (demoParam && SCENARIOS[demoParam]) {
      handleAutoLogin(demoParam)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoParam])

  async function handleAutoLogin(scenarioId: ScenarioId) {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    login(scenarioId)
    loadScenario(scenarioId)
    router.push(ROUTES.DASHBOARD)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Введите email и пароль')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))

    if (email === DEMO_CREDS.email && password === DEMO_CREDS.password) {
      const scenarioId = (demoParam && SCENARIOS[demoParam]) ? demoParam : 'junior-frontend'
      login(scenarioId)
      loadScenario(scenarioId)
      toast.success('Добро пожаловать в Sofi!')
      router.push(ROUTES.WELCOME)
    } else if (email.includes('@') && password.length >= 6) {
      // Accept any valid-looking email
      login('junior-frontend')
      loadScenario('junior-frontend')
      toast.success('Добро пожаловать в Sofi!')
      router.push(ROUTES.WELCOME)
    } else {
      setLoading(false)
      setError('Неверный email или пароль')
    }
  }

  return (
    <div className="w-full max-w-[400px] animate-fade-in">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-900">Sofi</span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-900 mb-1">Вход в кабинет</h1>
        <p className="text-sm text-zinc-500 mb-6">
          AI-помощник для автоматизации поиска работы
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={cn(
                'w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                error ? 'border-red-300' : 'border-zinc-200'
              )}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white pr-10 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                  error ? 'border-red-300' : 'border-zinc-200'
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
              'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
              loading && 'opacity-60 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Входим...
              </>
            ) : (
              <>
                Войти
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 text-center mb-2">Демо-доступ</p>
          <button
            onClick={() => { setEmail(DEMO_CREDS.email); setPassword(DEMO_CREDS.password) }}
            className="w-full text-xs text-indigo-600 hover:text-indigo-800 font-medium text-center transition-colors"
          >
            demo@sofi.ai / demo1234
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-400 mt-4">
        Нет аккаунта?{' '}
        <button className="text-indigo-600 font-medium hover:underline">
          Начать бесплатно
        </button>
      </p>
    </div>
  )
}
