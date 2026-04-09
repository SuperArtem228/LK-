'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Bookmark, EyeOff, Send, X, ChevronRight, MapPin, Briefcase } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { MatchBadge } from '@/components/shared/MatchBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatSalary } from '@/lib/utils/format'
import { fromNow } from '@/lib/utils/dates'
import type { Vacancy, VacancyCollection } from '@/lib/types'
import { toast } from 'sonner'

const COLLECTION_LABELS: Record<VacancyCollection | 'all', string> = {
  all: 'Все вакансии',
  best_today: 'Лучшие сегодня',
  quick_apply: 'Быстрый отклик',
  high_salary: 'Высокая зарплата',
  matches_experience: 'Подходит по опыту',
}

const FORMAT_LABELS: Record<string, string> = {
  all: 'Любой формат',
  remote: 'Удалённо',
  hybrid: 'Гибрид',
  office: 'В офисе',
}

export function JobsPage() {
  const scenario = useDemoStore((s) => s.scenario)
  const [collection, setCollection] = useState<VacancyCollection | 'all'>('all')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<Vacancy | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const vacancies = useMemo(() => {
    return scenario.vacancies.filter((v) => {
      if (hidden.has(v.id)) return false
      if (collection !== 'all' && !v.collections.includes(collection)) return false
      if (formatFilter !== 'all' && v.format !== formatFilter) return false
      if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.company.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => b.matchPercent - a.matchPercent)
  }, [scenario.vacancies, collection, formatFilter, search, hidden])

  function handleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    toast.success(saved.has(id) ? 'Удалено из избранного' : 'Добавлено в избранное')
  }

  function handleHide(id: string) {
    setHidden((prev) => new Set([...prev, id]))
    if (selectedJob?.id === id) setSelectedJob(null)
    toast.success('Вакансия скрыта')
  }

  function handleAddToQueue(vacancy: Vacancy) {
    toast.success(`«${vacancy.title}» добавлена в очередь откликов`)
  }

  const collections = ['all', 'best_today', 'quick_apply', 'high_salary', 'matches_experience'] as const

  return (
    <div>
      <PageHeader
        title="Вакансии"
        description={`${scenario.vacancies.length - hidden.size} подходящих вакансий`}
      />

      {/* Collections */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {collections.map((c) => (
          <button
            key={c}
            onClick={() => setCollection(c)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border',
              collection === c
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            )}
          >
            {COLLECTION_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Поиск по названию или компании..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="py-2.5 px-3.5 text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-700"
        >
          {Object.entries(FORMAT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Main layout */}
      <div className={cn('grid gap-5', selectedJob ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1')}>
        {/* Job list */}
        <div className={selectedJob ? 'lg:col-span-2' : 'lg:col-span-1'} data-tour-id="job-list">
          {vacancies.length === 0 ? (
            <EmptyState icon={Search} title="Вакансий не найдено" description="Попробуйте изменить фильтры" />
          ) : (
            <div className="space-y-3">
              {vacancies.map((vacancy) => (
                <JobCard
                  key={vacancy.id}
                  vacancy={vacancy}
                  isSelected={selectedJob?.id === vacancy.id}
                  isSaved={saved.has(vacancy.id)}
                  compact={!!selectedJob}
                  onSelect={() => setSelectedJob(vacancy)}
                  onSave={() => handleSave(vacancy.id)}
                  onHide={() => handleHide(vacancy.id)}
                  onAddToQueue={() => handleAddToQueue(vacancy)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Job detail */}
        {selectedJob && (
          <div className="lg:col-span-3 animate-fade-in">
            <div className="bg-white rounded-xl border border-zinc-100 p-6 sticky top-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{selectedJob.title}</h2>
                  <p className="text-sm text-indigo-600 font-medium mt-0.5">{selectedJob.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedJob.city}</span>
                    <span>·</span>
                    <span>{FORMAT_LABELS[selectedJob.format]}</span>
                    <span>·</span>
                    <span>{fromNow(selectedJob.publishedAt)}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1.5 rounded-lg hover:bg-zinc-100">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <MatchBadge percent={selectedJob.matchPercent} />
                <span className="text-sm font-semibold text-zinc-900">
                  {formatSalary(selectedJob.salary.min, selectedJob.salary.max)}
                </span>
              </div>

              {/* Match reasons */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Почему подходит</h3>
                <div className="space-y-1">
                  {selectedJob.matchReasons.map((reason) => (
                    <div key={reason} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing skills */}
              {selectedJob.missingSkills.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Чего не хватает</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.missingSkills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Описание</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedJob.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-lg">{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToQueue(selectedJob)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Добавить отклик
                </button>
                <button
                  onClick={() => handleSave(selectedJob.id)}
                  className={cn(
                    'p-2.5 rounded-lg border transition-all',
                    saved.has(selectedJob.id) ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', saved.has(selectedJob.id) && 'fill-current')} />
                </button>
                <button
                  onClick={() => handleHide(selectedJob.id)}
                  className="p-2.5 rounded-lg border border-zinc-200 text-zinc-500 hover:border-zinc-300 transition-all"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function JobCard({
  vacancy, isSelected, isSaved, compact, onSelect, onSave, onHide, onAddToQueue
}: {
  vacancy: Vacancy
  isSelected: boolean
  isSaved: boolean
  compact: boolean
  onSelect: () => void
  onSave: () => void
  onHide: () => void
  onAddToQueue: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white rounded-xl border transition-all cursor-pointer',
        isSelected ? 'border-indigo-300 shadow-sm' : 'border-zinc-100 hover:border-zinc-200'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{vacancy.title}</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{vacancy.company}</p>
          </div>
          <MatchBadge percent={vacancy.matchPercent} size="sm" />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatSalary(vacancy.salary.min, vacancy.salary.max)}</span>
          <span>·</span>
          <span>{FORMAT_LABELS[vacancy.format]}</span>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vacancy.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded">{tag}</span>
            ))}
          </div>
        )}

        {!compact && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-50">
            <button
              onClick={(e) => { e.stopPropagation(); onAddToQueue() }}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Send className="w-3 h-3" /> Откликнуться
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSave() }}
              className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', isSaved ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600')}
            >
              <Bookmark className={cn('w-3 h-3', isSaved && 'fill-current')} />
              {isSaved ? 'Сохранено' : 'Сохранить'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onHide() }}
              className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <EyeOff className="w-3 h-3" /> Скрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
