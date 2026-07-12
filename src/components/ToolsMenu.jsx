// Меню „Инструменти": износ/внос, резервно копие, печат, архив, инсталиране.
import { useRef, useState } from 'react'
import Menu from './Menu'
import Icon from './Icons'
import Modal from './Modal'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useToast } from '../context/ToastContext'
import useInstallPrompt from '../hooks/useInstallPrompt'
import { exportCSV, exportJSON } from '../utils/download'
import { parseCSV, csvRowToBungalow } from '../utils/csv'

export default function ToolsMenu() {
  const { bungalows, importItems } = useData()
  const { editMode } = useAuth()
  const { filters, setFilter } = useUI()
  const toast = useToast()
  const { canInstall, install } = useInstallPrompt()
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file) {
    if (!file) return
    try {
      const text = await file.text()
      let items
      if (/\.json$/i.test(file.name) || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        const data = JSON.parse(text)
        const arr = Array.isArray(data) ? data : data.bungalows
        if (!Array.isArray(arr)) throw new Error('липсва списък')
        items = arr
      } else {
        items = parseCSV(text).map(csvRowToBungalow)
      }
      if (!items.length) {
        toast.error('Файлът е празен или в непознат формат.')
        return
      }
      setPending(items)
    } catch (err) {
      toast.error('Файлът не можа да се прочете. Проверете формата (CSV или JSON).')
    }
  }

  async function doImport(replace) {
    if (!pending) return
    setBusy(true)
    try {
      await importItems(pending, { replace })
      toast.success(
        replace
          ? `Възстановени са ${pending.length} записа.`
          : `Добавени са ${pending.length} записа.`
      )
      setPending(null)
    } catch (err) {
      toast.error('Вносът не бе успешен.')
    } finally {
      setBusy(false)
    }
  }

  const items = [
    { label: 'Изнеси CSV', icon: 'download', onClick: () => { exportCSV(bungalows); toast.success('CSV файлът е свален.') } },
    { label: 'Изнеси JSON (резервно копие)', icon: 'download', onClick: () => { exportJSON(bungalows); toast.success('Резервното копие е свалено.') } },
  ]
  if (editMode) {
    items.push({ label: 'Внеси / възстанови от файл', icon: 'upload', onClick: () => fileRef.current?.click() })
  }
  items.push({ separator: true })
  items.push({ label: 'Изглед за печат', icon: 'print', onClick: () => window.print() })
  items.push({
    label: filters.showArchived ? 'Скрий архива' : 'Покажи архива',
    icon: 'archive',
    active: filters.showArchived,
    onClick: () => setFilter('showArchived', !filters.showArchived),
  })
  if (canInstall) {
    items.push({
      label: 'Инсталирай на телефон',
      icon: 'download',
      onClick: async () => {
        const ok = await install()
        if (ok) toast.success('Приложението е добавено на началния екран.')
      },
    })
  }

  return (
    <>
      <Menu
        align="end"
        label="Инструменти"
        trigger={
          <button className="icon-btn" aria-label="Инструменти" title="Инструменти">
            <Icon name="dots" size={20} />
          </button>
        }
        items={items}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Внасяне на данни"
        size="sm"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setPending(null)} disabled={busy}>Отказ</button>
            <button className="btn btn--danger" onClick={() => doImport(true)} disabled={busy}>Замести всички</button>
            <button className="btn btn--primary" onClick={() => doImport(false)} disabled={busy}>Добави</button>
          </>
        }
      >
        <p>
          Намерени са <strong>{pending?.length || 0}</strong> записа.
        </p>
        <p className="muted">
          „Добави" ги прибавя към сегашните. „Замести всички" изтрива текущите и зарежда само тези от файла
          (използвайте при възстановяване от резервно копие).
        </p>
      </Modal>
    </>
  )
}
