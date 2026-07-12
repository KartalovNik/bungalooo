// Сваляне на файлове (CSV / JSON) и подготовка на данните за износ.
import { toCSV } from './csv'

export function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`
}

// Изнасяме „чисти" записи (без вътрешните id-та) за преносимост.
function forExport(list) {
  return list.map(({ id, ...rest }) => rest)
}

export function exportCSV(list) {
  const csv = '﻿' + toCSV(list) // BOM за коректна кирилица в Excel
  downloadFile(`bungalooo_${stamp()}.csv`, csv, 'text/csv;charset=utf-8')
}

export function exportJSON(list) {
  const data = {
    app: 'Bungalooo',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: list.length,
    bungalows: forExport(list),
  }
  downloadFile(`bungalooo_${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json')
}
