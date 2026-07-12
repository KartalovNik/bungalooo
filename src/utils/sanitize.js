// Безопасно обработване на URL адреси (защита от опасни линкове).
// React сам екранира текста, така че тук се грижим само за href-овете.

const SAFE_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:']

// Връща безопасен href или null, ако адресът е опасен/невалиден.
export function safeUrl(raw) {
  if (!raw) return null
  let value = String(raw).trim()
  if (!value) return null

  // Ако няма протокол и прилича на домейн — добавяме https://
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    if (value.startsWith('//')) value = 'https:' + value
    else value = 'https://' + value
  }

  try {
    const url = new URL(value)
    if (!SAFE_PROTOCOLS.includes(url.protocol)) return null
    return url.href
  } catch {
    return null
  }
}

// Проверка дали текст е валиден (уеб) адрес — за формата.
export function isValidWebUrl(raw) {
  if (!raw) return false
  const safe = safeUrl(raw)
  if (!safe) return false
  try {
    const url = new URL(safe)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Кратко, четимо име на домейн за етикет на връзка.
export function domainLabel(raw) {
  const safe = safeUrl(raw)
  if (!safe) return raw || ''
  try {
    const url = new URL(safe)
    if (url.protocol === 'tel:') return url.pathname
    if (url.protocol === 'mailto:') return url.pathname
    return url.hostname.replace(/^www\./, '')
  } catch {
    return raw || ''
  }
}

// Разпознава известни източници за по-приятен етикет.
export function linkLabel(link) {
  if (link && link.label) return link.label
  const url = typeof link === 'string' ? link : link?.url
  const host = domainLabel(url).toLowerCase()
  if (host.includes('booking')) return 'Booking'
  if (host.includes('airbnb')) return 'Airbnb'
  if (host.includes('facebook') || host.includes('fb.')) return 'Facebook'
  if (host.includes('instagram')) return 'Instagram'
  if (host.includes('google') && host.includes('map')) return 'Google Maps'
  if (host.includes('maps.app') || host.includes('goo.gl')) return 'Google Maps'
  return domainLabel(url)
}
