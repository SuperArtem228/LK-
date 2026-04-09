'use client'

import { Check, Zap, Crown, Sparkles, Shield, Clock } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'trial',
    name: 'Пробный',
    price: 0,
    period: '14 дней',
    description: 'Попробуйте все возможности бесплатно',
    icon: Clock,
    color: 'border-zinc-200',
    badgeColor: 'bg-zinc-100 text-zinc-600',
    features: [
      'До 5 откликов в день',
      'Анализ профиля HH',
      'Базовый подбор вакансий',
      'Шаблоны сопроводительных писем',
      'Уведомления об ответах',
    ],
    missing: [
      'Безлимитные отклики',
      'AI-улучшение резюме',
      'Подготовка к интервью',
      'Приоритетная поддержка',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 990,
    period: 'в месяц',
    description: 'Для активного поиска работы',
    icon: Zap,
    color: 'border-indigo-400 ring-1 ring-indigo-400',
    badgeColor: 'bg-indigo-600 text-white',
    popular: true,
    features: [
      'До 20 откликов в день',
      'AI-подбор вакансий под профиль',
      'Персонализированные письма',
      'AI-анализ и улучшение резюме',
      'Подготовка к интервью',
      'Уведомления в реальном времени',
      'История откликов',
    ],
    missing: [
      'Безлимитные отклики',
      'Приоритетная поддержка',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 1990,
    period: 'в месяц',
    description: 'Максимум для топ-позиций',
    icon: Crown,
    color: 'border-amber-400',
    badgeColor: 'bg-amber-500 text-white',
    features: [
      'Безлимитные отклики в день',
      'Приоритетный подбор вакансий',
      'Персонализированные письма',
      'Полный AI-аудит резюме',
      'Подготовка к интервью',
      'Персональный карьерный коуч',
      'Приоритетная поддержка 24/7',
      'Аналитика рынка труда',
    ],
    missing: [],
  },
]

export function SubscriptionPage() {
  const user = useDemoStore((s) => s.scenario.user)
  const currentPlan = user.planId
  const trialDaysLeft = user.trialDaysLeft

  function handleUpgrade(planId: string) {
    toast.success(`Переход на план ${planId === 'pro' ? 'Pro' : 'Pro+'} оформлен!`)
  }

  return (
    <div>
      <PageHeader
        title="Подписка"
        description="Управление тарифным планом"
      />

      {/* Trial banner */}
      {currentPlan === 'trial' && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Пробный период: осталось {trialDaysLeft} {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              После окончания пробного периода доступ к AI-функциям будет ограничен. Выберите план, чтобы продолжить.
            </p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = currentPlan === plan.id
          return (
            <div
              key={plan.id}
              className={cn(
                'bg-white rounded-xl border p-6 flex flex-col relative transition-all',
                plan.color,
                isCurrent && 'shadow-sm'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    Популярный
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', plan.badgeColor)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                  <p className="text-xs text-zinc-500">{plan.description}</p>
                </div>
              </div>

              <div className="mb-5">
                {plan.price === 0 ? (
                  <p className="text-2xl font-bold text-zinc-900">Бесплатно</p>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-zinc-900">{plan.price.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-sm text-zinc-500">{plan.period}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-700">{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 opacity-40">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-px bg-zinc-400" />
                    </div>
                    <span className="text-sm text-zinc-500">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 rounded-lg bg-zinc-100 text-zinc-500 text-sm font-medium text-center">
                  Текущий план
                </div>
              ) : plan.price === 0 ? null : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={cn(
                    'w-full py-2.5 rounded-lg text-sm font-medium transition-all',
                    plan.id === 'pro'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  )}
                >
                  Перейти на {plan.name}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust block */}
      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Почему Sofi?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Sparkles, title: 'AI без компромиссов', desc: 'GPT-4 для каждого отклика, персонализация под конкретную вакансию' },
            { icon: Shield, title: 'Безопасность данных', desc: 'Данные хранятся только на серверах в России, соответствие 152-ФЗ' },
            { icon: Zap, title: 'Реальные результаты', desc: 'Наши пользователи получают ответ в среднем через 3 дня после регистрации' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
