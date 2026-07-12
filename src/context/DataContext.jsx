// ─────────────────────────────────────────────────────────────────
// Държи списъка с бунгала (синхронизиран в реално време) и всички
// действия за промяна. Всяка промяна автоматично записва „кой и кога".
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { store } from '../data/store'
import { emptyBungalow, DEFAULT_STATUS } from '../config'
import { SEED_BUNGALOWS } from '../seed'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const DataContext = createContext(null)
const HISTORY_LIMIT = 60

export function DataProvider({ children }) {
  const { currentUser } = useAuth()
  const [bungalows, setBungalows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [recentlyDeleted, setRecentlyDeleted] = useState([])
  const userRef = useRef(currentUser)
  userRef.current = currentUser
  const toast = useToast()

  // Незабавна (оптимистична) промяна в списъка, докато записът стигне до GitHub.
  const optimistic = useCallback((id, patch) => {
    setBungalows((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])

  useEffect(() => {
    const unsub = store.subscribe(
      (items, meta) => {
        setBungalows(items)
        setFromCache(meta?.fromCache || false)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('[Bungalooo] Грешка при зареждане:', err)
        setError('Възникна проблем при зареждането на данните.')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const stampMeta = useCallback(() => {
    const u = userRef.current
    return u ? { id: u.id, name: u.name, color: u.color } : null
  }, [])

  const addBungalow = useCallback(
    async (data) => {
      const now = Date.now()
      const by = stampMeta()
      const status = data.status || DEFAULT_STATUS
      const doc = {
        ...emptyBungalow(),
        ...data,
        createdAt: now,
        updatedAt: now,
        lastChangedBy: by ? { ...by, at: now } : null,
        statusHistory: [{ status, by, at: now }],
      }
      return store.add(doc)
    },
    [stampMeta]
  )

  const updateBungalow = useCallback(
    async (id, patch) => {
      const now = Date.now()
      const by = stampMeta()
      await store.update(id, {
        ...patch,
        updatedAt: now,
        lastChangedBy: by ? { ...by, at: now } : null,
      })
    },
    [stampMeta]
  )

  const setStatus = useCallback(
    async (b, status) => {
      if (b.status === status) return
      const now = Date.now()
      const by = stampMeta()
      const changed = by ? { ...by, at: now } : null
      const history = [...(b.statusHistory || []), { status, by, at: now }].slice(-HISTORY_LIMIT)
      // Показваме промяната веднага (с автора), после записваме.
      optimistic(b.id, { status, statusHistory: history, updatedAt: now, lastChangedBy: changed })
      try {
        await store.update(b.id, { status, statusHistory: history, updatedAt: now, lastChangedBy: changed })
      } catch (e) {
        optimistic(b.id, { status: b.status, statusHistory: b.statusHistory, lastChangedBy: b.lastChangedBy })
        toast.error('Статусът не се запази: ' + (e.message || 'грешка при запис.'))
      }
    },
    [stampMeta, optimistic, toast]
  )

  const toggleFavorite = useCallback(
    async (b) => {
      const now = Date.now()
      const by = stampMeta()
      const changed = by ? { ...by, at: now } : null
      optimistic(b.id, { favorite: !b.favorite, updatedAt: now, lastChangedBy: changed })
      try {
        await store.update(b.id, { favorite: !b.favorite, updatedAt: now, lastChangedBy: changed })
      } catch (e) {
        optimistic(b.id, { favorite: b.favorite, lastChangedBy: b.lastChangedBy })
        toast.error('Промяната не се запази: ' + (e.message || 'грешка.'))
      }
    },
    [stampMeta, optimistic, toast]
  )

  const saveNotes = useCallback(
    async (id, notes) => {
      const now = Date.now()
      const by = stampMeta()
      await store.update(id, {
        notes,
        notesUpdatedAt: now,
        notesUpdatedBy: by,
        updatedAt: now,
        lastChangedBy: by ? { ...by, at: now } : null,
      })
    },
    [stampMeta]
  )

  const duplicateBungalow = useCallback(
    async (b) => {
      const now = Date.now()
      const by = stampMeta()
      const { id, createdAt, updatedAt, ...rest } = b
      return store.add({
        ...rest,
        name: `${b.name || 'Бунгало'} (копие)`,
        favorite: false,
        createdAt: now,
        updatedAt: now,
        lastChangedBy: by ? { ...by, at: now } : null,
      })
    },
    [stampMeta]
  )

  const setArchived = useCallback(
    (b, val) => updateBungalow(b.id, { archived: val }),
    [updateBungalow]
  )

  const removeBungalow = useCallback(async (b) => {
    setRecentlyDeleted((prev) => [b, ...prev].slice(0, 10))
    await store.remove(b.id)
  }, [])

  const restoreDeleted = useCallback(async (b) => {
    const { id, ...rest } = b
    await store.add(rest)
    setRecentlyDeleted((prev) => prev.filter((x) => x.id !== b.id))
  }, [])

  const seedInitial = useCallback(async () => {
    const base = Date.now()
    const items = SEED_BUNGALOWS.map((b, i) => ({
      ...b,
      createdAt: base + i,
      updatedAt: base + i,
      statusHistory: [],
    }))
    await store.bulkAdd(items)
  }, [])

  const importItems = useCallback(async (items, { replace = false } = {}) => {
    const base = Date.now()
    const prepared = items.map((b, i) => ({
      ...emptyBungalow(),
      ...b,
      createdAt: b.createdAt || base + i,
      updatedAt: base + i,
    }))
    if (replace) await store.clearAll()
    await store.bulkAdd(prepared)
  }, [])

  const value = {
    bungalows,
    loading,
    error,
    fromCache,
    recentlyDeleted,
    isCloud: store.isCloud,
    addBungalow,
    updateBungalow,
    setStatus,
    toggleFavorite,
    saveNotes,
    duplicateBungalow,
    setArchived,
    removeBungalow,
    restoreDeleted,
    seedInitial,
    importItems,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData трябва да е вътре в <DataProvider>')
  return ctx
}
