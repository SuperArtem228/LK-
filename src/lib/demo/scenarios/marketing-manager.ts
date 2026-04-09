import type { DemoScenario } from '@/lib/types'
import { daysAgo, daysFromNow, hoursAgo } from '@/lib/utils/dates'

export const marketingManagerScenario: DemoScenario = {
  id: 'marketing-manager',
  label: 'Marketing Manager',
  description: 'Кирилл, 31 год, Москва — переход из офлайн-маркетинга в digital',

  user: {
    id: 'user-mm',
    name: 'Кирилл Новиков',
    email: 'kirill.novikov@mail.ru',
    city: 'Москва',
    onboardingStep: 'complete',
    hhConnected: true,
    planId: 'trial',
    trialEndsAt: daysFromNow(12),
    trialDaysLeft: 12,
    searchGoal: 'Перейти в digital-маркетинг в IT-компанию или e-commerce',
    experienceYears: 5,
    preferredFormats: ['hybrid', 'office'],
  },

  hhConnection: {
    status: 'connected',
    lastSyncAt: hoursAgo(8),
    importedResumes: 1,
    importedVacancies: 213,
    email: 'kirill.novikov@mail.ru',
  },

  resumes: [
    {
      id: 'resume-orig-mm',
      version: 'original',
      title: 'Менеджер по маркетингу',
      summary: 'Маркетолог с 5-летним опытом в B2C-компаниях. Хорошо знаю офлайн-каналы, SEO базово.',
      experience: [
        {
          id: 'exp-mm-1',
          company: 'Ритейл Плюс',
          position: 'Маркетолог',
          period: 'Март 2020 — наст. время',
          description: 'Организация акций, работа с подрядчиками, ведение соцсетей.',
        },
      ],
      skills: ['SMM', 'SEO', 'Контент', 'Excel'],
      salaryMin: 110000,
      salaryMax: 150000,
      city: 'Москва',
      format: 'hybrid',
      score: 58,
    },
    {
      id: 'resume-improved-mm',
      version: 'improved',
      title: 'Marketing Manager | Performance & Growth',
      summary: 'Marketing Manager с 5 годами опыта. Запускал кампании с бюджетом до 5 млн ₽/мес., увеличил органический трафик на 120% за год. Специализируюсь на growth-стратегиях и переходе к data-driven маркетингу.',
      experience: [
        {
          id: 'exp-mm-1-imp',
          company: 'Ритейл Плюс',
          position: 'Senior Marketing Manager',
          period: 'Март 2020 — наст. время',
          description: 'Управлял маркетинговым бюджетом 5 млн ₽/мес. Запустил performance-каналы (Яндекс.Директ, VK Ads). Увеличил органический трафик на 120% через контент-стратегию. ROI кампаний вырос с 180% до 340%.',
        },
      ],
      skills: ['Performance Marketing', 'Яндекс.Директ', 'SEO', 'Google Analytics', 'SMM', 'A/B тесты', 'Excel'],
      salaryMin: 140000,
      salaryMax: 190000,
      city: 'Москва',
      format: 'hybrid',
      score: 82,
    },
  ],

  resumeRecommendations: [
    {
      id: 'rec-mm-1',
      section: 'title',
      title: 'Сфокусируйтесь на digital-специализации',
      text: 'IT-компании ищут performance/growth маркетологов. Скорректируйте заголовок.',
      impact: 'high',
      applied: false,
    },
    {
      id: 'rec-mm-2',
      section: 'summary',
      title: 'Добавьте бюджеты и ROI',
      text: 'Цифры бюджетов и ROI — главные маркеры уровня маркетолога. Добавьте конкретику.',
      impact: 'high',
      applied: false,
    },
    {
      id: 'rec-mm-3',
      section: 'skills',
      title: 'Добавьте digital-инструменты',
      text: 'Яндекс.Директ, Google Analytics, Яндекс.Метрика, CRM — обязательные навыки для IT.',
      impact: 'medium',
      applied: false,
    },
  ],

  vacancies: [
    {
      id: 'vac-mm-1',
      title: 'Marketing Manager (digital)',
      company: 'TechStartup Solutions',
      salary: { min: 150000, max: 200000, currency: '₽' },
      matchPercent: 87,
      format: 'hybrid',
      city: 'Москва',
      tags: ['Performance', 'SEO', 'Analytics'],
      collections: ['best_today', 'matches_experience'],
      description: 'Ищем маркетолога для развития digital-направления B2B SaaS-продукта. Управление performance-каналами, контент, аналитика.',
      matchReasons: ['Опыт 5+ лет', 'Performance знаком', 'Hybrid формат', 'Зарплата в вашем диапазоне'],
      missingSkills: ['HubSpot CRM'],
      publishedAt: daysAgo(1),
    },
    {
      id: 'vac-mm-2',
      title: 'Digital Marketing Lead',
      company: 'E-commerce Platform',
      salary: { min: 180000, max: 240000, currency: '₽' },
      matchPercent: 79,
      format: 'office',
      city: 'Москва',
      tags: ['Performance', 'Analytics', 'Team Lead'],
      collections: ['high_salary'],
      description: 'Lead роль в маркетинговой команде e-commerce. Управление командой 3 человека, бюджет 10 млн ₽/мес.',
      matchReasons: ['Опыт управления кампаниями', 'Отличная зарплата'],
      missingSkills: ['Команда управления'],
      publishedAt: daysAgo(2),
    },
  ],

  applications: [
    {
      id: 'app-mm-1',
      vacancyId: 'vac-mm-1',
      vacancyTitle: 'Marketing Manager (digital)',
      company: 'TechStartup Solutions',
      status: 'viewed',
      sentAt: daysAgo(3),
      coverLetter: 'Добрый день! Меня привлекает возможность применить опыт в performance-маркетинге для B2B SaaS.',
      source: 'auto',
      statusHistory: [
        { status: 'sent', at: daysAgo(3) },
        { status: 'viewed', at: daysAgo(1) },
      ],
    },
    {
      id: 'app-mm-2',
      vacancyId: 'vac-mm-2',
      vacancyTitle: 'Digital Marketing Lead',
      company: 'E-commerce Platform',
      status: 'planned',
      scheduledFor: daysFromNow(0),
      coverLetter: 'Здравствуйте! Готов взять на себя ответственность за digital-направление и развивать команду.',
      source: 'auto',
      statusHistory: [],
    },
  ],

  threads: [],

  interviews: [],

  notifications: [
    {
      id: 'notif-mm-1',
      type: 'application_viewed',
      title: 'Отклик просмотрен',
      body: 'TechStartup Solutions просмотрели ваш отклик',
      relatedEntityId: 'app-mm-1',
      relatedEntityType: 'application',
      createdAt: daysAgo(1),
      read: false,
    },
    {
      id: 'notif-mm-2',
      type: 'apply_sent',
      title: 'Отклик отправлен',
      body: 'AI отправил отклик в TechStartup Solutions на Marketing Manager',
      relatedEntityId: 'app-mm-1',
      relatedEntityType: 'application',
      createdAt: daysAgo(3),
      read: true,
    },
  ],

  eventSchedule: [
    {
      id: 'evt-mm-1',
      triggerType: 'timer',
      triggerAfterMs: 20000,
      eventType: 'recruiter_reply',
      payload: {
        threadId: 'thread-mm-new',
        company: 'TechStartup Solutions',
        recruiterName: 'Анна Белова',
        message: 'Кирилл, здравствуйте! Ваш опыт нас заинтересовал. Когда можно созвониться?',
      },
      fired: false,
    },
  ],
}
