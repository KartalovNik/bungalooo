// Държи състоянието на интерфейса: търсене, филтри, сортиране, панели.
import { createContext, useContext, useState, useCallback } from 'react'
import { DEFAULT_FILTERS } from '../utils/filterSort'

const UIContext = createContext(null)
const SORT_KEY = 'bungalooo_sort'

export function UIProvider({ children }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSortState] = useState(() => localStorage.getItem(SORT_KEY) || 'recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [form, setForm] = useState({ mode: null, bungalow: null })
  const [toolsOpen, setToolsOpen] = useState(false)

  const setSort = useCallback((s) => {
    setSortState(s)
    localStorage.setItem(SORT_KEY, s)
  }, [])

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }, [])

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((f) => {
      const arr = f[key]
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setQuery('')
  }, [])

  // Бързи филтри от обобщението.
  const showOnlyStatus = useCallback((statusKey) => {
    setFilters({ ...DEFAULT_FILTERS, statuses: [statusKey] })
    setQuery('')
  }, [])

  const showOnlyFavorites = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, favorite: true })
    setQuery('')
  }, [])

  const showAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setQuery('')
  }, [])

  const openAdd = useCallback(() => setForm({ mode: 'add', bungalow: null }), [])
  const openEdit = useCallback((b) => setForm({ mode: 'edit', bungalow: b }), [])
  const openDuplicate = useCallback((b) => setForm({ mode: 'add', bungalow: { ...b, id: undefined, name: `${b.name} (копие)` } }), [])
  const closeForm = useCallback(() => setForm({ mode: null, bungalow: null }), [])

  const value = {
    query,
    setQuery,
    filters,
    setFilter,
    toggleArrayFilter,
    clearFilters,
    setFilters,
    sort,
    setSort,
    filtersOpen,
    setFiltersOpen,
    form,
    openAdd,
    openEdit,
    openDuplicate,
    closeForm,
    toolsOpen,
    setToolsOpen,
    showOnlyStatus,
    showOnlyFavorites,
    showAll,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI трябва да е вътре в <UIProvider>')
  return ctx
}
