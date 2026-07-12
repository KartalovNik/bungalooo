// Валидиране на входните данни във формата за добавяне/редакция.
import { isValidWebUrl } from './sanitize'

function isNonNegNumber(v) {
  if (v === '' || v === null || v === undefined) return true // празно е ок
  const n = Number(v)
  return !Number.isNaN(n) && n >= 0
}

export function validateBungalow(data) {
  const errors = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'Името е задължително.'
  } else if (data.name.length > 200) {
    errors.name = 'Името е твърде дълго (макс. 200 знака).'
  }

  if (!isNonNegNumber(data.price)) errors.price = 'Цената трябва да е неотрицателно число.'
  if (!isNonNegNumber(data.capacity)) errors.capacity = 'Капацитетът трябва да е число.'
  if (!isNonNegNumber(data.beachDistanceM))
    errors.beachDistanceM = 'Разстоянието трябва да е число (в метри).'

  if (data.rating !== '' && data.rating !== null && data.rating !== undefined) {
    const r = Number(data.rating)
    if (Number.isNaN(r) || r < 0 || r > 10) errors.rating = 'Рейтингът трябва да е между 0 и 10.'
  }

  // Линкове — всеки трябва да е валиден уеб адрес.
  ;(data.links || []).forEach((l, i) => {
    if (l && l.url && l.url.trim() && !isValidWebUrl(l.url)) {
      errors[`link_${i}`] = 'Невалиден адрес. Пример: https://...'
    }
  })

  // Снимки — всяка трябва да е валиден адрес.
  ;(data.photos || []).forEach((p, i) => {
    if (p && p.trim() && !isValidWebUrl(p)) {
      errors[`photo_${i}`] = 'Невалиден адрес на снимка.'
    }
  })

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
