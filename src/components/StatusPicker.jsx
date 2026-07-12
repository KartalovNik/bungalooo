// Смяна на статус директно от картата (падащо меню).
import Menu from './Menu'
import Icon from './Icons'
import { STATUSES, getStatus } from '../config'

export default function StatusPicker({ statusKey, onChange }) {
  const s = getStatus(statusKey)
  return (
    <Menu
      align="start"
      label="Смяна на статус"
      trigger={
        <button
          className="status-picker-btn"
          style={{ background: s.bg, color: s.fg, borderColor: s.color }}
          aria-label={`Статус: ${s.label}. Натиснете за смяна.`}
        >
          <span className="status-badge__dot" style={{ background: s.color }} aria-hidden="true" />
          <span className="status-badge__icon" aria-hidden="true">{s.icon}</span>
          <span className="status-badge__label">{s.label}</span>
          <Icon name="chevron" size={15} />
        </button>
      }
      items={STATUSES.map((st) => ({
        label: st.label,
        active: st.key === statusKey,
        onClick: () => onChange(st.key),
      }))}
    />
  )
}
