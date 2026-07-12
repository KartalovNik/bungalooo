// Импорт и експорт към CSV / JSON.
import { STATUSES, emptyBungalow } from '../config'

// Ред на колоните и български заглавия.
const COLUMNS = [
  ['name', 'Име'],
  ['town', 'Населено място'],
  ['area', 'Район/къмпинг/плаж'],
  ['price', 'Цена'],
  ['currency', 'Валута'],
  ['capacity', 'Капацитет'],
  ['suitableFor2A1C', '2 възрастни + 1 дете'],
  ['beachDistanceM', 'Разстояние до плажа (м)'],
  ['ownBathroom', 'Санитарен възел'],
  ['ac', 'Климатик'],
  ['parking', 'Паркинг'],
  ['kitchen', 'Кухня'],
  ['kidFriendly', 'За деца'],
  ['rating', 'Рейтинг'],
  ['ratingSource', 'Източник на рейтинг'],
  ['phone', 'Телефон'],
  ['description', 'Описание'],
  ['pros', 'Плюсове'],
  ['cons', 'Минуси'],
  ['notes', 'Бележки'],
  ['status', 'Статус'],
  ['favorite', 'Любимо'],
  ['lastCheckedDate', 'Последна проверка'],
  ['availability', 'Наличност'],
  ['nextAction', 'Следващо действие'],
  ['nextActionDate', 'Дата за следващо действие'],
  ['links', 'Линкове'],
  ['photos', 'Снимки'],
]

function triToText(v) {
  if (v === true) return 'Да'
  if (v === false) return 'Не'
  return 'За проверка'
}
function textToTri(s) {
  const t = String(s || '').trim().toLowerCase()
  if (['да', 'yes', 'true', '1', 'y'].includes(t)) return true
  if (['не', 'no', 'false', '0', 'n'].includes(t)) return false
  return null
}
function boolToText(v) {
  return v ? 'Да' : 'Не'
}
function textToBool(s) {
  const t = String(s || '').trim().toLowerCase()
  return ['да', 'yes', 'true', '1', 'y'].includes(t)
}
function statusToLabel(key) {
  return (STATUSES.find((s) => s.key === key) || STATUSES[0]).label
}
function labelToStatus(label) {
  const t = String(label || '').trim().toLowerCase()
  const found = STATUSES.find((s) => s.label.toLowerCase() === t || s.key === t)
  return found ? found.key : 'za_proverka'
}
function availToText(v) {
  if (v === 'yes') return 'Има свободни'
  if (v === 'no') return 'Няма свободни'
  return 'За проверка'
}
function textToAvail(s) {
  const t = String(s || '').trim().toLowerCase()
  if (t.includes('има')) return 'yes'
  if (t.includes('няма')) return 'no'
  return ''
}

const TRISTATE_FIELDS = ['suitableFor2A1C', 'ownBathroom', 'ac', 'parking', 'kitchen', 'kidFriendly']

function cellValue(b, field) {
  const v = b[field]
  if (TRISTATE_FIELDS.includes(field)) return triToText(v)
  if (field === 'favorite') return boolToText(v)
  if (field === 'status') return statusToLabel(v)
  if (field === 'availability') return availToText(v)
  if (field === 'links') return (b.links || []).map((l) => l.url).filter(Boolean).join(' | ')
  if (field === 'photos') return (b.photos || []).filter(Boolean).join(' | ')
  if (v === null || v === undefined) return ''
  return String(v)
}

// ── Сериализация към CSV ─────────────────────────────────────────
function escapeCell(value) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export function toCSV(list) {
  const header = COLUMNS.map(([, label]) => escapeCell(label)).join(',')
  const rows = list.map((b) =>
    COLUMNS.map(([field]) => escapeCell(cellValue(b, field))).join(',')
  )
  return [header, ...rows].join('\r\n')
}

// ── Разбор на CSV ────────────────────────────────────────────────
export function parseCSV(text) {
  const clean = text.replace(/^﻿/, '') // премахваме BOM
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c === '\r') {
      // пропускаме — краят на реда се обработва от \n
    } else field += c
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length) return []

  const headers = rows[0].map((h) => h.trim())
  // съпоставяме заглавия към полета
  const fieldByHeader = {}
  headers.forEach((h, idx) => {
    const col = COLUMNS.find(([, label]) => label.toLowerCase() === h.toLowerCase())
    if (col) fieldByHeader[idx] = col[0]
  })

  return rows.slice(1).filter((r) => r.some((c) => c && c.trim())).map((r) => {
    const obj = {}
    r.forEach((val, idx) => {
      const field = fieldByHeader[idx]
      if (field) obj[field] = val
    })
    return obj
  })
}

// Превръща разбран CSV ред в пълен обект бунгало.
export function csvRowToBungalow(row) {
  const b = emptyBungalow()
  const num = (v) => (v === '' || v == null ? null : Number(v))

  if (row.name != null) b.name = String(row.name).trim()
  if (row.town != null) b.town = String(row.town).trim()
  if (row.area != null) b.area = String(row.area).trim()
  if (row.price != null && row.price !== '') b.price = num(row.price)
  if (row.currency) b.currency = String(row.currency).trim()
  if (row.capacity != null && row.capacity !== '') b.capacity = num(row.capacity)
  if (row.beachDistanceM != null && row.beachDistanceM !== '') b.beachDistanceM = num(row.beachDistanceM)
  if (row.rating != null && row.rating !== '') b.rating = num(row.rating)
  if (row.ratingSource) b.ratingSource = String(row.ratingSource).trim()
  if (row.phone) b.phone = String(row.phone).trim()
  if (row.description) b.description = String(row.description)
  if (row.pros) b.pros = String(row.pros)
  if (row.cons) b.cons = String(row.cons)
  if (row.notes) b.notes = String(row.notes)
  if (row.lastCheckedDate) b.lastCheckedDate = String(row.lastCheckedDate).trim()
  if (row.nextAction) b.nextAction = String(row.nextAction)
  if (row.nextActionDate) b.nextActionDate = String(row.nextActionDate).trim()

  for (const f of TRISTATE_FIELDS) {
    if (row[f] != null && row[f] !== '') b[f] = textToTri(row[f])
  }
  if (row.favorite != null) b.favorite = textToBool(row.favorite)
  if (row.status != null && row.status !== '') b.status = labelToStatus(row.status)
  if (row.availability != null) b.availability = textToAvail(row.availability)

  if (row.links) {
    b.links = String(row.links)
      .split('|')
      .map((u) => u.trim())
      .filter(Boolean)
      .map((url) => ({ label: '', url }))
  }
  if (row.photos) {
    b.photos = String(row.photos)
      .split('|')
      .map((u) => u.trim())
      .filter(Boolean)
  }
  return b
}
