// Детайлен изглед на едно бунгало — със собствен URL (/b/:id).
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Icon from './Icons'
import Gallery from './Gallery'
import StatusBadge from './StatusBadge'
import StatusPicker from './StatusPicker'
import AmenityIcons from './AmenityIcons'
import NotesEditor from './NotesEditor'
import UserAvatar from './UserAvatar'
import Menu from './Menu'
import ConfirmDialog from './ConfirmDialog'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useToast } from '../context/ToastContext'
import { PLACEHOLDER_LABEL } from '../config'
import { formatPrice, formatDistance, formatRating, formatCapacity, formatDay, formatDateTime, relativeTime, isOverdue } from '../utils/format'
import { safeUrl, linkLabel } from '../utils/sanitize'
import { shareBungalow, copyText, directUrl, mapsUrl, telUrl } from '../utils/share'

function Fact({ label, children, wide = false }) {
  return (
    <div className={`fact${wide ? ' fact--wide' : ''}`}>
      <div className="fact__label">{label}</div>
      <div className="fact__value">{children}</div>
    </div>
  )
}

function triText(v) {
  return v === true ? 'Да' : v === false ? 'Не' : PLACEHOLDER_LABEL
}
function val(v) {
  return v === null || v === undefined || v === '' ? <span className="muted">{PLACEHOLDER_LABEL}</span> : v
}

