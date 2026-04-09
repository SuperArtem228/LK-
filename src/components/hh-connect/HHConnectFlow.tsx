'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

const STEPS = [
  { id: 'auth', label: 'Авторизация в HH.ru' },
  { id: 'import', label: 'Импорт резюме' },
  { id: 'analyze', label: 'Анализ профиля' },
  { id: 'sync', label: 'Синхронизация вакансий' },
]

export function HHConnectFlow() {
  const router = useRouter()
  const connectHH = useAuthStore((s) => s.connectHH)
  const scenarioId = useAuthStore((s) => s.scenarioId)

  const [currentStep, setCurrentStep] = useState(0) // 0 = auth form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importItems, setImportItems] = useState<string[]>([])
  const [analyzeItems, setAnalyzeItems] = useState<string[]>([])
  const [syncCount, setSyncCount] = useState(0)
  const [done, setDone] = useState(false)

  const resumeTitle = scenarioId === 'product-analyst'
    ? 'Product Analyst — SQL, Python'
    : scenarioId === 'marketing-manager'
    ? 'Marketing Manager | Digital'
    : 'Junior Frontend Developer — React'

  const salaryText = scenarioId === 'product-analyst'
    ? '140 000 – 200 000 ₽'
    : scenarioId === 'marketing-manager'
    ? '110 000 – 150 000 ₽'
    : '80 000 – 110 000 ₽'

  const vacancyCount = scenarioId === 'product-analyst' ? 184
    : scenarioId === 'marketing-manager' ? 213
    : 247

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setAuthLoading(true)
    await new Promise((r) => setTimeout(r, 1800))
    setAuthLoading(false)
    setCurrentStep(1)
    runImport()
  }

  async function runImport() {
    const items = [
      `Найдено резюме: «${resumeTitle}»`,
      `Зарплатные ожидания: ${salaryText}`,
      'Опыт работы: определён',
    ]
    await new Promise((r) => setTimeout(r, 400))
    for (let i = 0; i < 100; i += 12) {
      await new Promise((r) => setTimeout(r, 120))
      setProgress(Math.min(i + 12, 100))
    }
    for (const item of items) {
      await new Promise((r) => setTimeout(r, 350))
      setImportItems((prev) => [...prev, item])
    }
    await new Promise((r) => setTimeout(r, 800))
    setCurrentStep(2)
    runAnalyze()
  }

  async function runAnalyze() {
    const items = [
      'Опыт работы распознан',
      'Навыки извлечены',
      `Зарплатные ожидания: ${salaryText}`,
      'Оценка профиля: 62/100',
    ]
    for (const item of items) {
      await new Promise((r) => setTimeout(r, 600))
      setAnalyzeItems((prev) => [...prev, item])
    }
    await new Promise((r) => setTimeout(r, 800))
    setCurrentStep(3)
    runSync()
  }

  async function runSync() {
    const target = vacancyCount
    const step = Math.ceil(target / 30)
    for (let n = 0; n <= target; n += step) {
      await new Promise((r) => setTimeout(r, 80))
      setSyncCount(Math.min(n, target))
    }
    await new Promise((r) => setTimeout(r, 600))
    setDone(true)
  }

  function handleComplete() {
    connectHH()
    toast.success(`Подключено! Найдено ${vacancyCount} подходящих вакансий.`)
    router.push(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] animate-fade-in">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                i < currentStep ? 'bg-indigo-600' : i === currentStep ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'bg-zinc-100'
              )}>
                {i < currentStep
                  ? <CheckCircle2 className="w-3 h-3 text-white" />
                  : <span className="text-[9px] font-bold text-zinc-400">{i + 1}</span>
                }
              </div>
              <span className={cn('text-[11px] font-medium hidden sm:block', i === currentStep ? 'text-zinc-700' : 'text-zinc-400')}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className={cn('h-px flex-1 mx-1', i < currentStep ? 'bg-indigo-300' : 'bg-zinc-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          {/* Step 0: Auth form */}
          {currentStep === 0 && (
            <div className="p-8 animate-fade-in">
              {/* HH logo mock */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">hh</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">HeadHunter</p>
                  <p className="text-xs text-zinc-400">Авторизация</p>
                </div>
              </div>
              <h2 className="text-base font-semibold text-zinc-900 mb-1">Войдите в аккаунт HH.ru</h2>
              <p className="text-sm text-zinc-500 mb-5">Sofi получит доступ к вашему резюме и вакансиям</p>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email или телефон</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading || !email || !password}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
                    email && password && !authLoading
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  )}
                >
                  {authLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Авторизация...</>
                    : 'Войти в HH.ru'}
                </button>
              </form>
              <p className="text-xs text-zinc-400 text-center mt-4">
                Sofi не хранит ваш пароль
              </p>
            </div>
          )}

          {/* Step 1: Import */}
          {currentStep === 1 && (
            <div className="p-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <h2 className="text-base font-semibold text-zinc-900">Импорт резюме</h2>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2">
                {importItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </div>
                ))}
                {importItems.length < 3 && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-zinc-300 animate-spin flex-shrink-0" />
                    <span className="text-sm text-zinc-400">Обрабатываем данные...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Analyze */}
          {currentStep === 2 && (
            <div className="p-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <h2 className="text-base font-semibold text-zinc-900">Анализ профиля</h2>
              </div>
              <div className="space-y-3">
                {analyzeItems.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0', i === analyzeItems.length - 1 && item.includes('Оценка') ? 'text-indigo-500' : 'text-green-500')} />
                    <span className={cn('text-sm', item.includes('Оценка') ? 'font-medium text-zinc-900' : 'text-zinc-700')}>{item}</span>
                  </div>
                ))}
                {analyzeItems.length < 4 && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-zinc-300 animate-spin flex-shrink-0" />
                    <span className="text-sm text-zinc-400">Анализируем профиль...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Sync */}
          {currentStep === 3 && (
            <div className="p-8 animate-fade-in">
              {!done ? (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <h2 className="text-base font-semibold text-zinc-900">Синхронизация вакансий</h2>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-indigo-600 tabular-nums">{syncCount}</p>
                    <p className="text-sm text-zinc-500 mt-1">подходящих вакансий найдено</p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs text-zinc-500">Соответствие вашему профилю</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs text-zinc-500">Фильтрация дубликатов</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs text-zinc-500">Ранжирование по совпадению</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 mb-1">HeadHunter подключён!</h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    Найдено <span className="font-semibold text-zinc-900">{vacancyCount} вакансий</span>.<br />
                    AI уже готовит первую очередь откликов.
                  </p>
                  <button
                    onClick={handleComplete}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                  >
                    Перейти в кабинет
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
