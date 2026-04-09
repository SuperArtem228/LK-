'use client'

import { useState } from 'react'
import { Check, ChevronRight, Sparkles, ArrowUpRight, AlertCircle } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils/cn'
import { formatSalary } from '@/lib/utils/format'
import { triggerAction } from '@/lib/demo/engine'
import { toast } from 'sonner'

const IMPACT_COLORS = {
  high: 'border-l-red-400 bg-red-50',
  medium: 'border-l-amber-400 bg-amber-50',
  low: 'border-l-zinc-300 bg-zinc-50',
}

const IMPACT_LABELS = {
  high: 'Высокое влияние',
  medium: 'Среднее влияние',
  low: 'Низкое влияние',
}

export function ProfilePage() {
  const scenario = useDemoStore((s) => s.scenario)
  const updateResumeApplied = useDemoStore((s) => s.updateResumeApplied)
  const [showVersion, setShowVersion] = useState<'original' | 'improved'>('original')
  const [applyingAll, setApplyingAll] = useState(false)

  const original = scenario.resumes.find((r) => r.version === 'original')!
  const improved = scenario.resumes.find((r) => r.version === 'improved')!
  const current = showVersion === 'original' ? original : improved
  const recs = scenario.resumeRecommendations

  const unapplied = recs.filter((r) => !r.applied)
  const applied = recs.filter((r) => r.applied)

  async function handleApplyAll() {
    setApplyingAll(true)
    await new Promise((r) => setTimeout(r, 1500))
    unapplied.forEach((r) => updateResumeApplied(r.id))
    setShowVersion('improved')
    triggerAction('resume_improved')
    toast.success(`Резюме улучшено! Оценка выросла с ${original.score} до ${improved.score}.`)
    setApplyingAll(false)
  }

  function handleApplySingle(id: string) {
    updateResumeApplied(id)
    toast.success('Рекомендация применена')
  }

  return (
    <div>
      <PageHeader
        title="Профиль и резюме"
        description="Управляйте резюме и применяйте AI-рекомендации"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Resume viewer */}
        <div className="lg:col-span-2">
          {/* Version toggle */}
          <div className="flex items-center gap-1 mb-4 p-1 bg-zinc-100 rounded-lg w-fit">
            <button
              onClick={() => setShowVersion('original')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                showVersion === 'original' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              Исходное
            </button>
            <button
              onClick={() => setShowVersion('improved')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                showVersion === 'improved' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              AI-улучшенное
            </button>
          </div>

          <div className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{current.title}</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{current.city} · {current.format === 'remote' ? 'Удалённо' : current.format === 'hybrid' ? 'Гибрид' : 'В офисе'}</p>
              </div>
              {/* Score */}
              <div className={cn(
                'flex flex-col items-center px-4 py-2 rounded-xl',
                current.version === 'improved' ? 'bg-green-50' : 'bg-zinc-100'
              )}>
                <span className={cn('text-2xl font-bold tabular-nums', current.version === 'improved' ? 'text-green-700' : 'text-zinc-700')}>
                  {current.score}
                </span>
                <span className="text-xs text-zinc-500">/100</span>
                {current.version === 'improved' && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +{improved.score - original.score}
                  </span>
                )}
              </div>
            </div>

            {/* Salary */}
            <div>
              <span className="text-sm text-zinc-500">Ожидания: </span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatSalary(current.salaryMin, current.salaryMax)}
              </span>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">О себе</h3>
              <p className="text-sm text-zinc-700 leading-relaxed">{current.summary}</p>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Опыт работы</h3>
              <div className="space-y-4">
                {current.experience.map((exp) => (
                  <div key={exp.id} className="pl-3 border-l-2 border-indigo-100">
                    <p className="text-sm font-semibold text-zinc-900">{exp.position}</p>
                    <p className="text-sm text-indigo-600">{exp.company}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{exp.period}</p>
                    <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Навыки</h3>
              <div className="flex flex-wrap gap-2">
                {current.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-lg font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations sidebar */}
        <div className="space-y-4">
          {/* Score comparison */}
          <div className="bg-white rounded-xl border border-zinc-100 p-5" data-tour-id="resume-score">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI-анализ резюме
            </h3>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 text-center p-3 rounded-lg bg-zinc-50">
                <p className="text-2xl font-bold text-zinc-500 tabular-nums">{original.score}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Сейчас</p>
              </div>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-600 tabular-nums">{improved.score}</p>
                <p className="text-xs text-green-500 mt-0.5">После AI</p>
              </div>
            </div>
            {unapplied.length > 0 && (
              <button
                onClick={handleApplyAll}
                disabled={applyingAll}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                  applyingAll
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                )}
              >
                {applyingAll ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Применяем...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Применить все рекомендации
                  </>
                )}
              </button>
            )}
            {unapplied.length === 0 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2.5">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Все рекомендации применены</span>
              </div>
            )}
          </div>

          {/* Recommendations list */}
          {unapplied.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden" data-tour-id="recommendations-list">
              <div className="px-5 py-4 border-b border-zinc-50">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Рекомендации AI ({unapplied.length})
                </h3>
              </div>
              <div className="divide-y divide-zinc-50">
                {unapplied.map((rec) => (
                  <div key={rec.id} className={cn('p-4 border-l-4', IMPACT_COLORS[rec.impact])}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-900">{rec.title}</p>
                      <span className="text-xs text-zinc-400 flex-shrink-0">{IMPACT_LABELS[rec.impact]}</span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed mb-2">{rec.text}</p>
                    <button
                      onClick={() => handleApplySingle(rec.id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Применить →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {applied.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50">
                <h3 className="text-sm font-semibold text-zinc-500">Применено ({applied.length})</h3>
              </div>
              <div className="divide-y divide-zinc-50">
                {applied.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-zinc-600">{rec.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