export default function BungalowDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bungalows, loading, toggleFavorite, setStatus, duplicateBungalow, setArchived, removeBungalow, restoreDeleted } = useData()
  const { editMode } = useAuth()
  const { openEdit } = useUI()
  const toast = useToast()
  const [confirmDel, setConfirmDel] = useState(false)

  const b = bungalows.find((x) => x.id === id)

  const close = () => navigate('/')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirmDel) close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmDel])

  if (loading && !b) {
    return (
      <div className="detail-backdrop">
        <div className="detail"><div className="detail__loading">Зареждане…</div></div>
      </div>
    )
  }

  if (!b) {
    return (
      <div className="detail-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
        <div className="detail">
          <div className="state">
            <Icon name="warning" size={40} />
            <h2>Предложението не е намерено</h2>
            <p className="muted">Може да е изтрито или линкът да е грешен.</p>
            <button className="btn btn--primary" onClick={close}>Към списъка</button>
          </div>
        </div>
      </div>
    )
  }

  async function onShare() {
    const res = await shareBungalow(b)
    if (res === 'copied') toast.success('Линкът е копиран.')
    else if (res === 'failed') toast.error('Копирането не бе успешно.')
  }
  async function onCopyLink() {
    const ok = await copyText(directUrl(b.id))
    toast[ok ? 'success' : 'error'](ok ? 'Директният линк е копиран.' : 'Копирането не бе успешно.')
  }
  async function onCopyPhone() {
    const ok = await copyText(b.phone)
    toast[ok ? 'success' : 'error'](ok ? 'Телефонът е копиран.' : 'Копирането не бе успешно.')
  }

  const links = (b.links || []).filter((l) => l && l.url && safeUrl(l.url))
  const overdue = b.nextActionDate && isOverdue(b.nextActionDate)
  const history = [...(b.statusHistory || [])].reverse()

  const editItems = [
    { label: 'Редактирай', icon: 'edit', onClick: () => openEdit(b) },
    { label: 'Дублирай', icon: 'duplicate', onClick: async () => { await duplicateBungalow(b); toast.success('Създадено е копие.') } },
    b.archived
      ? { label: 'Извади от архив', icon: 'archive', onClick: () => setArchived(b, false) }
      : { label: 'Архивирай', icon: 'archive', onClick: () => setArchived(b, true) },
    { separator: true },
    { label: 'Изтрий', icon: 'trash', danger: true, onClick: () => setConfirmDel(true) },
  ]

  return (
    <div className="detail-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="detail" role="dialog" aria-modal="true" aria-label={b.name}>
        <header className="detail__head">
          <button className="icon-btn" onClick={close} aria-label="Назад към списъка">
            <Icon name="chevron" size={22} className="rot90ccw" />
          </button>
          <h1 className="detail__title">{b.name || 'Без име'}</h1>
          <div className="detail__head-actions">
            {editMode && (
              <button className={`heart heart--inline${b.favorite ? ' heart--on' : ''}`} onClick={() => toggleFavorite(b)}
                aria-pressed={b.favorite} aria-label={b.favorite ? 'Премахни от любими' : 'Добави в любими'}>
                <Icon name={b.favorite ? 'heartFilled' : 'heart'} size={20} />
              </button>
            )}
            <button className="icon-btn" onClick={onShare} aria-label="Сподели"><Icon name="share" size={20} /></button>
            <button className="icon-btn" onClick={onCopyLink} aria-label="Копирай линк"><Icon name="link" size={20} /></button>
            {editMode && (
              <>
                <button className="btn btn--ghost btn--sm" onClick={() => openEdit(b)}><Icon name="edit" size={16} /> Редактирай</button>
                <Menu align="end" label="Още" trigger={<button className="icon-btn" aria-label="Още"><Icon name="dots" size={20} /></button>} items={editItems} />
              </>
            )}
          </div>
        </header>

        <div className="detail__body">
          <div className="detail__gallery">
            <Gallery photos={b.photos} alt={b.name} />
          </div>

          <div className="detail__main">
            <div className="detail__statusrow">
              {editMode ? (
                <StatusPicker
                  statusKey={b.status}
                  onChange={(s) => setStatus(b, s)}
                  changedBy={history[0] && history[0].by ? { ...history[0].by, at: history[0].at } : null}
                />
              ) : (
                <StatusBadge statusKey={b.status} />
              )}
              {b.favorite && <span className="fav-tag"><Icon name="heartFilled" size={14} /> Любимо</span>}
              {b.archived && <span className="chip chip--demo">Архивирано</span>}
            </div>

            {/* Бързи действия */}
            <div className="detail__quick">
              <a className="btn btn--primary btn--sm" href={mapsUrl(b)} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={16} /> Google Maps
              </a>
              {telUrl(b.phone) && (
                <a className="btn btn--ghost btn--sm" href={telUrl(b.phone)}><Icon name="phone" size={16} /> Обади се</a>
              )}
              {links[0] && (
                <a className="btn btn--ghost btn--sm" href={safeUrl(links[0].url)} target="_blank" rel="noopener noreferrer nofollow">
                  <Icon name="external" size={16} /> {linkLabel(links[0])}
                </a>
              )}
            </div>

            {/* Основни факти */}
            <div className="facts">
              <Fact label="Населено място">{val(b.town)}</Fact>
              <Fact label="Район / къмпинг / плаж">{val(b.area)}</Fact>
              <Fact label="Цена на вечер">{formatPrice(b.price, b.currency)}</Fact>
              <Fact label="Капацитет">{b.capacity != null ? formatCapacity(b.capacity) : <span className="muted">{PLACEHOLDER_LABEL}</span>}</Fact>
              <Fact label="2 възрастни + 1 дете">{triText(b.suitableFor2A1C)}</Fact>
              <Fact label="Разстояние до плажа">{formatDistance(b.beachDistanceM)}</Fact>
              <Fact label="Рейтинг">
                {formatRating(b.rating)}{b.ratingSource ? <span className="muted"> · {b.ratingSource}</span> : null}
              </Fact>
              <Fact label="Свободна наличност">
                {b.availability === 'yes' ? 'Има свободни' : b.availability === 'no' ? 'Няма свободни' : <span className="muted">{PLACEHOLDER_LABEL}</span>}
              </Fact>
              <Fact label="Последна проверка">{b.lastCheckedDate ? formatDay(b.lastCheckedDate) : <span className="muted">{PLACEHOLDER_LABEL}</span>}</Fact>
            </div>

            {/* Удобства */}
            <section className="detail__section">
              <h3>Удобства</h3>
              <AmenityIcons bungalow={b} showAll />
            </section>

            {/* Контакти и линкове */}
            <section className="detail__section">
              <h3>Контакти и връзки</h3>
              <div className="contact-row">
                {b.phone ? (
                  <div className="contact-item">
                    <Icon name="phone" size={16} />
                    <span>{b.phone}</span>
                    {telUrl(b.phone) && <a className="link-btn" href={telUrl(b.phone)}>Обади се</a>}
                    <button className="link-btn" onClick={onCopyPhone}>Копирай</button>
                  </div>
                ) : (
                  <p className="muted">Няма добавен телефон.</p>
                )}
                {links.length > 0 ? (
                  <ul className="links-list">
                    {links.map((l, i) => (
                      <li key={i}>
                        <a href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer nofollow">
                          <Icon name="external" size={15} /> {linkLabel(l)}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Няма добавени линкове.</p>
                )}
              </div>
            </section>

            {/* Описание / плюсове / минуси */}
            {(b.description || b.pros || b.cons) && (
              <section className="detail__section">
                {b.description && (<><h3>Описание</h3><p className="detail__text">{b.description}</p></>)}
                {b.pros && (<><h4 className="pros-h">Плюсове</h4><p className="detail__text">{b.pros}</p></>)}
                {b.cons && (<><h4 className="cons-h">Минуси</h4><p className="detail__text">{b.cons}</p></>)}
              </section>
            )}

            {/* Следващо действие */}
            {(b.nextAction || b.nextActionDate) && (
              <section className={`detail__section next-action${overdue ? ' next-action--overdue' : ''}`}>
                <h3><Icon name="clock" size={17} /> Следващо действие</h3>
                <p>{b.nextAction || <span className="muted">—</span>}{b.nextActionDate && <span className="na-date"> · {formatDay(b.nextActionDate)}{overdue && ' (просрочено)'}</span>}</p>
              </section>
            )}

            {/* Бележки */}
            <section className="detail__section">
              <h3>Бележки</h3>
              <NotesEditor bungalow={b} />
            </section>

            {/* История на статусите */}
            {history.length > 0 && (
              <section className="detail__section">
                <h3><Icon name="history" size={17} /> История на статусите</h3>
                <ul className="history">
                  {history.map((h, i) => (
                    <li key={i} className="history__item">
                      <StatusBadge statusKey={h.status} size="sm" />
                      <span className="history__by">
                        {h.by ? <><UserAvatar user={h.by} size={16} /> {h.by.name}</> : <span className="muted">—</span>}
                      </span>
                      <span className="muted history__when">{formatDateTime(h.at)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Мета */}
            <footer className="detail__meta">
              {b.lastChangedBy && b.lastChangedBy.name && (
                <span className="changed-chip">
                  <UserAvatar user={b.lastChangedBy} size={18} /> Последна промяна: {b.lastChangedBy.name} · {relativeTime(b.lastChangedBy.at || b.updatedAt)}
                </span>
              )}
            </footer>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Изтриване на предложение"
        message={`Сигурни ли сте, че искате да изтриете „${b.name}"?`}
        confirmLabel="Изтрий"
        danger
        onConfirm={async () => {
          setConfirmDel(false)
          await removeBungalow(b)
          toast.action(`„${b.name}" е изтрито.`, 'Върни', () => restoreDeleted(b))
          close()
        }}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  )
}
