// Цветна значка за статус (текст + икона + цвят).
import { getStatus } from '../config'

export default function StatusBadge({ statusKey, size = 'md' }) {
  const s = getStatus(statusKey)
  return (
    <span
      className={`status-badge status-badge--${size}`}
      style={{ background: s.bg, color: s.fg, borderColor: s.color }}
    >
      <span className="status-badge__dot" style={{ background: s.color }} aria-hidden="true" />
      <span className="status-badge__icon" aria-hidden="true">{s.icon}</span>
      <span className="status-badge__label">{s.label}</span>
    </span>
  )
}
