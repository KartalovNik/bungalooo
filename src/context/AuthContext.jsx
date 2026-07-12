// ─────────────────────────────────────────────────────────────────
// Вход в режим за редактиране.
//   • Обща парола → един защитен акаунт в базата (паролата НЕ е в кода).
//   • След вход всеки избира кой е (Ник / Дани / Мари / Иван) — със свой цвят.
//   • Всяка промяна се записва с името и цвета на избрания човек.
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { backendEnabled, supabase } from '../backend'
import { EDITOR_EMAIL, getUser } from '../config'

const AuthContext = createContext(null)
const USER_KEY = 'bungalooo_user'
const DEMO_EDIT_KEY = 'bungalooo_demo_edit'

// Превежда съобщенията за грешка на разбираем български текст.
function friendlyError(message) {
  const m = (message || '').toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Грешна парола. Опитайте отново.'
  }
  if (m.includes('email not confirmed')) {
    return 'Акаунтът за редакция не е потвърден в базата.'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Няма връзка с интернет. Проверете мрежата.'
  }
  if (m.includes('rate') || m.includes('too many')) {
    return 'Твърде много опити. Изчакайте малко и опитайте пак.'
  }
  return 'Входът не бе успешен. Опитайте отново.'
}

export function AuthProvider({ children }) {
  const [editMode, setEditMode] = useState(false)
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_KEY) || null)
  const [authReady, setAuthReady] = useState(!backendEnabled)

  useEffect(() => {
    if (!backendEnabled) {
      // Демо режим — помним дали е бил включен редакторският режим.
      setEditMode(localStorage.getItem(DEMO_EDIT_KEY) === '1')
      setAuthReady(true)
      return
    }
    let sub = null
    supabase.auth.getSession().then(({ data }) => {
      setEditMode(!!data.session)
      setAuthReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEditMode(!!session)
      setAuthReady(true)
    })
    sub = data.subscription
    return () => sub && sub.unsubscribe()
  }, [])

  const signIn = useCallback(async (password) => {
    if (!password || !password.trim()) {
      throw new Error('Въведете парола.')
    }
    if (!backendEnabled) {
      // Демо режим: няма реални данни за защита → всяка непразна парола влиза.
      localStorage.setItem(DEMO_EDIT_KEY, '1')
      setEditMode(true)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: EDITOR_EMAIL,
      password,
    })
    if (error) throw new Error(friendlyError(error.message))
    // editMode се вдига от onAuthStateChange
  }, [])

  const signOut = useCallback(async () => {
    if (!backendEnabled) {
      localStorage.removeItem(DEMO_EDIT_KEY)
      setEditMode(false)
      return
    }
    await supabase.auth.signOut()
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
    authReady,
    currentUser,
    needsUserPick,
    isCloud: backendEnabled,
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
