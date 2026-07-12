// Разпознаване на възможни дублирани записи (по нормализирано име).

export function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// Разстояние на Левенщайн (за приблизително сравнение).
function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  const prev = new Array(n + 1)
  const curr = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j]
  }
  return prev[n]
}

export function similarity(a, b) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const dist = levenshtein(na, nb)
  const maxLen = Math.max(na.length, nb.length)
  return 1 - dist / maxLen
}

// Връща списък с възможни дубликати спрямо съществуващите записи.
export function findPossibleDuplicates(name, list, ignoreId = null, threshold = 0.82) {
  if (!name || !name.trim()) return []
  return list
    .filter((b) => b.id !== ignoreId && !b.archived)
    .map((b) => ({ bungalow: b, score: similarity(name, b.name) }))
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
}
