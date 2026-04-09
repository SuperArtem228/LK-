'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { MatchBadge } from '@/components/shared/MatchBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatSalary } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

export function JobDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const vacancy = useDemoStore((s) => s.scenario.vacancies.find((v) => v.id === id))

  if (!vacancy) {
    return <EmptyState title="Вакансия не найдена" description="Вернитесь к списку вакансий" />
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push(ROUTES.JOBS)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к вакансиям
      </button>

      <div className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{vacancy.title}</h1>
          <p className="text-sm text-indigo-600 font-medium mt-1">{vacancy.company}</p>
          <div className="flex items-center gap-3 mt-2">
            <MatchBadge percent={vacancy.matchPercent} />
            <span className="text-sm font-semibold text-zinc-900">{formatSalary(vacancy.salary.min, vacancy.salary.max)}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Описание</h3>
          <p className="text-sm text-zinc-700 leading-relaxed">{vacancy.description}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Почему подходит</h3>
          <ul className="space-y-1">
            {vacancy.matchReasons.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => { toast.success('Добавлено в очередь откликов'); router.push(ROUTES.APPLICATIONS_QUEUE) }}
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          Добавить в очередь откликов
        </button>
      </div>
    </div>
  )
}
