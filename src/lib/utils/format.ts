export function formatSalary(min: number, max: number, currency = '₽'): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)} тыс.` : `${n}`
  return `${fmt(min)} – ${fmt(max)} ${currency}`
}

export function formatSalaryShort(max: number, currency = '₽'): string {
  if (max >= 1000) return `до ${Math.round(max / 1000)} тыс. ${currency}`
  return `до ${max} ${currency}`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatCount(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const rem = abs % 10
  if (abs > 10 && abs < 20) return `${n} ${forms[2]}`
  if (rem === 1) return `${n} ${forms[0]}`
  if (rem >= 2 && rem <= 4) return `${n} ${forms[1]}`
  return `${n} ${forms[2]}`
}

export function formatDaysLeft(days: number): string {
  return formatCount(days, ['день', 'дня', 'дней'])
}
