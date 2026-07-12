// Маха счупени/паркирани линкове и архивира дубликатите. Показва останалите линкове.
// Стартиране: GH_TOKEN=$(gh auth token) node scripts/cleanup-links.mjs
const OWNER = 'KartalovNik', REPO = 'bungalooo', BRANCH = 'data', FILE = 'data.json'
const token = process.env.GH_TOKEN
if (!token) { console.error('Липсва GH_TOKEN'); process.exit(1) }

const BAD_HOSTS = ['silitur.com', 'comunicatorbg.com', 'vasilikoresort.com']
const ARCHIVE = ['Бунгала Сили Тур', 'Bungalows Nestinarka'] // дубликати → в архив

const api = async (path, method, body) => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}
const b64d = (s) => Buffer.from(s.replace(/\n/g, ''), 'base64').toString('utf-8')
const b64e = (s) => Buffer.from(s, 'utf-8').toString('base64')
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }

const file = await api(`/contents/${FILE}?ref=${BRANCH}`, 'GET')
const items = JSON.parse(b64d(file.content))
const now = Date.now()

let removedLinks = 0, archived = 0
const out = items.map((it) => {
  const b = { ...it }
  const before = (b.links || []).length
  b.links = (b.links || []).filter((l) => !BAD_HOSTS.some((h) => hostOf(l.url).includes(h)))
  if (b.links.length !== before) { removedLinks += before - b.links.length; b.updatedAt = now }
  if (ARCHIVE.includes((b.name || '').trim())) { b.archived = true; b.updatedAt = now; archived++ }
  return b
})

await api(`/contents/${FILE}`, 'PUT', {
  message: 'Bungalooo: премахнати счупени линкове + архивирани дубликати',
  content: b64e(JSON.stringify(out, null, 0)),
  sha: file.sha, branch: BRANCH,
})

console.log(`✓ Премахнати ${removedLinks} счупени линка. Архивирани ${archived} дубликата.`)
console.log('\n=== Линкове по бунгало (активни) ===')
for (const b of out.filter((x) => !x.archived)) {
  const links = (b.links || []).map((l) => `${l.label || 'линк'}→${hostOf(l.url)}`).join(', ')
  console.log(`• ${b.name}: ${links || '(няма)'}`)
}
console.log('\n=== Архивирани (дубликати) ===')
for (const b of out.filter((x) => x.archived)) console.log(`• ${b.name}`)
