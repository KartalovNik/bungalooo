// Избор на човек (Ник / Дани / Мари / Иван) — всеки със своя цвят.
import Modal from './Modal'
import UserAvatar from './UserAvatar'
import { USERS } from '../config'
import { useAuth } from '../context/AuthContext'

export function UserPickList({ onPick }) {
  return (
    <div className="who-grid">
      {USERS.map((u) => (
        <button key={u.id} className="who-btn" onClick={() => onPick(u.id)}>
          <UserAvatar user={u} size={44} />
          <span className="who-btn__name" style={{ color: u.color }}>{u.name}</span>
        </button>
      ))}
    </div>
  )
}

export default function WhoAmIModal({ open, onClose, dismissable = true }) {
  const { pickUser } = useAuth()
  return (
    <Modal
      open={open}
      onClose={dismissable ? onClose : () => {}}
      title="Кой редактира?"
      size="sm"
      closeOnBackdrop={dismissable}
    >
      <p className="muted mb">Изберете себе си — така промените ви ще се отбелязват с вашето име и цвят.</p>
      <UserPickList
        onPick={(id) => {
          pickUser(id)
          onClose()
        }}
      />
    </Modal>
  )
}
