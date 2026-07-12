// Добавя бунгала с футболно игрище + допълва описанията на съществуващи.
// Стартиране: GH_TOKEN=$(gh auth token) node scripts/add-football.mjs
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
  kidFriendly: true, rating: null, ratingSource: '', phone: '', description: '', pros: '', cons: '', notes: '',
  status: 'za_proverka', favorite: false, lastCheckedDate: '', availability: '', nextAction: '', nextActionDate: '',
  archived: false, statusHistory: [], lastChangedBy: by, notesUpdatedBy: null, notesUpdatedAt: null,
})

// Нови бунгала (с потвърдено футболно игрище — маркирани „За проверка")
const NEW = [
  {
    name: 'Приморско клуб (вили Форест Бийч)', town: 'Приморско', area: 'ММЦ Приморско',
    links: [{ label: 'Инфо', url: 'https://info-register.com/primorsko-club/' }, { label: 'Форест Бийч', url: 'https://gap-tours.com/MMC-hotel_Forest_Beach.html' }],
    beachDistanceM: 150, ownBathroom: true, kitchen: true, parking: true, phone: '0700 12 110',
    description: '⚽ Стандартно футболно игрище (изкуствена трева) + тенис кортове, волейбол, баскетбол, плажен волейбол — на територията. Вили сред дъбовата гора до южния плаж на Приморско (~150 м); кухненски бокс и баня. (За проверка.)',
  },
  {
    name: 'Ваканционно селище Лозенец', town: 'Лозенец', area: '',
    links: [{ label: 'Официален сайт', url: 'https://vslozenets.com/за-нас/' }, { label: 'Opoznai', url: 'https://opoznai.bg/hotels/view/vakantzionno-selishte-lozenetz-lozenetz' }],
    ownBathroom: true, ac: true, parking: true, phone: '0887 767685',
    description: '⚽ Осветено комбинирано игрище за мини-футбол и баскетбол, тенис на маса, детски площадки, аниматори за детски/младежки групи. Вили в скандинавски стил, директно до плажа. (За проверка.)',
  },
  {
    name: 'Бунгала Мечта (еко селище)', town: 'Приморско', area: '',
    links: [{ label: 'Орли Туризъм', url: 'https://www.orliturizum.eu/profile-49642-bungala-mecta-primorsko' }],
    beachDistanceM: 800, parking: true,
    description: '⚽ Спортен комплекс с футболно игрище и тенис корт в района. Еко селище с обзаведени бунгала (Wi-Fi, детски кът, ресторант, паркинг) в дъбова гора южно от Приморско, ~800 м от плажа. (За проверка.)',
  },
  {
    name: 'Бунгала Сами (Къмпинг Созопол Еко)', town: 'Черноморец', area: 'плаж Градина',
    links: [{ label: 'camping.bg', url: 'https://camping.bg/къмпинг-градина-еко-camping286.html' }, { label: 'Noshtuvka', url: 'https://www.noshtuvka.bg/kashta-za-gosti/butikovi-bungala-sami-kamping-sozopol-eko-10342350' }],
    price: 230, capacity: 8, beachDistanceM: 100, parking: true,
    description: '⚽ Футболно игрище на територията на къмпинга + 3 детски площадки, мини зоокът, фитнес на открито. Бунгала на 100 м от плаж Градина (между Черноморец и Созопол, малко по-на север). Цена 230–370 лв./нощ (до 8 души). (За проверка.)',
  },
]

// Допълване на съществуващи бунгала
const APPEND = {
  'Бунгала Василико': ' ⚽ В комплекса има футболно игрище и тенис корт.',
  'Къмпинг Бунгала Нестинарка': ' ⚽ Спортна зона в/до къмпинга (в описания се посочва футболно игрище — за потвърждение).',
}

const file = await api(`/contents/${F}?ref=${B}`, 'GET')
const items = JSON.parse(dec(file.content))

let appended = 0
for (const it of items) {
  const add = APPEND[(it.name || '').trim()]
  if (add && !(it.description || '').includes('⚽')) {
    it.description = (it.description || '') + add
    it.updatedAt = now; it.lastChangedBy = by
    appended++
  }
}

const existingNames = new Set(items.map((x) => (x.name || '').trim()))
let added = 0
for (const n of NEW) {
  if (existingNames.has(n.name)) continue
  items.push({ ...empty(), ...n, id: randomUUID(), createdAt: now, updatedAt: now })
  added++
}

await api(`/contents/${F}`, 'PUT', { message: 'Bungalooo: бунгала с футболно игрище (за деца)', content: enc(JSON.stringify(items, null, 0)), sha: file.sha, branch: B })
console.log(`✓ Добавени ${added} нови, допълнени ${appended} съществуващи. Общо записи: ${items.length}`)
