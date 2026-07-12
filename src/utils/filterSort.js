// Търсене, филтриране и сортиране на списъка с бунгала.
import { STATUSES } from '../config'

export const DEFAULT_FILTERS = {
  towns: [],
  areas: [],
  statuses: [],
  priceMin: '',
  priceMax: '',
  maxBeachDistance: '',
  minCapacity: '',
  minRating: '',
  favorite: false,
  ownBathroom: false,
  ac: false,
  parking: false,
  kitchen: false,
  kidFriendly: false,
  football: false,
  availableOnly: false,
  verifiedOnly: false,
  withNotes: false,
  withNextAction: false,
  showArchived: false,
}

export function countActiveFilters(f) {
  let n = 0
  n += f.towns.length ? 1 : 0
  n += f.areas.length ? 1 : 0
  n += f.statuses.length ? 1 : 0
  n += f.priceMin !== '' ? 1 : 0
  n += f.priceMax !== '' ? 1 : 0
  n += f.maxBeachDistance !== '' ? 1 : 0
  n += f.minCapacity !== '' ? 1 : 0
  n += f.minRating !== '' ? 1 : 0
  for (const k of [
    'favorite', 'ownBathroom', 'ac', 'parking', 'kitchen', 'kidFriendly', 'football',
    'availableOnly', 'verifiedOnly', 'withNotes', 'withNextAction',
  ]) {
    if (f[k]) n++
  }
  return n
}

function norm(s) {
  return (s || '').toString().toLowerCase()
}

export function matchesSearch(b, query) {
  const q = norm(query).trim()
  if (!q) return true
  const haystack = norm(
    [b.name, b.town, b.area, b.notes, b.description, b.nextAction, b.ratingSource].join(' ')
  )
  return q.split(/\s+/).every((token) => haystack.includes(token))
}

export function matchesFilters(b, f) {
  if (!f.showArchived && b.archived) return false
  if (f.showArchived && !b.archived) return false

  if (f.towns.length && !f.towns.includes(b.town || '')) return false
  if (f.areas.length && !f.areas.includes(b.area || '')) return false
  if (f.statuses.length && !f.statuses.includes(b.status)) return false

  if (f.priceMin !== '' && (b.price == null || Number(b.price) < Number(f.priceMin))) return false
  if (f.priceMax !== '' && (b.price == null || Number(b.price) > Number(f.priceMax))) return false

  if (f.maxBeachDistance !== '') {
    if (b.beachDistanceM == null || Number(b.beachDistanceM) > Number(f.maxBeachDistance)) return false
  }
  if (f.minCapacity !== '') {
    if (b.capacity == null || Number(b.capacity) < Number(f.minCapacity)) return false
  }
  if (f.minRating !== '') {
    if (b.rating == null || Number(b.rating) < Number(f.minRating)) return false
  }

  if (f.favorite && !b.favorite) return false
  if (f.ownBathroom && b.ownBathroom !== true) return false
  if (f.ac && b.ac !== true) return false
  if (f.parking && b.parking !== true) return false
  if (f.kitchen && b.kitchen !== true) return false
  if (f.kidFriendly && b.kidFriendly !== true) return false
  if (f.football && b.football !== true) return false
  if (f.availableOnly && b.availability !== 'yes') return false
  if (f.verifiedOnly && !b.lastCheckedDate) return false
  if (f.withNotes && !(b.notes && b.notes.trim())) return false
  if (f.withNextAction && !(b.nextAction && b.nextAction.trim())) return false

  return true
}

export function filterList(list, query, filters) {
  return list.filter((b) => matchesFilters(b, filters) && matchesSearch(b, query))
}

// ── Сортиране ────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { key: 'recommended', label: 'Препоръчани' },
  { key: 'priceAsc', label: 'Цена: ниска → висока' },
  { key: 'priceDesc', label: 'Цена: висока → ниска' },
  { key: 'beach', label: 'Най-близо до плажа' },
  { key: 'ratingDesc', label: 'Най-висок рейтинг' },
  { key: 'town', label: 'Населено място' },
  { key: 'status', label: 'Статус' },
  { key: 'favorites', label: 'Любими' },
  { key: 'newest', label: 'Последно добавени' },
  { key: 'edited', label: 'Последно редактирани' },
  { key: 'nextAction', label: 'Дата на следващо действие' },
]

const statusOrder = Object.fromEntries(
  ['da', 'rezervirano', 'mozhe_bi', 'svarzahme', 'chakame', 'za_proverka', 'nyama_mesta', 'nad_budjet', 'ne'].map(
    (k, i) => [k, i]
  )
)

// По-малко число = по-напред. „Липсва" отива най-отзад.
function nOr(v, big = Number.POSITIVE_INFINITY) {
  return v == null || v === '' ? big : Number(v)
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function recommendedScore(b) {
  // По-нисък резултат = по-препоръчано.
  let score = 0
  if (!b.favorite) score += 1000
  score += (statusOrder[b.status] ?? 50) * 10
  score += b.rating != null ? 5 - Math.min(5, Number(b.rating)) : 3
  return score
}

export function sortList(list, sortKey) {
  const arr = [...list]
  switch (sortKey) {
    case 'priceAsc':
      arr.sort((a, b) => cmp(nOr(a.price), nOr(b.price)) || cmp(a.name, b.name))
      break
    case 'priceDesc':
      arr.sort((a, b) => cmp(nOr(b.price, -1), nOr(a.price, -1)) || cmp(a.name, b.name))
      break
    case 'beach':
      arr.sort((a, b) => cmp(nOr(a.beachDistanceM), nOr(b.beachDistanceM)) || cmp(a.name, b.name))
      break
    case 'ratingDesc':
      arr.sort((a, b) => cmp(nOr(b.rating, -1), nOr(a.rating, -1)) || cmp(a.name, b.name))
      break
    case 'town':
      arr.sort((a, b) => cmp(norm(a.town), norm(b.town)) || cmp(a.name, b.name))
      break
    case 'status':
      arr.sort(
        (a, b) => cmp(statusOrder[a.status] ?? 99, statusOrder[b.status] ?? 99) || cmp(a.name, b.name)
      )
      break
    case 'favorites':
      arr.sort((a, b) => cmp(b.favorite ? 1 : 0, a.favorite ? 1 : 0) || cmp(a.name, b.name))
      break
    case 'newest':
      arr.sort((a, b) => cmp(b.createdAt || 0, a.createdAt || 0))
      break
    case 'edited':
      arr.sort((a, b) => cmp(b.updatedAt || 0, a.updatedAt || 0))
      break
    case 'nextAction':
      arr.sort((a, b) => cmp(a.nextActionDate || '9999', b.nextActionDate || '9999') || cmp(a.name, b.name))
      break
    case 'recommended':
    default:
      arr.sort((a, b) => cmp(recommendedScore(a), recommendedScore(b)) || cmp(a.name, b.name))
      break
  }
  return arr
}

// Стойности за падащите филтри (уникални населени места / райони).
export function uniqueValues(list, field) {
  const set = new Set()
  list.forEach((b) => {
    const v = (b[field] || '').trim()
    if (v) set.add(v)
  })
  return [...set].sort((a, b) => a.localeCompare(b, 'bg'))
}
