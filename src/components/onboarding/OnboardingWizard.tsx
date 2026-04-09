'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

const GOALS = [
  'Найти первую работу в IT',
  'Вырасти до следующего уровня',
  'Сменить компанию / сферу',
  'Найти удалённую работу',
  'Вернуться после перерыва',
]

const EXPERIENCE_OPTIONS = [
  { label: 'Нет опыта', value: '0', desc: 'Студент или выпускник' },
  { label: '1–2 года', value: '1', desc: 'Начинающий специалист' },
  { label: '3–5 лет', value: '3', desc: 'Опытный специалист' },
  { label: '5+ лет', value: '5', desc: 'Старший специалист' },
]

const FORMATS = [
  { label: 'Удалённо', value: 'remote' },
  { label: 'Гибрид', value: 'hybrid' },
  { label: 'В офисе', value: 'office' },
]

const STEPS = ['Цель поиска', 'Опыт', 'Предпочтения']

export function OnboardingWizard() {
  const router = useRouter()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)

  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [formats, setFormats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleFormat(v: string) {
    setFormats((prev) => prev.includes(v) ? prev.filter((f) => f !== v) : [...prev, v])
  }

  async function handleFinish() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    completeOnboarding()
    toast.success('Профиль настроен! Подключите HeadHunter для начала поиска.')
    router.push(ROUTES.HH_CONNECT)
  }

  const canNext = [
    !!goal,
    !!experience,
    formats.length > 0,
  ][step]

  return (
    <div className="w-full max-w-[500px] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Настройка профиля</span>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                    i < step
                      ? 'bg-indigo-600 text-white'
                      : i === step
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-zinc-100 text-zinc-400'
                  )}
                >
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium', i === step ? 'text-zinc-900' : 'text-zinc-400')}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px flex-1 mx-1', i < step ? 'bg-indigo-300' : 'bg-zinc-100')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 pb-8">
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">Какова ваша цель?</h2>
              <p className="text-sm text-zinc-500 mb-4">Это поможет AI подобрать подходящие вакансии</p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all',
                      goal === g
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">Ваш опыт работы</h2>
              <p className="text-sm text-zinc-500 mb-4">Поможет AI настроить уровень вакансий</p>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border transition-all',
                      experience === opt.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    )}
                  >
                    <p className={cn('text-sm font-medium', experience === opt.value ? 'text-indigo-700' : 'text-zinc-900')}>{opt.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">Формат работы</h2>
              <p className="text-sm text-zinc-500 mb-4">Можно выбрать несколько</p>
              <div className="flex gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => toggleFormat(f.value)}
                    className={cn(
                      'flex-1 py-3 rounded-lg border text-sm font-medium transition-all',
                      formats.includes(f.value)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-7">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                ← Назад
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  canNext
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                )}
              >
                Далее <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canNext || loading}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  canNext && !loading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохраняем...
                  </>
                ) : (
                  <>Готово <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
