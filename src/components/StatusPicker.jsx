// Смяна на статус — изскачащ прозорец с готови статуси + възможност за
// СВОЙ статус (свободен текст). Показва и кой последно е сменил статуса.
import { useState, useEffect } from 'react'
import Modal from './Modal'
import Icon from './Icons'
import UserAvatar from './UserAvatar'
import { STATUSES, getStatus, isCustomStatus } from '../config'
import { relativeTime } from '../utils/format'

export default function StatusPicker({ statusKey, onChange, changedBy }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
  const s = getStatus(statusKey)

  useEffect(() => {
    if (open) setCustom(isCustomStatus(statusKey) ? statusKey : '')
  }, [open, statusKey])

  const pick = (key) => { onChange(key); setOpen(false) }
  const saveCustom = () => {
    const v = custom.trim()
    if (v) pick(v)
  }

  return (
    <>
      <button
        className="status-picker-btn"
        style={{ background: s.bg, color: s.fg, borderColor: s.color }}
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        aria-label={`Статус: ${s.label}. Натиснете за смяна.`}
      >
        <span className="status-badge__dot" style={{ background: s.color }} aria-hidden="true" />
        <span className="status-badge__icon" aria-hidden="true">{s.icon}</span>
        <span className="status-badge__label">{s.label}</span>
        <Icon name="chevron" size={15} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Промяна на статус" size="sm">
        <div className="status-grid">
          {STATUSES.map((st) => (
            <button
              key={st.key}
              className={`status-opt${st.key === statusKey ? ' status-opt--active' : ''}`}
              style={{ background: st.bg, color: st.fg, borderColor: st.color }}
              onClick={() => pick(st.key)}
            >
              <span className="status-badge__dot" style={{ background: st.color }} aria-hidden="true" />
              <span className="status-opt__icon" aria-hidden="true">{st.icon}</span>
              <span className="status-opt__label">{st.label}</span>
              {st.key === statusKey && <Icon name="check" size={16} className="status-opt__check" />}
            </button>
          ))}
        </div>

        <div className="status-custom">
          <label className="field__label">✍️ Или напиши свой статус</label>
          <div className="status-custom__row">
            <input
              className="input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveCustom() } }}
              placeholder="напр. Чакаме снимки, Обади се пак…"
              maxLength={40}
            />
            <button className="btn btn--primary" onClick={saveCustom} disabled={!custom.trim()}>
              Запази
            </button>
          </div>
          {isCustomStatus(statusKey) && (
            <p className="hint">Сегашен свой статус: <strong>{statusKey}</strong></p>
          )}
        </div>

        {changedBy && changedBy.name && (
          <p className="status-changed-note">
            <UserAvatar user={changedBy} size={18} />
            Последна промяна на статуса: <strong>{changedBy.name}</strong>
            {changedBy.at ? ` · ${relativeTime(changedBy.at)}` : ''}
          </p>
        )}
      </Modal>
    </>
  )
}
