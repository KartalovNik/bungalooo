// Обединява намерените данни (batch-*.json) в data.json на клон „data".
// Стартиране: GH_TOKEN=$(gh auth token) RESEARCH_DIR="<път>" node scripts/merge-research.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const OWNER = 'KartalovNik'
const REPO = 'bungalooo'
const BRANCH = 'data'
const FILE = 'data.json'
const token = process.env.GH_TOKEN
const dir = process.env.RESEARCH_DIR
if (!token || !dir) {
  console.error('Липсва GH_TOKEN или RESEARCH_DIR')
  process.exit(1)
}

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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}
const b64d = (s) => Buffer.from(s.replace(/\n/g, ''), 'base64').toString('utf-8')
const b64e = (s) => Buffer.from(s, 'utf-8').toString('base64')

// 1) Текущи данни + sha
const file = await api(`/contents/${FILE}?ref=${BRANCH}`, 'GET')
const items = JSON.parse(b64d(file.content))

// 2) Събиране на проучванията по име
const research = {}
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const arr = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
  for (const r of arr) if (r && r.name) research[r.name.trim()] = r
}

const now = Date.now()
const by = { id: 'research', name: 'Проучване', color: '#0ea5b7', at: now }
const has = (v) => v !== null && v !== undefined && v !== ''
const tri = (v) => v === true || v === false

let filled = 0
const merged = items.map((it) => {
  const r = research[(it.name || '').trim()]
  if (!r) return it
  filled++
  const out = { ...it }
  if (has(r.town)) out.town = r.town
  if (has(r.area)) out.area = r.area
  if (Array.isArray(r.links) && r.links.length)
    out.links = r.links.filter((l) => l && l.url).map((l) => ({ label: l.label || '', url: l.url }))
  if (Array.isArray(r.photos) && r.photos.length) out.photos = r.photos.filter(Boolean)
  if (has(r.price)) out.price = Number(r.price)
  if (has(r.currency)) out.currency = r.currency
  if (has(r.capacity)) out.capacity = Number(r.capacity)
  if (has(r.beachDistanceM)) out.beachDistanceM = Number(r.beachDistanceM)
  if (has(r.rating)) out.rating = Number(r.rating)
  if (has(r.ratingSource)) out.ratingSource = r.ratingSource
  if (has(r.phone)) out.phone = r.phone
  if (has(r.description)) out.description = r.description
  for (const k of ['ownBathroom', 'ac', 'parking', 'kitchen', 'kidFriendly']) {
    if (tri(r[k])) out[k] = r[k]
  }
  out.updatedAt = now
  out.lastChangedBy = by
  return out
})

// 3) Запис обратно
await api(`/contents/${FILE}`, 'PUT', {
  message: 'Bungalooo: попълване с намерена публична информация (за проверка)',
  content: b64e(JSON.stringify(merged, null, 0)),
  sha: file.sha,
  branch: BRANCH,
})

console.log(`✓ Обновени ${filled}/${items.length} записа.`)
console.log('С данни:', merged.filter((x) => x.town || (x.links && x.links.length)).length)
console.log('Със снимки:', merged.filter((x) => x.photos && x.photos.length).length)
