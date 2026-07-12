// Фиксирана горна навигация.
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icons'
import Menu from './Menu'
import ToolsMenu from './ToolsMenu'
import UserAvatar from './UserAvatar'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useToast } from '../context/ToastContext'
import useOnline from '../hooks/useOnline'
import { SORT_OPTIONS, countActiveFilters } from '../utils/filterSort'
import { APP_NAME } from '../config'

export default function TopNav({ onOpenLogin, onOpenWho }) {
  const { editMode, currentUser, signOut } = useAuth()
  const { query, setQuery, sort, setSort, setFiltersOpen, filters, openAdd, showAll } = useUI()
  const toast = useToast()
  const online = useOnline()
  const navigate = useNavigate()
  const activeFilters = countActiveFilters(filters)
  const currentSort = SORT_OPTIONS.find((s) => s.key === sort)

  async function handleSignOut() {
    await signOut()
    toast.info('Излязохте от режима за редактиране.')
  }

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <Link
          to="/"
          className="brand"
          onClick={() => showAll()}
          aria-label={`${APP_NAME} — начало`}
        >
          <span className="brand__logo" aria-hidden="true">B</span>
          <span className="brand__name">{APP_NAME}</span>
        </Link>

        <div className="topnav__search">
          <Icon name="search" size={18} className="topnav__search-ic" />
          <input
            className="topnav__search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Търси по име, място, бележки…"
            aria-label="Търсене"
          />
          {query && (
            <button className="topnav__search-clear" onClick={() => setQuery('')} aria-label="Изчисти търсенето">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        <div className="topnav__actions">
          <Menu
            align="end"
            label="Сортиране"
            trigger={
              <button className="nav-btn" aria-label="Сортиране" title="Сортиране">
                <Icon name="sort" size={18} />
                <span className="nav-btn__label">{currentSort?.label || 'Сортиране'}</span>
              </button>
            }
            items={SORT_OPTIONS.map((o) => ({
              label: o.label,
              active: o.key === sort,
              onClick: () => setSort(o.key),
            }))}
          />

          <button
            className={`nav-btn${activeFilters ? ' nav-btn--active' : ''}`}
            onClick={() => setFiltersOpen(true)}
            aria-label="Филтри"
            title="Филтри"
          >
            <Icon name="filter" size={18} />
            <span className="nav-btn__label">Филтри</span>
            {activeFilters > 0 && <span className="nav-btn__badge">{activeFilters}</span>}
          </button>

          {editMode && (
            <button className="nav-btn nav-btn--primary" onClick={openAdd} title="Добави бунгало">
              <Icon name="plus" size={18} />
              <span className="nav-btn__label">Добави</span>
            </button>
          )}

          <ToolsMenu />

          {editMode ? (
            <Menu
              align="end"
              label="Профил"
              trigger={
                <button className="nav-user" title="Режим за редактиране" aria-label="Профил и изход">
                  <UserAvatar user={currentUser} size={26} />
                  <span className="nav-user__name" style={{ color: currentUser?.color }}>
                    {currentUser?.name}
                  </span>
                </button>
              }
            >
              {(close) => (
                <div className="menu-panel">
                  <div className="menu-panel__head">
                    <UserAvatar user={currentUser} size={30} />
                    <div>
                      <div className="menu-panel__name">{currentUser?.name}</div>
                      <div className="muted small">Режим за редактиране</div>
                    </div>
                  </div>
                  <button className="menu__item" onClick={() => { close(); onOpenWho() }}>
                    <Icon name="people" size={18} /> <span>Смени кой си</span>
                  </button>
                  <div className="menu__sep" />
                  <button className="menu__item menu__item--danger" onClick={() => { close(); handleSignOut() }}>
                    <Icon name="logout" size={18} /> <span>Изход от редакция</span>
                  </button>
                </div>
              )}
            </Menu>
          ) : (
            <button className="nav-btn nav-btn--outline" onClick={onOpenLogin} title="Вход за редактиране">
              <Icon name="login" size={18} />
              <span className="nav-btn__label">Вход</span>
            </button>
          )}

          {!online && (
            <span className="chip chip--offline" title="Няма връзка — виждате запазените данни. Промените ще се появят при връщане на мрежата.">
              <Icon name="cloudOff" size={15} /> Офлайн
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
