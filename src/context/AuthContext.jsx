// ─────────────────────────────────────────────────────────────────
// Вход в режим за редактиране.
//   • Обща парола → един защитен акаунт във Firebase (паролата НЕ е в кода).
//   • След вход всеки избира кой е (Ник / Дани / Мари / Иван) — със свой цвят.
//   • Всяка промяна се записва с името и цвета на избрания човек.
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { firebaseEnabled, auth } from '../firebase'
import { EDITOR_EMAIL, getUser } from '../config'

const AuthContext = createContext(null)
const USER_KEY = 'bungalooo_user'
const DEMO_EDIT_KEY = 'bungalooo_demo_edit'

// Превежда кодовете за грешка на Firebase на разбираем български текст.
function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Грешна парола. Опитайте отново.'
    case 'auth/too-many-requests':
      return 'Твърде много опити. Изчакайте малко и опитайте пак.'
    case 'auth/network-request-failed':
      return 'Няма връзка с интернет. Проверете мрежата.'
    case 'auth/invalid-email':
      return 'Невалидна настройка на редакторския акаунт (имейл).'
    default:
      return 'Входът не бе успешен. Опитайте отново.'
  }
}

export function AuthProvider({ children }) {
  const [editMode, setEditMode] = useState(false)
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_KEY) || null)
  const [authReady, setAuthReady] = useState(!firebaseEnabled)

  useEffect(() => {
    if (!firebaseEnabled) {
      // Демо режим — помним дали е бил включен редакторският режим.
      setEditMode(localStorage.getItem(DEMO_EDIT_KEY) === '1')
      setAuthReady(true)
      return
    }
    let unsub = () => {}
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, (user) => {
        setEditMode(!!user)
        setAuthReady(true)
      })
    })
    return () => unsub()
  }, [])

  const signIn = useCallback(async (password) => {
    if (!password || !password.trim()) {
      throw new Error('Въведете парола.')
    }
    if (!firebaseEnabled) {
      // Демо режим: няма реални данни за защита → всяка непразна парола влиза.
      localStorage.setItem(DEMO_EDIT_KEY, '1')
      setEditMode(true)
      return
    }
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, EDITOR_EMAIL, password)
      // editMode се вдига от onAuthStateChanged
    } catch (err) {
      throw new Error(friendlyError(err.code))
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!firebaseEnabled) {
      localStorage.removeItem(DEMO_EDIT_KEY)
      setEditMode(false)
      return
    }
    const { signOut: fbSignOut } = await import('firebase/auth')
    await fbSignOut(auth)
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
    isCloud: firebaseEnabled,
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
