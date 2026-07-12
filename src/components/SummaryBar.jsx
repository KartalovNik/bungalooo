// Компактно обобщение с броячи. Клик върху брояч филтрира списъка.
import { useMemo } from 'react'
import { STATUSES, SUMMARY_STATUSES, getStatus } from '../config'
import { useUI } from '../context/UIContext'

export default function SummaryBar({ items }) {
  const { filters, showOnlyStatus, showOnlyFavorites, showAll, setFilters } = useUI()

  const counts = useMemo(() => {
    const c = { total: items.length, favorite: 0, inBudget: 0, byStatus: {} }
    for (const b of items) {
      c.byStatus[b.status] = (c.byStatus[b.status] || 0) + 1
      if (b.favorite) c.favorite++
      if (b.status !== 'nad_budjet') c.inBudget++
    }
    return c
  }, [items])

  const noStatusFilter = filters.statuses.length === 0
  const isActiveStatus = (key) => filters.statuses.length === 1 && filters.statuses[0] === key

  const budgetKeys = STATUSES.map((s) => s.key).filter((k) => k !== 'nad_budjet')
  const inBudgetActive =
    filters.statuses.length === budgetKeys.length && budgetKeys.every((k) => filters.statuses.includes(k))

  return (
    <div className="summary" role="group" aria-label="Обобщение по статуси">
      <button
        className={`sum sum--total${noStatusFilter && !filters.favorite ? ' sum--active' : ''}`}
        onClick={showAll}
      >
        <span className="sum__num">{counts.total}</span>
        <span className="sum__label">Общо</span>
      </button>

      {SUMMARY_STATUSES.map((key) => {
        const s = getStatus(key)
        return (
          <button
            key={key}
            className={`sum${isActiveStatus(key) ? ' sum--active' : ''}`}
            style={{ '--sum-color': s.color, '--sum-bg': s.bg }}
            onClick={() => showOnlyStatus(key)}
            title={`Покажи само: ${s.label}`}
          >
            <span className="sum__num" style={{ color: s.color }}>{counts.byStatus[key] || 0}</span>
            <span className="sum__label">{s.label}</span>
          </button>
        )
      })}

      <button
        className={`sum sum--fav${filters.favorite ? ' sum--active' : ''}`}
        onClick={showOnlyFavorites}
      >
        <span className="sum__num">{counts.favorite}</span>
        <span className="sum__label">Любими</span>
      </button>

      <button
        className={`sum${inBudgetActive ? ' sum--active' : ''}`}
        onClick={() => setFilters((f) => ({ ...f, statuses: budgetKeys, favorite: false }))}
        title="Покажи всички без надбюджетните"
      >
        <span className="sum__num">{counts.inBudget}</span>
        <span className="sum__label">В бюджета</span>
      </button>
    </div>
  )
}
