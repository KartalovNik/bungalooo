// Помощни функции за споделяне, копиране и Google Maps.
import { safeUrl } from './sanitize'

export function directUrl(id) {
  // Работи и на GitHub Pages (подпапка + hash маршрутизация):
  // взимаме адреса до „#" и добавяме хеш-маршрута към бунгалото.
  const baseUrl = window.location.href.split('#')[0]
  return `${baseUrl}#/b/${id}`
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* пробваме резервния вариант */
  }
  // Резервен вариант за стари браузъри / несигурен контекст.
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function canNativeShare() {
  return typeof navigator !== 'undefined' && !!navigator.share
}

export async function shareBungalow(b) {
  const url = directUrl(b.id)
  const title = `Bungalooo — ${b.name || 'бунгало'}`
  const text = [b.name, b.town, b.area].filter(Boolean).join(', ')
  if (canNativeShare()) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled'
      // иначе падаме към копиране
    }
  }
  const ok = await copyText(url)
  return ok ? 'copied' : 'failed'
}

// Google Maps адрес: използва явен линк към карти, иначе търсене по име/място.
export function mapsUrl(b) {
  const explicit = (b.links || []).map((l) => l.url).find((u) => {
    const s = safeUrl(u)
    return s && /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(s)
  })
  if (explicit) return safeUrl(explicit)
  const q = encodeURIComponent([b.name, b.area, b.town].filter(Boolean).join(' '))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function telUrl(phone) {
  if (!phone) return null
  const clean = String(phone).replace(/[^\d+]/g, '')
  return clean ? `tel:${clean}` : null
}
