// Кръгъл аватар с инициал и цвета на човека.
import { initials } from '../utils/format'

export default function UserAvatar({ user, size = 24, title }) {
  if (!user) return null
  const label = user.name || ''
  return (
    <span
      className="avatar"
      title={title || label}
      style={{
        background: user.color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
      }}
      aria-label={label}
    >
      {initials(label)}
    </span>
  )
}
