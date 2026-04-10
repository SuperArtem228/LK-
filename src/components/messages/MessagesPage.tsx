'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, X, ArrowLeft, Phone, Video } from 'lucide-react'
import { useDemoStore } from '@/store/demo.store'
import { useNotificationsStore } from '@/store/notifications.store'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatTime, fromNow } from '@/lib/utils/dates'
import type { Thread, Message } from '@/lib/types'
import { toast } from 'sonner'

const AI_DRAFTS: Record<string, string> = {
  'thread-1': 'Добрый день, Мария! Большое спасибо за напоминание. Жду встречи завтра в 14:00, всё готово. Хорошего вечера!',
  'thread-2': 'Добрый день, Игорь! Конечно, расскажу подробнее. Последний проект был SPA на React с TypeScript — реализовал компонентную библиотеку и интеграцию с REST API. Готов обсудить детали на звонке!',
  'thread-3': 'Добрый день! Спасибо за обратную связь. Буду рад узнать, чего именно не хватило, чтобы учесть это в будущем.',
  'thread-4': 'Добрый день! Конечно, готов созвониться. Когда вам удобно — завтра или послезавтра?',
  'thread-5': 'Добрый день, Елена! Да, прошёл курс по алгоритмам на Яндекс.Практикуме. Готов пройти техническое задание.',
  'thread-6': 'Добрый день! Да, удалённый формат мне подходит полностью. Рассмотрю с удовольствием.',
  'thread-7': 'Добрый день, Антон! Спасибо. Жду оффер, буду рад изучить детали.',
  'thread-8': 'Добрый день! Конечно, могу прислать ссылки на GitHub-репозитории. Какой проект интересует в первую очередь?',
}

