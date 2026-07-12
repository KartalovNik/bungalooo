// Достъпен модален прозорец: затваряне с Esc / клик отвън, заключване
// на скрола, връщане на фокуса, capture на фокуса вътре.
import { useEffect, useRef } from 'react'
import Icon from './Icons'

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  labelId = 'modal-title',
}) {
  const dialogRef = useRef(null)
  const lastActive = useRef(null)

  useEffect(() => {
    if (!open) return
    lastActive.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'Tab') {
        trapFocus(e)
      }
    }
    document.addEventListener('keydown', onKey, true)

    // Фокус върху първия елемент.
    const t = setTimeout(() => {
      const el = dialogRef.current
      if (!el) return
      const focusable = el.querySelector(
        'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
      )
      ;(focusable || el).focus()
    }, 20)

    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = ''
      clearTimeout(t)
      if (lastActive.current && lastActive.current.focus) {
        try { lastActive.current.focus() } catch { /* ignore */ }
      }
    }
  }, [open, onClose])

  function trapFocus(e) {
    const el = dialogRef.current
    if (!el) return
    const nodes = el.querySelectorAll(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        ref={dialogRef}
      >
        {title != null && (
          <header className="modal__head">
            <h2 id={labelId} className="modal__title">{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Затвори">
              <Icon name="close" />
            </button>
          </header>
        )}
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
