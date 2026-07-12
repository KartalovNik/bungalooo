// Вход в режим за редактиране (само паролата).
// Изборът „кой си" се прави след това от WhoAmIModal (в App).
import { useState, useEffect } from 'react'
import Modal from './Modal'
import Icon from './Icons'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ open, onClose }) {
  const { signIn, isCloud } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
      setBusy(false)
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(password)
      setPassword('')
      onClose() // след успех избора „кой си" се показва автоматично
    } catch (err) {
      setError(err.message || 'Входът не бе успешен.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Вход за редактиране" size="sm">
      <form onSubmit={submit} className="login-form">
        <p className="muted mb">
          Въведете общата парола за редактиране. В публичния режим всеки може да разглежда, но не и да променя.
        </p>
        <label className="field">
          <span className="field__label">Парола</span>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Общата парола"
            autoFocus
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            <Icon name="warning" size={16} /> {error}
          </p>
        )}
        {!isCloud && (
          <p className="hint">
            <Icon name="info" size={15} /> Демо режим (без облак): работи всяка непразна парола. За реална защита добавете Firebase ключове.
          </p>
        )}
        <div className="modal__foot mt">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Отказ</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Влизане…' : 'Влез'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
