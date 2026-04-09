import { formatDistanceToNow, format, differenceInDays, addDays, subDays, subHours, subMinutes } from 'date-fns'
import { ru } from 'date-fns/locale'

export function fromNow(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru })
}

export function formatDate(date: string | Date, pattern = 'd MMM yyyy'): string {
  return format(new Date(date), pattern, { locale: ru })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'd MMM, HH:mm', { locale: ru })
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: ru })
}

export function daysFromNow(n: number): string {
  return addDays(new Date(), n).toISOString()
}

export function daysAgo(n: number): string {
  return subDays(new Date(), n).toISOString()
}

export function hoursAgo(n: number): string {
  return subHours(new Date(), n).toISOString()
}

export function minutesAgo(n: number): string {
  return subMinutes(new Date(), n).toISOString()
}

export function daysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date())
}
