// ─────────────────────────────────────────────────────────────────
// Слой за данните — върху GitHub (файл data.json в клон „data").
//   • Четене: публично (за всички). Актуализира се чрез опресняване.
//   • Запис: през GitHub API с личния код за достъп (виж github.js).
//   • Записите се нареждат в опашка и се повтарят при едновременна
//     промяна от друг (конфликт на версии).
//   • Пази се локален кеш за бързо зареждане и работа офлайн.
// ─────────────────────────────────────────────────────────────────
import { getToken, apiRead, rawRead, apiWrite } from '../github'

const CACHE_KEY = 'bungalooo_cache_v1'
const POLL_EDITOR_MS = 12000 // редактори — често (актуален API)
const POLL_PUBLIC_MS = 60000 // посетители — по-рядко (лимит на GitHub API)

function clean(obj) {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)))
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
  } catch {
    return []
  }
}
function writeCache(items) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    /* пренебрегваме */
  }
}

// Състояние
const listeners = new Set()
let state = { items: readCache(), sha: null, json: '' }
let pollTimer = null
let pollTick = null
let stopped = true
let writeChain = Promise.resolve()

function notify(fromCache = false) {
  listeners.forEach((cb) => cb([...state.items], { fromCache }))
}

async function readCurrent() {
  const token = getToken()
  if (token) return apiRead(token)
  // Посетители: първо свеж API (без вход), при лимит → публичния raw адрес.
  try {
    return await apiRead(null)
  } catch {
    return rawRead()
  }
}

// Зарежда актуалните данни и уведомява, ако има промяна.
async function refresh() {
  const { items, sha } = await readCurrent()
  const json = JSON.stringify(items)
  if (json !== state.json) {
    state = { items, sha: sha ?? state.sha, json }
    writeCache(items)
    notify(false)
  } else if (sha && sha !== state.sha) {
    state.sha = sha
  }
}

function scheduleNext() {
  const delay = getToken() ? POLL_EDITOR_MS : POLL_PUBLIC_MS
  pollTimer = setTimeout(async () => {
    await refresh().catch(() => {
      /* офлайн / временна грешка — оставаме на кеша */
    })
    if (!stopped) scheduleNext()
  }, delay)
}
function startPolling() {
  if (!stopped) return
  stopped = false
  scheduleNext()
  pollTick = () => refresh().catch(() => {})
  window.addEventListener('focus', pollTick)
  document.addEventListener('visibilitychange', pollTick)
  window.addEventListener('online', pollTick)
}
function stopPolling() {
  stopped = true
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
  if (pollTick) {
    window.removeEventListener('focus', pollTick)
    document.removeEventListener('visibilitychange', pollTick)
    window.removeEventListener('online', pollTick)
    pollTick = null
  }
}

function friendlyWriteError(status) {
  if (status === 401) return new Error('Кодът за редактиране е невалиден или изтекъл. Влезте отново.')
  if (status === 403) return new Error('Кодът няма права за запис в хранилището.')
  if (status === 404) return new Error('Хранилището/клонът „data" не е намерен.')
  return new Error(`Записът не бе успешен (GitHub ${status}).`)
}

// Изпълнява промяна: чете актуалното, прилага mutate(items) → нов списък,
// записва. При конфликт (друг е записал междувременно) опитва пак.
function commit(mutate, message) {
  const run = async () => {
    const token = getToken()
    if (!token) throw new Error('Няма код за редактиране. Влезте в режим за редакция.')
    let attempt = 0
    for (;;) {
      const { items, sha } = await apiRead(token)
      const next = mutate([...items])
      const res = await apiWrite(token, next, sha, message)
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        state = { items: next, sha: data?.content?.sha ?? null, json: JSON.stringify(next) }
        writeCache(next)
        notify(false)
        return
      }
      if (res.status === 409 && attempt < 5) {
        attempt++
        continue // друг е записал — четем наново и опитваме пак
      }
      throw friendlyWriteError(res.status)
    }
  }
  writeChain = writeChain.then(run, run)
  return writeChain
}

export const isCloud = true

export const store = {
  isCloud: true,

  subscribe(cb, onError) {
    listeners.add(cb)
    // Показваме кеша веднага (бързо + офлайн).
    if (state.items.length) Promise.resolve().then(() => cb([...state.items], { fromCache: true }))
    // Първо зареждане.
    refresh().catch((err) => {
      if (!state.items.length) onError && onError(err)
    })
    startPolling()
    return () => {
      listeners.delete(cb)
      if (listeners.size === 0) stopPolling()
    }
  },

  async add(doc) {
    const id = newId()
    await commit((items) => [...items, { id, ...clean(doc) }], 'Bungalooo: ново бунгало')
    return id
  },

  async update(id, patch) {
    await commit(
      (items) => items.map((it) => (it.id === id ? { ...it, ...clean(patch) } : it)),
      'Bungalooo: промяна'
    )
  },

  async set(id, doc) {
    await commit((items) => {
      const idx = items.findIndex((it) => it.id === id)
      const next = { id, ...clean(doc) }
      if (idx >= 0) items[idx] = next
      else items.push(next)
      return items
    }, 'Bungalooo: запис')
  },

  async remove(id) {
    await commit((items) => items.filter((it) => it.id !== id), 'Bungalooo: изтриване')
  },

  async getAllOnce() {
    const { items } = await readCurrent()
    return items
  },

  async bulkAdd(list) {
    await commit((items) => {
      const add = list.map((item) => {
        const { id, ...doc } = item
        return { id: newId(), ...clean(doc) }
      })
      return [...items, ...add]
    }, 'Bungalooo: добавяне на записи')
  },

  async clearAll() {
    await commit(() => [], 'Bungalooo: изчистване')
  },
}
