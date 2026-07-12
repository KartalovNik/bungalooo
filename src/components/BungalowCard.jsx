// Карта на едно бунгало в списъка.
import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icons'
import Photo from './Photo'
import StatusBadge from './StatusBadge'
import StatusPicker from './StatusPicker'
import AmenityIcons from './AmenityIcons'
import UserAvatar from './UserAvatar'
import Menu from './Menu'
import ConfirmDialog from './ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, formatDistance, formatRating, relativeTime, isOverdue, formatDay } from '../utils/format'
import { safeUrl, linkLabel } from '../utils/sanitize'
import { shareBungalow, copyText, directUrl } from '../utils/share'
import { PLACEHOLDER_LABEL } from '../config'

function BungalowCard({ bungalow: b }) {
  const navigate = useNavigate()
  const { editMode } = useAuth()
  const { toggleFavorite, setStatus, duplicateBungalow, setArchived, removeBungalow, restoreDeleted } = useData()
  const { openEdit } = useUI()
  const toast = useToast()
  const [confirmDel, setConfirmDel] = useState(false)

  const firstLink = (b.links || []).map((l) => l.url).map(safeUrl).find(Boolean)
  const cover = (b.photos || []).find(Boolean)
  const openDetails = () => navigate(`/b/${b.id}`)

  // Кой последно е сменил статуса (от историята на статусите).
  const lastStatus = b.statusHistory && b.statusHistory.length ? b.statusHistory[b.statusHistory.length - 1] : null
  const statusBy = lastStatus && lastStatus.by ? { ...lastStatus.by, at: lastStatus.at } : null

  async function onShare(e) {
    e.stopPropagation()
    const res = await shareBungalow(b)
    if (res === 'copied') toast.success('Линкът е копиран.')
    else if (res === 'failed') toast.error('Копирането не бе успешно.')
  }
  async function onCopyLink(e) {
    e.stopPropagation()
    const ok = await copyText(directUrl(b.id))
    toast[ok ? 'success' : 'error'](ok ? 'Директният линк е копиран.' : 'Копирането не бе успешно.')
  }

  const editItems = [
    { label: 'Редактирай', icon: 'edit', onClick: () => openEdit(b) },
    { label: 'Дублирай', icon: 'duplicate', onClick: async () => { await duplicateBungalow(b); toast.success('Създадено е копие.') } },
    b.archived
      ? { label: 'Извади от архив', icon: 'archive', onClick: async () => { await setArchived(b, false); toast.success('Извадено от архива.') } }
      : { label: 'Архивирай', icon: 'archive', onClick: async () => { await setArchived(b, true); toast.info('Преместено в архива.') } },
    { separator: true },
    { label: 'Изтрий', icon: 'trash', danger: true, onClick: () => setConfirmDel(true) },
  ]

  const overdue = b.nextActionDate && isOverdue(b.nextActionDate)

  return (
    <article className={`card${b.archived ? ' card--archived' : ''}`}>
      <div className="card__media" onClick={openDetails} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') openDetails() }}
        aria-label={`Отвори детайли за ${b.name}`}>
        <Photo src={cover} alt={b.name} className="card__photo" />
        {(b.photos || []).filter(Boolean).length > 1 && (
          <span className="card__photo-count"><Icon name="image" size={13} /> {b.photos.filter(Boolean).length}</span>
        )}
        <button
          className={`heart${b.favorite ? ' heart--on' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (editMode) toggleFavorite(b) }}
          disabled={!editMode}
          aria-pressed={b.favorite}
          aria-label={b.favorite ? 'Премахни от любими' : 'Добави в любими'}
          title={editMode ? (b.favorite ? 'Премахни от любими' : 'Добави в любими') : (b.favorite ? 'Любимо' : '')}
        >
          <Icon name={b.favorite ? 'heartFilled' : 'heart'} size={20} />
        </button>
        {b.archived && <span className="card__ribbon">Архив</span>}
      </div>

      <div className="card__body">
        <div className="card__status-row">
          {editMode ? (
            <StatusPicker statusKey={b.status} onChange={(s) => setStatus(b, s)} changedBy={statusBy} />
          ) : (
            <StatusBadge statusKey={b.status} />
          )}
          {statusBy && statusBy.name && (
            <span className="status-by" title={`Статус сменен от ${statusBy.name}`}>
              <UserAvatar user={statusBy} size={16} /> {statusBy.name}
            </span>
          )}
        </div>

        <h3 className="card__title" onClick={openDetails}>{b.name || 'Без име'}</h3>
        <p className="card__loc">
          <Icon name="map" size={14} />
          {[b.town, b.area].filter(Boolean).join(' · ') || PLACEHOLDER_LABEL}
        </p>

        <div className="card__meta">
          <span className="meta meta--price">{formatPrice(b.price, b.currency)}</span>
          <span className="meta" title="Разстояние до плажа"><Icon name="beach" size={15} /> {formatDistance(b.beachDistanceM)}</span>
          <span className="meta" title="Рейтинг"><Icon name="star" size={15} /> {formatRating(b.rating)}</span>
          <span className="meta" title="Капацитет"><Icon name="people" size={15} /> {b.capacity ?? '—'}</span>
        </div>

        <AmenityIcons bungalow={b} />

        {b.notes && b.notes.trim() && (
          <p className="card__note"><Icon name="edit" size={13} /> {b.notes.trim()}</p>
        )}

        {overdue && (
          <p className="card__overdue"><Icon name="warning" size={14} /> Просрочено: {b.nextAction || 'следващо действие'} ({formatDay(b.nextActionDate)})</p>
        )}

        <div className="card__footer">
          {b.lastChangedBy && b.lastChangedBy.name ? (
            <span className="changed-chip" title={`Последна промяна: ${b.lastChangedBy.name}`}>
              <UserAvatar user={b.lastChangedBy} size={18} />
              <span>{b.lastChangedBy.name}</span>
              <span className="muted">· {relativeTime(b.lastChangedBy.at || b.updatedAt)}</span>
            </span>
          ) : <span />}
        </div>

        <div className="card__actions">
          <button className="btn btn--primary btn--sm" onClick={openDetails}>Детайли</button>
          {firstLink ? (
            <a className="btn btn--ghost btn--sm" href={firstLink} target="_blank" rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()} title={linkLabel(b.links[0])}>
              <Icon name="external" size={16} /> Линк
            </a>
          ) : (
            <button className="btn btn--ghost btn--sm" disabled title="Няма добавен линк">
              <Icon name="external" size={16} /> Линк
            </button>
          )}
          <button className="icon-btn" onClick={onShare} aria-label="Сподели" title="Сподели"><Icon name="share" size={18} /></button>
          <button className="icon-btn" onClick={onCopyLink} aria-label="Копирай линк" title="Копирай директен линк"><Icon name="link" size={18} /></button>
          {editMode && (
            <Menu
              align="end"
              label="Още действия"
              trigger={<button className="icon-btn" aria-label="Още действия"><Icon name="dots" size={18} /></button>}
              items={editItems}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Изтриване на предложение"
        message={`Сигурни ли сте, че искате да изтриете „${b.name}"? Ще може да го върнете веднага след това.`}
        confirmLabel="Изтрий"
        danger
        onConfirm={async () => {
          setConfirmDel(false)
          await removeBungalow(b)
          toast.action(`„${b.name}" е изтрито.`, 'Върни', () => restoreDeleted(b))
        }}
        onCancel={() => setConfirmDel(false)}
      />
    </article>
  )
}

export default memo(BungalowCard)
