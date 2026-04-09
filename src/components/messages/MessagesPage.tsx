'use client'

import { useState } from 'react'
import { Send, Sparkles, X } from 'lucide-react'
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
  'thread-pa-1': 'Добрый день! Буду рада созвониться в любое удобное для команды время. Когда вам удобно — завтра или послезавтра?',
}

export function MessagesPage() {
  const threads = useDemoStore((s) => s.threads)
  const addMessage = useDemoStore((s) => s.addMessage)
  const markRead = useNotificationsStore((s) => s.markRead)
  const notifications = useNotificationsStore((s) => s.notifications)

  const [selectedId, setSelectedId] = useState<string | null>(
    threads.find((t) => t.unreadCount > 0)?.id ?? threads[0]?.id ?? null
  )
  const [replyText, setReplyText] = useState('')
  const [showDraft, setShowDraft] = useState(true)
  const [sending, setSending] = useState(false)

  const selectedThread = threads.find((t) => t.id === selectedId)
  const aiDraft = selectedId ? AI_DRAFTS[selectedId] : null

  function handleSelect(thread: Thread) {
    setSelectedId(thread.id)
    setShowDraft(true)
    setReplyText('')
    // Mark notification read
    const related = notifications.find(
      (n) => n.relatedEntityId === thread.id && !n.read
    )
    if (related) markRead(related.id)
  }

  async function handleSend() {
    if (!selectedId || !replyText.trim()) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 600))
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

  return (
    <div>
      <PageHeader title="Сообщения" description="Переписка с рекрутерами" />

      {threads.length === 0 ? (
        <EmptyState
          title="Нет сообщений"
          description="Когда рекрутеры ответят на ваши отклики, переписка появится здесь"
        />
      ) : (
        <div className="flex gap-0 bg-white rounded-xl border border-zinc-100 overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
          {/* Thread list */}
          <div className="w-72 flex-shrink-0 border-r border-zinc-100 overflow-y-auto" data-tour-id="thread-list">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isSelected={selectedId === thread.id}
                onSelect={() => handleSelect(thread)}
              />
            ))}
          </div>

          {/* Message area */}
          {selectedThread ? (
            <div className="flex flex-col flex-1 min-w-0">
              {/* Thread header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {selectedThread.recruiterName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{selectedThread.recruiterName}</p>
                  <p className="text-xs text-zinc-500">{selectedThread.company} · {selectedThread.vacancyTitle}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {selectedThread.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} recruiterName={selectedThread.recruiterName} />
                ))}
              </div>

              {/* AI Draft */}
              {aiDraft && showDraft && !replyText && (
                <div className="mx-5 mb-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-indigo-700">AI-черновик ответа</span>
                    </div>
                    <button onClick={() => setShowDraft(false)} className="text-indigo-400 hover:text-indigo-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed mb-3">{aiDraft}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseDraft}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Использовать
                    </button>
                    <button
                      onClick={() => { setReplyText(''); setShowDraft(false) }}
                      className="px-3 py-1.5 border border-indigo-200 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-50 transition-all"
                    >
                      Написать своё
                    </button>
                  </div>
                </div>
              )}

              {/* Reply input */}
              <div className="flex items-end gap-3 px-5 pb-4 pt-2 border-t border-zinc-100 flex-shrink-0">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Написать ответ..."
                  rows={2}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className={cn(
                    'p-2.5 rounded-xl transition-all',
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
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
              Выберите диалог
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ThreadItem({ thread, isSelected, onSelect }: { thread: Thread; isSelected: boolean; onSelect: () => void }) {
  const lastMsg = thread.messages[thread.messages.length - 1]
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-zinc-50',
        isSelected ? 'bg-indigo-50' : 'hover:bg-zinc-50'
      )}
    >
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
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
        <p className="text-xs text-zinc-500 truncate">{thread.company}</p>
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
        'max-w-[75%] rounded-2xl px-4 py-2.5',
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
