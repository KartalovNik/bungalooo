// ─────────────────────────────────────────────────────────────────
// Връзка с общата база (Supabase).
// Ако ключовете липсват (напр. при първо стартиране без настройка),
// приложението минава в „Демо режим" с локално съхранение само на
// това устройство. Виж src/data/store.js.
//
// Тези две стойности НЕ са тайни: „anon" ключът е публичен по дизайн,
// а сигурността идва от правилата (RLS) в базата и от входа с парола.
// ─────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const backendEnabled = Boolean(url && anonKey)

export const supabase = backendEnabled
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

if (!backendEnabled && import.meta.env.DEV) {
  console.warn(
    '[Bungalooo] Липсват ключове за базата — ДЕМО режим (локално съхранение). ' +
      'Попълнете .env.local за обща синхронизация.'
  )
}
