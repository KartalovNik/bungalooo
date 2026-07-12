// ─────────────────────────────────────────────────────────────────
// Слой за данните.
// Има два адаптера зад един и същ интерфейс:
//   • cloudStore — Supabase (обща синхронизация между устройства)
//   • localStore — localStorage (ДЕМО режим, само на това устройство)
// Изборът е автоматичен според наличието на ключове за базата.
// ─────────────────────────────────────────────────────────────────
import { backendEnabled, supabase } from '../backend'

const TABLE = 'bungalows'

// Прави чисто копие (без undefined стойности).
function clean(obj) {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)))
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Облачен адаптер (Supabase) ───────────────────────────────────
function makeCloudStore() {
  const CACHE_KEY = 'bungalooo_cache_v1'

  const rowsToItems = (rows) => (rows || []).map((r) => ({ id: r.id, ...r.doc }))

  const readCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
    } catch {
      return []
    }
  }
  const writeCache = (items) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items))
    } catch {
      /* пренебрегваме */
    }
  }

  async function fetchAll() {
    const { data, error } = await supabase.from(TABLE).select('id, doc')
    if (error) throw error
    return rowsToItems(data)
  }

  return {
    isCloud: true,

    subscribe(cb, onError) {
      // 1) Показваме веднага кешираните данни (бързо зареждане + офлайн).
      const cached = readCache()
      if (cached.length) Promise.resolve().then(() => cb(cached, { fromCache: true }))

      // 2) Зареждаме актуалните данни.
      const load = async () => {
        try {
          const items = await fetchAll()
          writeCache(items)
          cb(items, { fromCache: false })
        } catch (err) {
          if (!cached.length) onError && onError(err)
        }
      }
      load()

      // 3) Слушаме за промени в реално време.
      const channel = supabase
        .channel('bungalows-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, load)
        .subscribe()

      return () => supabase.removeChannel(channel)
    },

    async add(doc) {
      const id = newId()
      const { error } = await supabase.from(TABLE).insert({ id, doc: clean(doc) })
      if (error) throw error
      return id
    },

    async update(id, patch) {
      // Сливаме с текущия запис (както при документна база).
      const { data, error: readErr } = await supabase.from(TABLE).select('doc').eq('id', id).single()
      if (readErr) throw readErr
      const merged = { ...(data?.doc || {}), ...patch }
      const { error } = await supabase.from(TABLE).update({ doc: clean(merged) }).eq('id', id)
      if (error) throw error
    },

    async set(id, doc) {
      const { error } = await supabase.from(TABLE).upsert({ id, doc: clean(doc) })
      if (error) throw error
    },

    async remove(id) {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
    },

    async getAllOnce() {
      return fetchAll()
    },

    async bulkAdd(list) {
      const rows = list.map((item) => {
        const { id, ...doc } = item
        return { id: newId(), doc: clean(doc) }
      })
      // На партиди по 500, за да не са прекалено големи заявките.
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from(TABLE).insert(rows.slice(i, i + 500))
        if (error) throw error
      }
    },

    async clearAll() {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
    },
  }
}

// ── Локален адаптер (localStorage) ───────────────────────────────
function makeLocalStore() {
  const KEY = 'bungalooo_data_v1'
  const listeners = new Set()

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  }
  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items))
    listeners.forEach((cb) => cb([...items], { fromCache: false }))
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) listeners.forEach((cb) => cb(read(), { fromCache: false }))
    })
  }

  return {
    isCloud: false,

    subscribe(cb) {
      listeners.add(cb)
      Promise.resolve().then(() => cb(read(), { fromCache: false }))
      return () => listeners.delete(cb)
    },

    async add(data) {
      const items = read()
      const id = newId()
      items.push({ id, ...clean(data) })
      write(items)
      return id
    },

    async update(id, patch) {
      const items = read().map((it) => (it.id === id ? { ...it, ...clean(patch) } : it))
      write(items)
    },

    async set(id, data) {
      const items = read()
      const idx = items.findIndex((it) => it.id === id)
      const next = { id, ...clean(data) }
      if (idx >= 0) items[idx] = next
      else items.push(next)
      write(items)
    },

    async remove(id) {
      write(read().filter((it) => it.id !== id))
    },

    async getAllOnce() {
      return read()
    },

    async bulkAdd(list) {
      const items = read()
      for (const item of list) {
        const { id, ...rest } = item
        items.push({ id: newId(), ...clean(rest) })
      }
      write(items)
    },

    async clearAll() {
      write([])
    },
  }
}

export const store = backendEnabled ? makeCloudStore() : makeLocalStore()
export const isCloud = store.isCloud
