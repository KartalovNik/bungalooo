// Панел с филтри. На телефон се отваря като лист отдолу, на голям екран
// като страничен панел. Затваря се с Esc / клик отвън / бутон.
import { useEffect } from 'react'
import Icon from './Icons'
import { useUI } from '../context/UIContext'
import { useData } from '../context/DataContext'
import { uniqueValues, countActiveFilters } from '../utils/filterSort'
import { STATUSES, AMENITIES, AREA_SUGGESTIONS } from '../config'

function Toggle({ label, checked, onChange }) {
  return (
    <label className={`toggle${checked ? ' toggle--on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__box" aria-hidden="true">
        {checked && <Icon name="check" size={13} />}
      </span>
      <span>{label}</span>
    </label>
  )
}

function Chip({ label, active, onClick, color }) {
  return (
    <button
      type="button"
      className={`fchip${active ? ' fchip--on' : ''}`}
      style={active && color ? { borderColor: color, background: color + '22', color } : undefined}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

export default function FiltersPanel() {
  const { filtersOpen, setFiltersOpen, filters, setFilter, toggleArrayFilter, clearFilters } = useUI()
  const { bungalows } = useData()

  useEffect(() => {
    if (!filtersOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setFiltersOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen, setFiltersOpen])

  if (!filtersOpen) return null

  const towns = uniqueValues(bungalows, 'town')
  const areas = [...new Set([...AREA_SUGGESTIONS, ...uniqueValues(bungalows, 'area')])]
  const active = countActiveFilters(filters)

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setFiltersOpen(false)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Филтри">
        <header className="drawer__head">
          <h2>Филтри {active > 0 && <span className="drawer__count">{active}</span>}</h2>
          <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Затвори">
            <Icon name="close" />
          </button>
        </header>

        <div className="drawer__body">
          <section className="fsec">
            <h3 className="fsec__title">Статус</h3>
            <div className="fchips">
              {STATUSES.map((s) => (
                <Chip
                  key={s.key}
                  label={s.label}
                  color={s.color}
                  active={filters.statuses.includes(s.key)}
                  onClick={() => toggleArrayFilter('statuses', s.key)}
                />
              ))}
            </div>
          </section>

          {towns.length > 0 && (
            <section className="fsec">
              <h3 className="fsec__title">Населено място</h3>
              <div className="fchips">
                {towns.map((t) => (
                  <Chip key={t} label={t} active={filters.towns.includes(t)} onClick={() => toggleArrayFilter('towns', t)} />
                ))}
              </div>
            </section>
          )}

          <section className="fsec">
            <h3 className="fsec__title">Район / къмпинг / плаж</h3>
            <div className="fchips">
              {areas.map((a) => (
                <Chip key={a} label={a} active={filters.areas.includes(a)} onClick={() => toggleArrayFilter('areas', a)} />
              ))}
            </div>
          </section>

          <section className="fsec">
            <h3 className="fsec__title">Цена на вечер ({filters.priceMin || '0'}–{filters.priceMax || '∞'})</h3>
            <div className="frow">
              <label className="field field--inline">
                <span className="field__label">От</span>
                <input type="number" inputMode="numeric" min="0" className="input" value={filters.priceMin}
                  onChange={(e) => setFilter('priceMin', e.target.value)} placeholder="мин." />
              </label>
              <label className="field field--inline">
                <span className="field__label">До</span>
                <input type="number" inputMode="numeric" min="0" className="input" value={filters.priceMax}
                  onChange={(e) => setFilter('priceMax', e.target.value)} placeholder="макс." />
              </label>
            </div>
          </section>

          <section className="fsec">
            <div className="frow">
              <label className="field field--inline">
                <span className="field__label">Макс. до плажа (м)</span>
                <input type="number" inputMode="numeric" min="0" className="input" value={filters.maxBeachDistance}
                  onChange={(e) => setFilter('maxBeachDistance', e.target.value)} placeholder="напр. 300" />
              </label>
              <label className="field field--inline">
                <span className="field__label">Мин. капацитет</span>
                <input type="number" inputMode="numeric" min="0" className="input" value={filters.minCapacity}
                  onChange={(e) => setFilter('minCapacity', e.target.value)} placeholder="напр. 3" />
              </label>
            </div>
            <label className="field field--inline">
              <span className="field__label">Мин. рейтинг</span>
              <input type="number" inputMode="decimal" min="0" max="10" step="0.1" className="input" value={filters.minRating}
                onChange={(e) => setFilter('minRating', e.target.value)} placeholder="напр. 8" />
            </label>
          </section>

          <section className="fsec">
            <h3 className="fsec__title">Удобства и други</h3>
            <div className="ftoggles">
              <Toggle label="Само любими" checked={filters.favorite} onChange={(v) => setFilter('favorite', v)} />
              {AMENITIES.map((a) => (
                <Toggle key={a.key} label={a.label} checked={filters[a.key]} onChange={(v) => setFilter(a.key, v)} />
              ))}
              <Toggle label="Има свободни места" checked={filters.availableOnly} onChange={(v) => setFilter('availableOnly', v)} />
              <Toggle label="Проверени (с дата на проверка)" checked={filters.verifiedOnly} onChange={(v) => setFilter('verifiedOnly', v)} />
              <Toggle label="С добавена бележка" checked={filters.withNotes} onChange={(v) => setFilter('withNotes', v)} />
              <Toggle label="Със следващо действие" checked={filters.withNextAction} onChange={(v) => setFilter('withNextAction', v)} />
              <Toggle label="Показвай архивираните" checked={filters.showArchived} onChange={(v) => setFilter('showArchived', v)} />
            </div>
          </section>
        </div>

        <footer className="drawer__foot">
          <button className="btn btn--ghost" onClick={clearFilters}>
            <Icon name="close" size={16} /> Изчисти филтрите
          </button>
          <button className="btn btn--primary" onClick={() => setFiltersOpen(false)}>Готово</button>
        </footer>
      </aside>
    </div>
  )
}
