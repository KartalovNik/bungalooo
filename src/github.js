// ─────────────────────────────────────────────────────────────────
// „База данни" върху самото GitHub хранилище.
//
//  • Данните са във файл (data.json) в клон „data" на хранилището.
//  • ЧЕТЕНЕ: публично, за всички (без вход).
//  • ПИСАНЕ: през GitHub API с личен код за достъп (token), който всеки
//    редактор въвежда веднъж. Кодът се пази само в неговия браузър —
//    НЕ стои в кода на сайта.
//
// Синхронизацията става чрез кратко периодично опресняване.
// ─────────────────────────────────────────────────────────────────

export const GH = {
  owner: 'KartalovNik',
  repo: 'bungalooo',
  branch: 'data',
  file: 'data.json',
}

const TOKEN_KEY = 'bungalooo_gh_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}
export const backendEnabled = true // GitHub винаги е базата

// ── UTF-8 ⇄ base64 (важно за кирилицата) ─────────────────────────
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
export function base64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

const apiBase = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.file}`
const rawUrl = `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${GH.file}`

function headers(token) {
  const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

// Чете { items, sha } през API (актуално). token може да е null (публично).
export async function apiRead(token) {
  const res = await fetch(`${apiBase}?ref=${GH.branch}`, {
    headers: headers(token),
    cache: 'no-cache',
  })
  if (res.status === 404) return { items: [], sha: null }
  if (!res.ok) throw new Error(`GitHub четене: ${res.status}`)
  const data = await res.json()
  const items = JSON.parse(base64ToUtf8(data.content) || '[]')
  return { items, sha: data.sha }
}

// Чете само items през публичния raw адрес (за посетители без token).
export async function rawRead() {
  const res = await fetch(`${rawUrl}?t=${Math.floor(Date.now() / 30000)}`, { cache: 'no-cache' })
  if (res.status === 404) return { items: [], sha: null }
  if (!res.ok) throw new Error(`GitHub четене: ${res.status}`)
  const items = await res.json()
  return { items: Array.isArray(items) ? items : [], sha: null }
}

// Записва целия списък; връща новото sha.
export async function apiWrite(token, items, sha, message) {
  const body = {
    message: message || 'Bungalooo: промяна на данните',
    content: utf8ToBase64(JSON.stringify(items, null, 0)),
    branch: GH.branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(apiBase, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res
}

// Проверява дали кодът е валиден и има достъп до хранилището.
export async function validateToken(token) {
  const res = await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}`, {
    headers: headers(token),
  })
  return res.ok
}
