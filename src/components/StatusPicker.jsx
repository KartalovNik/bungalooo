// Смяна на статус — изскачащ прозорец с големи бутони (винаги достъпен,
// и на телефон), който показва и кой последно е сменил статуса.
import { useState } from 'react'
import Modal from './Modal'
import Icon from './Icons'
import UserAvatar from './UserAvatar'
import { STATUSES, getStatus } from '../config'
import { relativeTime } from '../utils/format'

export default function StatusPicker({ statusKey, onChange, changedBy }) {
  const [open, setOpen] = useState(false)
  const s = getStatus(statusKey)

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
              onClick={() => { onChange(st.key); setOpen(false) }}
            >
              <span className="status-badge__dot" style={{ background: st.color }} aria-hidden="true" />
              <span className="status-opt__icon" aria-hidden="true">{st.icon}</span>
              <span className="status-opt__label">{st.label}</span>
              {st.key === statusKey && <Icon name="check" size={16} className="status-opt__check" />}
            </button>
          ))}
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
