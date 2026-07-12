// Слага football=true на 6-те, оправя линка на Василико, добавя Къмпинг Вълканови.
// GH_TOKEN=$(gh auth token) node scripts/apply-fixes-2.mjs
import { randomUUID } from 'node:crypto'
const O = 'KartalovNik', R = 'bungalooo', B = 'data', F = 'data.json', token = process.env.GH_TOKEN
if (!token) { console.error('Липсва GH_TOKEN'); process.exit(1) }
const api = async (p, m, b) => {
  const r = await fetch(`https://api.github.com/repos/${O}/${R}${p}`, { method: m, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined })
  const t = await r.text(); if (!r.ok) throw new Error(r.status + t); return JSON.parse(t)
}
const dec = (s) => Buffer.from(s.replace(/\n/g, ''), 'base64').toString('utf-8')
const enc = (s) => Buffer.from(s, 'utf-8').toString('base64')
const now = Date.now()
const by = { id: 'research', name: 'Проучване', color: '#0ea5b7', at: now }
const empty = () => ({
  name: '', town: '', area: '', links: [], photos: [], price: null, currency: 'лв.', capacity: null,
  suitableFor2A1C: null, beachDistanceM: null, ownBathroom: null, ac: null, parking: null, kitchen: null,
  kidFriendly: null, football: null, rating: null, ratingSource: '', phone: '', description: '', pros: '', cons: '',
  notes: '', status: 'za_proverka', favorite: false, lastCheckedDate: '', availability: '', nextAction: '',
  nextActionDate: '', archived: false, statusHistory: [], lastChangedBy: by, notesUpdatedBy: null, notesUpdatedAt: null,
})

const FOOTBALL = new Set([
  'Приморско клуб (вили Форест Бийч)', 'Ваканционно селище Лозенец', 'Бунгала Мечта (еко селище)',
  'Бунгала Сами (Къмпинг Созопол Еко)', 'Бунгала Василико', 'Къмпинг Бунгала Нестинарка',
])

const file = await api(`/contents/${F}?ref=${B}`, 'GET')
const items = JSON.parse(dec(file.content))

let flagged = 0, fixed = 0
for (const it of items) {
  const nm = (it.name || '').trim()
  if (FOOTBALL.has(nm) && it.football !== true) { it.football = true; it.updatedAt = now; it.lastChangedBy = by; flagged++ }
  if (nm === 'Бунгала Василико') {
    it.links = [
      { label: 'Google Maps', url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Ваканционен клуб Василико Царево') },
      { label: 'Facebook', url: 'https://www.facebook.com/vasilikoresort/' },
    ]
    it.updatedAt = now; it.lastChangedBy = by; fixed++
  }
}

// Добавяне на Къмпинг Вълканови (Синеморец)
let added = 0
if (!items.some((x) => (x.name || '').trim() === 'Къмпинг Вълканови')) {
  items.push({
    ...empty(), id: randomUUID(), createdAt: now, updatedAt: now,
    name: 'Къмпинг Вълканови', town: 'Синеморец', area: '',
    links: [
      { label: 'Facebook', url: 'https://www.facebook.com/people/%D0%9A%D1%8A%D0%BC%D0%BF%D0%B8%D0%BD%D0%B3-%D0%92%D1%8A%D0%BB%D0%BA%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8/100063786931059/' },
      { label: 'Google Maps', url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Къмпинг Вълканови Синеморец') },
    ],
    description: 'Фамилна къща и къмпинг в Синеморец. (За проверка.)',
  })
  added++
}

await api(`/contents/${F}`, 'PUT', { message: 'Bungalooo: футбол ⚽ + линк Василико + Къмпинг Вълканови', content: enc(JSON.stringify(items, null, 0)), sha: file.sha, branch: B })
console.log(`✓ football=true на ${flagged}; оправен Василико: ${fixed}; добавени: ${added}. Общо: ${items.length}`)
