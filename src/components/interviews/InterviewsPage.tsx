'use client'

import { useState } from 'react'
import { Calendar, Video, Phone, MapPin, Clock, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, daysUntil, fromNow } from '@/lib/utils/dates'
import { INTERVIEW_STAGE_LABELS } from '@/lib/constants'
import type { Interview, PrepChecklistItem } from '@/lib/types'
import { toast } from 'sonner'

const FORMAT_ICONS = {
  video: Video,
  phone: Phone,
  onsite: MapPin,
}

const FORMAT_LABELS = {
  video: 'Видеозвонок',
  phone: 'Телефонный звонок',
  onsite: 'Личная встреча',
}

const STATUS_STYLES = {
  upcoming: 'bg-lime-50 text-lime-700',
  completed: 'bg-green-50 text-green-700',
  rescheduled: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-500',
}

const STATUS_LABELS = {
  upcoming: 'Предстоит',
  completed: 'Завершено',
  rescheduled: 'Перенесено',
  cancelled: 'Отменено',
}

export function InterviewsPage() {
  const interviews = useDemoStore((s) => s.interviews)
  const [selectedId, setSelectedId] = useState<string | null>(
    interviews.find((i) => i.status === 'upcoming')?.id ?? interviews[0]?.id ?? null
  )
  const [activeTab, setActiveTab] = useState<'company' | 'questions' | 'checklist'>('company')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  const selected = interviews.find((i) => i.id === selectedId)
  const upcoming = interviews.filter((i) => i.status === 'upcoming')
  const past = interviews.filter((i) => i.status !== 'upcoming')

  function toggleCheck(id: string) {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success('Пункт отмечен!')
  }

  return (
    <div>
      <PageHeader title="Интервью" description={`${upcoming.length} предстоящих`} />

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Интервью не назначено"
          description="Как только рекрутеры пригласят вас на встречу, они появятся здесь"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Interview list */}
          <div className="lg:col-span-2 space-y-3">
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Предстоящие</p>
                <div className="space-y-2">
                  {upcoming.map((i) => (
                    <InterviewListCard
                      key={i.id}
                      interview={i}
                      isSelected={selectedId === i.id}
                      onSelect={() => setSelectedId(i.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 mt-4">Прошедшие</p>
                <div className="space-y-2">
                  {past.map((i) => (
                    <InterviewListCard
                      key={i.id}
                      interview={i}
                      isSelected={selectedId === i.id}
                      onSelect={() => setSelectedId(i.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prep package */}
          {selected && (
            <div className="lg:col-span-3 animate-fade-in" data-tour-id="prep-package">
              <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
                {/* Header */}
                <div className={cn(
                  'px-6 py-5',
                  selected.status === 'upcoming' ? 'bg-gradient-to-r from-lime-500 to-purple-600' : 'bg-zinc-50'
                )}>
                  <div className={cn('flex items-center gap-2 mb-3', selected.status === 'upcoming' ? 'text-lime-100' : 'text-zinc-500')}>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', selected.status === 'upcoming' ? 'bg-white/20 text-white' : STATUS_STYLES[selected.status])}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                    <span>·</span>
                    <span className="text-sm">{INTERVIEW_STAGE_LABELS[selected.stage]}</span>
                  </div>
                  <h2 className={cn('text-lg font-semibold', selected.status === 'upcoming' ? 'text-white' : 'text-zinc-900')}>
                    {selected.company}
                  </h2>
                  <p className={cn('text-sm mt-0.5', selected.status === 'upcoming' ? 'text-lime-100' : 'text-zinc-500')}>
                    {selected.vacancyTitle}
                  </p>
                  <div className={cn('flex items-center gap-4 mt-3 text-sm', selected.status === 'upcoming' ? 'text-lime-100' : 'text-zinc-500')}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(selected.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {(() => { const Icon = FORMAT_ICONS[selected.format]; return <Icon className="w-4 h-4" /> })()}
                      {FORMAT_LABELS[selected.format]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {selected.durationMinutes} мин
                    </span>
                  </div>
                  {selected.meetingLink && selected.status === 'upcoming' && (
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Открыть встречу
                    </a>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-100">
                  {(['company', 'questions', 'checklist'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'flex-1 py-3 text-sm font-medium transition-colors',
                        activeTab === tab ? 'text-lime-600 border-b-2 border-lime-600' : 'text-zinc-500 hover:text-zinc-700'
                      )}
                    >
                      {tab === 'company' ? 'О компании' : tab === 'questions' ? 'Вопросы' : 'Чек-лист'}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === 'company' && (
                    <div className="animate-fade-in space-y-4">
                      <p className="text-sm text-zinc-700 leading-relaxed">{selected.prepPackage.companyInfo}</p>
                      {selected.prepPackage.companyValues.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Ценности компании</h4>
                          <div className="flex flex-wrap gap-2">
                            {selected.prepPackage.companyValues.map((v) => (
                              <span key={v} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selected.prepPackage.tips.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Советы AI</h4>
                          <ul className="space-y-1.5">
                            {selected.prepPackage.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="animate-fade-in space-y-3">
                      {selected.prepPackage.likelyQuestions.map((q) => (
                        <details key={q.id} className="group rounded-lg border border-zinc-100 overflow-hidden">
                          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors list-none">
                            <span className="text-sm font-medium text-zinc-900 pr-4">{q.question}</span>
                            <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                          </summary>
                          <div className="px-4 pb-3 pt-1 bg-zinc-50 border-t border-zinc-100">
                            <p className="text-sm text-zinc-600 leading-relaxed">{q.hint}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  )}

                  {activeTab === 'checklist' && (
                    <div className="animate-fade-in space-y-2">
                      {selected.prepPackage.checklist.map((item) => {
                        const done = checklist[item.id] ?? item.done
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                              done ? 'border-green-200 bg-green-50' : 'border-zinc-100 hover:border-zinc-200'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                              done ? 'bg-green-500 border-green-500' : 'border-zinc-300'
                            )}>
                              {done && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn('text-sm', done ? 'text-green-700 line-through' : 'text-zinc-700')}>
                              {item.text}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InterviewListCard({ interview, isSelected, onSelect }: { interview: Interview; isSelected: boolean; onSelect: () => void }) {
  const daysLeft = interview.status === 'upcoming' ? daysUntil(interview.scheduledAt) : null
  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white rounded-xl border p-4 cursor-pointer transition-all',
        isSelected ? 'border-lime-300 shadow-sm' : 'border-zinc-100 hover:border-zinc-200'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{interview.company}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{INTERVIEW_STAGE_LABELS[interview.stage]}</p>
        </div>
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', STATUS_STYLES[interview.status])}>
          {STATUS_LABELS[interview.status]}
        </span>
      </div>
      <p className="text-xs text-zinc-600">{formatDateTime(interview.scheduledAt)}</p>
      {daysLeft !== null && daysLeft <= 2 && (
        <p className="text-xs font-semibold text-lime-600 mt-1">
          {daysLeft === 0 ? 'Сегодня!' : daysLeft === 1 ? 'Завтра' : `Через ${daysLeft} дня`}
        </p>
      )}
    </div>
  )
}
