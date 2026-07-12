import { useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import SummaryBar from './components/SummaryBar'
import CardGrid from './components/CardGrid'
import FiltersPanel from './components/FiltersPanel'
import BungalowForm from './components/BungalowForm'
import BungalowDetails from './components/BungalowDetails'
import LoginModal from './components/LoginModal'
import WhoAmIModal from './components/WhoAmI'
import Icon from './components/Icons'
import { LoadingState, ErrorState, EmptyState } from './components/States'
import { useData } from './context/DataContext'
import { useUI } from './context/UIContext'
import { useAuth } from './context/AuthContext'
import { useToast } from './context/ToastContext'
import { filterList, sortList, countActiveFilters } from './utils/filterSort'

function DemoBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('bungalooo_demo_banner') === '1'
  )
  if (dismissed) return null
  return (
    <div className="demo-banner">
      <Icon name="info" size={16} />
      <span>
        Демо режим — данните се пазят само на този браузър. За обща синхронизация между
        устройства свържете базата (вижте <strong>README.md</strong>).
      </span>
      <button className="icon-btn" aria-label="Скрий" onClick={() => { localStorage.setItem('bungalooo_demo_banner', '1'); setDismissed(true) }}>
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}

function List() {
  const { bungalows, loading, error, seedInitial } = useData()
  const { query, filters, sort, clearFilters, openAdd } = useUI()
  const { editMode } = useAuth()
  const toast = useToast()

  const nonArchived = useMemo(() => bungalows.filter((b) => !b.archived), [bungalows])
  const summaryItems = filters.showArchived ? bungalows.filter((b) => b.archived) : nonArchived

  const visible = useMemo(
    () => sortList(filterList(bungalows, query, filters), sort),
    [bungalows, query, filters, sort]
  )

  const total = bungalows.length
  const activeFilters = countActiveFilters(filters) + (query ? 1 : 0)

  if (loading && !total) return <LoadingState />
  if (error && !total) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  if (!total) {
    return (
      <EmptyState
        title="Още няма добавени бунгала"
        message={editMode ? 'Заредете началните предложения или добавете първото ръчно.' : 'Влезте в режим за редактиране, за да добавяте предложения.'}
        action={
          editMode && (
            <div className="empty-actions">
              <button className="btn btn--primary" onClick={async () => {
                try { await seedInitial(); toast.success('Началните предложения са заредени.') }
                catch { toast.error('Зареждането не бе успешно.') }
              }}>
                <Icon name="download" size={16} /> Зареди началните 23 предложения
              </button>
              <button className="btn btn--ghost" onClick={openAdd}><Icon name="plus" size={16} /> Добави ръчно</button>
            </div>
          )
        }
      />
    )
  }

  return (
    <>
      <SummaryBar items={summaryItems} />

      <div className="listbar">
        <span className="listbar__count">
          Показани <strong>{visible.length}</strong> от {total}
          {filters.showArchived && ' (архив)'}
        </span>
        {activeFilters > 0 && (
          <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
            <Icon name="close" size={15} /> Изчисти филтрите
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Няма съвпадения"
          message="Опитайте с други филтри или изчистете търсенето."
          action={<button className="btn btn--primary" onClick={clearFilters}>Изчисти филтрите</button>}
        />
      ) : (
        <CardGrid items={visible} />
      )}
    </>
  )
}

export default function App() {
  const { isCloud } = useData()
  const { needsUserPick } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [whoOpen, setWhoOpen] = useState(false)

  return (
    <div className="app">
      <TopNav onOpenLogin={() => setLoginOpen(true)} onOpenWho={() => setWhoOpen(true)} />

      <main className="main">
        {!isCloud && <DemoBanner />}
        <List />
      </main>

      <FiltersPanel />
      <BungalowForm />

      <Routes>
        <Route path="/b/:id" element={<BungalowDetails />} />
        <Route path="*" element={null} />
      </Routes>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <WhoAmIModal
        open={whoOpen || needsUserPick}
        onClose={() => setWhoOpen(false)}
        dismissable={!needsUserPick}
      />

      <footer className="site-foot">
        <span>Bungalooo · Южно Черноморие</span>
      </footer>
    </div>
  )
}
