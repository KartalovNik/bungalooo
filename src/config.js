// ─────────────────────────────────────────────────────────────────
// Централна конфигурация на Bungalooo.
// Тук се сменят потребители, статуси, удобства и списъци — на едно място.
// ─────────────────────────────────────────────────────────────────

export const APP_NAME = 'Bungalooo'

// Имейл на общия редакторски акаунт (паролата му е общата парола за
// редактиране). НЕ е таен. Може да се смени през .env.local.
export const EDITOR_EMAIL =
  import.meta.env.VITE_EDITOR_EMAIL || 'editor@bungalooo.app'

// ── Хора, които редактират (всеки със свой цвят) ─────────────────
export const USERS = [
  { id: 'nik', name: 'Ник', color: '#2563eb' },
  { id: 'dani', name: 'Дани', color: '#0d9488' },
  { id: 'mari', name: 'Мари', color: '#db2777' },
  { id: 'ivan', name: 'Иван', color: '#d97706' },
]

export function getUser(id) {
  return USERS.find((u) => u.id === id) || null
}

// ── Статуси ──────────────────────────────────────────────────────
// color = основен цвят, bg = светъл фон, fg = цвят на текста върху bg
export const STATUSES = [
  { key: 'za_proverka', label: 'За проверка', icon: '🔍', color: '#475569', bg: '#eef2f6', fg: '#334155' },
  { key: 'da', label: 'Да', icon: '✓', color: '#16a34a', bg: '#e7f6ec', fg: '#166534' },
  { key: 'mozhe_bi', label: 'Може би', icon: '?', color: '#ca8a04', bg: '#fdf6e3', fg: '#854d0e' },
  { key: 'ne', label: 'Не', icon: '✕', color: '#dc2626', bg: '#fdecec', fg: '#991b1b' },
  { key: 'svarzahme', label: 'Свързахме се', icon: '✉', color: '#9333ea', bg: '#f5ecfe', fg: '#6b21a8' },
  { key: 'chakame', label: 'Чакаме отговор', icon: '⏳', color: '#a855f7', bg: '#f8f0ff', fg: '#7e22ce' },
  { key: 'nyama_mesta', label: 'Няма свободни места', icon: '🚫', color: '#f97316', bg: '#fff0e6', fg: '#9a3412' },
  { key: 'nad_budjet', label: 'Над бюджета', icon: '💸', color: '#c2410c', bg: '#fdeee6', fg: '#7c2d12' },
  { key: 'rezervirano', label: 'Резервирано', icon: '★', color: '#15803d', bg: '#e3f4ea', fg: '#14532d' },
]

export const DEFAULT_STATUS = 'za_proverka'

export function getStatus(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0]
}

// Кои статуси се показват в обобщението (в този ред).
export const SUMMARY_STATUSES = [
  'da',
  'mozhe_bi',
  'ne',
  'za_proverka',
  'svarzahme',
  'nyama_mesta',
  'rezervirano',
]

// ── Удобства (за икони по картите и за филтри) ───────────────────
export const AMENITIES = [
  { key: 'ownBathroom', label: 'Собствен санитарен възел', short: 'Баня', icon: 'bath' },
  { key: 'ac', label: 'Климатик', short: 'Климатик', icon: 'ac' },
  { key: 'parking', label: 'Паркинг', short: 'Паркинг', icon: 'parking' },
  { key: 'kitchen', label: 'Кухня / кухненски бокс', short: 'Кухня', icon: 'kitchen' },
  { key: 'kidFriendly', label: 'Подходящо за деца', short: 'За деца', icon: 'kids' },
]

// ── Списъци за падащи менюта / предложения ──────────────────────
export const AREA_SUGGESTIONS = [
  'Лозенец',
  'къмпинг Гардения',
  'Арапя',
  'Царево',
  'Нестинарка',
  'Ахтопол',
  'Синеморец',
  'Китен',
  'Приморско',
]

export const CURRENCIES = ['лв.', '€', '$']
export const DEFAULT_CURRENCY = 'лв.'

// Тристойностни полета: null = „За проверка", true = „Да", false = „Не"
export const TRISTATE = [
  { value: null, label: 'За проверка' },
  { value: true, label: 'Да' },
  { value: false, label: 'Не' },
]

export const AVAILABILITY = [
  { value: '', label: 'За проверка' },
  { value: 'yes', label: 'Има свободни' },
  { value: 'no', label: 'Няма свободни' },
]

export const PLACEHOLDER_LABEL = 'За проверка'

// Празно бунгало (шаблон за нов запис).
export function emptyBungalow() {
  return {
    name: '',
    town: '',
    area: '',
    links: [],
    photos: [],
    price: null,
    currency: DEFAULT_CURRENCY,
    capacity: null,
    suitableFor2A1C: null,
    beachDistanceM: null,
    ownBathroom: null,
    ac: null,
    parking: null,
    kitchen: null,
    kidFriendly: null,
    rating: null,
    ratingSource: '',
    phone: '',
    description: '',
    pros: '',
    cons: '',
    notes: '',
    status: DEFAULT_STATUS,
    favorite: false,
    lastCheckedDate: '',
    availability: '',
    nextAction: '',
    nextActionDate: '',
    archived: false,
    statusHistory: [],
    lastChangedBy: null,
    notesUpdatedBy: null,
    notesUpdatedAt: null,
  }
}
