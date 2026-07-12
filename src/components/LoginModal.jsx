// Вход в режим за редактиране (код за достъп = GitHub token).
// Изборът „кой си" се прави след това от WhoAmIModal (в App).
import { useState, useEffect } from 'react'
import Modal from './Modal'
import Icon from './Icons'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ open, onClose }) {
  const { signIn } = useAuth()
  const [token, setTokenValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTokenValue('')
      setError('')
      setBusy(false)
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(token)
      setTokenValue('')
      onClose() // след успех изборът „кой си" се показва автоматично
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
          Въведете общия <strong>код за редактиране</strong>. Работи като парола — въвежда се
          веднъж на това устройство. В публичния режим всеки може да разглежда, но не и да променя.
        </p>
        <label className="field">
          <span className="field__label">Код за редактиране</span>
          <input
            type="password"
            className="input"
            value={token}
            onChange={(e) => setTokenValue(e.target.value)}
            autoComplete="off"
            placeholder="github_pat_… (или ghp_…)"
            autoFocus
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            <Icon name="warning" size={16} /> {error}
          </p>
        )}
        <p className="hint">
          <Icon name="info" size={15} /> Кодът се получава веднъж и се споделя между четиримата
          (както обща парола). Как се създава — виж <strong>README.md</strong>, раздел „Код за редактиране".
        </p>
        <div className="modal__foot mt">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Отказ</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Проверка…' : 'Влез'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
