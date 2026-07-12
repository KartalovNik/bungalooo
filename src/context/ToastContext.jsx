// Кратки съобщения за успех / грешка / информация (+ бутон за действие).
import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, type = 'success', duration = 3500, action = null) => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, message, type, action }])
      if (duration) setTimeout(() => remove(id), duration)
      return id
    },
    [remove]
  )

  const value = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d ?? 5000),
    info: (m, d) => toast(m, 'info', d),
    // Съобщение с бутон за действие (напр. „Върни").
    action: (m, label, onClick, type = 'info', duration = 6000) =>
      toast(m, type, duration, { label, onClick }),
    remove,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__msg">{t.message}</span>
            {t.action && (
              <button
                className="toast__action"
                onClick={() => {
                  t.action.onClick()
                  remove(t.id)
                }}
              >
                {t.action.label}
              </button>
            )}
            <button className="toast__close" aria-label="Затвори" onClick={() => remove(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast трябва да е вътре в <ToastProvider>')
  return ctx
}
