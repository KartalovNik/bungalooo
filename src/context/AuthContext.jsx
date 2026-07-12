// ─────────────────────────────────────────────────────────────────
// Вход в режим за редактиране.
//   • Кодът за достъп (GitHub token) работи като обща парола — въвежда
//     се веднъж и се пази само в браузъра (НЕ в кода на сайта).
//   • След вход всеки избира кой е (Ник / Дани / Мари / Иван) — със свой цвят.
//   • Всяка промяна се записва с името и цвета на избрания човек.
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'
import { getToken, setToken, validateToken } from '../github'
import { getUser } from '../config'

const AuthContext = createContext(null)
const USER_KEY = 'bungalooo_user'

export function AuthProvider({ children }) {
  const [editMode, setEditMode] = useState(() => !!getToken())
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_KEY) || null)

  const signIn = useCallback(async (token) => {
    const t = (token || '').trim()
    if (!t) throw new Error('Въведете кода за редактиране.')
    let ok = false
    try {
      ok = await validateToken(t)
    } catch {
      throw new Error('Няма връзка с GitHub. Проверете мрежата.')
    }
    if (!ok) throw new Error('Невалиден код или без достъп до хранилището.')
    setToken(t)
    setEditMode(true)
  }, [])

  const signOut = useCallback(async () => {
    setToken(null)
    setEditMode(false)
  }, [])

  const pickUser = useCallback((id) => {
    if (id) {
      localStorage.setItem(USER_KEY, id)
      setUserId(id)
    } else {
      localStorage.removeItem(USER_KEY)
      setUserId(null)
    }
  }, [])

  const currentUser = editMode ? getUser(userId) : null
  const needsUserPick = editMode && !currentUser

  const value = {
    editMode,
    authReady: true,
    currentUser,
    needsUserPick,
    isCloud: true,
    signIn,
    signOut,
    pickUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth трябва да е вътре в <AuthProvider>')
  return ctx
}
