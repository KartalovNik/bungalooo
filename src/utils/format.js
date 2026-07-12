// Форматиране на стойности за показване (на български).
import { PLACEHOLDER_LABEL } from '../config'

export function formatPrice(price, currency) {
  if (price === null || price === undefined || price === '') return PLACEHOLDER_LABEL
  const num = Number(price)
  if (Number.isNaN(num)) return PLACEHOLDER_LABEL
  return `${num.toLocaleString('bg-BG')} ${currency || ''}`.trim()
}

export function formatDistance(m) {
  if (m === null || m === undefined || m === '') return PLACEHOLDER_LABEL
  const num = Number(m)
  if (Number.isNaN(num)) return PLACEHOLDER_LABEL
  if (num >= 1000) return `${(num / 1000).toLocaleString('bg-BG')} км`
  return `${num} м`
}

export function formatRating(r) {
  if (r === null || r === undefined || r === '') return PLACEHOLDER_LABEL
  const num = Number(r)
  if (Number.isNaN(num)) return PLACEHOLDER_LABEL
  return num.toLocaleString('bg-BG')
}

export function formatCapacity(c) {
  if (c === null || c === undefined || c === '') return PLACEHOLDER_LABEL
  return `${c} души`
}

// Дата и час от timestamp (ms) → „12.07.2026, 14:30"
const dtFmt = new Intl.DateTimeFormat('bg-BG', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
export function formatDateTime(ms) {
  if (!ms) return ''
  try {
    return dtFmt.format(new Date(ms))
  } catch {
    return ''
  }
}

// Дата (ISO „YYYY-MM-DD") → „12.07.2026"
export function formatDay(iso) {
  if (!iso) return ''
  const parts = String(iso).split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${d}.${m}.${y}`
}

// Относително време: „преди 5 мин", „преди 2 ч", „вчера"…
export function relativeTime(ms) {
  if (!ms) return ''
  const diff = Date.now() - ms
  const sec = Math.round(diff / 1000)
  if (sec < 60) return 'току-що'
  const min = Math.round(sec / 60)
  if (min < 60) return `преди ${min} мин`
  const hrs = Math.round(min / 60)
  if (hrs < 24) return `преди ${hrs} ч`
  const days = Math.round(hrs / 24)
  if (days === 1) return 'вчера'
  if (days < 30) return `преди ${days} дни`
  return formatDay(new Date(ms).toISOString().slice(0, 10))
}

export function initials(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

// Дали ISO дата е в миналото (спрямо днес).
export function isOverdue(iso) {
  if (!iso) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return false
  return d < today
}

export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}
