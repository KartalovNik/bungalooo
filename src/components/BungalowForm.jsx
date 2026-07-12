// Форма за добавяне и редактиране на бунгало.
import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import Icon from './Icons'
import Photo from './Photo'
import ConfirmDialog from './ConfirmDialog'
import { useUI } from '../context/UIContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { emptyBungalow, STATUSES, CURRENCIES, AREA_SUGGESTIONS, DEFAULT_STATUS } from '../config'
import { validateBungalow, hasErrors } from '../utils/validation'
import { findPossibleDuplicates } from '../utils/duplicates'
import { isValidWebUrl } from '../utils/sanitize'

function Field({ label, htmlFor, error, hint, children, required }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field__label">
        {label}{required && <span className="req"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error"><Icon name="warning" size={13} /> {error}</span>}
    </label>
  )
}

function TriSelect({ value, onChange, id }) {
  const v = value === true ? 'yes' : value === false ? 'no' : 'unknown'
  return (
    <select id={id} className="input" value={v}
      onChange={(e) => onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}>
      <option value="unknown">За проверка</option>
      <option value="yes">Да</option>
      <option value="no">Не</option>
    </select>
  )
}

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export default function BungalowForm() {
  const { form, closeForm } = useUI()
  const { bungalows, addBungalow, updateBungalow } = useData()
  const toast = useToast()
  const navigate = useNavigate()

  const open = form.mode !== null
  const isEdit = form.mode === 'edit'
  const original = form.bungalow

  // Начално състояние (пресмята се веднъж при отваряне).
  const initial = useMemo(() => {
    if (!open) return emptyBungalow()
    const base = { ...emptyBungalow(), ...(form.bungalow || {}) }
    base.links = (base.links || []).map((l) => ({ label: l.label || '', url: l.url || '' }))
    base.photos = [...(base.photos || [])]
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.bungalow])

  const [data, setData] = useState(initial)
  const [errors, setErrors] = useState({})
  const [confirmClose, setConfirmClose] = useState(false)
  const initialSnapshot = useRef(JSON.stringify(initial))

  // Пресинхронизиране при повторно отваряне.
  const openedRef = useRef(open)
  if (open && !openedRef.current) {
    openedRef.current = true
    setData(initial)
    setErrors({})
    initialSnapshot.current = JSON.stringify(initial)
  }
  if (!open && openedRef.current) openedRef.current = false

  const set = (patch) => setData((d) => ({ ...d, ...patch }))
  const dirty = JSON.stringify(data) !== initialSnapshot.current

  const duplicates = useMemo(
    () => findPossibleDuplicates(data.name, bungalows, isEdit ? original?.id : null),
    [data.name, bungalows, isEdit, original]
  )

  const townSuggestions = useMemo(
    () => [...new Set(bungalows.map((b) => (b.town || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'bg')),
    [bungalows]
  )

  function requestClose() {
    if (dirty) setConfirmClose(true)
    else closeForm()
  }

  // ── Линкове ──
  const setLink = (i, patch) =>
    setData((d) => ({ ...d, links: d.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }))
  const addLink = () => setData((d) => ({ ...d, links: [...d.links, { label: '', url: '' }] }))
  const removeLink = (i) => setData((d) => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }))

  // ── Снимки ──
  const setPhoto = (i, url) => setData((d) => ({ ...d, photos: d.photos.map((p, idx) => (idx === i ? url : p)) }))
  const addPhoto = () => setData((d) => ({ ...d, photos: [...d.photos, ''] }))
  const removePhoto = (i) => setData((d) => ({ ...d, photos: d.photos.filter((_, idx) => idx !== i) }))

  function buildSaveShape() {
    return {
      ...data,
      name: (data.name || '').trim(),
      town: (data.town || '').trim(),
      area: (data.area || '').trim(),
      price: toNum(data.price),
      capacity: toNum(data.capacity),
      beachDistanceM: toNum(data.beachDistanceM),
      rating: toNum(data.rating),
      ratingSource: (data.ratingSource || '').trim(),
      phone: (data.phone || '').trim(),
      links: data.links.map((l) => ({ label: (l.label || '').trim(), url: (l.url || '').trim() })).filter((l) => l.url),
      photos: data.photos.map((p) => (p || '').trim()).filter(Boolean),
    }
  }

  async function submit(e) {
    e.preventDefault()
    const shape = buildSaveShape()
    const errs = validateBungalow(shape)
    setErrors(errs)
    if (hasErrors(errs)) {
      toast.error('Има непопълнени или невалидни полета.')
      return
    }
    try {
      if (isEdit) {
        const patch = { ...shape }
        // Ако статусът е сменен от формата — добавяме в историята.
        if (shape.status !== original.status) {
          patch.statusHistory = [
            ...(original.statusHistory || []),
            { status: shape.status, by: null, at: Date.now() },
          ].slice(-60)
        }
        delete patch.id
        await updateBungalow(original.id, patch)
        toast.success('Промените са запазени.')
        closeForm()
      } else {
        const id = await addBungalow(shape)
        toast.success('Бунгалото е добавено.')
        closeForm()
        if (id) navigate(`/b/${id}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Записът не бе успешен. Опитайте отново.')
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title={isEdit ? 'Редактиране на бунгало' : 'Ново бунгало'}
      size="lg"
      closeOnBackdrop={false}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={requestClose}>Отказ</button>
          <button type="submit" form="bungalow-form" className="btn btn--primary">
            <Icon name="check" size={16} /> {isEdit ? 'Запази промените' : 'Добави'}
          </button>
        </>
      }
    >
      <form id="bungalow-form" onSubmit={submit} className="bform">
        {/* Възможен дубликат */}
        {!isEdit && duplicates.length > 0 && (
          <div className="dup-warn" role="alert">
            <Icon name="warning" size={16} />
            <div>
              Възможен дубликат: {duplicates.slice(0, 3).map((d, i) => (
                <button key={d.bungalow.id} type="button" className="link-btn" onClick={() => { closeForm(); navigate(`/b/${d.bungalow.id}`) }}>
                  {d.bungalow.name}{i < Math.min(duplicates.length, 3) - 1 ? ', ' : ''}
                </button>
              ))}. Проверете, преди да добавите.
            </div>
          </div>
        )}

        <fieldset className="bform__group">
          <legend>Основно</legend>
          <Field label="Име" htmlFor="f-name" required error={errors.name}>
            <input id="f-name" className="input" value={data.name} onChange={(e) => set({ name: e.target.value })} maxLength={200} autoComplete="off" />
          </Field>
          <div className="frow">
            <Field label="Населено място" htmlFor="f-town">
              <input id="f-town" className="input" value={data.town} onChange={(e) => set({ town: e.target.value })} list="towns-list" />
              <datalist id="towns-list">{townSuggestions.map((t) => <option key={t} value={t} />)}</datalist>
            </Field>
            <Field label="Район / къмпинг / плаж" htmlFor="f-area">
              <input id="f-area" className="input" value={data.area} onChange={(e) => set({ area: e.target.value })} list="areas-list" />
              <datalist id="areas-list">{AREA_SUGGESTIONS.map((a) => <option key={a} value={a} />)}</datalist>
            </Field>
          </div>
          <div className="frow">
            <Field label="Статус" htmlFor="f-status">
              <select id="f-status" className="input" value={data.status} onChange={(e) => set({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Любимо">
              <label className="toggle toggle--inline">
                <input type="checkbox" checked={!!data.favorite} onChange={(e) => set({ favorite: e.target.checked })} />
                <span className="toggle__box" aria-hidden="true">{data.favorite && <Icon name="check" size={13} />}</span>
                <span>Отбележи като любимо</span>
              </label>
            </Field>
          </div>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Цена и капацитет</legend>
          <div className="frow">
            <Field label="Цена на вечер" htmlFor="f-price" error={errors.price} hint="Остави празно, ако е за проверка">
              <input id="f-price" type="number" min="0" inputMode="decimal" className="input" value={data.price ?? ''} onChange={(e) => set({ price: e.target.value })} />
            </Field>
            <Field label="Валута" htmlFor="f-cur">
              <select id="f-cur" className="input" value={data.currency} onChange={(e) => set({ currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="frow">
            <Field label="Капацитет (души)" htmlFor="f-cap" error={errors.capacity}>
              <input id="f-cap" type="number" min="0" inputMode="numeric" className="input" value={data.capacity ?? ''} onChange={(e) => set({ capacity: e.target.value })} />
            </Field>
            <Field label="Разстояние до плажа (м)" htmlFor="f-beach" error={errors.beachDistanceM}>
              <input id="f-beach" type="number" min="0" inputMode="numeric" className="input" value={data.beachDistanceM ?? ''} onChange={(e) => set({ beachDistanceM: e.target.value })} />
            </Field>
          </div>
          <div className="frow">
            <Field label="Подходящо за 2 възрастни + 1 дете" htmlFor="f-2a1c">
              <TriSelect id="f-2a1c" value={data.suitableFor2A1C} onChange={(v) => set({ suitableFor2A1C: v })} />
            </Field>
            <Field label="Свободна наличност" htmlFor="f-avail">
              <select id="f-avail" className="input" value={data.availability} onChange={(e) => set({ availability: e.target.value })}>
                <option value="">За проверка</option>
                <option value="yes">Има свободни</option>
                <option value="no">Няма свободни</option>
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Удобства</legend>
          <div className="frow frow--3">
            <Field label="Собствен санитарен възел"><TriSelect value={data.ownBathroom} onChange={(v) => set({ ownBathroom: v })} /></Field>
            <Field label="Климатик"><TriSelect value={data.ac} onChange={(v) => set({ ac: v })} /></Field>
            <Field label="Паркинг"><TriSelect value={data.parking} onChange={(v) => set({ parking: v })} /></Field>
            <Field label="Кухня / кухненски бокс"><TriSelect value={data.kitchen} onChange={(v) => set({ kitchen: v })} /></Field>
            <Field label="Подходящо за деца"><TriSelect value={data.kidFriendly} onChange={(v) => set({ kidFriendly: v })} /></Field>
          </div>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Рейтинг и контакт</legend>
          <div className="frow frow--3">
            <Field label="Рейтинг (0–10)" htmlFor="f-rating" error={errors.rating}>
              <input id="f-rating" type="number" min="0" max="10" step="0.1" inputMode="decimal" className="input" value={data.rating ?? ''} onChange={(e) => set({ rating: e.target.value })} />
            </Field>
            <Field label="Източник на рейтинга" htmlFor="f-rsrc">
              <input id="f-rsrc" className="input" value={data.ratingSource} onChange={(e) => set({ ratingSource: e.target.value })} placeholder="Booking, Google…" />
            </Field>
            <Field label="Телефон" htmlFor="f-phone">
              <input id="f-phone" type="tel" className="input" value={data.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+359…" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Линкове</legend>
          <p className="field__hint mb">Booking, официален сайт, Facebook, Google Maps… Може повече от един.</p>
          {data.links.map((l, i) => (
            <div key={i} className="repeat-row">
              <input className="input repeat-row__label" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Етикет (по избор)" />
              <input className={`input repeat-row__main${l.url && !isValidWebUrl(l.url) ? ' input--error' : ''}`} value={l.url}
                onChange={(e) => setLink(i, { url: e.target.value })} placeholder="https://…" inputMode="url" />
              <button type="button" className="icon-btn" onClick={() => removeLink(i)} aria-label="Премахни линк"><Icon name="trash" size={18} /></button>
              {l.url && !isValidWebUrl(l.url) && <span className="field__error repeat-row__err"><Icon name="warning" size={13} /> Невалиден адрес</span>}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addLink}><Icon name="plus" size={16} /> Добави линк</button>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Снимки</legend>
          <p className="field__hint mb">Поставете адрес (URL) на снимка. Може няколко — първата е основна.</p>
          {data.photos.map((p, i) => (
            <div key={i} className="repeat-row repeat-row--photo">
              <div className="repeat-row__thumb"><Photo src={p} alt="" /></div>
              <input className={`input repeat-row__main${p && !isValidWebUrl(p) ? ' input--error' : ''}`} value={p}
                onChange={(e) => setPhoto(i, e.target.value)} placeholder="https://…/снимка.jpg" inputMode="url" />
              <button type="button" className="icon-btn" onClick={() => removePhoto(i)} aria-label="Премахни снимка"><Icon name="trash" size={18} /></button>
              {p && !isValidWebUrl(p) && <span className="field__error repeat-row__err"><Icon name="warning" size={13} /> Невалиден адрес</span>}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addPhoto}><Icon name="plus" size={16} /> Добави снимка</button>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Описание и бележки</legend>
          <Field label="Кратко описание" htmlFor="f-desc">
            <textarea id="f-desc" className="textarea" rows={3} value={data.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <div className="frow">
            <Field label="Плюсове" htmlFor="f-pros">
              <textarea id="f-pros" className="textarea" rows={2} value={data.pros} onChange={(e) => set({ pros: e.target.value })} />
            </Field>
            <Field label="Минуси" htmlFor="f-cons">
              <textarea id="f-cons" className="textarea" rows={2} value={data.cons} onChange={(e) => set({ cons: e.target.value })} />
            </Field>
          </div>
          <Field label="Лични бележки" htmlFor="f-notes">
            <textarea id="f-notes" className="textarea" rows={3} value={data.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </fieldset>

        <fieldset className="bform__group">
          <legend>Планиране</legend>
          <div className="frow frow--3">
            <Field label="Следващо действие" htmlFor="f-na">
              <input id="f-na" className="input" value={data.nextAction} onChange={(e) => set({ nextAction: e.target.value })} placeholder="напр. да звъннем" />
            </Field>
            <Field label="Дата за следващо действие" htmlFor="f-nad">
              <input id="f-nad" type="date" className="input" value={data.nextActionDate} onChange={(e) => set({ nextActionDate: e.target.value })} />
            </Field>
            <Field label="Дата на последна проверка" htmlFor="f-lcd">
              <input id="f-lcd" type="date" className="input" value={data.lastCheckedDate} onChange={(e) => set({ lastCheckedDate: e.target.value })} />
            </Field>
          </div>
        </fieldset>
      </form>

      <ConfirmDialog
        open={confirmClose}
        title="Незапазени промени"
        message="Имате незапазени промени. Сигурни ли сте, че искате да затворите без запазване?"
        confirmLabel="Затвори без запазване"
        cancelLabel="Продължи редакцията"
        danger
        onConfirm={() => { setConfirmClose(false); closeForm() }}
        onCancel={() => setConfirmClose(false)}
      />
    </Modal>
  )
}
