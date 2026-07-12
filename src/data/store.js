// ─────────────────────────────────────────────────────────────────
// Слой за данните.
// Има два адаптера зад един и същ интерфейс:
//   • cloudStore — Firestore (синхронизация между устройства + офлайн)
//   • localStore — localStorage (ДЕМО режим, само на това устройство)
// Изборът е автоматичен според наличието на Firebase ключове.
// ─────────────────────────────────────────────────────────────────
import { firebaseEnabled, db } from '../firebase'

const COLLECTION = 'bungalows'

// Премахва undefined (Firestore не ги приема) и прави чисто копие.
function clean(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (v === undefined ? null : v))
  )
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Облачен адаптер (Firestore) ──────────────────────────────────
function makeCloudStore() {
  let mod = null
  const load = async () => {
    if (!mod) mod = await import('firebase/firestore')
    return mod
  }

  return {
    isCloud: true,

    subscribe(cb, onError) {
      let unsub = () => {}
      load().then(({ collection, onSnapshot }) => {
        unsub = onSnapshot(
          collection(db, COLLECTION),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            cb(items, { fromCache: snap.metadata.fromCache })
          },
          (err) => onError && onError(err)
        )
      })
      return () => unsub()
    },

    async add(data) {
      const { collection, addDoc } = await load()
      const ref = await addDoc(collection(db, COLLECTION), clean(data))
      return ref.id
    },

    async update(id, patch) {
      const { doc, updateDoc } = await load()
      await updateDoc(doc(db, COLLECTION, id), clean(patch))
    },

    async set(id, data) {
      const { doc, setDoc } = await load()
      await setDoc(doc(db, COLLECTION, id), clean(data))
    },

    async remove(id) {
      const { doc, deleteDoc } = await load()
      await deleteDoc(doc(db, COLLECTION, id))
    },

    async getAllOnce() {
      const { collection, getDocs } = await load()
      const snap = await getDocs(collection(db, COLLECTION))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },

    // Записва списък наведнъж (за импорт / зареждане на началните данни).
    async bulkAdd(list) {
      const { collection, writeBatch, doc } = await load()
      let batch = writeBatch(db)
      let n = 0
      for (const item of list) {
        const { id, ...rest } = item
        batch.set(doc(collection(db, COLLECTION)), clean(rest))
        if (++n % 400 === 0) {
          await batch.commit()
          batch = writeBatch(db)
        }
      }
      await batch.commit()
    },

    // Изтрива всички записи (за възстановяване от резервно копие).
    async clearAll() {
      const { collection, getDocs, writeBatch } = await load()
      const snap = await getDocs(collection(db, COLLECTION))
      let batch = writeBatch(db)
      let n = 0
      for (const d of snap.docs) {
        batch.delete(d.ref)
        if (++n % 400 === 0) {
          await batch.commit()
          batch = writeBatch(db)
        }
      }
      await batch.commit()
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

export const store = firebaseEnabled ? makeCloudStore() : makeLocalStore()
export const isCloud = store.isCloud
