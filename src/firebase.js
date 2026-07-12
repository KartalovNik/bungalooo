// ─────────────────────────────────────────────────────────────────
// Инициализация на Firebase.
// Ако ключовете липсват (напр. при първо локално стартиране без
// настройка), приложението минава в „Демо режим" с локално съхранение
// само на това устройство — за да можете веднага да го видите как
// работи. Виж src/data/store.js.
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)

let app = null
let db = null
let auth = null

if (firebaseEnabled) {
  app = initializeApp(config)
  // Постоянен локален кеш → синхронизация в реално време + работа офлайн.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  })
  auth = getAuth(app)
} else if (import.meta.env.DEV) {
  // Показва се само в конзолата при разработка.
  console.warn(
    '[Bungalooo] Firebase ключовете липсват — работим в ДЕМО режим (локално съхранение). ' +
      'Попълнете .env.local за облачна синхронизация.'
  )
}

export { app, db, auth }
