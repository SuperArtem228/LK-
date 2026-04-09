export const APP_NAME = 'Sofi'
export const APP_TAGLINE = 'AI-помощник в поиске работы'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  WELCOME: '/welcome',
  ONBOARDING: '/onboarding',
  HH_CONNECT: '/hh-connect',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  JOBS: '/jobs',
  APPLICATIONS_QUEUE: '/applications/queue',
  APPLICATIONS_HISTORY: '/applications/history',
  MESSAGES: '/messages',
  INTERVIEWS: '/interviews',
  NOTIFICATIONS: '/notifications',
  SUBSCRIPTION: '/subscription',
} as const

export const STATUS_LABELS: Record<string, string> = {
  planned: 'В очереди',
  generating: 'Генерация',
  sent: 'Отправлен',
  viewed: 'Просмотрен',
  replied: 'Ответили',
  interview: 'Интервью',
  test_task: 'Тест. задание',
  offer: 'Оффер',
  rejected: 'Отказ',
}

export const INTERVIEW_STAGE_LABELS: Record<string, string> = {
  hr: 'HR-интервью',
  hiring_manager: 'С нанимающим менеджером',
  final: 'Финальное',
  test_review: 'Обзор тест. задания',
}

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  vacancy_found: 'Найдена вакансия',
  apply_sent: 'Отклик отправлен',
  recruiter_reply: 'Ответ рекрутера',
  interview_scheduled: 'Назначено интервью',
  resume_updated: 'Резюме обновлено',
  trial_expiring: 'Пробный период заканчивается',
  hh_connected: 'HH подключён',
  application_viewed: 'Отклик просмотрен',
}

export const DAILY_APPLY_LIMIT = 20
export const TRIAL_DAYS = 14
