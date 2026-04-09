export interface TourStep {
  id: string
  route: string
  targetId: string
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/dashboard',
    targetId: 'stats-grid',
    title: 'Главная панель управления',
    body: 'Здесь собрана вся ключевая статистика: сколько откликов отправлено, сколько ответов получено и предстоящие интервью.',
    position: 'bottom',
  },
  {
    id: 'ai-progress',
    route: '/dashboard',
    targetId: 'ai-progress',
    title: 'AI работает за вас',
    body: 'AI нашёл 247 вакансий, отфильтровал до 34 подходящих и поставил в очередь на отклик. Всё автоматически.',
    position: 'left',
  },
  {
    id: 'action-feed',
    route: '/dashboard',
    targetId: 'action-feed',
    title: 'Лента событий',
    body: 'Каждое действие AI фиксируется здесь в реальном времени: новый отклик, ответ рекрутера, найденная вакансия.',
    position: 'left',
  },
  {
    id: 'resume-score',
    route: '/profile',
    targetId: 'resume-score',
    title: 'Оценка резюме',
    body: 'AI проанализировал ваше резюме и дал оценку 65/100. После применения рекомендаций — 89/100.',
    position: 'bottom',
  },
  {
    id: 'ai-recommendations',
    route: '/profile',
    targetId: 'recommendations-list',
    title: 'Рекомендации AI',
    body: 'Конкретные правки с указанием раздела и ожидаемого влияния. Нажмите «Применить все» чтобы улучшить резюме одним кликом.',
    position: 'left',
  },
  {
    id: 'job-match',
    route: '/jobs',
    targetId: 'job-list',
    title: 'Подбор вакансий',
    body: 'AI отбирает вакансии по вашему профилю и показывает процент совпадения. Чем выше — тем лучше шанс ответа.',
    position: 'right',
  },
  {
    id: 'applications-queue',
    route: '/applications/queue',
    targetId: 'queued-list',
    title: 'Очередь автоотклика',
    body: 'Вакансии в очереди ждут отклика. AI уже написал персональное сопроводительное письмо для каждой.',
    position: 'bottom',
  },
  {
    id: 'cover-letter',
    route: '/applications/queue',
    targetId: 'cover-letter-preview',
    title: 'Персональное письмо',
    body: 'AI генерирует уникальное письмо под каждую вакансию — не шаблон, а персонализированный текст с учётом вашего опыта.',
    position: 'top',
  },
  {
    id: 'recruiter-message',
    route: '/messages',
    targetId: 'thread-list',
    title: 'Ответы рекрутеров',
    body: 'Рекрутеры уже ответили на некоторые отклики. AI подготовил черновик ответа для каждого диалога.',
    position: 'right',
  },
  {
    id: 'interview-prep',
    route: '/interviews',
    targetId: 'prep-package',
    title: 'Подготовка к интервью',
    body: 'AI собрал досье на компанию, вероятные вопросы и чек-лист подготовки. Всё в одном месте, за минуты.',
    position: 'left',
  },
  {
    id: 'notifications',
    route: '/notifications',
    targetId: 'notification-list',
    title: 'Центр уведомлений',
    body: 'Все важные события — в одном месте. Нажмите на уведомление чтобы перейти к деталям.',
    position: 'center',
  },
]
