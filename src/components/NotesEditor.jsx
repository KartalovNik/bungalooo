// Редактор за бележки с автоматично запазване.
//  • индикатори „Запазване…" / „Запазено"
//  • запис при пауза в писането, при напускане на полето и при затваряне
//  • не губи текста при затваряне на страницата
import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from './Icons'
import UserAvatar from './UserAvatar'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/format'

const DEBOUNCE = 800

export default function NotesEditor({ bungalow: b }) {
  const { saveNotes } = useData()
  const { editMode } = useAuth()
  const [text, setText] = useState(b.notes || '')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const savedRef = useRef(b.notes || '')
  const timer = useRef(null)
  const focused = useRef(false)
  const textRef = useRef(text)
  const idRef = useRef(b.id)
  textRef.current = text
  idRef.current = b.id

  // Приема външни промени (от друго устройство), когато не пишем.
  useEffect(() => {
    if (!focused.current && (b.notes || '') !== savedRef.current) {
      setText(b.notes || '')
      savedRef.current = b.notes || ''
      setStatus('idle')
    }
  }, [b.notes])

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    if (text !== savedRef.current) {
      setStatus('saving')
      await saveNotes(b.id, text)
      savedRef.current = text
      setStatus('saved')
    }
  }, [text, b.id, saveNotes])

  // Запазва при напускане на компонента (само при демонтиране).
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
      if (textRef.current !== savedRef.current) saveNotes(idRef.current, textRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Предупреждава при затваряне с незапазена промяна.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (text !== savedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [text])

  function onChange(e) {
    const v = e.target.value
    setText(v)
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await saveNotes(b.id, v)
      savedRef.current = v
      setStatus('saved')
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 1600)
    }, DEBOUNCE)
  }

  if (!editMode) {
    return (
      <div className="notes-view">
        {b.notes && b.notes.trim() ? (
          <p className="notes-view__text">{b.notes}</p>
        ) : (
          <p className="muted">Няма добавени бележки.</p>
        )}
        {b.notesUpdatedBy && (
          <p className="notes-meta">
            <UserAvatar user={b.notesUpdatedBy} size={16} /> {b.notesUpdatedBy.name} · {formatDateTime(b.notesUpdatedAt)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="notes-editor">
      <textarea
        className="textarea notes-textarea"
        value={text}
        onChange={onChange}
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false
          flush()
        }}
        placeholder="Свободни бележки — телефонни разговори, впечатления, какво да проверим…"
        rows={6}
        aria-label="Бележки"
      />
      <div className="notes-editor__bar">
        <span className={`save-ind save-ind--${status}`}>
          {status === 'saving' && (<><span className="spinner" /> Запазване…</>)}
          {status === 'saved' && (<><Icon name="check" size={15} /> Запазено</>)}
          {status === 'idle' && (b.notesUpdatedBy ? (
            <span className="notes-meta">
              <UserAvatar user={b.notesUpdatedBy} size={16} /> {b.notesUpdatedBy.name} · {formatDateTime(b.notesUpdatedAt)}
            </span>
          ) : 'Автоматично запазване')}
        </span>
      </div>
    </div>
  )
}