export function MessagesPage() {
  const threads = useDemoStore((s) => s.threads)
  const addMessage = useDemoStore((s) => s.addMessage)
  const markRead = useNotificationsStore((s) => s.markRead)
  const notifications = useNotificationsStore((s) => s.notifications)

  const firstUnread = threads.find((t) => t.unreadCount > 0)?.id ?? threads[0]?.id ?? null

  // On mobile: null = thread list, string = open thread
  // On desktop: always show both
  const [selectedId, setSelectedId] = useState<string | null>(firstUnread)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [replyText, setReplyText] = useState('')
  const [showDraft, setShowDraft] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedThread = threads.find((t) => t.id === selectedId)
  const aiDraft = selectedId ? AI_DRAFTS[selectedId] : null

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedThread?.messages.length])

  function handleSelect(thread: Thread) {
    setSelectedId(thread.id)
    setMobileView('chat')
    setShowDraft(true)
    setReplyText('')
    const related = notifications.find((n) => n.relatedEntityId === thread.id && !n.read)
    if (related) markRead(related.id)
  }

  function handleBack() {
    setMobileView('list')
  }

  async function handleSend() {
    if (!selectedId || !replyText.trim()) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 500))
    addMessage(selectedId, {
      id: `msg-user-${Date.now()}`,
      threadId: selectedId,
      from: 'user',
      text: replyText.trim(),
      sentAt: new Date().toISOString(),
      read: true,
    })
    setReplyText('')
    setSending(false)
    toast.success('Сообщение отправлено')
  }

  function handleUseDraft() {
    if (!aiDraft) return
    setReplyText(aiDraft)
    setShowDraft(false)
  }

  if (threads.length === 0) {
    return (
      <div>
        <PageHeader title="Сообщения" description="Переписка с рекрутерами" />
        <EmptyState
          title="Нет сообщений"
          description="Когда рекрутеры ответят на ваши отклики, переписка появится здесь"
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-130px)] md:h-[calc(100vh-120px)] flex flex-col">
      {/* Mobile header — only show on list view */}
      <div className="md:hidden">
        {mobileView === 'list' && (
          <PageHeader
            title="Сообщения"
            description={`${threads.filter(t => t.unreadCount > 0).length} непрочитанных`}
          />
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden md:block">
        <PageHeader title="Сообщения" description="Переписка с рекрутерами" />
      </div>

      <div className="flex flex-1 min-h-0 bg-white rounded-xl border border-zinc-100 overflow-hidden">

        {/* Thread list — always visible on desktop, hidden on mobile when in chat */}
        <div
          className={cn(
            'flex-shrink-0 border-r border-zinc-100 overflow-y-auto',
            'md:w-72 md:block',
            mobileView === 'list' ? 'w-full block' : 'hidden'
          )}
          data-tour-id="thread-list"
        >
          {threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isSelected={selectedId === thread.id}
              onSelect={() => handleSelect(thread)}
            />
          ))}
        </div>

        {/* Chat panel — always visible on desktop, shown on mobile when thread selected */}
        <div
          className={cn(
            'flex flex-col flex-1 min-w-0',
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          )}
        >
          {selectedThread ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 flex-shrink-0">
                {/* Back button — mobile only */}
                <button
                  onClick={handleBack}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-zinc-100 text-zinc-500 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {selectedThread.recruiterName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{selectedThread.recruiterName}</p>
                  <p className="text-xs text-zinc-500 truncate">{selectedThread.company}</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-zinc-300">
                  <Phone className="w-4 h-4" />
                  <Video className="w-4 h-4" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {/* Vacancy context pill */}
                <div className="flex justify-center">
                  <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-full px-3 py-1">
                    {selectedThread.vacancyTitle}
                  </span>
                </div>

                {selectedThread.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} recruiterName={selectedThread.recruiterName} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Draft */}
              {aiDraft && showDraft && !replyText && (
                <div className="mx-4 mb-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 animate-fade-in flex-shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-indigo-700">AI подготовил ответ</span>
                    </div>
                    <button onClick={() => setShowDraft(false)} className="text-indigo-300 hover:text-indigo-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed mb-2.5 line-clamp-2">{aiDraft}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseDraft}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Использовать
                    </button>
                    <button
                      onClick={() => setShowDraft(false)}
                      className="px-3 py-1.5 border border-indigo-200 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-50 transition-all"
                    >
                      Написать своё
                    </button>
                  </div>
                </div>
              )}

              {/* Reply input */}
              <div className="flex items-end gap-2 px-4 pb-4 pt-2 border-t border-zinc-100 flex-shrink-0">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Написать ответ..."
                  rows={2}
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className={cn(
                    'p-2.5 rounded-xl transition-all flex-shrink-0',
                    replyText.trim() && !sending
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                  )}
                >
                  {sending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
              Выберите диалог
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ThreadItem({ thread, isSelected, onSelect }: { thread: Thread; isSelected: boolean; onSelect: () => void }) {
  const lastMsg = thread.messages[thread.messages.length - 1]
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-zinc-50 active:bg-zinc-100',
        isSelected ? 'bg-indigo-50' : 'hover:bg-zinc-50'
      )}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {thread.recruiterName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        {thread.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={cn('text-sm truncate', thread.unreadCount > 0 ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700')}>
            {thread.recruiterName}
          </p>
          <span className="text-xs text-zinc-400 flex-shrink-0">{fromNow(thread.lastMessageAt)}</span>
        </div>
        <p className="text-xs text-zinc-500 truncate font-medium">{thread.company}</p>
        {lastMsg && (
          <p className={cn('text-xs mt-0.5 truncate', thread.unreadCount > 0 ? 'text-zinc-700' : 'text-zinc-400')}>
            {lastMsg.from === 'user' ? 'Вы: ' : ''}{lastMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message, recruiterName }: { message: Message; recruiterName: string }) {
  const isUser = message.from === 'user'
  return (
    <div className={cn('flex gap-2.5 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-1">
          {recruiterName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
      )}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2.5',
        isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
      )}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={cn('text-[10px] mt-1', isUser ? 'text-indigo-200 text-right' : 'text-zinc-400')}>
          {formatTime(message.sentAt)}
        </p>
      </div>
    </div>
  )
}
