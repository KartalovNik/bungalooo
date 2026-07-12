// Създава чист (orphan) клон „data" с файла data.json (23 начални записа).
// Стартиране:  GH_TOKEN=$(gh auth token) node scripts/create-data-branch.mjs
import { randomUUID } from 'node:crypto'

const OWNER = 'KartalovNik'
const REPO = 'bungalooo'
const BRANCH = 'data'
const token = process.env.GH_TOKEN
if (!token) {
  console.error('Липсва GH_TOKEN')
  process.exit(1)
}

const RAW = [
  ['Бунгала Оазис SUNRISE', ''], ['Bungalow Deja View', ''],
  ['Camping Gardenia', 'къмпинг Гардения'], ['Camping Gardenia Bungalow SeaBed', 'къмпинг Гардения'],
  ['Art Provence Bungalow', ''], ['M House Bungalows', ''],
  ['Dream Camping Arapya', 'Арапя'], ['Къмпинг Бунгала Нестинарка', 'Нестинарка'],
  ['Bungalows Nestinarka', 'Нестинарка'], ['Бунгала Калина Нестинарка', 'Нестинарка'],
  ['Bungalow Silitur', ''], ['Вилно селище Съни Дей', ''], ['Бунгала Натали', ''],
  ['Бунгала Сили Тур', ''], ['Бунгала St. Nicola', ''], ['South Beach Villa', ''],
  ['Azure Camp Sinemorets', 'Синеморец'], ['Бунгала Василико', ''], ['Къмпинг Атлиман', ''],
  ['Chernomorie Camp', ''], ['Бунгала Пламен Морето', ''], ['Комплекс Джулай Морнинг', ''],
  ['Dream Bungalow', ''],
]
const empty = () => ({
  name: '', town: '', area: '', links: [], photos: [], price: null, currency: 'лв.',
  capacity: null, suitableFor2A1C: null, beachDistanceM: null, ownBathroom: null, ac: null,
  parking: null, kitchen: null, kidFriendly: null, rating: null, ratingSource: '', phone: '',
  description: '', pros: '', cons: '', notes: '', status: 'za_proverka', favorite: false,
  lastCheckedDate: '', availability: '', nextAction: '', nextActionDate: '', archived: false,
  statusHistory: [], lastChangedBy: null, notesUpdatedBy: null, notesUpdatedAt: null,
})
const base = Date.now()
const items = RAW.map(([name, area], i) => ({ id: randomUUID(), ...empty(), name, area, createdAt: base + i, updatedAt: base + i }))
const content = JSON.stringify(items, null, 0)

const api = async (path, method, body) => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return json
}

// Ако клонът вече съществува, само обновяваме файла.
const exists = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}`, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
}).then((r) => r.ok)

if (exists) {
  console.log('Клонът „data" вече съществува — пропускам създаването.')
  process.exit(0)
}

const b64 = Buffer.from(content, 'utf-8').toString('base64')
const blob = await api('/git/blobs', 'POST', { content: b64, encoding: 'base64' })
const tree = await api('/git/trees', 'POST', {
  tree: [{ path: 'data.json', mode: '100644', type: 'blob', sha: blob.sha }],
})
const commit = await api('/git/commits', 'POST', {
  message: 'Bungalooo: начални данни (23 предложения)',
  tree: tree.sha,
  parents: [],
})
await api('/git/refs', 'POST', { ref: `refs/heads/${BRANCH}`, sha: commit.sha })
console.log(`✓ Създаден клон „${BRANCH}" с data.json (${items.length} записа).`)
