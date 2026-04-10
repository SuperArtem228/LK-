'use client'

import { useRouter } from 'next/navigation'
import { Search, Send, Calendar, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { HHLabLogo } from '@/components/shared/HHLabLogo'

const features = [
  {
    icon: Search,
    title: 'Умный подбор',
    desc: 'AI анализирует ваш профиль и подбирает вакансии с высоким совпадением',
  },
  {
    icon: Send,
    title: 'Автоотклики',
    desc: 'До 20 персонализированных откликов в день без вашего участия',
  },
  {
    icon: Calendar,
    title: 'Подготовка к интервью',
    desc: 'AI-пакет: вопросы, о компании, чек-лист — всё готово заранее',
  },
]

export function WelcomeScreen() {
  const router = useRouter()

  return (
    <div className="w-full max-w-[480px] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <HHLabLogo size="lg" />
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Добро пожаловать в HHLab
        </h1>
        <p className="text-zinc-500 text-sm mb-7 leading-relaxed">
          Настройте профиль за 2 минуты — и AI начнёт искать вакансии и отправлять отклики за вас
        </p>

        {/* Features */}
        <div className="space-y-4 mb-7 text-left">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-lime-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(ROUTES.ONBOARDING)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-lime-500 text-zinc-950 hover:bg-lime-600 hover:text-white active:bg-lime-700 transition-all"
        >
          Настроить профиль
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
