// ============================================================
// Core domain types for HHLab/HHLab demo personal account
// ============================================================

export type OnboardingStep = 'goal' | 'experience' | 'preferences' | 'complete'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  city: string
  onboardingStep: OnboardingStep
  hhConnected: boolean
  planId: 'trial' | 'pro' | 'pro_plus'
  trialEndsAt: string // ISO date
  trialDaysLeft: number
  searchGoal?: string
  experienceYears?: number
  preferredFormats?: string[]
}

// ─── HH Connection ──────────────────────────────────────────

export type HHConnectionStatus = 'connected' | 'syncing' | 'attention_required' | 'disconnected'

export interface HHConnection {
  status: HHConnectionStatus
  lastSyncAt?: string
  importedResumes: number
  importedVacancies: number
  email?: string
}

// ─── Resume ─────────────────────────────────────────────────

export interface ResumeExperience {
  id: string
  company: string
  position: string
  period: string
  description: string
}

export interface Resume {
  id: string
  version: 'original' | 'improved'
  title: string
  summary: string
  experience: ResumeExperience[]
  skills: string[]
  salaryMin: number
  salaryMax: number
  city: string
  format: 'remote' | 'office' | 'hybrid'
  score: number
}

export interface AIResumeRecommendation {
  id: string
  section: 'summary' | 'experience' | 'skills' | 'title'
  title: string
  text: string
  impact: 'high' | 'medium' | 'low'
  applied: boolean
}

// ─── Vacancies ──────────────────────────────────────────────

export type VacancyCollection = 'best_today' | 'quick_apply' | 'high_salary' | 'matches_experience'
export type WorkFormat = 'remote' | 'office' | 'hybrid'

export interface VacancySalary {
  min: number
  max: number
  currency: string
}

export interface Vacancy {
  id: string
  title: string
  company: string
  companyLogo?: string
  salary: VacancySalary
  matchPercent: number
  format: WorkFormat
  city: string
  tags: string[]
  collections: VacancyCollection[]
  description: string
  matchReasons: string[]
  missingSkills: string[]
  publishedAt: string
  isSaved?: boolean
  isHidden?: boolean
}

// ─── Applications ────────────────────────────────────────────

export type ApplicationStatus =
  | 'planned'
  | 'generating'
  | 'sent'
  | 'viewed'
  | 'replied'
  | 'interview'
  | 'test_task'
  | 'offer'
  | 'rejected'

export interface ApplicationStatusHistory {
  status: ApplicationStatus
  at: string
}

export interface Application {
  id: string
  vacancyId: string
  vacancyTitle: string
  company: string
  companyLogo?: string
  status: ApplicationStatus
  sentAt?: string
  scheduledFor?: string
  coverLetter: string
  source: 'auto' | 'manual'
  statusHistory: ApplicationStatusHistory[]
  skipReason?: string
}

// ─── Messages ────────────────────────────────────────────────

export interface Message {
  id: string
  threadId: string
  from: 'user' | 'recruiter'
  text: string
  sentAt: string
  read: boolean
}

export interface Thread {
  id: string
  vacancyId: string
  vacancyTitle: string
  company: string
  recruiterName: string
  recruiterAvatar?: string
  messages: Message[]
  pinned: boolean
  unreadCount: number
  lastMessageAt: string
}

// ─── Interviews ──────────────────────────────────────────────

export type InterviewStage = 'hr' | 'hiring_manager' | 'final' | 'test_review'
export type InterviewStatus = 'upcoming' | 'completed' | 'rescheduled' | 'cancelled'
export type InterviewFormat = 'video' | 'phone' | 'onsite'

export interface PrepQuestion {
  id: string
  question: string
  hint: string
}

export interface PrepChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface PrepPackage {
  companyInfo: string
  companyValues: string[]
  likelyQuestions: PrepQuestion[]
  checklist: PrepChecklistItem[]
  tips: string[]
}

export interface Interview {
  id: string
  vacancyId: string
  vacancyTitle: string
  company: string
  companyLogo?: string
  stage: InterviewStage
  scheduledAt: string
  durationMinutes: number
  format: InterviewFormat
  meetingLink?: string
  status: InterviewStatus
  interviewers?: string[]
  prepPackage: PrepPackage
}

// ─── Notifications ───────────────────────────────────────────

export type NotificationType =
  | 'vacancy_found'
  | 'apply_sent'
  | 'recruiter_reply'
  | 'interview_scheduled'
  | 'resume_updated'
  | 'trial_expiring'
  | 'hh_connected'
  | 'application_viewed'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  relatedEntityId?: string
  relatedEntityType?: 'vacancy' | 'application' | 'thread' | 'interview'
  createdAt: string
  read: boolean
}

// ─── Demo Engine ─────────────────────────────────────────────

export type TriggerAction =
  | 'resume_improved'
  | 'hh_connected'
  | 'dashboard_viewed'
  | 'jobs_viewed'
  | 'application_sent'

export interface DemoEvent {
  id: string
  triggerType: 'timer' | 'action'
  triggerAfterMs?: number
  triggerOnAction?: TriggerAction
  eventType: NotificationType | 'application_status_change' | 'new_message' | 'new_interview'
  payload: Record<string, unknown>
  fired: boolean
}

export type ScenarioId = 'junior-frontend' | 'product-analyst' | 'marketing-manager'
export type EngineState = 'idle' | 'running' | 'paused' | 'quiet'

export interface DemoScenario {
  id: ScenarioId
  label: string
  description: string
  user: User
  hhConnection: HHConnection
  resumes: Resume[]
  resumeRecommendations: AIResumeRecommendation[]
  vacancies: Vacancy[]
  applications: Application[]
  threads: Thread[]
  interviews: Interview[]
  notifications: Notification[]
  eventSchedule: DemoEvent[]
}

// ─── Dashboard ───────────────────────────────────────────────

export type DashboardPeriod = 'today' | '7d' | '30d' | 'all'

export interface DashboardStats {
  applicationsSent: number
  repliesReceived: number
  interviewsScheduled: number
  conversionRate: number
  vacanciesFound: number
  vacanciesFiltered: number
  queuedApplications: number
}
